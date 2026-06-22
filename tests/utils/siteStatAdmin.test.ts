import { describe, it, expect } from 'vitest'

import {
  mapSiteStatRow,
  formatStatDisplay,
  createEmptySiteStatForm,
  rowToSiteStatForm,
  formToSiteStatPayload,
  validateSiteStatForm,
  hasSiteStatFormErrors,
  STAT_ICON_OPTIONS,
  type SiteStatDbRow
} from '~/utils/siteStatAdmin'

describe('mapSiteStatRow', () => {
  it('maps db row to SiteStat type', () => {
    const row: SiteStatDbRow = {
      id: '1', value: 500, prefix: '+', suffix: '%', label: 'Growth',
      icon: 'bi-graph-up-arrow', display_order: 1, is_published: true,
      created_at: '2024-01-01', updated_at: '2024-01-02'
    }
    const stat = mapSiteStatRow(row)
    expect(stat.value).toBe(500)
    expect(stat.prefix).toBe('+')
    expect(stat.suffix).toBe('%')
    expect(stat.label).toBe('Growth')
    expect(stat.icon).toBe('bi-graph-up-arrow')
  })

  it('converts string value to number', () => {
    const row: SiteStatDbRow = {
      id: '1', value: '250' as unknown as number, label: 'Students',
      display_order: 0, is_published: true
    }
    const stat = mapSiteStatRow(row)
    expect(stat.value).toBe(250)
  })

  it('defaults null fields to undefined/empty', () => {
    const row: SiteStatDbRow = {
      id: '1', value: 10, label: 'Test',
      display_order: 0, is_published: false
    }
    const stat = mapSiteStatRow(row)
    expect(stat.prefix).toBeUndefined()
    expect(stat.suffix).toBeUndefined()
    expect(stat.icon).toBeUndefined()
    expect(stat.createdAt).toBe('')
    expect(stat.updatedAt).toBe('')
  })
})

describe('formatStatDisplay', () => {
  it('formats stat with prefix and suffix', () => {
    expect(formatStatDisplay({ value: 500, prefix: '+', suffix: '%' })).toBe('+500%')
  })

  it('handles missing prefix/suffix', () => {
    expect(formatStatDisplay({ value: 100 })).toBe('100')
  })

  it('handles zero value', () => {
    expect(formatStatDisplay({ value: 0 })).toBe('0')
  })
})

describe('createEmptySiteStatForm', () => {
  it('returns default form state', () => {
    const form = createEmptySiteStatForm()
    expect(form.label).toBe('')
    expect(form.value).toBe(0)
    expect(form.icon).toBe('bi-people-fill')
    expect(form.isPublished).toBe(true)
  })
})

describe('rowToSiteStatForm', () => {
  it('maps db row to form state', () => {
    const row: SiteStatDbRow = {
      id: '1', value: 500, prefix: '+', suffix: '%', label: 'Growth',
      icon: 'bi-graph-up-arrow', display_order: 1, is_published: true
    }
    const form = rowToSiteStatForm(row)
    expect(form.label).toBe('Growth')
    expect(form.value).toBe(500)
    expect(form.prefix).toBe('+')
    expect(form.suffix).toBe('%')
    expect(form.displayOrder).toBe(1)
  })

  it('defaults null fields to empty string/zero', () => {
    const row: SiteStatDbRow = {
      id: '1', value: 0, label: 'Test', display_order: 0, is_published: false
    }
    const form = rowToSiteStatForm(row)
    expect(form.prefix).toBe('')
    expect(form.suffix).toBe('')
    expect(form.icon).toBe('')
  })
})

describe('formToSiteStatPayload', () => {
  it('converts form to db payload', () => {
    const form = createEmptySiteStatForm()
    form.label = '  Graduates  '
    form.value = 500
    form.prefix = '  '
    form.suffix = '  +  '
    const payload = formToSiteStatPayload(form)
    expect(payload.label).toBe('Graduates')
    expect(payload.value).toBe(500)
    expect(payload.prefix).toBeNull()
    expect(payload.suffix).toBe('+')
    expect(payload.updated_at).toBeDefined()
  })
})

describe('validateSiteStatForm', () => {
  it('returns no errors for valid form', () => {
    const form = createEmptySiteStatForm()
    form.label = 'Test'
    form.value = 100
    expect(hasSiteStatFormErrors(validateSiteStatForm(form))).toBe(false)
  })

  it('requires label', () => {
    const form = createEmptySiteStatForm()
    expect(validateSiteStatForm(form).label).toBe('Label is required.')
  })

  it('rejects negative value', () => {
    const form = createEmptySiteStatForm()
    form.label = 'Test'
    form.value = -1
    expect(validateSiteStatForm(form).value).toBeDefined()
  })

  it('accepts zero value', () => {
    const form = createEmptySiteStatForm()
    form.label = 'Test'
    form.value = 0
    expect(validateSiteStatForm(form).value).toBeUndefined()
  })

  it('rejects negative display order', () => {
    const form = createEmptySiteStatForm()
    form.label = 'Test'
    form.displayOrder = -1
    expect(validateSiteStatForm(form).displayOrder).toBeDefined()
  })

  it('rejects NaN value', () => {
    const form = createEmptySiteStatForm()
    form.label = 'Test'
    form.value = NaN
    expect(validateSiteStatForm(form).value).toBeDefined()
  })
})

describe('STAT_ICON_OPTIONS', () => {
  it('has expected icon options', () => {
    expect(STAT_ICON_OPTIONS.length).toBeGreaterThanOrEqual(5)
    const values = STAT_ICON_OPTIONS.map(o => o.value)
    expect(values).toContain('bi-people-fill')
    expect(values).toContain('bi-rocket-takeoff-fill')
  })
})
