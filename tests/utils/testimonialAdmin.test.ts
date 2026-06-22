import { describe, it, expect, vi } from 'vitest'

import {
  parseTestimonialAvatarLocation,
  mapTestimonialRow,
  createEmptyTestimonialForm,
  rowToTestimonialForm,
  formToTestimonialPayload,
  validateTestimonialForm,
  hasTestimonialFormErrors,
  testimonialStorageRefForRow,
  type TestimonialDbRow
} from '~/utils/testimonialAdmin'

vi.stubGlobal('useSupabaseClient', () => ({
  storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: '' } }) }) }
}))
vi.stubGlobal('useRuntimeConfig', () => ({ public: { supabaseUrl: '' } }))

describe('parseTestimonialAvatarLocation', () => {
  it('parses colon-style storage ref', () => {
    expect(parseTestimonialAvatarLocation('testimonial_avatars:avatar.jpg'))
      .toEqual({ bucket: 'testimonial_avatars', path: 'avatar.jpg' })
  })

  it('parses slash-style path', () => {
    expect(parseTestimonialAvatarLocation('testimonial_avatars/avatar.jpg'))
      .toEqual({ bucket: 'testimonial_avatars', path: 'avatar.jpg' })
  })

  it('treats bare path as testimonial_avatars bucket', () => {
    expect(parseTestimonialAvatarLocation('avatar.jpg'))
      .toEqual({ bucket: 'testimonial_avatars', path: 'avatar.jpg' })
  })

  it('returns null for empty string', () => {
    expect(parseTestimonialAvatarLocation('')).toBeNull()
  })

  it('returns null for http URLs', () => {
    expect(parseTestimonialAvatarLocation('https://example.com/avatar.jpg')).toBeNull()
  })

  it('returns null for absolute paths', () => {
    expect(parseTestimonialAvatarLocation('/images/avatar.jpg')).toBeNull()
  })
})

describe('mapTestimonialRow', () => {
  it('maps db row to Testimonial type', () => {
    const row: TestimonialDbRow = {
      id: '1', name: 'Jane', role: 'Student', organization: 'NCAT',
      quote: 'Great!', avatar_url: 'media:avatar.jpg', rating: 4,
      is_featured: true, is_published: true, sort_order: 1, created_at: '2024-01-01'
    }
    const result = mapTestimonialRow(row)
    expect(result.name).toBe('Jane')
    expect(result.role).toBe('Student')
    expect(result.rating).toBe(4)
    expect(result.isFeatured).toBe(true)
  })

  it('defaults null role/organization to undefined', () => {
    const row: TestimonialDbRow = {
      id: '1', name: 'Jane', role: null, organization: null,
      quote: 'Great!', avatar_url: null, rating: null,
      is_featured: false, is_published: true, sort_order: null, created_at: '2024-01-01'
    }
    const result = mapTestimonialRow(row)
    expect(result.role).toBeUndefined()
    expect(result.organization).toBeUndefined()
    expect(result.rating).toBe(5)
  })
})

describe('createEmptyTestimonialForm', () => {
  it('returns form with defaults', () => {
    const form = createEmptyTestimonialForm()
    expect(form.name).toBe('')
    expect(form.rating).toBe(5)
    expect(form.isPublished).toBe(true)
    expect(form.sortOrder).toBe(0)
  })
})

describe('rowToTestimonialForm', () => {
  it('maps db row to form state', () => {
    const row: TestimonialDbRow = {
      id: '1', name: 'Jane', role: 'Student', organization: 'NCAT',
      quote: 'Great!', avatar_url: 'media:avatar.jpg', rating: 4,
      is_featured: true, is_published: true, sort_order: 2, created_at: '2024-01-01'
    }
    const form = rowToTestimonialForm(row)
    expect(form.name).toBe('Jane')
    expect(form.role).toBe('Student')
    expect(form.avatarUrl).toBe('media:avatar.jpg')
    expect(form.sortOrder).toBe(2)
  })

  it('defaults null fields to empty/default', () => {
    const row: TestimonialDbRow = {
      id: '1', name: 'Jane', role: null, organization: null,
      quote: 'Great!', avatar_url: null, rating: null,
      is_featured: false, is_published: true, sort_order: null, created_at: '2024-01-01'
    }
    const form = rowToTestimonialForm(row)
    expect(form.role).toBe('')
    expect(form.avatarUrl).toBe('')
    expect(form.rating).toBe(5)
    expect(form.sortOrder).toBe(0)
  })
})

describe('formToTestimonialPayload', () => {
  it('converts form to db payload with clamped rating', () => {
    const form = createEmptyTestimonialForm()
    form.name = '  Jane  '
    form.quote = '  Great program!  '
    form.rating = 10
    const payload = formToTestimonialPayload(form)
    expect(payload.name).toBe('Jane')
    expect(payload.quote).toBe('Great program!')
    expect(payload.rating).toBe(5) // clamped to max 5
  })

  it('clamps rating to minimum 1', () => {
    const form = createEmptyTestimonialForm()
    form.name = 'Jane'
    form.quote = 'Great!'
    form.rating = -1
    const payload = formToTestimonialPayload(form)
    expect(payload.rating).toBe(1)
  })

  it('sets empty optional fields to null', () => {
    const form = createEmptyTestimonialForm()
    form.name = 'Jane'
    form.quote = 'Great!'
    const payload = formToTestimonialPayload(form)
    expect(payload.role).toBeNull()
    expect(payload.organization).toBeNull()
    expect(payload.avatar_url).toBeNull()
  })
})

describe('validateTestimonialForm', () => {
  it('returns no errors for valid form', () => {
    const form = createEmptyTestimonialForm()
    form.name = 'Jane'
    form.quote = 'Great!'
    expect(hasTestimonialFormErrors(validateTestimonialForm(form))).toBe(false)
  })

  it('requires name', () => {
    const form = createEmptyTestimonialForm()
    form.quote = 'Great!'
    expect(validateTestimonialForm(form).name).toBe('Name is required.')
  })

  it('requires quote', () => {
    const form = createEmptyTestimonialForm()
    form.name = 'Jane'
    expect(validateTestimonialForm(form).quote).toBe('Quote is required.')
  })

  it('validates rating range', () => {
    const form = createEmptyTestimonialForm()
    form.name = 'Jane'
    form.quote = 'Great!'
    form.rating = 0
    expect(validateTestimonialForm(form).rating).toBeDefined()
    form.rating = 6
    expect(validateTestimonialForm(form).rating).toBeDefined()
  })

  it('validates sort order is non-negative', () => {
    const form = createEmptyTestimonialForm()
    form.name = 'Jane'
    form.quote = 'Great!'
    form.sortOrder = -1
    expect(validateTestimonialForm(form).sortOrder).toBeDefined()
  })
})

describe('testimonialStorageRefForRow', () => {
  it('returns storage ref for colon-style avatar', () => {
    const row: TestimonialDbRow = {
      id: '1', name: 'Jane', role: null, organization: null,
      quote: 'Great!', avatar_url: 'testimonial_avatars:avatars/abc.jpg',
      rating: 5, is_featured: false, is_published: true, sort_order: 0, created_at: ''
    }
    expect(testimonialStorageRefForRow(row)).toBe('testimonial_avatars:avatars/abc.jpg')
  })

  it('returns null for null avatar', () => {
    const row: TestimonialDbRow = {
      id: '1', name: 'Jane', role: null, organization: null,
      quote: 'Great!', avatar_url: null,
      rating: 5, is_featured: false, is_published: true, sort_order: 0, created_at: ''
    }
    expect(testimonialStorageRefForRow(row)).toBeNull()
  })

  it('returns null for empty avatar', () => {
    const row: TestimonialDbRow = {
      id: '1', name: 'Jane', role: null, organization: null,
      quote: 'Great!', avatar_url: '  ',
      rating: 5, is_featured: false, is_published: true, sort_order: 0, created_at: ''
    }
    expect(testimonialStorageRefForRow(row)).toBeNull()
  })
})
