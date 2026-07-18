import { supabase } from '../lib/supabaseClient'
import type {
  AccountOverview,
  AccountType,
  DailyPnl,
  EquityPoint,
  OverviewSummary,
  SymbolBreakdown,
  WeekdayPnl,
} from '../types/domain'

export async function fetchOverviewSummary(): Promise<OverviewSummary | null> {
  const { data, error } = await supabase.from('overview_summary').select('*').maybeSingle()
  if (error) throw error
  return data as OverviewSummary | null
}

export async function fetchAccountOverview(account: AccountType): Promise<AccountOverview | null> {
  const { data, error } = await supabase
    .from('account_overview')
    .select('*')
    .eq('account', account)
    .maybeSingle()
  if (error) throw error
  return data as AccountOverview | null
}

export async function fetchAllAccountOverviews(): Promise<AccountOverview[]> {
  const { data, error } = await supabase.from('account_overview').select('*')
  if (error) throw error
  return data as AccountOverview[]
}

export async function fetchEquityCurve(account: AccountType): Promise<EquityPoint[]> {
  const { data, error } = await supabase.rpc('equity_curve', { p_account: account })
  if (error) throw error
  return data as EquityPoint[]
}

export async function fetchDailyPnl(account: AccountType): Promise<DailyPnl[]> {
  const { data, error } = await supabase.rpc('daily_pnl', { p_account: account })
  if (error) throw error
  return data as DailyPnl[]
}

export async function fetchPnlByWeekday(account: AccountType): Promise<WeekdayPnl[]> {
  const { data, error } = await supabase.rpc('pnl_by_weekday', { p_account: account })
  if (error) throw error
  return data as WeekdayPnl[]
}

export async function fetchBreakdownBySymbol(account: AccountType): Promise<SymbolBreakdown[]> {
  const { data, error } = await supabase.rpc('breakdown_by_symbol', { p_account: account })
  if (error) throw error
  return data as SymbolBreakdown[]
}
