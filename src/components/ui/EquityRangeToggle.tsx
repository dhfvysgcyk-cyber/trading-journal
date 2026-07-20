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
    <div className="select-pill-wrap">
      <select
        className="select-pill"
        aria-label="Zeitraum"
        value={value}
        onChange={(e) => onChange(e.target.value as EquityRange)}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <span className="select-pill-chevron">▾</span>
    </div>
  )
}
