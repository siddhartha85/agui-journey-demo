/**
 * Document Layout — Insurance Claim journey
 * Warm orange theme with timeline progress and incident summary panel.
 */
import { useState } from 'react'
import './Document.css'

type UA = (msg: string) => void

function DocWelcome({ data, onUserAction }: { data: any; onUserAction: UA }) {
  return (
    <div className="doc-welcome">
      <div className="doc-welcome-header">
        <div className="doc-welcome-icon-wrap">
          <span className="doc-welcome-icon">{data.icon}</span>
        </div>
        <div className="doc-welcome-text">
          <h1>{data.title}</h1>
          <p>{data.description}</p>
        </div>
      </div>
      <div className="doc-timeline-preview">
        {['Incident Details', 'Supporting Info', 'Review', 'Decision'].map((s, i) => (
          <div key={i} className="doc-tl-dot">
            <div className="doc-tl-circle">{i + 1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>
      <button className="doc-cta-btn" onClick={() => onUserAction(data.cta_label)}>
        {data.cta_label} →
      </button>
    </div>
  )
}

function DocProgress({ data }: { data: any }) {
  return (
    <div className="doc-progress">
      {data.steps?.map((step: string, i: number) => {
        const done   = i < data.current - 1
        const active = i === data.current - 1
        return (
          <div key={i} className={`doc-tl-step ${done ? 'done' : active ? 'active' : ''}`}>
            <div className="doc-tl-node">{done ? '✓' : i + 1}</div>
            <span className="doc-tl-label">{step}</span>
            {i < data.steps.length - 1 && <div className={`doc-tl-line ${done ? 'done' : ''}`} />}
          </div>
        )
      })}
    </div>
  )
}

function DocForm({ data, onUserAction }: { data: any; onUserAction: UA }) {
  const [values,    setValues]    = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    setSubmitted(true)
    const parts = data.fields
      .map((f: any) => `${f.name}: ${values[f.name] || ''}`)
      .join(' | ')
    onUserAction(`[Form Response] ${parts}`)
  }

  const filledFields = data.fields?.filter((f: any) => values[f.name]) || []

  return (
    <div className="doc-form-layout">
      {/* Left: Form */}
      <div className="doc-form-left">
        <h2 className="doc-form-title">{data.title}</h2>
        <div className="doc-fields">
          {data.fields?.map((field: any) => (
            <div key={field.name} className="doc-field">
              <label>{field.label}{field.required && <span className="doc-req"> *</span>}</label>
              {field.type === 'select' ? (
                <select
                  disabled={submitted}
                  value={values[field.name] || ''}
                  onChange={e => setValues(p => ({ ...p, [field.name]: e.target.value }))}
                >
                  <option value="">Select…</option>
                  {field.options?.map((o: string) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder || ''}
                  disabled={submitted}
                  value={values[field.name] || ''}
                  onChange={e => setValues(p => ({ ...p, [field.name]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
        <button className="doc-submit-btn" onClick={handleSubmit} disabled={submitted}>
          {submitted ? '✓ Submitted' : data.submit_label}
        </button>
      </div>

      {/* Right: Incident Summary Panel */}
      <div className="doc-summary-panel">
        <div className="doc-panel-header">📋 Claim Summary</div>
        {filledFields.length === 0 ? (
          <p className="doc-panel-empty">Fill in the form to build your claim summary</p>
        ) : (
          <div className="doc-panel-items">
            {filledFields.map((f: any) => (
              <div key={f.name} className="doc-panel-row">
                <span className="doc-panel-lbl">{f.label}</span>
                <span className="doc-panel-val">{values[f.name]}</span>
              </div>
            ))}
          </div>
        )}
        <div className="doc-panel-status">
          <span className="doc-status-dot" />
          {submitted ? 'Claim data recorded' : 'Building claim…'}
        </div>
      </div>
    </div>
  )
}

function DocSummary({ data }: { data: any }) {
  return (
    <div className="doc-summary">
      <h2 className="doc-summary-title">📋 {data.title}</h2>
      <div className="doc-summary-list">
        {data.items?.map((item: any, i: number) => (
          <div key={i} className="doc-summary-row">
            <span className="doc-summary-lbl">{item.label}</span>
            <span className="doc-summary-val">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DocDecision({ data }: { data: any }) {
  const cfg: Record<string, { icon: string; color: string }> = {
    approved: { icon: '✅', color: '#16a34a' },
    rejected: { icon: '❌', color: '#dc2626' },
    pending:  { icon: '⏳', color: '#d97706' },
    review:   { icon: '🔍', color: '#ea580c' },
  }
  const s = cfg[data.status] || cfg.pending
  return (
    <div className="doc-decision">
      <div className="doc-decision-icon">{s.icon}</div>
      <h2 style={{ color: s.color }}>{data.title}</h2>
      <p>{data.message}</p>
    </div>
  )
}

function DocConfirmation({ data }: { data: any }) {
  return (
    <div className="doc-confirmation">
      <div className="doc-conf-icon">📋</div>
      <h2>{data.title}</h2>
      <div className="doc-conf-ref">Claim Ref: <strong>{data.reference_number}</strong></div>
      <div className="doc-next-steps">
        {data.next_steps?.map((s: string, i: number) => (
          <div key={i} className="doc-next-row">
            <span className="doc-next-num">{i + 1}</span><span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DocOptions({ data, onUserAction }: { data: any; onUserAction: UA }) {
  return (
    <div className="doc-options">
      {data.question && <p className="doc-options-q">{data.question}</p>}
      <div className="doc-options-row">
        {data.options?.map((o: string) => (
          <button key={o} className="doc-option-btn" onClick={() => onUserAction(o)}>{o}</button>
        ))}
      </div>
    </div>
  )
}

export const DocumentLayout: Record<string, React.FC<{ data: any; onUserAction: UA }>> = {
  welcome:      DocWelcome,
  progress:     DocProgress,
  form:         DocForm,
  summary:      DocSummary,
  decision:     DocDecision,
  confirmation: DocConfirmation,
  options:      DocOptions,
}
