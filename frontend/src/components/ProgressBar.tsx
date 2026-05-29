import type { ProgressData } from '../agui/types'
import './components.css'

export function ProgressBar({ current, steps }: ProgressData) {
  return (
    <div className="ag-progress">
      {steps.map((name, i) => {
        const n   = i + 1
        const cls = n < current ? 'done' : n === current ? 'active' : 'upcoming'
        return (
          <div key={name} className="ag-step-wrapper">
            {i > 0 && <div className={`ag-step-line ${n <= current ? 'done-line' : ''}`} />}
            <div className={`ag-step ${cls}`}>
              <div className="ag-step-dot">{n < current ? '✓' : n}</div>
              <div className="ag-step-label">{name}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
