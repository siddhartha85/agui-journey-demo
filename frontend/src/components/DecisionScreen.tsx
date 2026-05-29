import type { DecisionData } from '../agui/types'
import './components.css'

const ICONS   = { approved: '✅', rejected: '❌', pending: '⏳', review: '🔍' }

export function DecisionScreen({ status, title, message, details }: DecisionData) {
  return (
    <div className={`ag-decision ag-decision-${status}`}>
      <div className="ag-dec-icon">{ICONS[status]}</div>
      <div className="ag-dec-title">{title}</div>
      <div className="ag-dec-msg">{message}</div>
      {details && details.length > 0 && (
        <div className="ag-dec-details">
          {details.map(d => (
            <div key={d.label} className="ag-dec-detail">
              <span>{d.label}</span>
              <strong>{d.value}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
