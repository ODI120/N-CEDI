/**
 * N-CEDI — usePrograms
 *
 * Fetches published skill tracks from the `programs` table for the public site.
 */

export interface ProgramCard {
  id?: string
  title: string
  slug: string
  description: string
  coverImageUrl: string
  isFeatured?: boolean
  subtitle?: string
}

export interface ProgramDetail extends ProgramCard {
  body?: Record<string, unknown>[]
  requirements?: string
  outcomes?: string[]
  overview?: string
  labExperience?: string
  galleryUrls?: string[]
  metaTitle?: string
  metaDescription?: string
  updatedAt?: string
}

export interface UseProgramsOptions {
  limit?: number
  featuredOnly?: boolean
  excludeSlug?: string
  orderBy?: 'title' | 'updated_at'
}

interface ProgramRow {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  description?: string | null
  cover_image_url?: string | null
  is_featured?: boolean | null
  is_published?: boolean | null
  body?: Record<string, unknown>[] | null
  requirements?: string | null
  outcomes?: string[] | null
  overview?: string | null
  lab_experience?: string | null
  gallery_urls?: string[] | null
  meta_title?: string | null
  meta_description?: string | null
  updated_at?: string | null
}

export function mapProgramCard(row: ProgramRow): ProgramCard {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle ?? undefined,
    description: row.description ?? '',
    coverImageUrl: row.cover_image_url?.trim() ?? '',
    isFeatured: row.is_featured ?? false,
  }
}

export function mapProgramDetail(row: ProgramRow): ProgramDetail {
  const body: Record<string, unknown>[] = row.body?.length
    ? [...row.body]
    : row.overview
      ? [
          { type: 'heading', data: { level: 2, text: 'Program Overview' } },
          { type: 'paragraph', data: { text: row.overview } },
        ]
      : row.description
        ? [
            { type: 'heading', data: { level: 2, text: 'Program Overview' } },
            { type: 'paragraph', data: { text: row.description } },
          ]
        : []

  return {
    ...mapProgramCard(row),
    body,
    requirements: row.requirements ?? undefined,
    outcomes: row.outcomes?.length ? row.outcomes : undefined,
    overview: row.overview ?? undefined,
    labExperience: row.lab_experience ?? undefined,
    galleryUrls: row.gallery_urls?.length ? [...row.gallery_urls] : undefined,
    metaTitle: row.meta_title ?? undefined,
    metaDescription: row.meta_description ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  }
}

function buildCacheKey(options: UseProgramsOptions = {}): string {
  const { limit, featuredOnly, excludeSlug, orderBy = 'title' } = options
  return `programs-${orderBy}-${limit ?? 'all'}-${featuredOnly ? 'featured' : 'all'}-${excludeSlug ?? ''}`
}

export async function fetchPublishedPrograms(options: UseProgramsOptions = {}): Promise<ProgramCard[]> {
  const { client } = useSupabase()
  const { limit, featuredOnly, excludeSlug, orderBy = 'title' } = options

  let query = client
    .from('programs')
    .select('id, title, slug, subtitle, description, cover_image_url, is_featured, updated_at')
    .eq('is_published', true)
    .order(orderBy, { ascending: orderBy === 'title' })

  if (featuredOnly) query = query.eq('is_featured', true)
  if (excludeSlug) query = query.neq('slug', excludeSlug)
  if (limit) query = query.limit(limit)

  const { data: rows, error: sbError } = await query

  if (sbError) {
    throw new Error(`[usePrograms] ${sbError.message}`)
  }

  if (!rows?.length) return []

  return rows.map((row) => mapProgramCard(row as ProgramRow))
}

/** Homepage: featured tracks first, then fill with latest published. */
export async function fetchHomepagePrograms(limit = 6): Promise<ProgramCard[]> {
  const featured = await fetchPublishedPrograms({
    featuredOnly: true,
    limit,
    orderBy: 'updated_at',
  })

  if (featured.length >= limit) return featured

  const recent = await fetchPublishedPrograms({
    limit: limit * 2,
    orderBy: 'updated_at',
  })

  const seen = new Set(featured.map((p) => p.slug))
  const filler = recent.filter((p) => !seen.has(p.slug))

  return [...featured, ...filler].slice(0, limit)
}

export async function usePrograms(options: UseProgramsOptions = {}) {
  const { data, pending, error, refresh } = await useAsyncData<ProgramCard[]>(
    buildCacheKey(options),
    () => fetchPublishedPrograms(options),
    { default: () => [] },
  )

  return { programs: data, pending, error, refresh }
}

export async function useHomepagePrograms(limit = 6) {
  const { data, pending, error, refresh } = await useAsyncData<ProgramCard[]>(
    `programs-home-${limit}`,
    () => fetchHomepagePrograms(limit),
    { default: () => [] },
  )

  return { programs: data, pending, error, refresh }
}

export async function useProgram(slug: string) {
  const { client } = useSupabase()

  const { data, pending, error, refresh } = await useAsyncData<ProgramDetail | null>(
    `program-${slug}`,
    async () => {
      const { data: row, error: sbError } = await client
        .from('programs')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle()

      if (sbError) {
        throw createError({
          statusCode: 503,
          statusMessage: 'Unable to load program',
          message: sbError.message,
        })
      }

      if (!row) return null

      return mapProgramDetail(row as ProgramRow)
    },
    { default: () => null },
  )

  return { program: data, pending, error, refresh }
}

/** Related tracks: prefer same featured pool, exclude current slug. */
export async function useRelatedPrograms(currentSlug: string, limit = 2) {
  const { data, pending, error, refresh } = await useAsyncData<ProgramCard[]>(
    `programs-related-${currentSlug}-${limit}`,
    async () => {
      const related = await fetchPublishedPrograms({
        excludeSlug: currentSlug,
        limit,
        orderBy: 'updated_at',
      })
      return related
    },
    { default: () => [] },
  )

  return { programs: data, pending, error, refresh }
}
