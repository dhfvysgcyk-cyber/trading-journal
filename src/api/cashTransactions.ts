import { supabase } from '../lib/supabaseClient'
import type { AccountType, CashTransactionInput, CashTransaction } from '../types/domain'

export async function fetchCashTransactions(account: AccountType): Promise<CashTransaction[]> {
  const { data, error } = await supabase
    .from('cash_transactions')
    .select('*')
    .eq('account', account)
    .order('occurred_at', { ascending: false })
  if (error) throw error
  return data as CashTransaction[]
}

export async function insertCashTransaction(input: CashTransactionInput): Promise<CashTransaction> {
  const { data, error } = await supabase.from('cash_transactions').insert(input).select().single()
  if (error) throw error
  return data as CashTransaction
}

export async function deleteCashTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('cash_transactions').delete().eq('id', id)
  if (error) throw error
}
