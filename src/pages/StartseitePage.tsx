import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllAccountOverviews, fetchEquityCurve, fetchOverviewSummary } from '../api/stats'
import { fetchTrades } from '../api/trades'
import { StatBox } from '../components/ui/StatBox'
import { EmptyState } from '../components/ui/EmptyState'
import { EquityChart, type EquityMode } from '../components/ui/EquityChart'
import { EquityModeToggle } from '../components/ui/EquityModeToggle'
import { fmtEuro, fmtPct, pnlClass, fmtDate } from '../lib/format'
import type { AccountOverview, EquityPoint, OverviewSummary, Trade } from '../types/domain'

const ACCOUNT_LABEL: Record<string, string> = { live: 'Live Account', propfirm: 'Propfirm' }

export function StartseitePage() {
  const [summary, setSummary] = useState<OverviewSummary | null>(null)
  const [accounts, setAccounts] = useState<AccountOverview[]>([])
  const [recent, setRecent] = useState<Trade[]>([])
  const [liveEquity, setLiveEquity] = useState<EquityPoint[]>([])
  const [propEquity, setPropEquity] = useState<EquityPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [equityMode, setEquityMode] = useState<EquityMode>('pnl')

  useEffect(() => {
    Promise.all([
      fetchOverviewSummary(),
      fetchAllAccountOverviews(),
      fetchTrades(),
      fetchEquityCurve('live'),
      fetchEquityCurve('propfirm'),
    ])
      .then(([s, a, t, le, pe]) => {
        setSummary(s)
        setAccounts(a)
        setRecent(t.slice(0, 5))
        setLiveEquity(le)
        setPropEquity(pe)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-screen">Lade…</div>

  return (
    <div>
      <h1 className="page-title">Startseite</h1>

      <div className="kpi-row">
        <StatBox label="Gesamt-Kontostand" value={fmtEuro(summary?.combined_balance ?? 0)} />
        <StatBox label="Gesamt-PnL" value={fmtEuro(summary?.total_pnl ?? 0)} valueClassName={pnlClass(summary?.total_pnl ?? 0)} />
        <StatBox label="Trades gesamt" value={String(summary?.trade_count ?? 0)} />
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
            </Link>
          )
        })}
      </div>

      <div className="section-header">
        <h2 className="section-title">Equity-Kurven</h2>
        <EquityModeToggle value={equityMode} onChange={setEquityMode} />
      </div>
      <div className="equity-grid">
        <div className="card">
          <div className="equity-chart-title">Live Account</div>
          <EquityChart points={liveEquity} compact mode={equityMode} />
        </div>
        <div className="card">
          <div className="equity-chart-title">Propfirm</div>
          <EquityChart points={propEquity} compact mode={equityMode} />
        </div>
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
              <span className="account-badge">{ACCOUNT_LABEL[t.account]}</span>
              <strong className={pnlClass(t.pnl)}>{fmtEuro(t.pnl)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
