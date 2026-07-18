import { supabase } from '../lib/supabaseClient'
import type { AccountType, Trade, TradeInput } from '../types/domain'

export interface TradeFilters {
  account?: AccountType
  symbol?: string
  result?: string
  direction?: string
  from?: string
  to?: string
}

export async function fetchTrades(filters: TradeFilters = {}): Promise<Trade[]> {
  let query = supabase.from('trades').select('*').order('datum', { ascending: false })

  if (filters.account) query = query.eq('account', filters.account)
  if (filters.symbol) query = query.eq('symbol', filters.symbol)
  if (filters.result) query = query.eq('result', filters.result)
  if (filters.direction) query = query.eq('direction', filters.direction)
  if (filters.from) query = query.gte('datum', filters.from)
  if (filters.to) query = query.lte('datum', filters.to)

  const { data, error } = await query
  if (error) throw error
  return data as Trade[]
}

export async function insertTrade(input: TradeInput): Promise<Trade> {
  const { data, error } = await supabase.from('trades').insert(input).select().single()
  if (error) throw error
  return data as Trade
}

export async function updateTrade(id: string, input: Partial<TradeInput>): Promise<Trade> {
  const { data, error } = await supabase
    .from('trades')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Trade
}

export async function deleteTrade(id: string): Promise<void> {
  const { error } = await supabase.from('trades').delete().eq('id', id)
  if (error) throw error
}
