import { useState } from 'react'
import { Modal } from './Modal'
import { EmptyState } from './EmptyState'
import { fetchTrades } from '../../api/trades'
import { fmtEuro, fmtDate, pnlClass } from '../../lib/format'
import type { AccountType, DailyPnl, Trade } from '../../types/domain'

const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTH_LABELS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

function cellClass(pnl: number | undefined): string {
  if (pnl === undefined) return 'month-cell-empty'
  if (pnl > 0) return 'month-cell-pos'
  if (pnl < 0) return 'month-cell-neg'
  return 'month-cell-flat'
}

export function MonthCalendar({ data, account }: { data: DailyPnl[]; account: AccountType }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayTrades, setDayTrades] = useState<Trade[]>([])
  const [loadingDay, setLoadingDay] = useState(false)

  const byDate = new Map(data.map((d) => [d.trade_date, d.pnl]))

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7

  const cells: (string | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
  }

  async function openDay(iso: string) {
    setSelectedDate(iso)
    setLoadingDay(true)
    const trades = await fetchTrades({ account, from: `${iso}T00:00:00`, to: `${iso}T23:59:59` })
    setDayTrades(trades)
    setLoadingDay(false)
  }

  return (
    <div>
      <div className="month-calendar-header">
        <button type="button" className="icon-btn" aria-label="Vorheriger Monat" onClick={() => setCursor(new Date(year, month - 1, 1))}>‹</button>
        <span className="month-calendar-title">{MONTH_LABELS[month]} {year}</span>
        <button type="button" className="icon-btn" aria-label="Nächster Monat" onClick={() => setCursor(new Date(year, month + 1, 1))}>›</button>
      </div>

      <div className="month-calendar-grid">
        {WEEKDAY_LABELS.map((w) => <div key={w} className="month-weekday-label">{w}</div>)}
        {cells.map((iso, i) => {
          if (!iso) return <div key={`pad-${i}`} className="month-cell month-cell-pad" />
          const pnl = byDate.get(iso)
          const day = Number(iso.slice(8, 10))
          return (
            <button key={iso} type="button" className={`month-cell ${cellClass(pnl)}`} onClick={() => openDay(iso)}>
              <span className="month-cell-day">{day}</span>
              {pnl !== undefined && <span className="month-cell-pnl">{Math.round(pnl)}</span>}
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <Modal title={fmtDate(selectedDate)} onClose={() => setSelectedDate(null)}>
          {loadingDay ? (
            <div className="loading-screen">Lade…</div>
          ) : dayTrades.length === 0 ? (
            <EmptyState text="Keine Trades an diesem Tag." />
          ) : (
            <div className="detail-list">
              {dayTrades.map((t) => (
                <div key={t.id} className="detail-row">
                  <span className="detail-label">{t.symbol ?? '–'} ({t.direction ?? '–'}, {t.result ?? '–'})</span>
                  <span className={pnlClass(t.pnl)}>{fmtEuro(t.pnl)}</span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
