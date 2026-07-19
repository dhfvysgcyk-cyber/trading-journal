import { useEffect, useState } from 'react'
import { deleteDailyNote, fetchDailyNotes, upsertDailyNote } from '../../api/dailyNotes'
import { EmptyState } from '../ui/EmptyState'
import { TrashIcon } from '../ui/icons'
import { fmtDate } from '../../lib/format'
import type { DailyNote } from '../../types/domain'

function todayDateValue(): string {
  return new Date().toISOString().slice(0, 10)
}

export function DailyNotesSection() {
  const [notes, setNotes] = useState<DailyNote[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(todayDateValue())
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const data = await fetchDailyNotes()
    setNotes(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const existing = notes.find((n) => n.note_date === date)
    setText(existing?.note ?? '')
  }, [date, notes])

  async function handleSave() {
    if (!text.trim()) return
    setSaving(true)
    await upsertDailyNote(date, text.trim())
    setSaving(false)
    await load()
  }

  async function handleDelete(n: DailyNote) {
    if (!confirm('Diese Notiz wirklich löschen?')) return
    await deleteDailyNote(n.id)
    await load()
  }

  const otherNotes = notes.filter((n) => n.note_date !== date)

  return (
    <div className="card">
      <h2 className="section-title" style={{ margin: '0 0 0.75rem' }}>Notizen</h2>
      <div className="daily-note-form">
        <input type="date" className="input daily-note-date" value={date} onChange={(e) => setDate(e.target.value)} />
        <textarea
          className="input"
          rows={3}
          placeholder="Wie lief der Handelstag? Was ist dir aufgefallen?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="button" className="btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Speichern…' : 'Speichern'}
        </button>
      </div>

      {loading ? (
        <div className="loading-screen">Lade…</div>
      ) : otherNotes.length === 0 ? (
        <EmptyState text="Noch keine weiteren Notizen." />
      ) : (
        <div className="daily-notes-list">
          {otherNotes.map((n) => (
            <div key={n.id} className="daily-note-row">
              <div>
                <div className="daily-note-date-label">{fmtDate(n.note_date)}</div>
                <div className="daily-note-text">{n.note}</div>
              </div>
              <button type="button" className="icon-btn icon-btn-danger" aria-label="Löschen" title="Löschen" onClick={() => handleDelete(n)}>
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
