import { useEffect, useState } from 'react'
import {
  fetchAccountOverview, fetchBreakdownBySymbol, fetchDailyPnl, fetchEquityCurve, fetchPnlByWeekday,
} from '../api/stats'
import { fetchTrades } from '../api/trades'
import { fetchMonthlyGoal } from '../api/goals'
import { StatBox } from '../components/ui/StatBox'
import { RingGauge } from '../components/ui/RingGauge'
import { EquityChart, type EquityMode } from '../components/ui/EquityChart'
import { EquityModeToggle } from '../components/ui/EquityModeToggle'
import { MonthCalendar } from '../components/ui/MonthCalendar'
import { WeekdayBars } from '../components/ui/WeekdayBars'
import { BreakdownCard } from '../components/ui/BreakdownCard'
import { GoalProgress } from '../components/ui/GoalProgress'
import { StreakBadge } from '../components/ui/StreakBadge'
import { EmptyState } from '../components/ui/EmptyState'
import { fmtEuro, pnlClass } from '../lib/format'
import { computeStreak } from '../lib/streak'
import { monthlyPnl } from '../lib/monthlyPnl'
import type { AccountOverview, AccountType, DailyPnl, EquityPoint, MonthlyGoal, SymbolBreakdown, Trade, WeekdayPnl } from '../types/domain'

const ACCOUNT_LABEL: Record<AccountType, string> = { live: 'Live Account Statistik', propfirm: 'Prop Account Statistik' }

export function StatistikPage({ account }: { account: AccountType }) {
  const [overview, setOverview] = useState<AccountOverview | null>(null)
  const [equity, setEquity] = useState<EquityPoint[]>([])
  const [daily, setDaily] = useState<DailyPnl[]>([])
  const [weekday, setWeekday] = useState<WeekdayPnl[]>([])
  const [symbols, setSymbols] = useState<SymbolBreakdown[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [goal, setGoal] = useState<MonthlyGoal | null>(null)
  const [loading, setLoading] = useState(true)
  const [equityMode, setEquityMode] = useState<EquityMode>('pnl')

  useEffect(() => {
    setLoading(true)
    const now = new Date()
    Promise.all([
      fetchAccountOverview(account),
      fetchEquityCurve(account),
      fetchDailyPnl(account),
      fetchPnlByWeekday(account),
      fetchBreakdownBySymbol(account),
      fetchTrades({ account }),
      fetchMonthlyGoal(account, now.getFullYear(), now.getMonth() + 1),
    ]).then(([o, e, d, w, s, t, g]) => {
      setOverview(o)
      setEquity(e)
      setDaily(d)
      setWeekday(w)
      setSymbols(s)
      setTrades(t)
      setGoal(g)
      setLoading(false)
    })
  }, [account])

  if (loading) return <div className="loading-screen">Lade…</div>

  const hasTrades = (overview?.trade_count ?? 0) > 0

  const now = new Date()
  const currentMonthPnl = monthlyPnl(daily, now.getFullYear(), now.getMonth() + 1)
  const streak = computeStreak(trades)

  return (
    <div>
      <h1 className="page-title">{ACCOUNT_LABEL[account]}</h1>

      <div className="kpi-row">
        <StatBox label="Kontostand" value={fmtEuro(overview?.current_balance ?? 0)} />
        <StatBox label="PnL" value={fmtEuro(overview?.total_pnl ?? 0)} valueClassName={pnlClass(overview?.total_pnl ?? 0)} />
        <StatBox label="Profit-Faktor" value={overview?.profit_factor?.toString() ?? '–'} />
        <StatBox label="Trades" value={String(overview?.trade_count ?? 0)} />
      </div>

      <div className="goal-and-streak-row">
        <div className="card">
          <GoalProgress currentPnl={currentMonthPnl} targetPnl={goal?.target_pnl ?? null} />
        </div>
        <div className="card">
          <StreakBadge streak={streak} />
        </div>
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

          <div className="kpi-row">
            <StatBox label="Ø Gewinn-Trade" value={fmtEuro(overview?.avg_win_pnl ?? null)} valueClassName="positive" />
            <StatBox label="Ø Verlust-Trade" value={fmtEuro(overview?.avg_loss_pnl ?? null)} valueClassName="negative" />
          </div>

          <div className="section-header">
            <h2 className="section-title">Equity-Kurve</h2>
            <EquityModeToggle value={equityMode} onChange={setEquityMode} />
          </div>
          <div className="card">
            <EquityChart points={equity} mode={equityMode} />
          </div>

          <h2 className="section-title">Kalender</h2>
          <div className="card">
            <MonthCalendar data={daily} account={account} />
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
