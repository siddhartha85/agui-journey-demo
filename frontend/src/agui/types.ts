/**
 * AG-UI Protocol — Event Type Definitions
 * ----------------------------------------
 * Every event that can arrive over the SSE stream is typed here.
 * Frontend developers import these types to get full autocomplete.
 */

export type AGUIEventType =
  | 'RUN_STARTED'
  | 'RUN_FINISHED'
  | 'RUN_ERROR'
  | 'TEXT_MESSAGE_START'
  | 'TEXT_MESSAGE_CONTENT'
  | 'TEXT_MESSAGE_END'
  | 'TOOL_CALL_START'
  | 'TOOL_CALL_ARGS'
  | 'TOOL_CALL_END'
  | 'CUSTOM_COMPONENT'   // ← agent-generated UI component

export interface AGUIEvent {
  type: AGUIEventType
  [key: string]: unknown
}

// ── Specific event shapes ──────────────────────────────────────────────────

export interface RunStartedEvent      extends AGUIEvent { type: 'RUN_STARTED';         threadId: string; runId: string }
export interface RunFinishedEvent     extends AGUIEvent { type: 'RUN_FINISHED';        threadId: string; runId: string }
export interface RunErrorEvent        extends AGUIEvent { type: 'RUN_ERROR';           message: string }
export interface TextStartEvent       extends AGUIEvent { type: 'TEXT_MESSAGE_START';  messageId: string; role: string }
export interface TextContentEvent     extends AGUIEvent { type: 'TEXT_MESSAGE_CONTENT';messageId: string; delta: string }
export interface TextEndEvent         extends AGUIEvent { type: 'TEXT_MESSAGE_END';    messageId: string }
export interface ToolCallStartEvent   extends AGUIEvent { type: 'TOOL_CALL_START';     toolCallId: string; toolCallName: string }
export interface ToolCallEndEvent     extends AGUIEvent { type: 'TOOL_CALL_END';       toolCallId: string; result: string }

/** The key event — agent tells the frontend to render a UI component */
export interface CustomComponentEvent extends AGUIEvent {
  type: 'CUSTOM_COMPONENT'
  component: string        // e.g. "welcome", "form", "decision"
  data: Record<string, unknown>
}

// ── Component data shapes ──────────────────────────────────────────────────

export interface WelcomeData {
  icon: string; title: string; description: string
  cta_label: string; color: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
}

export interface ProgressData {
  current: number; total: number; steps: string[]
}

export interface FormField {
  name: string; label: string
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'select'
  placeholder?: string; options?: string[]; required?: boolean
}

export interface FormData {
  title: string; submit_label: string; fields: FormField[]
}

export interface SummaryItem { label: string; value: string }
export interface SummaryData { title: string; items: SummaryItem[] }

export interface DecisionDetail { label: string; value: string }
export interface DecisionData {
  status: 'approved' | 'rejected' | 'pending' | 'review'
  title: string; message: string; details?: DecisionDetail[]
}

export interface ConfirmationData {
  reference_number: string; title: string; next_steps: string[]
}

export interface CardData {
  emoji: string; title: string; body: string
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
}

export interface TableData {
  title: string; headers: string[]; rows: string[][]
}

export interface OptionsData {
  question: string; options: string[]
}
