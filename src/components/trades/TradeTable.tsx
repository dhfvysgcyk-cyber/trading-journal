import { fmtDate, fmtEuro, pnlClass } from '../../lib/format'
import type { Trade } from '../../types/domain'

const ACCOUNT_LABEL: Record<string, string> = { live: 'Live', propfirm: 'Propfirm' }

interface TradeTableProps {
  trades: Trade[]
  onEdit: (trade: Trade) => void
  onDelete: (trade: Trade) => void
}

export function TradeTable({ trades, onEdit, onDelete }: TradeTableProps) {
  return (
    <div className="trade-list">
      {trades.map((t) => (
        <div key={t.id} className="card trade-row">
          <div className="trade-row-main">
            <div>
              <span className="account-badge">{ACCOUNT_LABEL[t.account]}</span>
              <span className="trade-symbol">{t.symbol ?? '–'}</span>
            </div>
            <strong className={pnlClass(t.pnl)}>{fmtEuro(t.pnl)}</strong>
          </div>
          <div className="trade-row-meta">
            <span>{fmtDate(t.datum)}</span>
            <span>{t.direction ?? '–'}</span>
            <span>{t.result ?? '–'}</span>
            <span>R/R {t.rr ?? '–'}{t.realized_rr !== null ? ` → ${t.realized_rr}` : ''}</span>
          </div>
          <div className="trade-row-actions">
            <button type="button" className="btn btn-secondary" onClick={() => onEdit(t)}>Bearbeiten</button>
            <button type="button" className="btn btn-secondary" onClick={() => onDelete(t)}>Löschen</button>
          </div>
        </div>
      ))}
    </div>
  )
}
