import { supabase } from '../lib/supabaseClient'
import type { PropAccount, PropAccountInput } from '../types/domain'

export async function fetchPropAccounts(): Promise<PropAccount[]> {
  const { data, error } = await supabase
    .from('prop_accounts')
    .select('*')
    .order('opened_at', { ascending: false })
  if (error) throw error
  return data as PropAccount[]
}

export async function insertPropAccount(input: PropAccountInput): Promise<PropAccount> {
  const { data, error } = await supabase.from('prop_accounts').insert(input).select().single()
  if (error) throw error
  return data as PropAccount
}

export async function setPropAccountActive(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from('prop_accounts').update({ active }).eq('id', id)
  if (error) throw error
}
