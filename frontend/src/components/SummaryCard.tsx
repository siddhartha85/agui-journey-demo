import type { SummaryData } from '../agui/types'
import './components.css'

export function SummaryCard({ title, items }: SummaryData) {
  return (
    <div className="ag-summary">
      <div className="ag-summary-header">📋 {title}</div>
      <table className="ag-sum-table">
        <tbody>
          {items.map(item => (
            <tr key={item.label}>
              <td>{item.label}</td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
