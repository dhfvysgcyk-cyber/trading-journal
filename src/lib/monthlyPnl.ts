import type { DailyPnl } from '../types/domain'

export function monthlyPnl(daily: DailyPnl[], year: number, month: number): number {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return daily.filter((d) => d.trade_date.startsWith(prefix)).reduce((sum, d) => sum + d.pnl, 0)
}
