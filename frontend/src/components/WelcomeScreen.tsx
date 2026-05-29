import type { WelcomeData } from '../agui/types'
import './components.css'

interface Props extends WelcomeData {
  onStart: (ctaLabel: string) => void
}

export function WelcomeScreen({ icon, title, description, cta_label, color, onStart }: Props) {
  return (
    <div className={`ag-welcome ag-welcome-${color}`}>
      <div className="ag-welcome-icon">{icon}</div>
      <h2 className="ag-welcome-title">{title}</h2>
      <p  className="ag-welcome-desc">{description}</p>
      <button className="ag-welcome-btn" onClick={() => onStart(cta_label)}>
        {cta_label}
      </button>
    </div>
  )
}
