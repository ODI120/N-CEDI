import type { Testimonial } from '~/types'
import { resolveStorageRef } from '~/utils/storage'

export interface FetchTestimonialsOptions {
  limit?: number
  featuredOnly?: boolean
}

export const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: 'fallback-1',
    name: 'Amina Ibrahim',
    role: 'Fashion Design Graduate, 2024',
    quote: 'N-CEDI transformed my passion for fashion into a thriving business. The hands-on training and mentorship were exactly what I needed to launch my own brand.',
    avatarUrl: '/images/student1.jpg',
    rating: 5,
    isFeatured: true,
    isPublished: true,
    createdAt: '',
  },
  {
    id: 'fallback-2',
    name: 'Chukwuemeka Obi',
    role: 'Web Development Graduate, 2023',
    quote: 'The web development program at N-CEDI gave me the skills to land a remote job with an international company. The curriculum is truly world-class.',
    avatarUrl: '/images/student2.jpg',
    rating: 5,
    isFeatured: true,
    isPublished: true,
    createdAt: '',
  },
  {
    id: 'fallback-3',
    name: 'Fatima Yusuf',
    role: 'Solar Installation Graduate, 2024',
    quote: 'As a woman in solar energy, N-CEDI gave me the confidence and technical expertise to lead installation projects across the region.',
    avatarUrl: '/images/student3.jpg',
    rating: 5,
    isFeatured: true,
    isPublished: true,
    createdAt: '',
  },
]

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
    if (error.code === '42P01') return []
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
      return (rowsFallback ?? []).map((row) => mapTestimonialRow(row as TestimonialDbRow))
    }

    throw new Error(`[useTestimonials] ${error.message}`)
  }

  if (!rows?.length) return []

  return rows.map((row) => mapTestimonialRow(row as TestimonialDbRow))
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
    async () => {
      const testimonials = await fetchPublishedTestimonials({ limit })
      return testimonials.length ? testimonials : FALLBACK_TESTIMONIALS.slice(0, limit)
    },
    { default: () => FALLBACK_TESTIMONIALS.slice(0, limit) },
  )

  return { testimonials: data, pending, error, refresh }
}
