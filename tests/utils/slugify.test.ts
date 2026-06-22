import { describe, it, expect } from 'vitest'
import { slugify } from '~/utils/slugify'

describe('slugify', () => {
  it('converts basic text to lowercase hyphenated slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('handles accented characters', () => {
    expect(slugify('Cafe & Creme')).toBe('cafe-creme')
  })

  it('strips diacritics from accented characters', () => {
    expect(slugify('Cafe\u0301 & Cre\u0300me')).toBe('cafe-creme')
  })

  it('trims leading and trailing whitespace', () => {
    expect(slugify('  Hello   World  ')).toBe('hello-world')
  })

  it('collapses multiple spaces into single hyphen', () => {
    expect(slugify('a   b   c')).toBe('a-b-c')
  })

  it('collapses consecutive hyphens', () => {
    expect(slugify('a---b')).toBe('a-b')
  })

  it('removes special characters', () => {
    expect(slugify('Digital Fabrication 101!')).toBe('digital-fabrication-101')
  })

  it('strips underscores (non-alphanumeric)', () => {
    expect(slugify('hello_world_test')).toBe('helloworldtest')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('---hello---')).toBe('hello')
  })

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('')
  })

  it('returns empty string for whitespace-only input', () => {
    expect(slugify('   ')).toBe('')
  })

  it('handles numeric input', () => {
    expect(slugify('123 456')).toBe('123-456')
  })

  it('handles mixed case with numbers and symbols', () => {
    expect(slugify('My Program #1 (Advanced)')).toBe('my-program-1-advanced')
  })

  it('handles unicode normalization (NFD)', () => {
    expect(slugify('\u00e9v\u00e9nement')).toBe('evenement')
  })
})
