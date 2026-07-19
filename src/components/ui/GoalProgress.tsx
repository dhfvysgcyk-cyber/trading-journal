import { fmtEuro } from '../../lib/format'

export function GoalProgress({ currentPnl, targetPnl }: { currentPnl: number; targetPnl: number | null }) {
  if (targetPnl === null || targetPnl <= 0) {
    return <div className="goal-progress-empty">Kein Monatsziel gesetzt</div>
  }
  const pct = Math.max(0, Math.min(100, (currentPnl / targetPnl) * 100))
  const achieved = currentPnl >= targetPnl

  return (
    <div className="goal-progress">
      <div className="goal-progress-labels">
        <span>Monatsziel</span>
        <span className={achieved ? 'positive' : ''}>{fmtEuro(currentPnl)} / {fmtEuro(targetPnl)}</span>
      </div>
      <div className="goal-progress-track">
        <div className={`goal-progress-fill${achieved ? ' achieved' : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
