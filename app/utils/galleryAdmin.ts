import type { GalleryItem } from '~/types'
import {
  parseStorageRef,
  STORAGE_BUCKETS,
  getStoragePublicUrl,
  resolveStorageRef,
  type StorageBucketId,
  type ImageTransformOptions,
  appendTransformParams,
} from '~/utils/storage'

export interface GalleryItemDbRow {
  id: string
  title: string | null
  media_url: string
  media_type: 'image' | 'video'
  alt_text: string | null
  category_id: string | null
  event_id: string | null
  program_id: string | null
  is_published: boolean
  display_order: number
  created_at: string
}

export interface GalleryCategoryRow {
  id: string
  name: string
  slug: string
  category_type: string
}

export interface GalleryFormState {
  title: string
  mediaUrl: string
  mediaType: 'image' | 'video'
  altText: string
  categoryId: string
  eventId: string
  programId: string
  displayOrder: number
  isPublished: boolean
}

export interface GalleryFormErrors {
  title?: string
  mediaUrl?: string
  displayOrder?: string
}

/** Map a stored gallery `media_url` to bucket + object path. */
export function parseGalleryMediaLocation(
  ref: string,
): { bucket: StorageBucketId; path: string } | null {
  const trimmed = ref.trim()
  if (!trimmed) return null

  const colonRef = parseStorageRef(trimmed)
  if (colonRef) return colonRef

  if (trimmed.startsWith('gallery_media/')) {
    return {
      bucket: STORAGE_BUCKETS.gallery_media,
      path: trimmed.slice('gallery_media/'.length),
    }
  }

  if (trimmed.startsWith('gallery/')) {
    return { bucket: STORAGE_BUCKETS.media, path: trimmed }
  }

  if (trimmed.startsWith('items/')) {
    return { bucket: STORAGE_BUCKETS.gallery_media, path: trimmed }
  }

  if (!trimmed.includes('://') && !trimmed.startsWith('/')) {
    return { bucket: STORAGE_BUCKETS.gallery_media, path: trimmed }
  }

  return null
}

export function resolveGalleryMediaUrl(
  ref?: string | null,
  options?: ImageTransformOptions,
): string {
  if (!ref?.trim()) return ''

  const trimmed = ref.trim()

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    return trimmed
  }

  const location = parseGalleryMediaLocation(trimmed)

  if (location) {
    try {
      const client = useSupabaseClient()
      const { data } = client.storage.from(location.bucket).getPublicUrl(location.path)
      if (data.publicUrl) return appendTransformParams(data.publicUrl, options)
    } catch (e: unknown) {
      // Outside Nuxt setup — fall through to manual URL construction
      if (import.meta.dev) console.debug('[galleryAdmin] Supabase client unavailable, building URL manually:', e)
    }

    const built = getStoragePublicUrl(location.bucket, location.path, options)
    if (built) return built
  }

  return resolveStorageRef(trimmed, options) || trimmed
}

export function mapGalleryRow(row: GalleryItemDbRow): GalleryItem {
  return {
    id: row.id,
    title: row.title ?? undefined,
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    altText: row.alt_text ?? undefined,
    categoryId: row.category_id ?? undefined,
    eventId: row.event_id ?? undefined,
    programId: row.program_id ?? undefined,
    isPublished: row.is_published,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  }
}

export function createEmptyGalleryForm(): GalleryFormState {
  return {
    title: '',
    mediaUrl: '',
    mediaType: 'image',
    altText: '',
    categoryId: '',
    eventId: '',
    programId: '',
    displayOrder: 0,
    isPublished: true,
  }
}

export function rowToGalleryForm(row: GalleryItemDbRow): GalleryFormState {
  return {
    title: row.title ?? '',
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    altText: row.alt_text ?? '',
    categoryId: row.category_id ?? '',
    eventId: row.event_id ?? '',
    programId: row.program_id ?? '',
    displayOrder: row.display_order,
    isPublished: row.is_published,
  }
}

export function formToGalleryPayload(form: GalleryFormState): Record<string, unknown> {
  return {
    title: form.title.trim() || null,
    media_url: form.mediaUrl.trim(),
    media_type: form.mediaType,
    alt_text: form.altText.trim() || null,
    category_id: form.categoryId || null,
    event_id: form.eventId || null,
    program_id: form.programId || null,
    display_order: form.displayOrder,
    is_published: form.isPublished,
  }
}

export function validateGalleryForm(
  form: GalleryFormState,
  options?: { hasImageUpload?: boolean },
): GalleryFormErrors {
  const errors: GalleryFormErrors = {}

  if (!form.title.trim()) errors.title = 'Title is required.'

  const hasMedia =
    Boolean(form.mediaUrl.trim()) ||
    (form.mediaType === 'image' && options?.hasImageUpload)

  if (!hasMedia) {
    errors.mediaUrl =
      form.mediaType === 'image'
        ? 'Upload an image or provide a media URL.'
        : 'Video URL is required.'
  } else if (form.mediaType === 'video' && form.mediaUrl.trim() && !isVideoMediaValue(form.mediaUrl)) {
    errors.mediaUrl = 'Videos need a valid URL (https://… or storage reference).'
  }
  if (form.displayOrder < 0) errors.displayOrder = 'Display order cannot be negative.'

  return errors
}

export function hasGalleryFormErrors(errors: GalleryFormErrors): boolean {
  return Object.keys(errors).length > 0
}

export function isVideoMediaValue(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (trimmed.includes(':') && !trimmed.startsWith('http')) return true
  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
}

/** Slugs used by 013_gallery_categories_seed — fallback when category_type column is missing. */
const GALLERY_CATEGORY_SLUGS = new Set(['labs', 'projects', 'events'])

export type GalleryFilterCategory = Pick<import('~/types').Category, 'id' | 'name' | 'slug'>

function isMissingCategoryTypeColumn(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('category_type')
    && (lower.includes('does not exist') || lower.includes('could not find') || lower.includes('schema cache'))
  )
}

/**
 * Load gallery filter tabs. Uses category_type when present; otherwise all categories
 * (or known gallery slugs) so older Supabase schemas do not 400.
 */
export async function fetchGalleryFilterCategories(): Promise<GalleryFilterCategory[]> {
  const client = useSupabaseClient() as any

  const typed = await client
    .from('categories')
    .select('id, name, slug, category_type')
    .eq('category_type', 'gallery')
    .order('name', { ascending: true })

  if (!typed.error) {
    return (typed.data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
    }))
  }

  if (!isMissingCategoryTypeColumn(typed.error.message)) {
    throw new Error(`[gallery] categories: ${typed.error.message}`)
  }

  const fallback = await client
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })

  if (fallback.error) {
    throw new Error(`[gallery] categories: ${fallback.error.message}`)
  }

  const rows = fallback.data ?? []
  const galleryLike = rows.filter((row: any) => GALLERY_CATEGORY_SLUGS.has(row.slug))
  return galleryLike.length ? galleryLike : rows
}

export function galleryStorageRefForRow(row: Pick<GalleryItemDbRow, 'media_url' | 'media_type'>): string | null {
  if (row.media_type !== 'image') return null
  const ref = row.media_url?.trim()
  if (!ref || ref.startsWith('http://') || ref.startsWith('https://')) return null
  return ref
}
