import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  STORAGE_BUCKETS,
  isStorageBucketId,
  formatStorageRef,
  parseStorageRef,
  appendTransformParams,
  getStoragePublicUrl,
  collectProgramStorageRefs,
  resolveStorageRefForDelete,
  isSupabaseStorageUrl,
  partnerLogoObjectPath,
  galleryMediaObjectPath,
  mediaObjectPath,
  programMediaObjectPath,
  testimonialAvatarObjectPath,
  teamMemberAvatarObjectPath,
  resolveStorageRef
} from '~/utils/storage'

vi.mock('~/utils/imageProcessing', () => ({
  processImageBeforeUpload: vi.fn(async (file: File) => file)
}))

// Mock Nuxt auto-imports used inside storage.ts
const mockGetPublicUrl = vi.fn()
const mockUpload = vi.fn()
const mockRemove = vi.fn()

vi.stubGlobal('useSupabaseClient', () => ({
  storage: {
    from: () => ({
      getPublicUrl: mockGetPublicUrl,
      upload: mockUpload,
      remove: mockRemove
    })
  }
}))

vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    supabaseUrl: 'https://test.supabase.co'
  }
}))

describe('STORAGE_BUCKETS', () => {
  it('has expected bucket keys', () => {
    expect(STORAGE_BUCKETS.media).toBe('media')
    expect(STORAGE_BUCKETS.site_assets).toBe('site_assets')
    expect(STORAGE_BUCKETS.gallery_media).toBe('gallery_media')
    expect(STORAGE_BUCKETS.program_media).toBe('program_media')
    expect(STORAGE_BUCKETS.teams_avatars).toBe('teams_avatars')
    expect(STORAGE_BUCKETS.testimonial_avatars).toBe('testimonial_avatars')
  })
})

describe('isStorageBucketId', () => {
  it('returns true for valid bucket ids', () => {
    expect(isStorageBucketId('media')).toBe(true)
    expect(isStorageBucketId('site_assets')).toBe(true)
    expect(isStorageBucketId('gallery_media')).toBe(true)
  })

  it('returns false for invalid bucket ids', () => {
    expect(isStorageBucketId('unknown')).toBe(false)
    expect(isStorageBucketId('')).toBe(false)
    expect(isStorageBucketId('Media')).toBe(false)
  })
})

describe('formatStorageRef', () => {
  it('builds bucket:path reference', () => {
    expect(formatStorageRef('media', 'photo.jpg')).toBe('media:photo.jpg')
  })

  it('strips leading slashes from path', () => {
    expect(formatStorageRef('media', '///photo.jpg')).toBe('media:photo.jpg')
  })

  it('preserves nested paths', () => {
    expect(formatStorageRef('program_media', 'slug/cover.jpg')).toBe('program_media:slug/cover.jpg')
  })
})

describe('parseStorageRef', () => {
  it('parses a valid storage reference', () => {
    const result = parseStorageRef('media:photo.jpg')
    expect(result).toEqual({ bucket: 'media', path: 'photo.jpg' })
  })

  it('parses nested paths', () => {
    const result = parseStorageRef('program_media:slug/cover.jpg')
    expect(result).toEqual({ bucket: 'program_media', path: 'slug/cover.jpg' })
  })

  it('returns null for string without colon', () => {
    expect(parseStorageRef('nocolon')).toBeNull()
  })

  it('returns null for string starting with colon', () => {
    expect(parseStorageRef(':path')).toBeNull()
  })

  it('returns null for unknown bucket', () => {
    expect(parseStorageRef('unknown:path.jpg')).toBeNull()
  })

  it('returns null if path is empty after colon', () => {
    expect(parseStorageRef('media:')).toBeNull()
  })
})

describe('appendTransformParams', () => {
  it('returns url unchanged when no options provided', () => {
    const url = 'https://example.com/storage/v1/object/public/media/photo.jpg'
    expect(appendTransformParams(url)).toBe(url)
  })

  it('returns url unchanged for non-image urls', () => {
    const url = 'https://example.com/file.pdf'
    expect(appendTransformParams(url, { width: 100 })).toBe(url)
  })

  it('appends width, height, quality params to image urls', () => {
    const url = 'https://example.com/photo.jpg'
    const result = appendTransformParams(url, { width: 100, height: 200, quality: 80 })
    expect(result).toContain('width=100')
    expect(result).toContain('height=200')
    expect(result).toContain('quality=80')
  })

  it('replaces /object/public/ with /render/image/public/ for Supabase URLs', () => {
    const url = 'https://test.supabase.co/storage/v1/object/public/media/photo.jpg'
    const result = appendTransformParams(url, { width: 100 })
    expect(result).toContain('/storage/v1/render/image/public/')
    expect(result).not.toContain('/storage/v1/object/public/')
  })

  it('uses ? for first param when url has no query string', () => {
    const url = 'https://example.com/photo.png'
    const result = appendTransformParams(url, { width: 100 })
    expect(result).toContain('?width=100')
  })

  it('uses & when url already has query string', () => {
    const url = 'https://example.com/photo.png?existing=1'
    const result = appendTransformParams(url, { width: 100 })
    expect(result).toContain('&width=100')
  })

  it('returns url unchanged when options have no values', () => {
    const url = 'https://example.com/photo.jpg'
    expect(appendTransformParams(url, {})).toBe(url)
  })

  it('recognizes various image extensions', () => {
    for (const ext of ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg']) {
      const url = `https://example.com/file.${ext}`
      const result = appendTransformParams(url, { width: 50 })
      expect(result).toContain('width=50')
    }
  })
})

describe('isSupabaseStorageUrl', () => {
  it('returns true for Supabase storage URLs', () => {
    expect(isSupabaseStorageUrl('https://abc.supabase.co/storage/v1/object/public/media/photo.jpg')).toBe(true)
  })

  it('returns false for non-Supabase URLs', () => {
    expect(isSupabaseStorageUrl('https://example.com/photo.jpg')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isSupabaseStorageUrl('')).toBe(false)
  })
})

describe('collectProgramStorageRefs', () => {
  it('collects cover and gallery refs', () => {
    const refs = collectProgramStorageRefs('media:cover.jpg', ['media:g1.jpg', 'media:g2.jpg'])
    expect(refs).toEqual(['media:cover.jpg', 'media:g1.jpg', 'media:g2.jpg'])
  })

  it('skips empty cover', () => {
    const refs = collectProgramStorageRefs('', ['media:g1.jpg'])
    expect(refs).toEqual(['media:g1.jpg'])
  })

  it('skips null gallery', () => {
    const refs = collectProgramStorageRefs('media:cover.jpg', null)
    expect(refs).toEqual(['media:cover.jpg'])
  })

  it('returns empty array when all empty', () => {
    expect(collectProgramStorageRefs(null, null)).toEqual([])
  })

  it('trims whitespace from refs', () => {
    const refs = collectProgramStorageRefs('  media:cover.jpg  ', ['  media:g1.jpg  '])
    expect(refs).toEqual(['media:cover.jpg', 'media:g1.jpg'])
  })

  it('skips empty strings in gallery array', () => {
    const refs = collectProgramStorageRefs(undefined, ['', '  ', 'media:g1.jpg'])
    expect(refs).toEqual(['media:g1.jpg'])
  })
})

describe('resolveStorageRefForDelete', () => {
  it('parses colon-style storage ref', () => {
    expect(resolveStorageRefForDelete('media:photo.jpg')).toEqual({ bucket: 'media', path: 'photo.jpg' })
  })

  it('parses slash-style storage ref', () => {
    expect(resolveStorageRefForDelete('program_media/slug/cover.jpg')).toEqual({ bucket: 'program_media', path: 'slug/cover.jpg' })
  })

  it('returns null for non-storage ref', () => {
    expect(resolveStorageRefForDelete('https://example.com/photo.jpg')).toBeNull()
  })
})

describe('object path generators', () => {
  it('partnerLogoObjectPath generates partners/ prefix', () => {
    const result = partnerLogoObjectPath('logo.png')
    expect(result).toMatch(/^partners\/[a-f0-9-]+-logo\.png$/)
  })

  it('partnerLogoObjectPath sanitizes filenames', () => {
    const result = partnerLogoObjectPath('my logo (1).png')
    expect(result).toMatch(/^partners\/.*my_logo__1_\.png$/)
  })

  it('galleryMediaObjectPath generates items/ prefix', () => {
    const result = galleryMediaObjectPath('image.jpg')
    expect(result).toMatch(/^items\/[a-f0-9-]+-image\.jpg$/)
  })

  it('mediaObjectPath includes filename and uuid', () => {
    const result = mediaObjectPath('doc.pdf')
    expect(result).toMatch(/doc\.pdf-/)
  })

  it('programMediaObjectPath generates slug/prefix pattern', () => {
    const result = programMediaObjectPath('my-program', 'cover', 'photo.jpg')
    expect(result).toMatch(/^my-program\/cover-[a-f0-9-]+-photo\.jpg$/)
  })

  it('programMediaObjectPath sanitizes slug', () => {
    const result = programMediaObjectPath('My Program!', 'gallery', 'image.png')
    expect(result).toMatch(/^my-program-?\/gallery-.*-image\.png$/)
  })

  it('programMediaObjectPath falls back to "program" for empty slug', () => {
    const result = programMediaObjectPath('', 'cover', 'photo.jpg')
    expect(result).toMatch(/^program\/cover-/)
  })

  it('testimonialAvatarObjectPath generates avatars/ prefix', () => {
    const result = testimonialAvatarObjectPath('avatar.jpg')
    expect(result).toMatch(/^avatars\/[a-f0-9-]+-avatar\.jpg$/)
  })

  it('teamMemberAvatarObjectPath generates avatars/ prefix', () => {
    const result = teamMemberAvatarObjectPath('photo.png')
    expect(result).toMatch(/^avatars\/[a-f0-9-]+-photo\.png$/)
  })
})

describe('getStoragePublicUrl', () => {
  beforeEach(() => {
    mockGetPublicUrl.mockReset()
  })

  it('uses Supabase client getPublicUrl when available', () => {
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/media/photo.jpg' }
    })
    const result = getStoragePublicUrl('media', 'photo.jpg')
    expect(result).toBe('https://test.supabase.co/storage/v1/object/public/media/photo.jpg')
  })

  it('strips leading slashes from object path', () => {
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/media/photo.jpg' }
    })
    const result = getStoragePublicUrl('media', '///photo.jpg')
    expect(result).toBe('https://test.supabase.co/storage/v1/object/public/media/photo.jpg')
  })
})

describe('resolveStorageRef', () => {
  beforeEach(() => {
    mockGetPublicUrl.mockReset()
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/media/photo.jpg' }
    })
  })

  it('returns empty string for null/undefined', () => {
    expect(resolveStorageRef(null)).toBe('')
    expect(resolveStorageRef(undefined)).toBe('')
  })

  it('returns empty string for empty or whitespace-only string', () => {
    expect(resolveStorageRef('')).toBe('')
    expect(resolveStorageRef('   ')).toBe('')
  })

  it('returns absolute URLs unchanged', () => {
    expect(resolveStorageRef('https://example.com/photo.jpg')).toBe('https://example.com/photo.jpg')
    expect(resolveStorageRef('http://example.com/photo.jpg')).toBe('http://example.com/photo.jpg')
  })

  it('returns local paths unchanged', () => {
    expect(resolveStorageRef('/images/logo.png')).toBe('/images/logo.png')
  })

  it('resolves colon-style storage refs', () => {
    const result = resolveStorageRef('media:photo.jpg')
    expect(result).toContain('photo.jpg')
  })
})
