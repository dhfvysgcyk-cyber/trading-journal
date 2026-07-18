import { CashSection } from '../components/cash/CashSection'

export function EinstellungenPage() {
  return (
    <div>
      <h1 className="page-title">Einstellungen</h1>
      <div className="cash-sections">
        <CashSection account="live" />
        <CashSection account="propfirm" />
      </div>
    </div>
  )
}
