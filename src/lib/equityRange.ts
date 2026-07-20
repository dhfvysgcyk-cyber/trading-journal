import { localDateValue } from './format'

export type EquityRange = 'all' | '6m' | '3m' | '1m' | '1w'

export function filterByRange<T extends { event_date: string }>(points: T[], range: EquityRange): T[] {
  if (range === 'all') return points
  const cutoff = new Date()
  if (range === '6m') cutoff.setMonth(cutoff.getMonth() - 6)
  else if (range === '3m') cutoff.setMonth(cutoff.getMonth() - 3)
  else if (range === '1m') cutoff.setMonth(cutoff.getMonth() - 1)
  else cutoff.setDate(cutoff.getDate() - 7)
  const cutoffStr = localDateValue(cutoff)
  return points.filter((p) => p.event_date >= cutoffStr)
}
