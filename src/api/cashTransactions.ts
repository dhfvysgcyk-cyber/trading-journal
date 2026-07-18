import { supabase } from '../lib/supabaseClient'
import type { CashTransactionInput, CashTransaction } from '../types/domain'

export async function insertCashTransaction(input: CashTransactionInput): Promise<CashTransaction> {
  const { data, error } = await supabase.from('cash_transactions').insert(input).select().single()
  if (error) throw error
  return data as CashTransaction
}
