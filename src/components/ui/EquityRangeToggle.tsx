import type { EquityRange } from '../../lib/equityRange'

const OPTIONS: { value: EquityRange; label: string }[] = [
  { value: 'all', label: 'Gesamt' },
  { value: '6m', label: '6 Monate' },
  { value: '3m', label: '3 Monate' },
  { value: '1m', label: 'Monat' },
  { value: '1w', label: 'Woche' },
]

export function EquityRangeToggle({ value, onChange }: { value: EquityRange; onChange: (range: EquityRange) => void }) {
  return (
    <div className="segmented-control-scroll">
      <div className="segmented-control">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`segmented-option${value === opt.value ? ' active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
