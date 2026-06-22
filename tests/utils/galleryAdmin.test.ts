import { describe, it, expect, vi } from 'vitest'

import {
  parseGalleryMediaLocation,
  mapGalleryRow,
  createEmptyGalleryForm,
  rowToGalleryForm,
  formToGalleryPayload,
  validateGalleryForm,
  hasGalleryFormErrors,
  isVideoMediaValue,
  galleryStorageRefForRow,
  type GalleryItemDbRow
} from '~/utils/galleryAdmin'

vi.stubGlobal('useSupabaseClient', () => ({
  storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: '' } }) }) }
}))
vi.stubGlobal('useRuntimeConfig', () => ({ public: { supabaseUrl: '' } }))

describe('parseGalleryMediaLocation', () => {
  it('parses colon-style storage ref', () => {
    expect(parseGalleryMediaLocation('gallery_media:items/photo.jpg'))
      .toEqual({ bucket: 'gallery_media', path: 'items/photo.jpg' })
  })

  it('parses gallery_media/ prefix', () => {
    expect(parseGalleryMediaLocation('gallery_media/photo.jpg'))
      .toEqual({ bucket: 'gallery_media', path: 'photo.jpg' })
  })

  it('maps gallery/ prefix to media bucket', () => {
    expect(parseGalleryMediaLocation('gallery/photo.jpg'))
      .toEqual({ bucket: 'media', path: 'gallery/photo.jpg' })
  })

  it('maps items/ prefix to gallery_media bucket', () => {
    expect(parseGalleryMediaLocation('items/photo.jpg'))
      .toEqual({ bucket: 'gallery_media', path: 'items/photo.jpg' })
  })

  it('treats bare path as gallery_media bucket', () => {
    expect(parseGalleryMediaLocation('photo.jpg'))
      .toEqual({ bucket: 'gallery_media', path: 'photo.jpg' })
  })

  it('returns null for empty string', () => {
    expect(parseGalleryMediaLocation('')).toBeNull()
  })

  it('returns null for http URLs', () => {
    expect(parseGalleryMediaLocation('https://example.com/photo.jpg')).toBeNull()
  })

  it('returns null for absolute paths', () => {
    expect(parseGalleryMediaLocation('/images/photo.jpg')).toBeNull()
  })
})

describe('isVideoMediaValue', () => {
  it('returns true for http URLs', () => {
    expect(isVideoMediaValue('https://youtube.com/watch?v=123')).toBe(true)
    expect(isVideoMediaValue('http://example.com/video.mp4')).toBe(true)
  })

  it('returns true for storage refs with colon', () => {
    expect(isVideoMediaValue('media:video.mp4')).toBe(true)
  })

  it('returns false for empty string', () => {
    expect(isVideoMediaValue('')).toBe(false)
  })

  it('returns false for bare filenames', () => {
    expect(isVideoMediaValue('video.mp4')).toBe(false)
  })
})

describe('mapGalleryRow', () => {
  it('maps db row to GalleryItem', () => {
    const row: GalleryItemDbRow = {
      id: '1', title: 'Photo', media_url: 'gallery_media:photo.jpg',
      media_type: 'image', alt_text: 'A photo', category_id: 'c1',
      event_id: 'e1', program_id: 'p1', is_published: true,
      display_order: 1, created_at: '2024-01-01'
    }
    const item = mapGalleryRow(row)
    expect(item.id).toBe('1')
    expect(item.title).toBe('Photo')
    expect(item.mediaType).toBe('image')
    expect(item.displayOrder).toBe(1)
  })

  it('defaults null fields to undefined', () => {
    const row: GalleryItemDbRow = {
      id: '1', title: null, media_url: 'photo.jpg', media_type: 'image',
      alt_text: null, category_id: null, event_id: null, program_id: null,
      is_published: false, display_order: 0, created_at: '2024-01-01'
    }
    const item = mapGalleryRow(row)
    expect(item.title).toBeUndefined()
    expect(item.altText).toBeUndefined()
    expect(item.categoryId).toBeUndefined()
  })
})

describe('createEmptyGalleryForm', () => {
  it('returns default form state', () => {
    const form = createEmptyGalleryForm()
    expect(form.title).toBe('')
    expect(form.mediaType).toBe('image')
    expect(form.displayOrder).toBe(0)
    expect(form.isPublished).toBe(true)
  })
})

describe('rowToGalleryForm', () => {
  it('maps db row to form state', () => {
    const row: GalleryItemDbRow = {
      id: '1', title: 'Photo', media_url: 'gallery_media:photo.jpg',
      media_type: 'image', alt_text: 'Alt', category_id: 'c1',
      event_id: 'e1', program_id: 'p1', is_published: true,
      display_order: 2, created_at: '2024-01-01'
    }
    const form = rowToGalleryForm(row)
    expect(form.title).toBe('Photo')
    expect(form.mediaUrl).toBe('gallery_media:photo.jpg')
    expect(form.altText).toBe('Alt')
    expect(form.displayOrder).toBe(2)
  })
})

describe('formToGalleryPayload', () => {
  it('converts form to db payload', () => {
    const form = createEmptyGalleryForm()
    form.title = '  Photo Title  '
    form.mediaUrl = 'gallery_media:photo.jpg'
    form.altText = '  Alt text  '
    form.categoryId = ''
    const payload = formToGalleryPayload(form)
    expect(payload.title).toBe('Photo Title')
    expect(payload.media_url).toBe('gallery_media:photo.jpg')
    expect(payload.alt_text).toBe('Alt text')
    expect(payload.category_id).toBeNull()
  })
})

describe('validateGalleryForm', () => {
  it('returns no errors for valid form', () => {
    const form = createEmptyGalleryForm()
    form.title = 'Photo'
    form.mediaUrl = 'gallery_media:photo.jpg'
    expect(hasGalleryFormErrors(validateGalleryForm(form))).toBe(false)
  })

  it('requires title', () => {
    const form = createEmptyGalleryForm()
    form.mediaUrl = 'gallery_media:photo.jpg'
    expect(validateGalleryForm(form).title).toBe('Title is required.')
  })

  it('requires media URL for image without upload', () => {
    const form = createEmptyGalleryForm()
    form.title = 'Photo'
    expect(validateGalleryForm(form).mediaUrl).toBeDefined()
  })

  it('allows image with pending upload', () => {
    const form = createEmptyGalleryForm()
    form.title = 'Photo'
    expect(validateGalleryForm(form, { hasImageUpload: true }).mediaUrl).toBeUndefined()
  })

  it('validates video URL format', () => {
    const form = createEmptyGalleryForm()
    form.title = 'Video'
    form.mediaType = 'video'
    form.mediaUrl = 'just-a-filename.mp4'
    expect(validateGalleryForm(form).mediaUrl).toBeDefined()
  })

  it('accepts valid video URL', () => {
    const form = createEmptyGalleryForm()
    form.title = 'Video'
    form.mediaType = 'video'
    form.mediaUrl = 'https://youtube.com/video'
    expect(validateGalleryForm(form).mediaUrl).toBeUndefined()
  })

  it('rejects negative display order', () => {
    const form = createEmptyGalleryForm()
    form.title = 'Photo'
    form.mediaUrl = 'photo.jpg'
    form.displayOrder = -1
    expect(validateGalleryForm(form).displayOrder).toBeDefined()
  })
})

describe('galleryStorageRefForRow', () => {
  it('returns media_url for image items', () => {
    expect(galleryStorageRefForRow({ media_url: 'gallery_media:photo.jpg', media_type: 'image' }))
      .toBe('gallery_media:photo.jpg')
  })

  it('returns null for video items', () => {
    expect(galleryStorageRefForRow({ media_url: 'https://example.com/v.mp4', media_type: 'video' }))
      .toBeNull()
  })

  it('returns null for http image URLs', () => {
    expect(galleryStorageRefForRow({ media_url: 'https://example.com/photo.jpg', media_type: 'image' }))
      .toBeNull()
  })

  it('returns null for empty media_url', () => {
    expect(galleryStorageRefForRow({ media_url: '  ', media_type: 'image' }))
      .toBeNull()
  })
})
