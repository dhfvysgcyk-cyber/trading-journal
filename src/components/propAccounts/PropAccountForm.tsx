import { useState, type FormEvent } from 'react'
import { localDateValue } from '../../lib/format'
import type { PropAccountInput } from '../../types/domain'

interface PropAccountFormProps {
  onSubmit: (input: PropAccountInput) => Promise<void>
  onCancel: () => void
}

export function PropAccountForm({ onSubmit, onCancel }: PropAccountFormProps) {
  const [size, setSize] = useState('')
  const [note, setNote] = useState('')
  const [openedAt, setOpenedAt] = useState(localDateValue())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ size: Number(size), note: note || null, opened_at: openedAt })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="pa-size">Größe (€)</label>
          <input id="pa-size" type="number" step="0.01" min="0.01" className="input" required value={size} onChange={(e) => setSize(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="pa-date">Datum</label>
          <input id="pa-date" type="date" className="input" required value={openedAt} onChange={(e) => setOpenedAt(e.target.value)} />
        </div>
        <div className="span-2">
          <label className="field-label" htmlFor="pa-note">Notiz (welche Propfirm?)</label>
          <input id="pa-note" className="input" placeholder="z.B. FTMO" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Abbrechen</button>
        <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Speichern…' : 'Speichern'}</button>
      </div>
    </form>
  )
}
