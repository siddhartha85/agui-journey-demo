/**
 * Card Preview Layout — Credit Card journey
 * Dark sleek theme with 3D animated card that updates live as you type.
 */
import { useState } from 'react'
import './CardPreview.css'

type UA = (msg: string) => void

// ── Welcome ──────────────────────────────────────────────────────────────────
function CPWelcome({ data, onUserAction }: { data: any; onUserAction: UA }) {
  return (
    <div className="cp-welcome">
      <div className="cp-welcome-card-visual">
        <div className="cp-demo-card">
          <div className="cp-demo-card-inner">
            <div className="cp-demo-card-front">
              <div className="cp-demo-top">
                <span className="cp-demo-bank">SecureBank</span>
                <span className="cp-demo-wifi">◎</span>
              </div>
              <div className="cp-demo-chip" />
              <div className="cp-demo-number">•••• •••• •••• ••••</div>
              <div className="cp-demo-bottom">
                <div>
                  <div className="cp-demo-label">CARD HOLDER</div>
                  <div className="cp-demo-val">YOUR NAME</div>
                </div>
                <div>
                  <div className="cp-demo-label">EXPIRES</div>
                  <div className="cp-demo-val">12/28</div>
                </div>
                <div className="cp-demo-brand">VISA</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h1 className="cp-welcome-title">{data.icon} {data.title}</h1>
      <p className="cp-welcome-desc">{data.description}</p>
      <button className="cp-cta-btn" onClick={() => onUserAction(data.cta_label)}>
        {data.cta_label} →
      </button>
    </div>
  )
}

// ── Progress ─────────────────────────────────────────────────────────────────
function CPProgress({ data }: { data: any }) {
  return (
    <div className="cp-progress">
      {data.steps?.map((step: string, i: number) => {
        const done   = i < data.current - 1
        const active = i === data.current - 1
        return (
          <div key={i} className={`cp-step ${done ? 'done' : active ? 'active' : ''}`}>
            <div className="cp-step-dot">{done ? '✓' : i + 1}</div>
            <span className="cp-step-label">{step}</span>
            {i < data.steps.length - 1 && <div className={`cp-step-line ${done ? 'done' : ''}`} />}
          </div>
        )
      })}
    </div>
  )
}

// ── Form with Live Card Preview ───────────────────────────────────────────────
function CPForm({ data, onUserAction }: { data: any; onUserAction: UA }) {
  const [values,  setValues]  = useState<Record<string, string>>({})
  const [flipped, setFlipped] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const cardName = values.full_name?.toUpperCase() || 'YOUR NAME'
  const cardType = values.card_type || ''
  const brand    = cardType.toLowerCase().includes('mastercard') ? 'MASTERCARD' : 'VISA'

  function set(name: string, val: string) {
    setValues(p => ({ ...p, [name]: val }))
  }

  function handleSubmit() {
    setSubmitted(true)
    const parts = data.fields
      .map((f: any) => `${f.name}: ${values[f.name] || ''}`)
      .join(' | ')
    onUserAction(`[Form Response] ${parts}`)
  }

  return (
    <div className="cp-form-layout">
      {/* ── Left: Form ── */}
      <div className="cp-form-left">
        <h2 className="cp-form-title">{data.title}</h2>
        <div className="cp-fields">
          {data.fields?.map((field: any) => (
            <div key={field.name} className="cp-field">
              <label>{field.label}{field.required && <span className="cp-req"> *</span>}</label>
              {field.type === 'select' ? (
                <select
                  disabled={submitted}
                  value={values[field.name] || ''}
                  onChange={e => set(field.name, e.target.value)}
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
                  onChange={e => set(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <button className="cp-submit-btn" onClick={handleSubmit} disabled={submitted}>
          {submitted ? '✓ Submitted' : data.submit_label}
        </button>
      </div>

      {/* ── Right: 3D Card Preview ── */}
      <div className="cp-form-right">
        <p className="cp-preview-label">Your Card Preview</p>
        <div className={`cp-card-scene ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(f => !f)}>
          <div className="cp-card-inner">
            {/* Front */}
            <div className="cp-card-front">
              <div className="cp-card-top-row">
                <span className="cp-card-bank">SecureBank</span>
                <span className="cp-card-wifi">◎</span>
              </div>
              <div className="cp-chip" />
              <div className="cp-card-number">•••• •••• •••• ••••</div>
              <div className="cp-card-bottom-row">
                <div>
                  <div className="cp-card-lbl">CARD HOLDER</div>
                  <div className="cp-card-val">{cardName}</div>
                </div>
                <div>
                  <div className="cp-card-lbl">EXPIRES</div>
                  <div className="cp-card-val">12 / 28</div>
                </div>
                <div className="cp-brand">{brand}</div>
              </div>
            </div>
            {/* Back */}
            <div className="cp-card-back">
              <div className="cp-mag-stripe" />
              <div className="cp-cvv-row">
                <div className="cp-sig-strip" />
                <div className="cp-cvv-box">
                  <div className="cp-cvv-lbl">CVV</div>
                  <div className="cp-cvv-val">•••</div>
                </div>
              </div>
              <div className="cp-card-type-back">{cardType || 'Credit Card'}</div>
            </div>
          </div>
        </div>
        <p className="cp-flip-hint">👆 Click card to flip</p>
      </div>
    </div>
  )
}

// ── Summary ───────────────────────────────────────────────────────────────────
function CPSummary({ data }: { data: any }) {
  return (
    <div className="cp-summary">
      <h2 className="cp-summary-title">💳 {data.title}</h2>
      <div className="cp-summary-grid">
        {data.items?.map((item: any, i: number) => (
          <div key={i} className="cp-summary-row">
            <span className="cp-summary-label">{item.label}</span>
            <span className="cp-summary-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Decision ──────────────────────────────────────────────────────────────────
function CPDecision({ data }: { data: any }) {
  const cfg: Record<string, { icon: string; color: string; bg: string }> = {
    approved: { icon: '✅', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    rejected: { icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    pending:  { icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    review:   { icon: '🔍', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  }
  const s = cfg[data.status] || cfg.pending
  return (
    <div className="cp-decision" style={{ background: s.bg, borderColor: s.color }}>
      <div className="cp-decision-icon">{s.icon}</div>
      <h2 style={{ color: s.color }}>{data.title}</h2>
      <p className="cp-decision-msg">{data.message}</p>
    </div>
  )
}

// ── Confirmation ──────────────────────────────────────────────────────────────
function CPConfirmation({ data }: { data: any }) {
  return (
    <div className="cp-confirmation">
      <div className="cp-conf-icon">💳</div>
      <h2 className="cp-conf-title">{data.title}</h2>
      <div className="cp-ref-badge">Ref: {data.reference_number}</div>
      <ul className="cp-next-steps">
        {data.next_steps?.map((s: string, i: number) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  )
}

// ── Options (themed) ──────────────────────────────────────────────────────────
function CPOptions({ data, onUserAction }: { data: any; onUserAction: UA }) {
  return (
    <div className="cp-options">
      {data.question && <p className="cp-options-q">{data.question}</p>}
      <div className="cp-options-btns">
        {data.options?.map((o: string) => (
          <button key={o} className="cp-option-btn" onClick={() => onUserAction(o)}>{o}</button>
        ))}
      </div>
    </div>
  )
}

// ── Export map ────────────────────────────────────────────────────────────────
export const CardPreviewLayout: Record<string, React.FC<{ data: any; onUserAction: UA }>> = {
  welcome:      CPWelcome,
  progress:     CPProgress,
  form:         CPForm,
  summary:      CPSummary,
  decision:     CPDecision,
  confirmation: CPConfirmation,
  options:      CPOptions,
}
