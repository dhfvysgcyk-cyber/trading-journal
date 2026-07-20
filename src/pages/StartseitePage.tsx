import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllAccountOverviews, fetchDailyPnl, fetchEquityCurve, fetchOverviewSummary } from '../api/stats'
import { fetchTrades, insertTrade } from '../api/trades'
import { fetchMonthlyGoal } from '../api/goals'
import { StatBox } from '../components/ui/StatBox'
import { EmptyState } from '../components/ui/EmptyState'
import { EquityChart, type EquityMode } from '../components/ui/EquityChart'
import { EquityModeToggle } from '../components/ui/EquityModeToggle'
import { EquityRangeToggle } from '../components/ui/EquityRangeToggle'
import { GoalProgress } from '../components/ui/GoalProgress'
import { MonthCalendar } from '../components/ui/MonthCalendar'
import { TradeForm } from '../components/trades/TradeForm'
import { Modal } from '../components/ui/Modal'
import { DailyNotesSection } from '../components/notes/DailyNotesSection'
import { fmtEuro, fmtPct, pnlClass, fmtDate } from '../lib/format'
import { monthlyPnl } from '../lib/monthlyPnl'
import { filterByRange, type EquityRange } from '../lib/equityRange'
import type { AccountOverview, AccountType, DailyPnl, EquityPoint, MonthlyGoal, OverviewSummary, Trade, TradeInput } from '../types/domain'

const ACCOUNT_LABEL: Record<string, string> = { live: 'Live', propfirm: 'Propfirm' }

function mergeDailyPnl(a: DailyPnl[], b: DailyPnl[]): DailyPnl[] {
  const byDate = new Map<string, DailyPnl>()
  for (const d of [...a, ...b]) {
    const existing = byDate.get(d.trade_date)
    if (existing) {
      existing.pnl += d.pnl
      existing.trade_count += d.trade_count
    } else {
      byDate.set(d.trade_date, { ...d })
    }
  }
  return Array.from(byDate.values())
}

export function StartseitePage() {
  const [summary, setSummary] = useState<OverviewSummary | null>(null)
  const [accounts, setAccounts] = useState<AccountOverview[]>([])
  const [recent, setRecent] = useState<Trade[]>([])
  const [liveEquity, setLiveEquity] = useState<EquityPoint[]>([])
  const [propEquity, setPropEquity] = useState<EquityPoint[]>([])
  const [liveDaily, setLiveDaily] = useState<DailyPnl[]>([])
  const [propDaily, setPropDaily] = useState<DailyPnl[]>([])
  const [goals, setGoals] = useState<Record<AccountType, MonthlyGoal | null>>({ live: null, propfirm: null })
  const [loading, setLoading] = useState(true)
  const [equityMode, setEquityMode] = useState<EquityMode>('pnl')
  const [equityRange, setEquityRange] = useState<EquityRange>('all')
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const now = new Date()
    const [s, a, t, le, pe, ld, pd, liveGoal, propGoal] = await Promise.all([
      fetchOverviewSummary(),
      fetchAllAccountOverviews(),
      fetchTrades(),
      fetchEquityCurve('live'),
      fetchEquityCurve('propfirm'),
      fetchDailyPnl('live'),
      fetchDailyPnl('propfirm'),
      fetchMonthlyGoal('live', now.getFullYear(), now.getMonth() + 1),
      fetchMonthlyGoal('propfirm', now.getFullYear(), now.getMonth() + 1),
    ])
    setSummary(s)
    setAccounts(a)
    setRecent(t.slice(0, 5))
    setLiveEquity(le)
    setPropEquity(pe)
    setLiveDaily(ld)
    setPropDaily(pd)
    setGoals({ live: liveGoal, propfirm: propGoal })
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  async function handleSubmit(input: TradeInput) {
    await insertTrade(input)
    setShowForm(false)
    await load()
  }

  if (loading) return <div className="loading-screen">Lade…</div>

  const dailyByAccount: Record<AccountType, DailyPnl[]> = { live: liveDaily, propfirm: propDaily }
  const now = new Date()

  return (
    <div>
      <h1 className="page-title">Startseite</h1>

      <div className="kpi-row">
        <StatBox label="Gesamt-Kontostand" value={fmtEuro(summary?.combined_balance ?? 0)} />
        <StatBox label="Gesamt-PnL" value={fmtEuro(summary?.total_pnl ?? 0)} valueClassName={pnlClass(summary?.total_pnl ?? 0)} />
        <StatBox label="Trades gesamt" value={String(summary?.trade_count ?? 0)} />
        <button type="button" className="card kpi-action" onClick={() => setShowForm(true)}>
          <span className="kpi-action-plus">+</span>
          <span>Neuer Trade</span>
        </button>
      </div>

      <div className="account-grid">
        {(['live', 'propfirm'] as const).map((acc) => {
          const overview = accounts.find((a) => a.account === acc)
          return (
            <Link key={acc} to={`/statistik/${acc}`} className="card account-card">
              <div className="account-card-title">{ACCOUNT_LABEL[acc]}</div>
              <div className="account-card-row">
                <span>Kontostand</span>
                <strong>{fmtEuro(overview?.current_balance ?? 0)}</strong>
              </div>
              <div className="account-card-row">
                <span>PnL</span>
                <strong className={pnlClass(overview?.total_pnl ?? 0)}>{fmtEuro(overview?.total_pnl ?? 0)}</strong>
              </div>
              <div className="account-card-row">
                <span>Winrate</span>
                <strong>{fmtPct(overview?.winrate ?? null)}</strong>
              </div>
              <div className="account-card-goal">
                <GoalProgress currentPnl={monthlyPnl(dailyByAccount[acc], now.getFullYear(), now.getMonth() + 1)} targetPnl={goals[acc]?.target_pnl ?? null} />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="section-header">
        <h2 className="section-title">Equity-Kurven</h2>
        <div className="section-header-controls">
          <EquityModeToggle value={equityMode} onChange={setEquityMode} />
          <EquityRangeToggle value={equityRange} onChange={setEquityRange} />
        </div>
      </div>
      <div className="equity-grid">
        <div className="card">
          <div className="equity-chart-title">Live</div>
          <EquityChart points={filterByRange(liveEquity, equityRange)} compact mode={equityMode} />
        </div>
        <div className="card">
          <div className="equity-chart-title">Propfirm</div>
          <EquityChart points={filterByRange(propEquity, equityRange)} compact mode={equityMode} />
        </div>
      </div>

      <h2 className="section-title">Kalender</h2>
      <div className="card">
        <MonthCalendar data={mergeDailyPnl(liveDaily, propDaily)} />
      </div>

      <h2 className="section-title">Letzte Trades</h2>
      {recent.length === 0 ? (
        <EmptyState text="Noch keine Trades erfasst." />
      ) : (
        <div className="card">
          {recent.map((t) => (
            <div key={t.id} className="recent-trade-row">
              <span>{fmtDate(t.datum)}</span>
              <span>{t.symbol ?? '–'}</span>
              <span className={`account-badge account-badge-${t.account}`}>{ACCOUNT_LABEL[t.account]}</span>
              <strong className={pnlClass(t.pnl)}>{fmtEuro(t.pnl)}</strong>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '1.25rem' }}>
        <DailyNotesSection />
      </div>

      {showForm && (
        <Modal title="Neuer Trade" onClose={() => setShowForm(false)}>
          <TradeForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  )
}
