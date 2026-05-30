/**
 * Onboarding Layout — Bank Account journey
 * Friendly green theme with checklist-style steps sidebar.
 */
import { useState } from 'react'
import './Onboarding.css'

type UA = (msg: string) => void

function OBWelcome({ data, onUserAction }: { data: any; onUserAction: UA }) {
  return (
    <div className="ob-welcome">
      <div className="ob-welcome-blob">
        <span className="ob-welcome-emoji">{data.icon}</span>
      </div>
      <h1 className="ob-welcome-title">{data.title}</h1>
      <p className="ob-welcome-desc">{data.description}</p>
      <div className="ob-perks">
        <div className="ob-perk">✅ No monthly fees</div>
        <div className="ob-perk">✅ Open in minutes</div>
        <div className="ob-perk">✅ FDIC Insured</div>
      </div>
      <button className="ob-cta-btn" onClick={() => onUserAction(data.cta_label)}>
        {data.cta_label} →
      </button>
    </div>
  )
}

function OBProgress({ data }: { data: any }) {
  return (
    <div className="ob-progress">
      {data.steps?.map((step: string, i: number) => {
        const done   = i < data.current - 1
        const active = i === data.current - 1
        return (
          <div key={i} className={`ob-step ${done ? 'done' : active ? 'active' : ''}`}>
            <div className="ob-step-icon">{done ? '✓' : active ? '●' : '○'}</div>
            <span>{step}</span>
          </div>
        )
      })}
    </div>
  )
}

function OBForm({ data, onUserAction }: { data: any; onUserAction: UA }) {
  const [values,    setValues]    = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    setSubmitted(true)
    const parts = data.fields
      .map((f: any) => `${f.name}: ${values[f.name] || ''}`)
      .join(' | ')
    onUserAction(`[Form Response] ${parts}`)
  }

  return (
    <div className="ob-form-layout">
      {/* Left: Step sidebar */}
      <div className="ob-sidebar">
        <div className="ob-sidebar-title">Your Progress</div>
        <div className="ob-sidebar-items">
          {data.fields?.slice(0, 4).map((f: any) => (
            <div key={f.name} className={`ob-sidebar-item ${values[f.name] ? 'filled' : ''}`}>
              <span className="ob-sidebar-check">{values[f.name] ? '✓' : '○'}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Form */}
      <div className="ob-form-right">
        <h2 className="ob-form-title">{data.title}</h2>
        <div className="ob-fields">
          {data.fields?.map((field: any) => (
            <div key={field.name} className="ob-field">
              <label>{field.label}{field.required && <span className="ob-req"> *</span>}</label>
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
        <button className="ob-submit-btn" onClick={handleSubmit} disabled={submitted}>
          {submitted ? '✓ Saved' : data.submit_label}
        </button>
      </div>
    </div>
  )
}

function OBSummary({ data }: { data: any }) {
  return (
    <div className="ob-summary">
      <h2 className="ob-summary-title">🏛️ {data.title}</h2>
      <div className="ob-summary-list">
        {data.items?.map((item: any, i: number) => (
          <div key={i} className="ob-summary-row">
            <span className="ob-summary-lbl">{item.label}</span>
            <span className="ob-summary-val">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function OBDecision({ data }: { data: any }) {
  const cfg: Record<string, { icon: string; color: string }> = {
    approved: { icon: '🎉', color: '#16a34a' },
    rejected: { icon: '❌', color: '#dc2626' },
    pending:  { icon: '⏳', color: '#d97706' },
    review:   { icon: '🔍', color: '#2563eb' },
  }
  const s = cfg[data.status] || cfg.pending
  return (
    <div className="ob-decision">
      <div className="ob-decision-icon">{s.icon}</div>
      <h2 style={{ color: s.color }}>{data.title}</h2>
      <p>{data.message}</p>
    </div>
  )
}

function OBConfirmation({ data }: { data: any }) {
  return (
    <div className="ob-confirmation">
      <div className="ob-conf-icon">🏛️</div>
      <h2>{data.title}</h2>
      <div className="ob-conf-ref">Ref: <strong>{data.reference_number}</strong></div>
      <div className="ob-checklist">
        {data.next_steps?.map((s: string, i: number) => (
          <div key={i} className="ob-check-item">
            <span className="ob-check">✓</span>{s}
          </div>
        ))}
      </div>
    </div>
  )
}

function OBOptions({ data, onUserAction }: { data: any; onUserAction: UA }) {
  return (
    <div className="ob-options">
      {data.question && <p className="ob-options-q">{data.question}</p>}
      <div className="ob-options-row">
        {data.options?.map((o: string) => (
          <button key={o} className="ob-option-btn" onClick={() => onUserAction(o)}>{o}</button>
        ))}
      </div>
    </div>
  )
}

export const OnboardingLayout: Record<string, React.FC<{ data: any; onUserAction: UA }>> = {
  welcome:      OBWelcome,
  progress:     OBProgress,
  form:         OBForm,
  summary:      OBSummary,
  decision:     OBDecision,
  confirmation: OBConfirmation,
  options:      OBOptions,
}
