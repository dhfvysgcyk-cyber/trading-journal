import type { StreakResult } from '../../lib/streak'

export function StreakBadge({ streak }: { streak: StreakResult }) {
  if (!streak.type || streak.count === 0) {
    return <div className="streak-badge streak-neutral">Keine aktuelle Serie</div>
  }
  const label = streak.type === 'win' ? 'Gewinne in Folge' : 'Verluste in Folge'
  return (
    <div className={`streak-badge ${streak.type === 'win' ? 'streak-win' : 'streak-loss'}`}>
      {streak.count} {label}
    </div>
  )
}
