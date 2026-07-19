import { CashSection } from '../components/cash/CashSection'
import { MonthlyGoalInput } from '../components/goals/MonthlyGoalInput'

export function EinstellungenPage() {
  return (
    <div>
      <h1 className="page-title">Einstellungen</h1>
      <div className="cash-sections">
        <MonthlyGoalInput account="live" />
        <CashSection account="live" />
        <MonthlyGoalInput account="propfirm" />
        <CashSection account="propfirm" />
      </div>
    </div>
  )
}
