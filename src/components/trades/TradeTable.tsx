import { fmtDate, fmtEuro, pnlClass } from '../../lib/format'
import { EyeIcon, PencilIcon, TrashIcon } from '../ui/icons'
import type { Trade } from '../../types/domain'

const ACCOUNT_LABEL: Record<string, string> = { live: 'Live', propfirm: 'Propfirm' }

interface TradeTableProps {
  trades: Trade[]
  onView: (trade: Trade) => void
  onEdit: (trade: Trade) => void
  onDelete: (trade: Trade) => void
}

export function TradeTable({ trades, onView, onEdit, onDelete }: TradeTableProps) {
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
            <button type="button" className="icon-btn" aria-label="Ansehen" title="Ansehen" onClick={() => onView(t)}>
              <EyeIcon />
            </button>
            <button type="button" className="icon-btn" aria-label="Bearbeiten" title="Bearbeiten" onClick={() => onEdit(t)}>
              <PencilIcon />
            </button>
            <button type="button" className="icon-btn icon-btn-danger" aria-label="Löschen" title="Löschen" onClick={() => onDelete(t)}>
              <TrashIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
