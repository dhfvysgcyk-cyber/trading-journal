import { supabase } from '../lib/supabaseClient'
import type { AccountType, MonthlyGoal } from '../types/domain'

export async function fetchMonthlyGoal(account: AccountType, year: number, month: number): Promise<MonthlyGoal | null> {
  const { data, error } = await supabase
    .from('monthly_goals')
    .select('*')
    .eq('account', account)
    .eq('year', year)
    .eq('month', month)
    .maybeSingle()
  if (error) throw error
  return data as MonthlyGoal | null
}

export async function upsertMonthlyGoal(account: AccountType, year: number, month: number, targetPnl: number): Promise<MonthlyGoal> {
  const { data, error } = await supabase
    .from('monthly_goals')
    .upsert(
      { account, year, month, target_pnl: targetPnl, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,account,year,month' },
    )
    .select()
    .single()
  if (error) throw error
  return data as MonthlyGoal
}
