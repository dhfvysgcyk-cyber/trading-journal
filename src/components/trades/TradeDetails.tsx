import { fmtDateTime, fmtEuro, pnlClass } from '../../lib/format'
import type { Trade } from '../../types/domain'

const ACCOUNT_LABEL: Record<string, string> = { live: 'Live', propfirm: 'Propfirm' }

function Row({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  )
}

export function TradeDetails({ trade }: { trade: Trade }) {
  return (
    <div className="detail-list">
      <Row label="Account" value={ACCOUNT_LABEL[trade.account]} />
      <Row label="Datum/Uhrzeit" value={fmtDateTime(trade.datum)} />
      <Row label="Symbol" value={trade.symbol ?? '–'} />
      <Row label="Long/Short" value={trade.direction ?? '–'} />
      <Row label="R/R (geplant)" value={trade.rr?.toString() ?? '–'} />
      <Row label="Entry Emotionen" value={trade.entry_emotion ?? '–'} />
      <Row label="Win/Loss" value={trade.result ?? '–'} />
      <Row label="Realized R/R" value={trade.realized_rr?.toString() ?? '–'} />
      <Row label="PnL" value={fmtEuro(trade.pnl)} valueClassName={pnlClass(trade.pnl)} />
      <Row label="Warum genommen?" value={trade.reason ?? '–'} />
      <Row label="Plan eingehalten?" value={trade.plan_adherence ?? '–'} />
      <Row label="Gefühl gegen Erwartung" value={trade.adverse_emotion ?? '–'} />
    </div>
  )
}
