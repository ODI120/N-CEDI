import { describe, it, expect, vi } from 'vitest'

import {
  createEmptyEventForm,
  slugifyTitle,
  rowToEventForm,
  formToDbPayload,
  validateSlugFormat,
  getPublishBlockers,
  validateEventForm,
  hasFormErrors,
  type EventFormState,
  type EventDbRow
} from '~/utils/eventAdmin'

vi.stubGlobal('useSupabaseClient', () => ({
  storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: '' } }) }) }
}))
vi.stubGlobal('useRuntimeConfig', () => ({ public: { supabaseUrl: '' } }))

describe('createEmptyEventForm', () => {
  it('returns a blank form state', () => {
    const form = createEmptyEventForm()
    expect(form.title).toBe('')
    expect(form.slug).toBe('')
    expect(form.description).toBe('')
    expect(form.body).toEqual([])
    expect(form.coverImageUrl).toBe('')
    expect(form.galleryUrls).toEqual([])
    expect(form.isPublished).toBe(false)
  })
})

describe('slugifyTitle', () => {
  it('converts text to lowercase hyphenated slug', () => {
    expect(slugifyTitle('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugifyTitle('Event #1!')).toBe('event-1')
  })

  it('collapses consecutive hyphens', () => {
    expect(slugifyTitle('a---b')).toBe('a-b')
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugifyTitle('  --hello--  ')).toBe('hello')
  })

  it('handles empty string', () => {
    expect(slugifyTitle('')).toBe('')
  })
})

describe('validateSlugFormat', () => {
  it('returns undefined for valid slug', () => {
    expect(validateSlugFormat('hello-world')).toBeUndefined()
  })

  it('returns error for empty slug', () => {
    expect(validateSlugFormat('')).toBe('URL slug is required.')
    expect(validateSlugFormat('   ')).toBe('URL slug is required.')
  })

  it('rejects slugs with uppercase letters', () => {
    expect(validateSlugFormat('Hello')).toBeDefined()
  })

  it('rejects slugs with special characters', () => {
    expect(validateSlugFormat('hello_world')).toBeDefined()
    expect(validateSlugFormat('hello world')).toBeDefined()
  })

  it('rejects slugs longer than 80 characters', () => {
    const longSlug = 'a'.repeat(81)
    expect(validateSlugFormat(longSlug)).toBe('Slug must be 80 characters or fewer.')
  })

  it('accepts slugs up to 80 characters', () => {
    const slug80 = 'a'.repeat(80)
    expect(validateSlugFormat(slug80)).toBeUndefined()
  })

  it('rejects slugs with consecutive hyphens', () => {
    expect(validateSlugFormat('hello--world')).toBeDefined()
  })

  it('rejects slugs starting or ending with hyphen', () => {
    expect(validateSlugFormat('-hello')).toBeDefined()
    expect(validateSlugFormat('hello-')).toBeDefined()
  })
})

describe('getPublishBlockers', () => {
  it('returns no blockers when all required fields present', () => {
    const form: EventFormState = {
      title: 'Test', slug: 'test', description: 'Desc',
      body: [], coverImageUrl: 'media:cover.jpg', galleryUrls: [],
      metaTitle: '', metaDescription: '', categoryId: '', isPublished: true
    }
    expect(getPublishBlockers(form)).toEqual([])
  })

  it('returns blocker for missing title', () => {
    const form = createEmptyEventForm()
    form.slug = 'test'
    form.description = 'Desc'
    form.coverImageUrl = 'media:cover.jpg'
    expect(getPublishBlockers(form)).toContain('Event title')
  })

  it('returns multiple blockers for empty form', () => {
    const form = createEmptyEventForm()
    const blockers = getPublishBlockers(form)
    expect(blockers).toContain('Event title')
    expect(blockers).toContain('URL slug')
    expect(blockers).toContain('Short description')
    expect(blockers).toContain('Cover image')
  })
})

describe('validateEventForm', () => {
  it('returns no errors for a valid form', () => {
    const form: EventFormState = {
      title: 'Test Event', slug: 'test-event', description: 'A test event',
      body: [], coverImageUrl: 'media:cover.jpg', galleryUrls: [],
      metaTitle: '', metaDescription: '', categoryId: '', isPublished: false
    }
    expect(hasFormErrors(validateEventForm(form))).toBe(false)
  })

  it('returns title error when title is empty', () => {
    const form = createEmptyEventForm()
    form.slug = 'test'
    form.description = 'Desc'
    const errors = validateEventForm(form)
    expect(errors.title).toBe('Event title is required.')
  })

  it('returns slug error for invalid slug', () => {
    const form = createEmptyEventForm()
    form.title = 'Test'
    form.slug = 'INVALID SLUG!'
    form.description = 'Desc'
    const errors = validateEventForm(form)
    expect(errors.slug).toBeDefined()
  })

  it('requires cover image on create', () => {
    const form = createEmptyEventForm()
    form.title = 'Test'
    form.slug = 'test'
    form.description = 'Desc'
    const errors = validateEventForm(form, { isCreate: true })
    expect(errors.coverImageUrl).toBeDefined()
  })

  it('does not require cover image on update', () => {
    const form = createEmptyEventForm()
    form.title = 'Test'
    form.slug = 'test'
    form.description = 'Desc'
    const errors = validateEventForm(form)
    expect(errors.coverImageUrl).toBeUndefined()
  })

  it('returns publish blockers when publishing incomplete form', () => {
    const form = createEmptyEventForm()
    form.title = 'Test'
    form.slug = 'test'
    form.description = 'Desc'
    form.isPublished = true
    const errors = validateEventForm(form)
    expect(errors.publish).toBeDefined()
  })

  it('accepts pending cover on create', () => {
    const form = createEmptyEventForm()
    form.title = 'Test'
    form.slug = 'test'
    form.description = 'Desc'
    const errors = validateEventForm(form, { isCreate: true, hasPendingCover: true })
    expect(errors.coverImageUrl).toBeUndefined()
  })
})

describe('hasFormErrors', () => {
  it('returns false for empty error object', () => {
    expect(hasFormErrors({})).toBe(false)
  })

  it('returns true when errors exist', () => {
    expect(hasFormErrors({ title: 'Required' })).toBe(true)
  })
})

describe('rowToEventForm', () => {
  it('maps db row to form state', () => {
    const row: EventDbRow = {
      id: '1', title: 'Event', slug: 'event', description: 'Desc',
      body: [{ type: 'paragraph', data: { text: 'Hello' } }],
      cover_image_url: 'media:cover.jpg',
      gallery_urls: ['media:g1.jpg'],
      meta_title: 'Meta', meta_description: 'Meta Desc',
      category_id: 'cat-1', is_published: true
    }
    const form = rowToEventForm(row)
    expect(form.title).toBe('Event')
    expect(form.slug).toBe('event')
    expect(form.body).toHaveLength(1)
    expect(form.galleryUrls).toEqual(['media:g1.jpg'])
    expect(form.metaTitle).toBe('Meta')
    expect(form.isPublished).toBe(true)
  })

  it('handles null optional fields', () => {
    const row: EventDbRow = {
      id: '1', title: 'Event', slug: 'event', description: 'Desc',
      cover_image_url: '', is_published: false
    }
    const form = rowToEventForm(row)
    expect(form.body).toEqual([])
    expect(form.galleryUrls).toEqual([])
    expect(form.metaTitle).toBe('')
    expect(form.metaDescription).toBe('')
    expect(form.categoryId).toBe('')
  })
})

describe('formToDbPayload', () => {
  it('converts form state to db payload', () => {
    const form: EventFormState = {
      title: '  Test Event  ', slug: '  test-event  ', description: '  Desc  ',
      body: [{ type: 'paragraph', data: { text: 'Hello' } }],
      coverImageUrl: 'media:cover.jpg', galleryUrls: ['media:g1.jpg'],
      metaTitle: '  Meta  ', metaDescription: '  ', categoryId: '', isPublished: true
    }
    const payload = formToDbPayload(form)
    expect(payload.title).toBe('Test Event')
    expect(payload.slug).toBe('test-event')
    expect(payload.description).toBe('Desc')
    expect(payload.meta_title).toBe('Meta')
    expect(payload.meta_description).toBeNull()
    expect(payload.category_id).toBeNull()
    expect(payload.is_published).toBe(true)
    expect(payload.updated_at).toBeDefined()
  })
})
