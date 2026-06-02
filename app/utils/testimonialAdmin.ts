import type { Testimonial } from '~/types'
import {
  parseStorageRef,
  STORAGE_BUCKETS,
  getStoragePublicUrl,
  resolveStorageRef,
  type StorageBucketId,
} from '~/utils/storage'

export interface TestimonialDbRow {
  id: string
  name: string
  role: string | null
  organization: string | null
  quote: string
  avatar_url: string | null
  rating: number | null
  is_featured: boolean
  is_published: boolean
  sort_order: number | null
  created_at: string
}

export interface TestimonialFormState {
  name: string
  role: string
  organization: string
  quote: string
  avatarUrl: string
  rating: number
  isFeatured: boolean
  isPublished: boolean
  sortOrder: number
}

export interface TestimonialFormErrors {
  name?: string
  quote?: string
  avatarUrl?: string
  rating?: string
  sortOrder?: string
}

/** Map a stored testimonial `avatar_url` to bucket + object path. */
export function parseTestimonialAvatarLocation(
  ref: string,
): { bucket: StorageBucketId; path: string } | null {
  const trimmed = ref.trim()
  if (!trimmed) return null

  const colonRef = parseStorageRef(trimmed)
  if (colonRef) return colonRef

  if (trimmed.startsWith('testimonial_avatars/')) {
    return {
      bucket: STORAGE_BUCKETS.testimonial_avatars,
      path: trimmed.slice('testimonial_avatars/'.length),
    }
  }

  if (!trimmed.includes('://') && !trimmed.startsWith('/')) {
    return { bucket: STORAGE_BUCKETS.testimonial_avatars, path: trimmed }
  }

  return null
}

/**
 * Resolve testimonial avatar for display. Uses the Supabase client when available,
 * then manual public URL construction.
 */
export function resolveTestimonialAvatarUrl(ref?: string | null): string {
  if (!ref?.trim()) return ''

  const trimmed = ref.trim()

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    return trimmed
  }

  const location = parseTestimonialAvatarLocation(trimmed)

  if (location) {
    try {
      const client = useSupabaseClient()
      const { data } = client.storage.from(location.bucket).getPublicUrl(location.path)
      if (data.publicUrl) return data.publicUrl
    } catch {
      // Outside Nuxt setup — build URL from runtime config
    }

    const built = getStoragePublicUrl(location.bucket, location.path)
    if (built) return built
  }

  return resolveStorageRef(trimmed) || trimmed
}

export function mapTestimonialRow(row: TestimonialDbRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    role: row.role ?? undefined,
    organization: row.organization ?? undefined,
    quote: row.quote,
    avatarUrl: row.avatar_url ?? undefined,
    rating: row.rating ?? 5,
    isFeatured: row.is_featured,
    isPublished: row.is_published,
    createdAt: row.created_at,
  }
}

export function createEmptyTestimonialForm(): TestimonialFormState {
  return {
    name: '',
    role: '',
    organization: '',
    quote: '',
    avatarUrl: '',
    rating: 5,
    isFeatured: false,
    isPublished: true,
    sortOrder: 0,
  }
}

export function rowToTestimonialForm(row: TestimonialDbRow): TestimonialFormState {
  return {
    name: row.name,
    role: row.role ?? '',
    organization: row.organization ?? '',
    quote: row.quote,
    avatarUrl: row.avatar_url ?? '',
    rating: row.rating ?? 5,
    isFeatured: row.is_featured,
    isPublished: row.is_published,
    sortOrder: row.sort_order ?? 0,
  }
}

export function formToTestimonialPayload(form: TestimonialFormState): Record<string, unknown> {
  return {
    name: form.name.trim(),
    role: form.role.trim() || null,
    organization: form.organization.trim() || null,
    quote: form.quote.trim(),
    avatar_url: form.avatarUrl.trim() || null,
    rating: Math.min(5, Math.max(1, form.rating)),
    is_featured: form.isFeatured,
    is_published: form.isPublished,
    sort_order: form.sortOrder,
  }
}

export function validateTestimonialForm(
  form: TestimonialFormState,
  options?: { hasAvatarUpload?: boolean },
): TestimonialFormErrors {
  const errors: TestimonialFormErrors = {}

  if (!form.name.trim()) errors.name = 'Name is required.'
  if (!form.quote.trim()) errors.quote = 'Quote is required.'

  if (form.rating < 1 || form.rating > 5) errors.rating = 'Rating must be between 1 and 5.'
  if (form.sortOrder < 0) errors.sortOrder = 'Sort order cannot be negative.'

  return errors
}

export function hasTestimonialFormErrors(errors: TestimonialFormErrors): boolean {
  return Object.keys(errors).length > 0
}

/** Get storage ref for a testimonial row's avatar for deletion purposes. */
export function testimonialStorageRefForRow(row: TestimonialDbRow): string | null {
  if (!row.avatar_url?.trim()) return null

  const location = parseTestimonialAvatarLocation(row.avatar_url)
  if (!location) return null

  return `${location.bucket}:${location.path}`
}
