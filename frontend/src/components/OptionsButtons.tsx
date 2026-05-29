import type { OptionsData } from '../agui/types'
import './components.css'

interface Props extends OptionsData {
  onChoice: (option: string) => void
}

export function OptionsButtons({ question, options, onChoice }: Props) {
  function handleClick(opt: string, e: React.MouseEvent<HTMLButtonElement>) {
    // Disable all buttons after click
    const parent = (e.target as HTMLElement).closest('.ag-options-btns')
    parent?.querySelectorAll('button').forEach(b => { (b as HTMLButtonElement).disabled = true })
    ;(e.target as HTMLButtonElement).classList.add('selected')
    onChoice(opt)
  }

  return (
    <div className="ag-options">
      <div className="ag-options-q">{question}</div>
      <div className="ag-options-btns">
        {options.map(opt => (
          <button key={opt} className="ag-opt-btn" onClick={e => handleClick(opt, e)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
