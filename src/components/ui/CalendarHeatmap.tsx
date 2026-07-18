import type { DailyPnl } from '../../types/domain'
import { fmtEuro } from '../../lib/format'

function cellClass(pnl: number | undefined): string {
  if (pnl === undefined) return 'heat-cell-empty'
  if (pnl > 0) return 'heat-cell-pos'
  if (pnl < 0) return 'heat-cell-neg'
  return 'heat-cell-flat'
}

export function CalendarHeatmap({ data }: { data: DailyPnl[] }) {
  const byDate = new Map(data.map((d) => [d.trade_date, d.pnl]))

  const days: Date[] = []
  const today = new Date()
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d)
  }

  return (
    <div className="heatmap">
      <div className="heatmap-grid">
        {days.map((d) => {
          const key = d.toISOString().slice(0, 10)
          const pnl = byDate.get(key)
          return (
            <div
              key={key}
              className={`heat-cell ${cellClass(pnl)}`}
              title={`${d.toLocaleDateString('de-DE')}${pnl !== undefined ? `: ${fmtEuro(pnl)}` : ''}`}
            />
          )
        })}
      </div>
      <div className="heatmap-legend">
        <span className="heat-cell heat-cell-neg" /> Verlust
        <span className="heat-cell heat-cell-flat" /> Neutral
        <span className="heat-cell heat-cell-pos" /> Gewinn
      </div>
    </div>
  )
}
