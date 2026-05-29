import type { CardData } from '../agui/types'
import './components.css'

export function InfoCard({ emoji, title, body, color }: CardData) {
  return (
    <div className={`ag-card ag-card-${color}`}>
      <div className="ag-card-header">
        <span className="ag-card-emoji">{emoji}</span>
        <span className="ag-card-title">{title}</span>
      </div>
      <div className="ag-card-body">{body}</div>
    </div>
  )
}
