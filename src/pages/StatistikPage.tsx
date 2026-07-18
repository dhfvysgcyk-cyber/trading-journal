import { useEffect, useState } from 'react'
import {
  fetchAccountOverview, fetchBreakdownBySymbol, fetchDailyPnl, fetchEquityCurve, fetchPnlByWeekday,
} from '../api/stats'
import { StatBox } from '../components/ui/StatBox'
import { RingGauge } from '../components/ui/RingGauge'
import { EquityChart } from '../components/ui/EquityChart'
import { CalendarHeatmap } from '../components/ui/CalendarHeatmap'
import { WeekdayBars } from '../components/ui/WeekdayBars'
import { BreakdownCard } from '../components/ui/BreakdownCard'
import { EmptyState } from '../components/ui/EmptyState'
import { fmtEuro, pnlClass } from '../lib/format'
import type { AccountOverview, AccountType, DailyPnl, EquityPoint, SymbolBreakdown, WeekdayPnl } from '../types/domain'

const ACCOUNT_LABEL: Record<AccountType, string> = { live: 'Live Account Statistik', propfirm: 'Prop Account Statistik' }

export function StatistikPage({ account }: { account: AccountType }) {
  const [overview, setOverview] = useState<AccountOverview | null>(null)
  const [equity, setEquity] = useState<EquityPoint[]>([])
  const [daily, setDaily] = useState<DailyPnl[]>([])
  const [weekday, setWeekday] = useState<WeekdayPnl[]>([])
  const [symbols, setSymbols] = useState<SymbolBreakdown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchAccountOverview(account),
      fetchEquityCurve(account),
      fetchDailyPnl(account),
      fetchPnlByWeekday(account),
      fetchBreakdownBySymbol(account),
    ]).then(([o, e, d, w, s]) => {
      setOverview(o)
      setEquity(e)
      setDaily(d)
      setWeekday(w)
      setSymbols(s)
      setLoading(false)
    })
  }, [account])

  if (loading) return <div className="loading-screen">Lade…</div>

  const hasTrades = (overview?.trade_count ?? 0) > 0

  return (
    <div>
      <h1 className="page-title">{ACCOUNT_LABEL[account]}</h1>

      <div className="kpi-row">
        <StatBox label="Kontostand" value={fmtEuro(overview?.current_balance ?? 0)} />
        <StatBox label="PnL" value={fmtEuro(overview?.total_pnl ?? 0)} valueClassName={pnlClass(overview?.total_pnl ?? 0)} />
        <StatBox label="Profit-Faktor" value={overview?.profit_factor?.toString() ?? '–'} />
        <StatBox label="Trades" value={String(overview?.trade_count ?? 0)} />
      </div>

      {!hasTrades ? (
        <EmptyState text="Noch keine Trades für diesen Account." />
      ) : (
        <>
          <div className="gauge-row">
            <RingGauge label="Winrate" value={overview?.winrate ?? null} />
            <RingGauge label="Ø geplantes R/R" value={overview?.avg_rr ?? null} suffix="R" max={5} />
            <RingGauge label="Ø realisiertes R/R" value={overview?.avg_realized_rr ?? null} suffix="R" max={5} />
          </div>

          <h2 className="section-title">Equity-Kurve</h2>
          <div className="card">
            <EquityChart points={equity} />
          </div>

          <h2 className="section-title">Tages-PnL (letzte 12 Wochen)</h2>
          <div className="card">
            <CalendarHeatmap data={daily} />
          </div>

          <h2 className="section-title">PnL nach Wochentag</h2>
          <div className="card">
            <WeekdayBars data={weekday} />
          </div>

          <h2 className="section-title">Nach Symbol</h2>
          <BreakdownCard data={symbols} />
        </>
      )}
    </div>
  )
}
