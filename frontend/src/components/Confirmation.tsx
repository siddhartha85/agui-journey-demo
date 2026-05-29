import type { ConfirmationData } from '../agui/types'
import './components.css'

export function Confirmation({ reference_number, title, next_steps }: ConfirmationData) {
  return (
    <div className="ag-confirmation">
      <div className="ag-conf-icon">🎉</div>
      <div className="ag-conf-title">{title}</div>
      <div className="ag-conf-ref">
        Reference: <strong>{reference_number}</strong>
      </div>
      {next_steps?.length > 0 && (
        <ul className="ag-conf-steps">
          {next_steps.map(s => <li key={s}>{s}</li>)}
        </ul>
      )}
    </div>
  )
}
