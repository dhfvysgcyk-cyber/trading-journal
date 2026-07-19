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
  const account = data as PropAccount

  const { error: statusError } = await supabase.from('prop_account_status_changes').insert({
    prop_account_id: account.id,
    active: true,
    occurred_at: account.opened_at,
  })
  if (statusError) throw statusError

  return account
}

export async function setPropAccountActive(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from('prop_accounts').update({ active }).eq('id', id)
  if (error) throw error

  const { error: statusError } = await supabase.from('prop_account_status_changes').insert({
    prop_account_id: id,
    active,
  })
  if (statusError) throw statusError
}
