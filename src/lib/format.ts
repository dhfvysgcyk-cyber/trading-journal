export function fmtEuro(value: number | null | undefined): string {
  if (value === null || value === undefined) return '–'
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
}

export function fmtPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return '–'
  return `${value.toFixed(1)}%`
}

export function fmtNum(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined) return '–'
  return value.toFixed(digits)
}

export function pnlClass(value: number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return value >= 0 ? 'positive' : 'negative'
}

export function fmtDate(value: string | null | undefined): string {
  if (!value) return '–'
  return new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function fmtDateTime(value: string | null | undefined): string {
  if (!value) return '–'
  return new Date(value).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function nowLocalDateTimeValue(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

// Local calendar date as YYYY-MM-DD. Deliberately avoids toISOString(), which
// converts to UTC first and can land on the wrong day for timezones ahead of
// UTC (e.g. right after local midnight in Germany during CEST).
export function localDateValue(d: Date = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
