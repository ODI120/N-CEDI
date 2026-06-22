import { describe, it, expect, vi } from 'vitest'

import {
  partnerAcronymFromName,
  parsePartnerLogoLocation,
  mapPartnerRow,
  mapPartnerToSectionDisplay,
  createEmptyPartnerForm,
  rowToPartnerForm,
  formToPartnerPayload,
  validatePartnerForm,
  hasPartnerFormErrors,
  partnerLogoStorageRefForRow,
  PARTNER_TIER_OPTIONS,
  type PartnerDbRow
} from '~/utils/partnerAdmin'

vi.stubGlobal('useSupabaseClient', () => ({
  storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: '' } }) }) }
}))
vi.stubGlobal('useRuntimeConfig', () => ({ public: { supabaseUrl: '' } }))

describe('partnerAcronymFromName', () => {
  it('extracts initials from multi-word names', () => {
    expect(partnerAcronymFromName('Federal Ministry of Science and Technology'))
      .toBe('FMST')
  })

  it('skips stop words', () => {
    expect(partnerAcronymFromName('Ministry of Education')).toBe('ME')
  })

  it('limits to 4 characters', () => {
    expect(partnerAcronymFromName('Very Long Organization Name Here Today')).toHaveLength(4)
  })

  it('uses first 5 chars for single-word names', () => {
    expect(partnerAcronymFromName('Cognition')).toBe('COGNI')
  })

  it('returns N/C for empty or symbol-only names', () => {
    expect(partnerAcronymFromName('- +')).toBe('N/C')
  })

  it('handles short single word', () => {
    expect(partnerAcronymFromName('AI')).toBe('AI')
  })

  it('falls back to compact form when not enough multi-char words', () => {
    expect(partnerAcronymFromName('A B Technology')).toBe('ABTEC')
  })
})

describe('parsePartnerLogoLocation', () => {
  it('parses colon-style storage ref', () => {
    expect(parsePartnerLogoLocation('site_assets:partners/logo.png'))
      .toEqual({ bucket: 'site_assets', path: 'partners/logo.png' })
  })

  it('parses site_assets/ prefix', () => {
    expect(parsePartnerLogoLocation('site_assets/logo.png'))
      .toEqual({ bucket: 'site_assets', path: 'logo.png' })
  })

  it('maps partners/ prefix to site_assets bucket', () => {
    expect(parsePartnerLogoLocation('partners/logo.png'))
      .toEqual({ bucket: 'site_assets', path: 'partners/logo.png' })
  })

  it('treats bare path as site_assets bucket', () => {
    expect(parsePartnerLogoLocation('logo.png'))
      .toEqual({ bucket: 'site_assets', path: 'logo.png' })
  })

  it('returns null for empty string', () => {
    expect(parsePartnerLogoLocation('')).toBeNull()
  })

  it('returns null for http URLs', () => {
    expect(parsePartnerLogoLocation('https://example.com/logo.png')).toBeNull()
  })

  it('returns null for absolute paths', () => {
    expect(parsePartnerLogoLocation('/images/logo.png')).toBeNull()
  })
})

describe('mapPartnerRow', () => {
  it('maps db row to Partner type', () => {
    const row: PartnerDbRow = {
      id: '1', name: 'Partner Co', website_url: 'https://partner.com',
      logo_url: 'site_assets:logo.png', tier: 'gold',
      is_active: true, display_order: 1, created_at: '2024-01-01'
    }
    const partner = mapPartnerRow(row)
    expect(partner.name).toBe('Partner Co')
    expect(partner.websiteUrl).toBe('https://partner.com')
    expect(partner.tier).toBe('gold')
    expect(partner.isActive).toBe(true)
  })

  it('defaults null website to undefined', () => {
    const row: PartnerDbRow = {
      id: '1', name: 'P', website_url: null, logo_url: 'logo.png',
      tier: 'silver', is_active: true, display_order: 0, created_at: ''
    }
    expect(mapPartnerRow(row).websiteUrl).toBeUndefined()
  })
})

describe('mapPartnerToSectionDisplay', () => {
  it('produces display object with acronym and icon', () => {
    const partner = mapPartnerRow({
      id: '1', name: 'Federal Ministry of Tech', website_url: null,
      logo_url: 'logo.png', tier: 'gold', is_active: true,
      display_order: 0, created_at: ''
    })
    const display = mapPartnerToSectionDisplay(partner)
    expect(display.acronym).toBe('FMT')
    expect(display.icon).toBe('bi-award')
    expect(display.tier).toBe('gold')
  })
})

describe('createEmptyPartnerForm', () => {
  it('returns default form state', () => {
    const form = createEmptyPartnerForm()
    expect(form.name).toBe('')
    expect(form.tier).toBe('gold')
    expect(form.isActive).toBe(true)
  })
})

describe('rowToPartnerForm', () => {
  it('maps db row to form state', () => {
    const row: PartnerDbRow = {
      id: '1', name: 'Partner', website_url: 'https://example.com',
      logo_url: 'logo.png', tier: 'platinum',
      is_active: false, display_order: 3, created_at: ''
    }
    const form = rowToPartnerForm(row)
    expect(form.name).toBe('Partner')
    expect(form.websiteUrl).toBe('https://example.com')
    expect(form.tier).toBe('platinum')
    expect(form.isActive).toBe(false)
    expect(form.displayOrder).toBe(3)
  })
})

describe('formToPartnerPayload', () => {
  it('converts form to db payload', () => {
    const form = createEmptyPartnerForm()
    form.name = '  Partner Name  '
    form.websiteUrl = '  '
    form.logoUrl = 'logo.png'
    const payload = formToPartnerPayload(form)
    expect(payload.name).toBe('Partner Name')
    expect(payload.website_url).toBeNull()
    expect(payload.logo_url).toBe('logo.png')
  })
})

describe('validatePartnerForm', () => {
  it('returns no errors for valid form', () => {
    const form = createEmptyPartnerForm()
    form.name = 'Partner'
    form.logoUrl = 'logo.png'
    expect(hasPartnerFormErrors(validatePartnerForm(form))).toBe(false)
  })

  it('requires name', () => {
    const form = createEmptyPartnerForm()
    form.logoUrl = 'logo.png'
    expect(validatePartnerForm(form).name).toBe('Partner name is required.')
  })

  it('requires logo URL without upload', () => {
    const form = createEmptyPartnerForm()
    form.name = 'Partner'
    expect(validatePartnerForm(form).logoUrl).toBeDefined()
  })

  it('allows logo with pending upload', () => {
    const form = createEmptyPartnerForm()
    form.name = 'Partner'
    expect(validatePartnerForm(form, { hasLogoUpload: true }).logoUrl).toBeUndefined()
  })

  it('rejects negative display order', () => {
    const form = createEmptyPartnerForm()
    form.name = 'P'
    form.logoUrl = 'logo.png'
    form.displayOrder = -1
    expect(validatePartnerForm(form).displayOrder).toBeDefined()
  })
})

describe('partnerLogoStorageRefForRow', () => {
  it('returns logo_url for storage refs', () => {
    expect(partnerLogoStorageRefForRow({ logo_url: 'site_assets:logo.png' })).toBe('site_assets:logo.png')
  })

  it('returns null for http URLs', () => {
    expect(partnerLogoStorageRefForRow({ logo_url: 'https://example.com/logo.png' })).toBeNull()
  })

  it('returns null for absolute paths', () => {
    expect(partnerLogoStorageRefForRow({ logo_url: '/logo.png' })).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(partnerLogoStorageRefForRow({ logo_url: '' })).toBeNull()
  })
})

describe('PARTNER_TIER_OPTIONS', () => {
  it('has all four tiers', () => {
    expect(PARTNER_TIER_OPTIONS).toHaveLength(4)
    const values = PARTNER_TIER_OPTIONS.map(o => o.value)
    expect(values).toContain('platinum')
    expect(values).toContain('gold')
    expect(values).toContain('silver')
    expect(values).toContain('community')
  })
})
