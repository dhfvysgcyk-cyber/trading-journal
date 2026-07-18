export type AccountType = 'live' | 'propfirm'

export type Direction = 'Long' | 'Short'
export type Result = 'TP' | 'SL' | 'BE' | 'TSL'
export type CashType = 'deposit' | 'withdrawal'

export interface Trade {
  id: string
  user_id: string
  account: AccountType
  datum: string | null
  symbol: string | null
  direction: Direction | null
  rr: number | null
  entry_emotion: string | null
  result: Result | null
  realized_rr: number | null
  pnl: number | null
  reason: string | null
  plan_adherence: string | null
  adverse_emotion: string | null
  created_at: string
  updated_at: string
}

export type TradeInput = Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export interface CashTransaction {
  id: string
  user_id: string
  account: AccountType
  type: CashType
  amount: number
  occurred_at: string
  note: string | null
  created_at: string
}

export type CashTransactionInput = Omit<CashTransaction, 'id' | 'user_id' | 'created_at'>

export interface AccountOverview {
  user_id: string
  account: AccountType
  trade_count: number
  winrate: number | null
  total_pnl: number
  profit_factor: number | null
  avg_rr: number | null
  avg_realized_rr: number | null
  net_cash: number
  current_balance: number
}

export interface OverviewSummary {
  user_id: string
  trade_count: number
  total_pnl: number
  combined_balance: number
}

export interface EquityPoint {
  event_date: string
  delta: number
  balance: number
  label: string
}

export interface DailyPnl {
  trade_date: string
  pnl: number
  trade_count: number
}

export interface WeekdayPnl {
  weekday: number
  pnl: number
  trade_count: number
}

export interface SymbolBreakdown {
  symbol: string
  trade_count: number
  winrate: number | null
  total_pnl: number
}

export const SYMBOL_OPTIONS = [
  'XAUUSD', 'US30', 'NAS100', 'S&P 500',
  'EURUSD', 'USDJPY', 'GBPUSD', 'GBPJPY', 'USDCHF', 'AUDUSD', 'AUDJPY', 'AUDCHF',
]

export const ENTRY_EMOTION_OPTIONS = ['Fokussiert', 'FOMO', 'Angst', 'Unsicherheit', 'Euphorie', 'Keine']
export const ADVERSE_EMOTION_OPTIONS = ['Ruhig', 'Gier', 'Panik', 'Keine']
