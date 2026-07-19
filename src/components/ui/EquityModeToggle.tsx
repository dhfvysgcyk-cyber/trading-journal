import type { EquityMode } from './EquityChart'

export function EquityModeToggle({ value, onChange }: { value: EquityMode; onChange: (mode: EquityMode) => void }) {
  return (
    <div className="segmented-control">
      <button
        type="button"
        className={`segmented-option${value === 'pnl' ? ' active' : ''}`}
        onClick={() => onChange('pnl')}
      >
        PnL
      </button>
      <button
        type="button"
        className={`segmented-option${value === 'balance' ? ' active' : ''}`}
        onClick={() => onChange('balance')}
      >
        Kontostand
      </button>
    </div>
  )
}
