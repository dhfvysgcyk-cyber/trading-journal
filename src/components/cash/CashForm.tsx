import { useState, type FormEvent } from 'react'
import { localDateValue } from '../../lib/format'
import type { AccountType, CashTransactionInput, CashType } from '../../types/domain'

interface CashFormProps {
  account: AccountType
  onSubmit: (input: CashTransactionInput) => Promise<void>
  onCancel: () => void
}

export function CashForm({ account, onSubmit, onCancel }: CashFormProps) {
  const [type, setType] = useState<CashType>('deposit')
  const [amount, setAmount] = useState('')
  const [occurredAt, setOccurredAt] = useState(localDateValue())
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        account,
        type,
        amount: Number(amount),
        occurred_at: occurredAt,
        note: note || null,
      })
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
          <label className="field-label" htmlFor="c-type">Typ</label>
          <select id="c-type" className="input" value={type} onChange={(e) => setType(e.target.value as CashType)}>
            <option value="deposit">Einzahlung</option>
            <option value="withdrawal">Auszahlung</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="c-amount">Betrag (€)</label>
          <input id="c-amount" type="number" step="0.01" min="0.01" className="input" required value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="c-date">Datum</label>
          <input id="c-date" type="date" className="input" required value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="c-note">Notiz</label>
          <input id="c-note" className="input" value={note} onChange={(e) => setNote(e.target.value)} />
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
