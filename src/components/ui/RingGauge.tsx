interface RingGaugeProps {
  label: string
  value: number | null
  suffix?: string
  max?: number
}

export function RingGauge({ label, value, suffix = '%', max = 100 }: RingGaugeProps) {
  const pct = value === null ? 0 : Math.max(0, Math.min(100, (value / max) * 100))
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="card ring-gauge">
      <svg viewBox="0 0 100 100" className="ring-gauge-svg">
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="42" fill="none"
          stroke="var(--accent)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="54" textAnchor="middle" fontSize="20" fill="var(--text-primary)" fontWeight="700">
          {value === null ? '–' : `${value}${suffix}`}
        </text>
      </svg>
      <div className="ring-gauge-label">{label}</div>
    </div>
  )
}
