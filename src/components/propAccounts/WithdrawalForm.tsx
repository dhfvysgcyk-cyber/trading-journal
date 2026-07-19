import { useState, type FormEvent } from 'react'
import { localDateValue, fmtEuro } from '../../lib/format'
import type { CashTransactionInput, PropAccount } from '../../types/domain'

interface WithdrawalFormProps {
  accounts: PropAccount[]
  onSubmit: (input: CashTransactionInput) => Promise<void>
  onCancel: () => void
}

export function WithdrawalForm({ accounts, onSubmit, onCancel }: WithdrawalFormProps) {
  const [propAccountId, setPropAccountId] = useState(accounts[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [occurredAt, setOccurredAt] = useState(localDateValue())
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!propAccountId) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        account: 'propfirm',
        type: 'withdrawal',
        amount: Number(amount),
        occurred_at: occurredAt,
        note: note || null,
        prop_account_id: propAccountId,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
    } finally {
      setSubmitting(false)
    }
  }

  if (accounts.length === 0) {
    return (
      <div>
        <p>Du brauchst zuerst mindestens einen Prop-Account, bevor du eine Auszahlung erfassen kannst.</p>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>Schließen</button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="span-2">
          <label className="field-label" htmlFor="wd-account">Account</label>
          <select id="wd-account" className="input" value={propAccountId} onChange={(e) => setPropAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.note ? `${a.note} · ` : ''}{fmtEuro(a.size)}{!a.active ? ' (inaktiv)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="wd-amount">Betrag (€)</label>
          <input id="wd-amount" type="number" step="0.01" min="0.01" className="input" required value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="wd-date">Datum</label>
          <input id="wd-date" type="date" className="input" required value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
        </div>
        <div className="span-2">
          <label className="field-label" htmlFor="wd-note">Notiz</label>
          <input id="wd-note" className="input" value={note} onChange={(e) => setNote(e.target.value)} />
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
