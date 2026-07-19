import type { Trade } from '../types/domain'

export interface StreakResult {
  type: 'win' | 'loss' | null
  count: number
}

// Consecutive most-recent trades of the same kind (pnl > 5 = win, pnl < -5 = loss).
// A neutral trade or a trade of the opposite kind ends the streak.
export function computeStreak(trades: Trade[]): StreakResult {
  const sorted = [...trades]
    .filter((t) => t.pnl !== null && t.datum !== null)
    .sort((a, b) => new Date(b.datum as string).getTime() - new Date(a.datum as string).getTime())

  let type: 'win' | 'loss' | null = null
  let count = 0

  for (const t of sorted) {
    const pnl = t.pnl as number
    const kind: 'win' | 'loss' | null = pnl > 5 ? 'win' : pnl < -5 ? 'loss' : null
    if (kind === null) break
    if (type === null) {
      type = kind
      count = 1
    } else if (kind === type) {
      count++
    } else {
      break
    }
  }

  return { type, count }
}
