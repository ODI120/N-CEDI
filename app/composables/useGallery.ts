/**
 * N-CEDI — useGallery
 *
 * Fetches published gallery items from the `gallery_items` table.
 */

import type { Category, GalleryItem } from '~/types'
import {
  fetchGalleryFilterCategories,
  mapGalleryRow,
  type GalleryItemDbRow,
} from '~/utils/galleryAdmin'

export { resolveGalleryMediaUrl } from '~/utils/galleryAdmin'

export interface GalleryOptions {
  mediaType?: 'image' | 'video'
  categoryId?: string
  eventId?: string
  programId?: string
  limit?: number
}

export interface GalleryPageItem extends GalleryItem {
  categorySlug?: string
  categoryName?: string
}

export interface GalleryPageData {
  items: GalleryPageItem[]
  categories: Pick<Category, 'id' | 'name' | 'slug'>[]
  /** True when at least one row came from `gallery_items`. */
  fromDatabase: boolean
}



/** Published rows for the public gallery page. */
export async function fetchGalleryPageData(limit = 500): Promise<GalleryPageData> {
  const { client } = useSupabase()

  const [{ data: rows, error }, categories] = await Promise.all([
    client
      .from('gallery_items')
      .select(
        'id, title, media_url, media_type, alt_text, category_id, event_id, program_id, is_published, display_order, created_at',
      )
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .limit(limit),
    fetchGalleryFilterCategories(),
  ])

  if (error) {
    throw new Error(`[useGallery] ${error.message}`)
  }

  const categoryById = new Map(categories.map((c) => [c.id, c]))

  const items: GalleryPageItem[] = ((rows ?? []) as GalleryItemDbRow[]).map((row) => {
    const base = mapGalleryRow(row)
    const cat = base.categoryId ? categoryById.get(base.categoryId) : undefined
    return {
      ...base,
      categorySlug: cat?.slug,
      categoryName: cat?.name,
    }
  })

  return {
    items,
    categories,
    fromDatabase: items.length > 0,
  }
}

export async function fetchPublishedGalleryItems(
  options: GalleryOptions = {},
): Promise<GalleryItem[]> {
  const { client } = useSupabase()
  const { mediaType, categoryId, eventId, programId, limit = 100 } = options

  let query = client
    .from('gallery_items')
    .select(
      'id, title, media_url, media_type, alt_text, category_id, event_id, program_id, is_published, display_order, created_at',
    )
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    .limit(limit)

  if (mediaType) query = query.eq('media_type', mediaType)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (eventId) query = query.eq('event_id', eventId)
  if (programId) query = query.eq('program_id', programId)

  const { data: rows, error: sbError } = await query

  if (sbError) {
    throw new Error(`[useGallery] ${sbError.message}`)
  }

  if (!rows?.length) return []

  return rows.map((row: any) => mapGalleryRow(row as GalleryItemDbRow))
}

export async function useGallery(options: GalleryOptions = {}) {
  const { mediaType, categoryId, eventId, programId, limit = 100 } = options
  const cacheKey = `gallery-${mediaType ?? 'all'}-${categoryId ?? ''}-${eventId ?? ''}-${programId ?? ''}-${limit}`

  const { data, pending, error, refresh } = await useAsyncData<GalleryItem[]>(
    cacheKey,
    () => fetchPublishedGalleryItems(options),
    { default: () => [] },
  )

  return {
    items: data,
    pending,
    error,
    refresh,
  }
}

/** Public /gallery — database only; empty array when no published items. */
export async function useGalleryPage(limit = 500) {
  const { data, pending, error, refresh } = await useAsyncData<GalleryPageData>(
    `gallery-page-${limit}`,
    () => fetchGalleryPageData(limit),
    {
      default: () => ({
        items: [],
        categories: [],
        fromDatabase: false,
      }),
    },
  )

  return {
    gallery: data,
    pending,
    error,
    refresh,
  }
}

/** Homepage bento slider — DB first. */
export async function useHomepageGallerySlider(limit = 6) {
  const { data, pending, error, refresh } = await useAsyncData<GalleryItem[]>(
    `gallery-home-slider-${limit}`,
    async () => {
      const items = await fetchPublishedGalleryItems({ mediaType: 'image', limit })
      return items
    },
    { default: () => [] },
  )

  return { items: data, pending, error, refresh }
}
