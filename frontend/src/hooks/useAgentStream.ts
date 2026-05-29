/**
 * useAgentStream — simplified, bulletproof version
 * No useCallback, no stale closures, uses useRef for streaming guard.
 */

import { useState, useRef } from 'react'
import type { CustomComponentEvent } from '../agui/types'

const AGENT_URL = 'http://localhost:8000/run'

export interface ChatMessage {
  id:         string
  role:       'user' | 'assistant'
  text:       string
  components: CustomComponentEvent[]
}

export function useAgentStream() {
  const [messages,    setMessages]    = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [debugLog,    setDebugLog]    = useState<string[]>([])
  const streamingRef = useRef(false)
  const threadId     = useRef(crypto.randomUUID())

  function dbg(msg: string) {
    console.log('[AG-UI]', msg)
    setDebugLog(prev => [...prev.slice(-20), msg])   // keep last 20 lines
  }

  async function send(userText: string) {
    if (streamingRef.current) return
    streamingRef.current = true
    setIsStreaming(true)
    setDebugLog([])   // clear log for new run

    const assistantId = crypto.randomUUID()
    dbg(`send() called: "${userText.slice(0,40)}"`)

    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user',     text: userText, components: [] },
      { id: assistantId,         role: 'assistant', text: '',       components: [] },
    ])

    try {
      dbg(`fetching ${AGENT_URL}…`)
      const response = await fetch(AGENT_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: userText, thread_id: threadId.current }),
      })
      dbg(`response: ${response.status} ${response.statusText}`)

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (!response.body) throw new Error('No response body')

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let   buffer  = ''
      let   chunks  = 0
      let   events  = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) { dbg(`stream done. chunks=${chunks} events=${events}`); break }

        chunks++
        const text = decoder.decode(value, { stream: true })
        dbg(`chunk #${chunks}: ${text.slice(0,60).replace(/\n/g,'↵')}`)
        buffer += text

        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            events++
            dbg(`event: ${event.type}`)

            if (event.type === 'RUN_ERROR') {
              const errMsg = event.message ?? 'Unknown server error'
              dbg(`RUN_ERROR: ${errMsg}`)
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, text: `❌ ${errMsg}` } : m
              ))
            }
            if (event.type === 'TEXT_MESSAGE_CONTENT') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, text: m.text + (event.delta ?? '') } : m
              ))
            }
            if (event.type === 'CUSTOM_COMPONENT') {
              dbg(`→ rendering component: ${event.component}`)
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, components: [...m.components, event] } : m
              ))
            }
          } catch(e) { dbg(`parse error: ${e}`) }
        }
      }

    } catch (err) {
      const msg = (err as Error).message
      dbg(`ERROR: ${msg}`)
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, text: `❌ ${msg}` } : m
      ))
    } finally {
      streamingRef.current = false
      setIsStreaming(false)
      dbg('done.')
    }
  }

  function reset() {
    if (streamingRef.current) return
    setMessages([])
    threadId.current = crypto.randomUUID()
  }

  return { messages, isStreaming, send, reset, debugLog }
}
