import { describe, it, expect } from 'vitest'
import { cssEasing, EASING, DURATION, STAGGER } from '~/constants/motion'

describe('cssEasing', () => {
  it('converts a 4-value tuple to CSS cubic-bezier string', () => {
    expect(cssEasing([0.25, 0.1, 0.25, 1])).toBe('cubic-bezier(0.25, 0.1, 0.25, 1)')
  })

  it('works with EASING.smooth preset', () => {
    expect(cssEasing(EASING.smooth)).toBe('cubic-bezier(0.25, 0.1, 0.25, 1)')
  })

  it('works with EASING.snappy preset', () => {
    expect(cssEasing(EASING.snappy)).toBe('cubic-bezier(0.77, 0, 0.175, 1)')
  })

  it('works with EASING.bouncy preset', () => {
    expect(cssEasing(EASING.bouncy)).toBe('cubic-bezier(0.34, 1.56, 0.64, 1)')
  })

  it('works with zero values', () => {
    expect(cssEasing([0, 0, 0, 0])).toBe('cubic-bezier(0, 0, 0, 0)')
  })
})

describe('DURATION constants', () => {
  it('has expected duration values', () => {
    expect(DURATION.instant).toBe(0.1)
    expect(DURATION.fast).toBe(0.3)
    expect(DURATION.base).toBe(0.6)
    expect(DURATION.slow).toBe(1.0)
    expect(DURATION.cinematic).toBe(1.6)
  })
})

describe('STAGGER constants', () => {
  it('has expected stagger values', () => {
    expect(STAGGER.tight).toBe(0.05)
    expect(STAGGER.base).toBe(0.10)
    expect(STAGGER.loose).toBe(0.18)
  })
})
