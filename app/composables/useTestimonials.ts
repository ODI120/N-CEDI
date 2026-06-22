import type { Testimonial } from '~/types'
import { resolveStorageRef } from '~/utils/storage'

export interface FetchTestimonialsOptions {
  limit?: number
  featuredOnly?: boolean
}



interface TestimonialDbRow {
  id: string
  name: string
  role?: string | null
  organization?: string | null
  quote?: string | null
  avatar_url?: string | null
  rating?: number | null
  is_featured?: boolean | null
  is_published?: boolean | null
  created_at: string
  sort_order?: number | null
}

function mapTestimonialRow(row: TestimonialDbRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    role: row.role ?? undefined,
    organization: row.organization ?? undefined,
    quote: row.quote ?? '',
    avatarUrl: row.avatar_url ? resolveStorageRef(row.avatar_url) : undefined,
    rating: row.rating ?? 5,
    isFeatured: row.is_featured ?? false,
    isPublished: row.is_published ?? false,
    createdAt: row.created_at,
  }
}

export async function fetchPublishedTestimonials(
  options: FetchTestimonialsOptions = {},
): Promise<Testimonial[]> {
  const { client } = useSupabase()
  const { limit, featuredOnly = false } = options

  let query = client
    .from('testimonials')
    .select('id, name, role, organization, quote, avatar_url, rating, is_featured, is_published, created_at, sort_order')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (featuredOnly) query = query.eq('is_featured', true)
  if (limit) query = query.limit(limit)

  const { data: rows, error } = await query

  if (error) {
    if (error.code === '42P01') {
      console.warn('[useTestimonials] Table "testimonials" does not exist — returning empty list')
      return []
    }
    if (error.code === '42703') {
      const fallbackQuery = client
        .from('testimonials')
        .select('id, name, role, organization, quote, avatar_url, rating, is_featured, is_published, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (featuredOnly) fallbackQuery.eq('is_featured', true)
      if (limit) fallbackQuery.limit(limit)

      const { data: rowsFallback, error: fallbackError } = await fallbackQuery
      if (fallbackError) throw new Error(`[useTestimonials] ${fallbackError.message}`)
      return (rowsFallback ?? []).map((row: any) => mapTestimonialRow(row as TestimonialDbRow))
    }

    throw new Error(`[useTestimonials] ${error.message}`)
  }

  if (!rows?.length) return []

  return rows.map((row: any) => mapTestimonialRow(row as TestimonialDbRow))
}

export async function useTestimonials(options: FetchTestimonialsOptions = {}) {
  const cacheKey = `testimonials-${options.featuredOnly ? 'featured' : 'all'}-${options.limit ?? 'all'}`

  const { data, pending, error, refresh } = await useAsyncData<Testimonial[]>(
    cacheKey,
    () => fetchPublishedTestimonials(options),
    { default: () => [] },
  )

  return { testimonials: data, pending, error, refresh }
}

export async function useHomepageTestimonials(limit = 6) {
  const { data, pending, error, refresh } = await useAsyncData<Testimonial[]>(
    `testimonials-home-${limit}`,
    () => fetchPublishedTestimonials({ limit }),
    { default: () => [] },
  )

  return { testimonials: data, pending, error, refresh }
}
