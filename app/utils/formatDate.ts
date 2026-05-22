/**
 * N-CEDI — Date formatter
 *
 * Formats ISO-8601 date strings for the Nigerian English locale (`en-NG`).
 *
 * Default output style: "22 May 2026"
 *
 * @example
 *   formatDate('2026-05-22T10:00:00Z')           // "22 May 2026"
 *   formatDate('2026-05-22T10:00:00Z', { month: 'long' }) // "22 May 2026"
 *   formatDate('2026-05-22T10:00:00Z', { dateStyle: 'full' })
 *   // "Friday, 22 May 2026"
 */
const LOCALE = 'en-NG'

const DEFAULT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}

export function formatDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return dateString // Fallback: return the raw string if unparseable
  }

  return new Intl.DateTimeFormat(LOCALE, options ?? DEFAULT_OPTIONS).format(date)
}
