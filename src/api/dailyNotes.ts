import { supabase } from '../lib/supabaseClient'
import type { DailyNote } from '../types/domain'

export async function fetchDailyNotes(from?: string, to?: string): Promise<DailyNote[]> {
  let query = supabase.from('daily_notes').select('*').order('note_date', { ascending: true })
  if (from) query = query.gte('note_date', from)
  if (to) query = query.lte('note_date', to)
  const { data, error } = await query
  if (error) throw error
  return data as DailyNote[]
}

export async function upsertDailyNote(noteDate: string, note: string): Promise<DailyNote> {
  const { data, error } = await supabase
    .from('daily_notes')
    .upsert(
      { note_date: noteDate, note, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,note_date' },
    )
    .select()
    .single()
  if (error) throw error
  return data as DailyNote
}

export async function deleteDailyNote(id: string): Promise<void> {
  const { error } = await supabase.from('daily_notes').delete().eq('id', id)
  if (error) throw error
}
