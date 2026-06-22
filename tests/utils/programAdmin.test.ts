import { describe, it, expect, vi } from 'vitest'

import {
  createEmptyProgramForm,
  slugifyTitle,
  parseOverviewFromBody,
  deserializeBlockField,
  rowToProgramForm,
  formToDbPayload,
  getPublishBlockers,
  validateProgramForm,
  hasFormErrors,
  type ProgramFormState,
  type ProgramDbRow
} from '~/utils/programAdmin'

vi.stubGlobal('useSupabaseClient', () => ({
  storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: '' } }) }) }
}))
vi.stubGlobal('useRuntimeConfig', () => ({ public: { supabaseUrl: '' } }))

describe('createEmptyProgramForm', () => {
  it('returns a blank form with default requirements block', () => {
    const form = createEmptyProgramForm()
    expect(form.title).toBe('')
    expect(form.slug).toBe('')
    expect(form.outcomes).toEqual([''])
    expect(form.requirementsBlocks).toHaveLength(1)
    expect(form.isFeatured).toBe(false)
    expect(form.isPublished).toBe(false)
  })
})

describe('slugifyTitle', () => {
  it('converts text to lowercase hyphenated slug', () => {
    expect(slugifyTitle('Digital Fabrication 101')).toBe('digital-fabrication-101')
  })

  it('removes special chars and collapses hyphens', () => {
    expect(slugifyTitle('  Hello! World---  ')).toBe('hello-world')
  })
})

describe('parseOverviewFromBody', () => {
  it('returns empty for null/empty body', () => {
    expect(parseOverviewFromBody(null)).toBe('')
    expect(parseOverviewFromBody([])).toBe('')
  })

  it('extracts text after "Program Overview" heading', () => {
    const body = [
      { type: 'heading', data: { text: 'Program Overview' } },
      { type: 'paragraph', data: { text: 'This is the overview.' } }
    ]
    expect(parseOverviewFromBody(body)).toBe('This is the overview.')
  })

  it('falls back to first paragraph if no overview heading', () => {
    const body = [
      { type: 'heading', data: { text: 'Introduction' } },
      { type: 'paragraph', data: { text: 'First paragraph text.' } }
    ]
    expect(parseOverviewFromBody(body)).toBe('First paragraph text.')
  })

  it('returns empty when no paragraphs exist', () => {
    const body = [
      { type: 'heading', data: { text: 'Heading only' } }
    ]
    expect(parseOverviewFromBody(body)).toBe('')
  })
})

describe('deserializeBlockField', () => {
  it('returns empty array for null/empty input', () => {
    expect(deserializeBlockField(null)).toEqual([])
    expect(deserializeBlockField('')).toEqual([])
    expect(deserializeBlockField(undefined)).toEqual([])
  })

  it('parses valid JSON array', () => {
    const input = '[{"type":"paragraph","data":{"text":"Hello"}}]'
    const result = deserializeBlockField(input)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('paragraph')
  })

  it('wraps plain text as a paragraph block', () => {
    const result = deserializeBlockField('Some plain text')
    expect(result).toEqual([{ type: 'paragraph', data: { text: 'Some plain text' } }])
  })

  it('wraps malformed JSON as paragraph block', () => {
    const result = deserializeBlockField('[invalid json')
    expect(result).toEqual([{ type: 'paragraph', data: { text: '[invalid json' } }])
  })
})

describe('getPublishBlockers (program)', () => {
  it('returns no blockers for complete form', () => {
    const form: ProgramFormState = {
      title: 'Test', slug: 'test', subtitle: '', description: 'Desc',
      body: [{ type: 'paragraph', data: { text: 'Body' } }],
      labExperienceBlocks: [], requirementsBlocks: [],
      outcomes: ['Learn something'], coverImageUrl: 'media:cover.jpg',
      galleryUrls: [], metaTitle: '', metaDescription: '', categoryId: '',
      isFeatured: false, isPublished: true
    }
    expect(getPublishBlockers(form)).toEqual([])
  })

  it('returns multiple blockers for empty form', () => {
    const form = createEmptyProgramForm()
    const blockers = getPublishBlockers(form)
    expect(blockers).toContain('Program title')
    expect(blockers).toContain('URL slug')
    expect(blockers).toContain('Card description')
    expect(blockers).toContain('Hero cover image')
    expect(blockers).toContain('At least one learning outcome')
  })

  it('detects missing outcomes', () => {
    const form = createEmptyProgramForm()
    form.title = 'T'
    form.slug = 'test'
    form.description = 'D'
    form.coverImageUrl = 'img'
    form.body = [{ type: 'paragraph', data: { text: 'B' } }]
    form.outcomes = ['', '  ']
    expect(getPublishBlockers(form)).toContain('At least one learning outcome')
  })
})

describe('validateProgramForm', () => {
  it('returns no errors for valid form', () => {
    const form: ProgramFormState = {
      title: 'Test', slug: 'test', subtitle: '', description: 'Desc',
      body: [], labExperienceBlocks: [], requirementsBlocks: [],
      outcomes: [''], coverImageUrl: '', galleryUrls: [],
      metaTitle: '', metaDescription: '', categoryId: '',
      isFeatured: false, isPublished: false
    }
    expect(hasFormErrors(validateProgramForm(form))).toBe(false)
  })

  it('requires title', () => {
    const form = createEmptyProgramForm()
    form.slug = 'test'
    form.description = 'D'
    expect(validateProgramForm(form).title).toBe('Program title is required.')
  })

  it('requires description', () => {
    const form = createEmptyProgramForm()
    form.title = 'T'
    form.slug = 'test'
    expect(validateProgramForm(form).description).toBeDefined()
  })

  it('requires cover image on create', () => {
    const form = createEmptyProgramForm()
    form.title = 'T'
    form.slug = 'test'
    form.description = 'D'
    expect(validateProgramForm(form, { isCreate: true }).coverImageUrl).toBeDefined()
  })

  it('skips cover image check with hasPendingCover', () => {
    const form = createEmptyProgramForm()
    form.title = 'T'
    form.slug = 'test'
    form.description = 'D'
    expect(validateProgramForm(form, { isCreate: true, hasPendingCover: true }).coverImageUrl).toBeUndefined()
  })
})

describe('rowToProgramForm', () => {
  it('maps db row to form state', () => {
    const row: ProgramDbRow = {
      id: '1', title: 'Program', slug: 'program', description: 'Desc',
      body: [{ type: 'paragraph', data: { text: 'Hi' } }],
      outcomes: ['Outcome 1'], cover_image_url: 'media:cover.jpg',
      gallery_urls: ['media:g1.jpg'], is_featured: true, is_published: true
    }
    const form = rowToProgramForm(row)
    expect(form.title).toBe('Program')
    expect(form.outcomes).toEqual(['Outcome 1'])
    expect(form.isFeatured).toBe(true)
    expect(form.body).toHaveLength(1)
  })

  it('falls back to overview when body is empty', () => {
    const row: ProgramDbRow = {
      id: '1', title: 'Program', slug: 'program', description: 'Desc',
      overview: 'The overview text', cover_image_url: '',
      is_featured: false, is_published: false
    }
    const form = rowToProgramForm(row)
    expect(form.body).toHaveLength(2) // heading + paragraph
    expect(form.body[0].type).toBe('heading')
    expect(form.body[1].type).toBe('paragraph')
  })

  it('handles null optional fields', () => {
    const row: ProgramDbRow = {
      id: '1', title: 'P', slug: 's', description: 'D',
      cover_image_url: '', is_featured: false, is_published: false
    }
    const form = rowToProgramForm(row)
    expect(form.subtitle).toBe('')
    expect(form.outcomes).toEqual([''])
    expect(form.galleryUrls).toEqual([])
  })
})

describe('formToDbPayload (program)', () => {
  it('converts form to db payload with trimmed values', () => {
    const form: ProgramFormState = {
      title: '  My Program  ', slug: '  my-program  ', subtitle: '  Sub  ',
      description: '  Desc  ', body: [], labExperienceBlocks: [],
      requirementsBlocks: [], outcomes: ['  Learn  ', '', '  Build  '],
      coverImageUrl: 'media:cover.jpg', galleryUrls: [],
      metaTitle: '  ', metaDescription: '  Meta  ', categoryId: '',
      isFeatured: true, isPublished: false
    }
    const payload = formToDbPayload(form)
    expect(payload.title).toBe('My Program')
    expect(payload.subtitle).toBe('Sub')
    expect(payload.outcomes).toEqual(['Learn', 'Build'])
    expect(payload.meta_title).toBeNull()
    expect(payload.meta_description).toBe('Meta')
    expect(payload.is_featured).toBe(true)
    expect(payload.updated_at).toBeDefined()
  })

  it('serializes lab experience blocks as JSON', () => {
    const form = createEmptyProgramForm()
    form.title = 'T'
    form.slug = 's'
    form.description = 'D'
    form.labExperienceBlocks = [{ type: 'paragraph', data: { text: 'Lab' } }]
    const payload = formToDbPayload(form)
    expect(typeof payload.lab_experience).toBe('string')
    expect(JSON.parse(payload.lab_experience as string)).toHaveLength(1)
  })

  it('sets lab_experience to null when empty', () => {
    const form = createEmptyProgramForm()
    form.title = 'T'
    form.slug = 's'
    form.description = 'D'
    form.labExperienceBlocks = []
    const payload = formToDbPayload(form)
    expect(payload.lab_experience).toBeNull()
  })
})
