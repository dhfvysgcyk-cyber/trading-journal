import type { WeekdayPnl } from '../../types/domain'
import { fmtEuro, pnlClass } from '../../lib/format'

const WEEKDAY_LABEL = ['', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export function WeekdayBars({ data }: { data: WeekdayPnl[] }) {
  const byWeekday = new Map(data.map((d) => [d.weekday, d]))
  const maxAbs = Math.max(1, ...data.map((d) => Math.abs(d.pnl)))

  return (
    <div className="weekday-bars">
      {[1, 2, 3, 4, 5, 6, 7].map((wd) => {
        const entry = byWeekday.get(wd)
        const pnl = entry?.pnl ?? 0
        const heightPct = entry ? Math.max(4, (Math.abs(pnl) / maxAbs) * 100) : 0
        return (
          <div key={wd} className="weekday-bar-col">
            <div className="weekday-bar-track">
              <div
                className={`weekday-bar-fill ${pnlClass(pnl)}`}
                style={{ height: `${heightPct}%`, background: pnl >= 0 ? 'var(--positive)' : 'var(--negative)' }}
              />
            </div>
            <div className="weekday-bar-label">{WEEKDAY_LABEL[wd]}</div>
            <div className={`weekday-bar-value ${pnlClass(pnl)}`}>{entry ? fmtEuro(pnl) : '–'}</div>
          </div>
        )
      })}
    </div>
  )
}
