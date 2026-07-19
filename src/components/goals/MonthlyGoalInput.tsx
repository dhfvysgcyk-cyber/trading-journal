import { useEffect, useState } from 'react'
import { fetchMonthlyGoal, fetchMonthlyGoals, upsertMonthlyGoal } from '../../api/goals'
import { fetchDailyPnl } from '../../api/stats'
import { fmtEuro } from '../../lib/format'
import { monthlyPnl } from '../../lib/monthlyPnl'
import type { AccountType, MonthlyGoal } from '../../types/domain'

const ACCOUNT_LABEL: Record<AccountType, string> = { live: 'Live', propfirm: 'Propfirm' }
const MONTH_LABELS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

interface HistoryEntry {
  goal: MonthlyGoal
  actual: number
}

export function MonthlyGoalInput({ account }: { account: AccountType }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  async function loadAll() {
    setLoading(true)
    const [current, allGoals, daily] = await Promise.all([
      fetchMonthlyGoal(account, year, month),
      fetchMonthlyGoals(account),
      fetchDailyPnl(account),
    ])
    setValue(current?.target_pnl?.toString() ?? '')
    setHistory(
      allGoals
        .filter((g) => !(g.year === year && g.month === month))
        .map((g) => ({ goal: g, actual: monthlyPnl(daily, g.year, g.month) })),
    )
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  async function handleSave() {
    if (value === '') return
    setSaving(true)
    setSaved(false)
    await upsertMonthlyGoal(account, year, month, Number(value))
    setSaving(false)
    setSaved(true)
    await loadAll()
  }

  return (
    <div className="card">
      <h2 className="section-title" style={{ margin: '0 0 0.2rem' }}>{ACCOUNT_LABEL[account]}: Monatsziel</h2>
      <p className="goal-input-hint">Ziel für {MONTH_LABELS[month - 1]} {year}</p>
      {loading ? (
        <div className="loading-screen">Lade…</div>
      ) : (
        <>
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
          {saved && <div className="goal-input-saved">Gespeichert.</div>}

          {history.length > 0 && (
            <div className="goal-history">
              <div className="goal-history-title">Verlauf</div>
              {history.map(({ goal, actual }) => {
                const achieved = actual >= goal.target_pnl
                return (
                  <div key={goal.id} className="goal-history-row">
                    <span className="goal-history-month">{MONTH_LABELS[goal.month - 1]} {goal.year}</span>
                    <span className="goal-history-values">{fmtEuro(actual)} / {fmtEuro(goal.target_pnl)}</span>
                    <span className={`status-badge ${achieved ? 'status-active' : 'status-missed'}`}>
                      {achieved ? 'Erreicht' : 'Verfehlt'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
