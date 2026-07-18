import { useState, type FormEvent } from 'react'
import { ADVERSE_EMOTION_OPTIONS, ENTRY_EMOTION_OPTIONS, SYMBOL_OPTIONS, type Trade, type TradeInput } from '../../types/domain'
import { nowLocalDateTimeValue } from '../../lib/format'

interface TradeFormProps {
  initial?: Trade | null
  onSubmit: (input: TradeInput) => Promise<void>
  onCancel: () => void
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return nowLocalDateTimeValue()
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function TradeForm({ initial, onSubmit, onCancel }: TradeFormProps) {
  const [account, setAccount] = useState(initial?.account ?? 'live')
  const [datum, setDatum] = useState(toDatetimeLocal(initial?.datum ?? null))
  const [symbol, setSymbol] = useState(initial?.symbol ?? '')
  const [direction, setDirection] = useState(initial?.direction ?? '')
  const [rr, setRr] = useState(initial?.rr?.toString() ?? '')
  const [entryEmotion, setEntryEmotion] = useState(initial?.entry_emotion ?? '')
  const [result, setResult] = useState(initial?.result ?? '')
  const [realizedRr, setRealizedRr] = useState(initial?.realized_rr?.toString() ?? '')
  const [pnl, setPnl] = useState(initial?.pnl?.toString() ?? '')
  const [reason, setReason] = useState(initial?.reason ?? '')
  const [planAdherence, setPlanAdherence] = useState(initial?.plan_adherence ?? '')
  const [adverseEmotion, setAdverseEmotion] = useState(initial?.adverse_emotion ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        account: account as TradeInput['account'],
        datum: datum ? new Date(datum).toISOString() : null,
        symbol: symbol || null,
        direction: (direction || null) as TradeInput['direction'],
        rr: rr === '' ? null : Number(rr),
        entry_emotion: entryEmotion || null,
        result: (result || null) as TradeInput['result'],
        realized_rr: realizedRr === '' ? null : Number(realizedRr),
        pnl: pnl === '' ? null : Number(pnl),
        reason: reason || null,
        plan_adherence: planAdherence || null,
        adverse_emotion: adverseEmotion || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="trade-form">
      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="f-account">Account</label>
          <select id="f-account" className="input" value={account} onChange={(e) => setAccount(e.target.value as typeof account)}>
            <option value="live">Live</option>
            <option value="propfirm">Propfirm</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="f-datum">Datum/Uhrzeit</label>
          <input id="f-datum" type="datetime-local" className="input" required value={datum} onChange={(e) => setDatum(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="f-symbol">Symbol</label>
          <input id="f-symbol" className="input" list="symbol-suggestions" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          <datalist id="symbol-suggestions">
            {SYMBOL_OPTIONS.map((s) => <option key={s} value={s} />)}
          </datalist>
        </div>
        <div>
          <label className="field-label" htmlFor="f-direction">Long/Short</label>
          <select id="f-direction" className="input" value={direction ?? ''} onChange={(e) => setDirection(e.target.value as typeof direction)}>
            <option value="">–</option>
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="f-rr">R/R (geplant)</label>
          <input id="f-rr" type="number" step="0.01" className="input" value={rr} onChange={(e) => setRr(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="f-entry-emotion">Entry Emotionen</label>
          <input id="f-entry-emotion" className="input" list="entry-emotion-suggestions" value={entryEmotion} onChange={(e) => setEntryEmotion(e.target.value)} />
          <datalist id="entry-emotion-suggestions">
            {ENTRY_EMOTION_OPTIONS.map((s) => <option key={s} value={s} />)}
          </datalist>
        </div>
        <div>
          <label className="field-label" htmlFor="f-result">Win/Loss</label>
          <select id="f-result" className="input" value={result ?? ''} onChange={(e) => setResult(e.target.value as typeof result)}>
            <option value="">–</option>
            <option value="TP">TP</option>
            <option value="SL">SL</option>
            <option value="BE">BE</option>
            <option value="TSL">TSL</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="f-realized-rr">Realized R/R</label>
          <input id="f-realized-rr" type="number" step="0.01" className="input" value={realizedRr} onChange={(e) => setRealizedRr(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="f-pnl">PnL (€)</label>
          <input id="f-pnl" type="number" step="0.01" className="input" value={pnl} onChange={(e) => setPnl(e.target.value)} />
        </div>
        <div className="span-full">
          <label className="field-label" htmlFor="f-reason">Warum habe ich den Trade genommen?</label>
          <textarea id="f-reason" className="input" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="f-plan-adherence">Plan eingehalten?</label>
          <input id="f-plan-adherence" className="input" value={planAdherence} onChange={(e) => setPlanAdherence(e.target.value)} />
        </div>
        <div className="span-2">
          <label className="field-label" htmlFor="f-adverse-emotion">Gefühl bei Trade gegen Erwartung</label>
          <input id="f-adverse-emotion" className="input" list="adverse-emotion-suggestions" value={adverseEmotion} onChange={(e) => setAdverseEmotion(e.target.value)} />
          <datalist id="adverse-emotion-suggestions">
            {ADVERSE_EMOTION_OPTIONS.map((s) => <option key={s} value={s} />)}
          </datalist>
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
