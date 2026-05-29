/**
 * App.tsx — Main application
 * ---------------------------
 * This is what a frontend developer writes to use the AG-UI component library.
 * Notice how clean it is — no SSE logic, no event parsing, no component mapping.
 * All of that is handled by useAgentStream + ComponentRenderer.
 */

import { useState, useRef, useEffect } from 'react'
import { useAgentStream } from './hooks/useAgentStream'
import { ComponentRenderer } from './agui/ComponentRenderer'
import './App.css'

export default function App() {
  const { messages, isStreaming, send, reset, debugLog } = useAgentStream()
  const [input, setInput]       = useState('')
  const [connStatus, setConnStatus] = useState<'checking'|'ok'|'error'>('checking')
  const bottomRef               = useRef<HTMLDivElement>(null)

  // Test backend connection on load
  useEffect(() => {
    fetch('http://localhost:8000/ping')
      .then(r => r.json())
      .then(d => { console.log('Backend ping:', d); setConnStatus('ok') })
      .catch(e => { console.error('Backend unreachable:', e); setConnStatus('error') })
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    send(text)
  }

  // Called by interactive components (form submit, option click, CTA button)
  function handleUserAction(message: string) {
    send(message)
  }

  return (
    <div className="app">
      {/* Connection status banner */}
      {connStatus === 'error' && (
        <div style={{background:'#fee2e2',color:'#b91c1c',padding:'8px 12px',borderRadius:8,marginTop:8,fontSize:'.85rem'}}>
          ❌ Cannot reach backend at <b>localhost:8000</b>. Is the Python server running?
        </div>
      )}
      {connStatus === 'ok' && (
        <div style={{background:'#f0fdf4',color:'#15803d',padding:'6px 12px',borderRadius:8,marginTop:8,fontSize:'.8rem'}}>
          ✅ Backend connected · {isStreaming ? '⏳ Streaming…' : 'Ready'}
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="app-header-left">
          <h1>AG-UI Journey Demo</h1>
          <span className="app-subtitle">React component library · Config-driven journeys</span>
        </div>
        <button className="reset-btn" onClick={reset} title="Start over">↺ Reset</button>
      </header>

      {/* Chat / Journey area */}
      <main className="app-main">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🚀</div>
            <h2>Start a journey</h2>
            <p>Type one of these to begin:</p>
            <div className="suggestions">
              {[
                'I want to apply for a loan',
                'Open a bank account for me',
                'I need to file an insurance claim',
                'What journeys are available?',
              ].map(s => (
                <button key={s} className="suggestion-btn" onClick={() => { setInput(''); send(s) }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`message-group ${msg.role}`}>

            {/* Text bubble — only show if there's text */}
            {msg.text && (
              <div className={`bubble ${msg.role}`}>
                {msg.text}
                {isStreaming && msg.role === 'assistant' && (
                  <span className="cursor">▌</span>
                )}
              </div>
            )}

            {/* Typing indicator — while streaming with no content yet */}
            {isStreaming && msg.role === 'assistant' && !msg.text && msg.components.length === 0 && (
              <div className="bubble assistant">
                <span className="dots"><span/><span/><span/></span>
              </div>
            )}

            {/* AG-UI Components — rendered in the order they arrived */}
            {msg.components.map((event, i) => (
              <ComponentRenderer
                key={i}
                event={event}
                onUserAction={handleUserAction}
              />
            ))}
          </div>
        ))}

        <div ref={bottomRef} />
      </main>

      {/* Debug panel — shows streaming log on screen */}
      {debugLog.length > 0 && (
        <div style={{
          background: '#0f172a', color: '#7dd3fc', fontFamily: 'monospace',
          fontSize: '.72rem', padding: '10px 14px', borderRadius: 8,
          maxHeight: 160, overflowY: 'auto', marginTop: 8, flexShrink: 0,
          lineHeight: 1.6,
        }}>
          {debugLog.map((line, i) => (
            <div key={i} style={{ color: line.startsWith('ERROR') ? '#f87171' : line.startsWith('→') ? '#86efac' : '#7dd3fc' }}>
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Input bar */}
      <footer className="app-footer">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message or start a journey…"
          disabled={isStreaming}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
        >
          {isStreaming ? '…' : 'Send'}
        </button>
      </footer>
    </div>
  )
}
