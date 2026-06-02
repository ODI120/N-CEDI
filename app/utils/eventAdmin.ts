import { resolveStorageRef } from '~/utils/storage'

export interface EventFormState {
  title: string
  slug: string
  description: string
  body: Record<string, any>[]
  coverImageUrl: string
  galleryUrls: string[]
  metaTitle: string
  metaDescription: string
  categoryId: string
  isPublished: boolean
}

export interface EventDbRow {
  id: string
  title: string
  slug: string
  description: string
  body?: Record<string, any>[] | null
  cover_image_url: string
  gallery_urls?: string[] | null
  meta_title?: string | null
  meta_description?: string | null
  category_id?: string | null
  is_published: boolean
  created_at?: string
  updated_at?: string
}

export function createEmptyEventForm(): EventFormState {
  return {
    title: '',
    slug: '',
    description: '',
    body: [],
    coverImageUrl: '',
    galleryUrls: [],
    metaTitle: '',
    metaDescription: '',
    categoryId: '',
    isPublished: false,
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

export function resolveEventMediaUrl(url?: string | null): string {
  return resolveStorageRef(url)
}

export function rowToEventForm(row: EventDbRow): EventFormState {
  return {
    title: row.title,
    slug: row.slug,
    description: row.description,
    body: row.body ? [...row.body] : [],
    coverImageUrl: row.cover_image_url || '',
    galleryUrls: row.gallery_urls ? [...row.gallery_urls] : [],
    metaTitle: row.meta_title ?? '',
    metaDescription: row.meta_description ?? '',
    categoryId: row.category_id ?? '',
    isPublished: row.is_published,
  }
}

export function formToDbPayload(form: EventFormState): Record<string, any> {
  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    description: form.description.trim(),
    body: form.body,
    cover_image_url: form.coverImageUrl,
    gallery_urls: form.galleryUrls,
    meta_title: form.metaTitle.trim() || null,
    meta_description: form.metaDescription.trim() || null,
    category_id: form.categoryId || null,
    is_published: form.isPublished,
    updated_at: new Date().toISOString(),
  }
}

export interface EventFormErrors {
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

export function getPublishBlockers(form: EventFormState): string[] {
  const blockers: string[] = []

  if (!form.title.trim()) blockers.push('Event title')
  if (!form.slug.trim()) blockers.push('URL slug')
  if (!form.description.trim()) blockers.push('Short description')
  if (!form.coverImageUrl.trim()) blockers.push('Cover image')

  return blockers
}

export function validateEventForm(
  form: EventFormState,
  options: { isCreate?: boolean; hasPendingCover?: boolean } = {},
): EventFormErrors {
  const errors: EventFormErrors = {}

  if (!form.title.trim()) errors.title = 'Event title is required.'

  const slugError = validateSlugFormat(form.slug)
  if (slugError) errors.slug = slugError

  if (!form.description.trim()) errors.description = 'Short description is required.'

  const hasCover = Boolean(form.coverImageUrl || options.hasPendingCover)
  if (options.isCreate && !hasCover) {
    errors.coverImageUrl = 'A cover image is required before saving a new event.'
  }

  if (form.isPublished) {
    const blockers = getPublishBlockers({
      ...form,
      coverImageUrl: hasCover ? form.coverImageUrl || 'pending' : '',
    })
    if (blockers.length) {
      errors.publish = `Complete before publishing: ${blockers.join(', ')}.`
    }
  }

  return errors
}

export function hasFormErrors(errors: EventFormErrors): boolean {
  return Object.keys(errors).length > 0
}
