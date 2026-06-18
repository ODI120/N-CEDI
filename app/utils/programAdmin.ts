/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveStorageRef } from '~/utils/storage'

export interface ProgramFormState {
  title: string
  slug: string
  subtitle: string
  description: string
  body: Record<string, any>[]
  labExperienceBlocks: Record<string, any>[]
  requirementsBlocks: Record<string, any>[]
  outcomes: string[]
  coverImageUrl: string
  galleryUrls: string[]
  metaTitle: string
  metaDescription: string
  categoryId: string
  isFeatured: boolean
  isPublished: boolean
}

export interface ProgramDbRow {
  id: string
  title: string
  slug: string
  subtitle?: string | null
  description: string
  overview?: string | null
  lab_experience?: string | null
  requirements?: string | null
  body?: Record<string, unknown>[] | null
  outcomes?: string[] | null
  cover_image_url: string
  gallery_urls?: string[] | null
  meta_title?: string | null
  meta_description?: string | null
  category_id?: string | null
  is_featured: boolean
  is_published: boolean
  updated_at?: string
}

export function createEmptyProgramForm(): ProgramFormState {
  return {
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    body: [],
    labExperienceBlocks: [],
    requirementsBlocks: [
      { type: 'paragraph', data: { text: 'Active enrollment in an NCAT NBTE academic program (AMS, ATE, or AME schools).' } }
    ],
    outcomes: [''],
    coverImageUrl: '',
    galleryUrls: [],
    metaTitle: '',
    metaDescription: '',
    categoryId: '',
    isFeatured: false,
    isPublished: false
  }
}

export function slugifyTitle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function resolveProgramMediaUrl(url?: string | null): string {
  return resolveStorageRef(url)
}

export function parseOverviewFromBody(body?: Record<string, unknown>[] | null): string {
  if (!body?.length) return ''

  const overviewIndex = body.findIndex(
    block =>
      block.type === 'heading'
      && typeof block.data === 'object'
      && block.data
      && (block.data as { text?: string }).text === 'Program Overview'
  )

  if (overviewIndex >= 0) {
    const next = body[overviewIndex + 1]
    if (next?.type === 'paragraph' && typeof next.data === 'object' && next.data) {
      return (next.data as { text?: string }).text ?? ''
    }
  }

  const firstParagraph = body.find(block => block.type === 'paragraph')
  if (firstParagraph && typeof firstParagraph.data === 'object' && firstParagraph.data) {
    return (firstParagraph.data as { text?: string }).text ?? ''
  }

  return ''
}

export function deserializeBlockField(value?: string | null): Record<string, any>[] {
  if (!value) return []
  const trimmed = value.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // Fallback
    }
  }
  return [{ type: 'paragraph', data: { text: trimmed } }]
}

export function rowToProgramForm(row: ProgramDbRow): ProgramFormState {
  let bodyBlocks: Record<string, any>[] = []
  if (row.body?.length) {
    bodyBlocks = [...row.body]
  } else if (row.overview?.trim()) {
    bodyBlocks = [
      { type: 'heading', data: { level: 2, text: 'Program Overview' } },
      { type: 'paragraph', data: { text: row.overview.trim() } }
    ]
  }

  return {
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle ?? '',
    description: row.description,
    body: bodyBlocks,
    labExperienceBlocks: deserializeBlockField(row.lab_experience),
    requirementsBlocks: deserializeBlockField(row.requirements),
    outcomes: row.outcomes?.length ? [...row.outcomes] : [''],
    coverImageUrl: row.cover_image_url,
    galleryUrls: row.gallery_urls ? [...row.gallery_urls] : [],
    metaTitle: row.meta_title ?? '',
    metaDescription: row.meta_description ?? '',
    categoryId: row.category_id ?? '',
    isFeatured: row.is_featured,
    isPublished: row.is_published
  }
}

export function formToDbPayload(form: ProgramFormState): Record<string, unknown> {
  const outcomes = form.outcomes.map(item => item.trim()).filter(Boolean)

  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    subtitle: form.subtitle.trim() || null,
    description: form.description.trim(),
    overview: parseOverviewFromBody(form.body) || null,
    lab_experience: form.labExperienceBlocks.length ? JSON.stringify(form.labExperienceBlocks) : null,
    requirements: form.requirementsBlocks.length ? JSON.stringify(form.requirementsBlocks) : null,
    body: form.body,
    outcomes,
    cover_image_url: form.coverImageUrl,
    gallery_urls: form.galleryUrls,
    meta_title: form.metaTitle.trim() || null,
    meta_description: form.metaDescription.trim() || null,
    category_id: form.categoryId || null,
    is_featured: form.isFeatured,
    is_published: form.isPublished,
    updated_at: new Date().toISOString()
  }
}

export interface ProgramFormErrors {
  title?: string
  slug?: string
  description?: string
  coverImageUrl?: string
  publish?: string
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateSlugFormat(slug: string): string | undefined {
  const value = slug.trim()
  if (!value) return 'URL slug is required.'
  if (!SLUG_PATTERN.test(value)) {
    return 'Slug must use lowercase letters, numbers, and hyphens only.'
  }
  if (value.length > 80) return 'Slug must be 80 characters or fewer.'
  return undefined
}

/** Fields required before a track can go live on the public site. */
export function getPublishBlockers(form: ProgramFormState): string[] {
  const blockers: string[] = []

  if (!form.title.trim()) blockers.push('Program title')
  if (!form.slug.trim()) blockers.push('URL slug')
  if (!form.description.trim()) blockers.push('Card description')
  if (!form.coverImageUrl.trim()) blockers.push('Hero cover image')
  if (!form.body.length && !form.description.trim()) blockers.push('Overview or description content')
  if (!form.outcomes.some(item => item.trim())) blockers.push('At least one learning outcome')

  return blockers
}

export function validateProgramForm(
  form: ProgramFormState,
  options: { isCreate?: boolean, hasPendingCover?: boolean } = {}
): ProgramFormErrors {
  const errors: ProgramFormErrors = {}

  if (!form.title.trim()) errors.title = 'Program title is required.'

  const slugError = validateSlugFormat(form.slug)
  if (slugError) errors.slug = slugError

  if (!form.description.trim()) errors.description = 'Short description is required for program cards.'

  const hasCover = Boolean(form.coverImageUrl || options.hasPendingCover)
  if (options.isCreate && !hasCover) {
    errors.coverImageUrl = 'A hero cover image is required before saving a new program.'
  }

  if (form.isPublished) {
    const blockers = getPublishBlockers({
      ...form,
      coverImageUrl: hasCover ? form.coverImageUrl || 'pending' : ''
    })
    if (blockers.length) {
      errors.publish = `Complete before publishing: ${blockers.join(', ')}.`
    }
  }

  return errors
}

export function hasFormErrors(errors: ProgramFormErrors): boolean {
  return Object.keys(errors).length > 0
}
