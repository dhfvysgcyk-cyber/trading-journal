interface StatBoxProps {
  label: string
  value: string
  valueClassName?: string
}

export function StatBox({ label, value, valueClassName }: StatBoxProps) {
  return (
    <div className="card">
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value ${valueClassName ?? ''}`}>{value}</div>
    </div>
  )
}
