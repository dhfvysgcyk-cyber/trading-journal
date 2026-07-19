import { useEffect, useState } from 'react'
import { fetchMonthlyGoal, upsertMonthlyGoal } from '../../api/goals'
import type { AccountType } from '../../types/domain'

const ACCOUNT_LABEL: Record<AccountType, string> = { live: 'Live Account', propfirm: 'Propfirm' }
const MONTH_LABELS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

export function MonthlyGoalInput({ account }: { account: AccountType }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchMonthlyGoal(account, year, month).then((g) => {
      setValue(g?.target_pnl?.toString() ?? '')
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  async function handleSave() {
    if (value === '') return
    setSaving(true)
    setSaved(false)
    await upsertMonthlyGoal(account, year, month, Number(value))
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="card">
      <h2 className="section-title" style={{ margin: '0 0 0.2rem' }}>{ACCOUNT_LABEL[account]}: Monatsziel</h2>
      <p className="goal-input-hint">Ziel für {MONTH_LABELS[month - 1]} {year}</p>
      {loading ? (
        <div className="loading-screen">Lade…</div>
      ) : (
        <div className="goal-input-row">
          <input
            type="number"
            step="1"
            className="input"
            placeholder="z.B. 500"
            value={value}
            onChange={(e) => { setValue(e.target.value); setSaved(false) }}
          />
          <button type="button" className="btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      )}
      {saved && <div className="goal-input-saved">Gespeichert.</div>}
    </div>
  )
}
