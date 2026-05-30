/**
 * Financial Layout — Loan Application journey
 * Professional blue theme with live EMI calculator panel.
 */
import { useState, useMemo } from 'react'
import './Financial.css'

type UA = (msg: string) => void

// ── EMI Calculator ────────────────────────────────────────────────────────────
function calcEMI(principal: number, annualRate: number, months: number) {
  if (!principal || !months) return 0
  const r = annualRate / 12 / 100
  if (r === 0) return principal / months
  return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1)
}

function parseTerm(term: string): number {
  const m = term.match(/(\d+)/)
  return m ? parseInt(m[1]) : 24
}

// ── Welcome ───────────────────────────────────────────────────────────────────
function FWelcome({ data, onUserAction }: { data: any; onUserAction: UA }) {
  return (
    <div className="fi-welcome">
      <div className="fi-welcome-icon">{data.icon}</div>
      <h1 className="fi-welcome-title">{data.title}</h1>
      <p className="fi-welcome-desc">{data.description}</p>
      <div className="fi-rate-badges">
        <div className="fi-badge">📊 From 6.9% APR</div>
        <div className="fi-badge">⚡ Instant Decision</div>
        <div className="fi-badge">🔒 Secure & Safe</div>
      </div>
      <button className="fi-cta-btn" onClick={() => onUserAction(data.cta_label)}>
        {data.cta_label} →
      </button>
    </div>
  )
}

// ── Progress ──────────────────────────────────────────────────────────────────
function FProgress({ data }: { data: any }) {
  return (
    <div className="fi-progress">
      <div className="fi-progress-track">
        {data.steps?.map((step: string, i: number) => {
          const done   = i < data.current - 1
          const active = i === data.current - 1
          return (
            <div key={i} className={`fi-step ${done ? 'done' : active ? 'active' : ''}`}>
              <div className="fi-step-circle">{done ? '✓' : i + 1}</div>
              <span className="fi-step-name">{step}</span>
              {i < data.steps.length - 1 && <div className={`fi-connector ${done ? 'done' : ''}`} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Form with EMI Calculator ──────────────────────────────────────────────────
function FForm({ data, onUserAction }: { data: any; onUserAction: UA }) {
  const [values,    setValues]    = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const income  = parseFloat(values.monthly_income  || '0')
  const amount  = parseFloat(values.loan_amount     || '0')
  const termStr = values.loan_term || '24 months'
  const months  = parseTerm(termStr)
  const APR     = 6.9

  const emi         = useMemo(() => calcEMI(amount, APR, months), [amount, months])
  const total       = emi * months
  const interest    = total - amount
  const ratio       = income > 0 ? (emi / income) * 100 : 0
  const affordable  = ratio < 35 ? 'comfortable' : ratio < 50 ? 'borderline' : 'high'

  function handleSubmit() {
    setSubmitted(true)
    const parts = data.fields
      .map((f: any) => `${f.name}: ${values[f.name] || ''}`)
      .join(' | ')
    onUserAction(`[Form Response] ${parts}`)
  }

  return (
    <div className="fi-form-layout">
      {/* Left: Form */}
      <div className="fi-form-left">
        <h2 className="fi-form-title">{data.title}</h2>
        <div className="fi-fields">
          {data.fields?.map((field: any) => (
            <div key={field.name} className="fi-field">
              <label>{field.label}{field.required && <span className="fi-req"> *</span>}</label>
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
        <button className="fi-submit-btn" onClick={handleSubmit} disabled={submitted}>
          {submitted ? '✓ Submitted' : data.submit_label}
        </button>
      </div>

      {/* Right: EMI Calculator */}
      <div className="fi-calc-panel">
        <div className="fi-calc-header">📊 Live Calculator</div>

        <div className="fi-emi-display">
          <span className="fi-emi-label">Monthly Payment</span>
          <span className="fi-emi-amount">
            {emi > 0 ? `$${Math.round(emi).toLocaleString()}` : '—'}<span className="fi-emi-mo">/mo</span>
          </span>
          <span className="fi-apr-note">at {APR}% APR</span>
        </div>

        {emi > 0 && (
          <>
            <div className="fi-calc-row">
              <span>Total Repayable</span>
              <strong>${Math.round(total).toLocaleString()}</strong>
            </div>
            <div className="fi-calc-row">
              <span>Total Interest</span>
              <strong>${Math.round(interest).toLocaleString()}</strong>
            </div>

            <div className="fi-afford-section">
              <div className="fi-afford-label">
                Affordability
                <span className={`fi-afford-badge ${affordable}`}>
                  {affordable === 'comfortable' ? '✅ Good' : affordable === 'borderline' ? '⚠️ Borderline' : '❌ High'}
                </span>
              </div>
              <div className="fi-afford-bar-bg">
                <div
                  className={`fi-afford-bar ${affordable}`}
                  style={{ width: `${Math.min(ratio, 100)}%` }}
                />
              </div>
              <div className="fi-afford-pct">{Math.round(ratio)}% of monthly income</div>
            </div>
          </>
        )}

        {!emi && (
          <p className="fi-calc-placeholder">Fill in income, amount and term to see your estimate</p>
        )}
      </div>
    </div>
  )
}

// ── Summary ───────────────────────────────────────────────────────────────────
function FSummary({ data }: { data: any }) {
  return (
    <div className="fi-summary">
      <h2 className="fi-summary-title">🏦 {data.title}</h2>
      <div className="fi-summary-list">
        {data.items?.map((item: any, i: number) => (
          <div key={i} className="fi-summary-row">
            <span className="fi-summary-lbl">{item.label}</span>
            <span className="fi-summary-val">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Decision ──────────────────────────────────────────────────────────────────
function FDecision({ data }: { data: any }) {
  const cfg: Record<string, { icon: string; color: string; border: string }> = {
    approved: { icon: '✅', color: '#16a34a', border: '#bbf7d0' },
    rejected: { icon: '❌', color: '#dc2626', border: '#fecaca' },
    pending:  { icon: '⏳', color: '#d97706', border: '#fde68a' },
    review:   { icon: '🔍', color: '#2563eb', border: '#bfdbfe' },
  }
  const s = cfg[data.status] || cfg.pending
  return (
    <div className="fi-decision" style={{ borderColor: s.border }}>
      <div className="fi-decision-icon">{s.icon}</div>
      <h2 style={{ color: s.color }}>{data.title}</h2>
      <p className="fi-decision-msg">{data.message}</p>
    </div>
  )
}

// ── Confirmation ──────────────────────────────────────────────────────────────
function FConfirmation({ data }: { data: any }) {
  return (
    <div className="fi-confirmation">
      <div className="fi-conf-check">🏦</div>
      <h2 className="fi-conf-title">{data.title}</h2>
      <div className="fi-conf-ref">Reference: <strong>{data.reference_number}</strong></div>
      <ul className="fi-steps-list">
        {data.next_steps?.map((s: string, i: number) => (
          <li key={i}><span className="fi-step-num">{i + 1}</span>{s}</li>
        ))}
      </ul>
    </div>
  )
}

// ── Options ───────────────────────────────────────────────────────────────────
function FOptions({ data, onUserAction }: { data: any; onUserAction: UA }) {
  return (
    <div className="fi-options">
      {data.question && <p className="fi-options-q">{data.question}</p>}
      <div className="fi-options-row">
        {data.options?.map((o: string) => (
          <button key={o} className="fi-option-btn" onClick={() => onUserAction(o)}>{o}</button>
        ))}
      </div>
    </div>
  )
}

export const FinancialLayout: Record<string, React.FC<{ data: any; onUserAction: UA }>> = {
  welcome:      FWelcome,
  progress:     FProgress,
  form:         FForm,
  summary:      FSummary,
  decision:     FDecision,
  confirmation: FConfirmation,
  options:      FOptions,
}
