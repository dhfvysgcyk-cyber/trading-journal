import type { SymbolBreakdown } from '../../types/domain'
import { fmtEuro, fmtPct, pnlClass } from '../../lib/format'

export function BreakdownCard({ data }: { data: SymbolBreakdown[] }) {
  if (data.length === 0) return <div className="card empty-state">Noch keine Daten.</div>
  return (
    <div className="card">
      {data.map((row) => (
        <div key={row.symbol} className="breakdown-row">
          <span className="breakdown-symbol">{row.symbol}</span>
          <span className="breakdown-count">{row.trade_count}x</span>
          <span>{fmtPct(row.winrate)}</span>
          <strong className={pnlClass(row.total_pnl)}>{fmtEuro(row.total_pnl)}</strong>
        </div>
      ))}
    </div>
  )
}
