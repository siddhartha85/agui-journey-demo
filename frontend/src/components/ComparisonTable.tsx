import type { TableData } from '../agui/types'
import './components.css'

export function ComparisonTable({ title, headers, rows }: TableData) {
  return (
    <div className="ag-table-wrap">
      <div className="ag-table-title">{title}</div>
      <table className="ag-table">
        <thead>
          <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td key={j}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
