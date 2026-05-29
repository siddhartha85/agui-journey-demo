import type { FormData } from '../agui/types'
import './components.css'

interface Props extends FormData {
  onSubmit: (data: string) => void
}

export function JourneyForm({ title, fields, submit_label, onSubmit }: Props) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd    = new FormData(e.currentTarget)
    const parts = [...fd.entries()].map(([k, v]) => `${k}: ${v}`)
    // Disable all inputs after submit
    const inputs = e.currentTarget.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input,select')
    inputs.forEach(el => { el.disabled = true })
    const btn = e.currentTarget.querySelector<HTMLButtonElement>('button')
    if (btn) btn.disabled = true
    onSubmit(`[Form Response] ${parts.join(' | ')}`)
  }

  return (
    <div className="ag-form">
      <div className="ag-form-title">{title}</div>
      <form className="ag-form-grid" onSubmit={handleSubmit}>
        {fields.map(f => (
          <div className="ag-field" key={f.name}>
            <label htmlFor={f.name}>
              {f.label}{f.required && <span className="req"> *</span>}
            </label>

            {f.type === 'select' ? (
              <select id={f.name} name={f.name} required={f.required}>
                <option value="">Select…</option>
                {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                id={f.name} name={f.name} type={f.type}
                placeholder={f.placeholder ?? ''}
                required={f.required}
              />
            )}
          </div>
        ))}
        <div style={{ gridColumn: '1 / -1' }}>
          <button type="submit" className="ag-form-btn">{submit_label}</button>
        </div>
      </form>
    </div>
  )
}
