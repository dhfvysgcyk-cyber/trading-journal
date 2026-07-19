import { useEffect, useState } from 'react'
import { deleteDailyNote, fetchDailyNotes, upsertDailyNote } from '../../api/dailyNotes'
import { EmptyState } from '../ui/EmptyState'
import { TrashIcon } from '../ui/icons'
import { fmtDate, localDateValue } from '../../lib/format'
import type { DailyNote } from '../../types/domain'

function startOfWeek(d: Date): Date {
  const date = new Date(d)
  const day = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - day)
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}

export function DailyNotesSection() {
  const [date, setDate] = useState(localDateValue())
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [weekNotes, setWeekNotes] = useState<DailyNote[]>([])
  const [loadingWeek, setLoadingWeek] = useState(true)
  const weekEnd = addDays(weekStart, 6)

  async function loadWeek() {
    setLoadingWeek(true)
    const data = await fetchDailyNotes(localDateValue(weekStart), localDateValue(weekEnd))
    setWeekNotes(data)
    setLoadingWeek(false)
  }

  useEffect(() => {
    loadWeek()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart])

  useEffect(() => {
    fetchDailyNotes(date, date).then((data) => setText(data[0]?.note ?? ''))
  }, [date])

  async function handleSave() {
    if (!text.trim()) return
    setSaving(true)
    await upsertDailyNote(date, text.trim())
    setSaving(false)
    await loadWeek()
  }

  async function handleDelete(n: DailyNote) {
    if (!confirm('Diese Notiz wirklich löschen?')) return
    await deleteDailyNote(n.id)
    if (n.note_date === date) setText('')
    await loadWeek()
  }

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

      <div className="week-nav">
        <button type="button" className="icon-btn" aria-label="Vorherige Woche" onClick={() => setWeekStart(addDays(weekStart, -7))}>‹</button>
        <span className="week-nav-label">{fmtDate(localDateValue(weekStart))} – {fmtDate(localDateValue(weekEnd))}</span>
        <button type="button" className="icon-btn" aria-label="Nächste Woche" onClick={() => setWeekStart(addDays(weekStart, 7))}>›</button>
      </div>

      {loadingWeek ? (
        <div className="loading-screen">Lade…</div>
      ) : weekNotes.length === 0 ? (
        <EmptyState text="Keine Notizen in dieser Woche." />
      ) : (
        <div className="daily-notes-list">
          {weekNotes.map((n) => (
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
