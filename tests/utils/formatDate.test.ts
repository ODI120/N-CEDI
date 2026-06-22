import { describe, it, expect } from 'vitest'
import { formatDate } from '~/utils/formatDate'

describe('formatDate', () => {
  it('formats an ISO date string with default options', () => {
    const result = formatDate('2026-05-22T10:00:00Z')
    expect(result).toContain('22')
    expect(result).toContain('May')
    expect(result).toContain('2026')
  })

  it('returns the raw string for an unparseable date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })

  it('returns the raw string for an empty string', () => {
    expect(formatDate('')).toBe('')
  })

  it('accepts custom Intl.DateTimeFormat options', () => {
    const result = formatDate('2026-01-15T00:00:00Z', { year: 'numeric' })
    expect(result).toContain('2026')
  })

  it('handles dates at year boundary', () => {
    const result = formatDate('2025-12-31T23:59:59Z')
    expect(result).toContain('2025') // Could be Jan 1 2026 in some timezones, but contains year
  })

  it('handles a date with only date part', () => {
    const result = formatDate('2024-03-01')
    expect(result).toContain('2024')
    expect(result).toContain('March')
  })

  it('returns raw string for invalid date format like random text', () => {
    expect(formatDate('xyz123')).toBe('xyz123')
  })
})
