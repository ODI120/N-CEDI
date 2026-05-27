/**
 * N-CEDI — useGallery
 *
 * Fetches published gallery items from the `gallery_items` table.
 * Supports optional filtering by category, event, or program.
 *
 * Usage:
 *   // All published images (for homepage slider)
 *   const { items, pending } = useGallery({ mediaType: 'image', limit: 6 })
 *
 *   // Images tied to a specific event
 *   const { items } = useGallery({ eventId: 'uuid-here' })
 */

import type { GalleryItem } from '~/types'

interface GalleryOptions {
  mediaType?: 'image' | 'video'
  categoryId?: string
  eventId?: string
  programId?: string
  limit?: number
}

const FALLBACK_SLIDES: GalleryItem[] = [
  { id: '1', mediaUrl: '/images/student2.jpg', mediaType: 'image', title: 'Robotics Lab',    altText: 'Students working on advanced robotics and automation', displayOrder: 1, isPublished: true, createdAt: '' },
  { id: '2', mediaUrl: '/images/student3.jpg', mediaType: 'image', title: 'Coding Bootcamp', altText: 'Intensive software engineering programs',              displayOrder: 2, isPublished: true, createdAt: '' },
  { id: '3', mediaUrl: '/images/student4.jpg', mediaType: 'image', title: 'Aviation Tech',   altText: 'State of the art aviation training facilities',         displayOrder: 3, isPublished: true, createdAt: '' },
]

export function useGallery(options: GalleryOptions = {}) {
  const { client } = useSupabase()
  const { mediaType, categoryId, eventId, programId, limit = 10 } = options

  // Build a unique cache key from the options
  const cacheKey = `gallery-${mediaType ?? 'all'}-${categoryId ?? ''}-${eventId ?? ''}-${programId ?? ''}-${limit}`

  const { data, pending, error, refresh } = useAsyncData<GalleryItem[]>(
    cacheKey,
    async () => {
      let query = client
        .from('gallery_items')
        .select('id, title, media_url, media_type, alt_text, category_id, event_id, program_id, is_published, display_order, created_at')
        .eq('is_published', true)
        .order('display_order', { ascending: true })
        .limit(limit)

      if (mediaType)   query = query.eq('media_type', mediaType)
      if (categoryId)  query = query.eq('category_id', categoryId)
      if (eventId)     query = query.eq('event_id', eventId)
      if (programId)   query = query.eq('program_id', programId)

      const { data: rows, error: sbError } = await query

      if (sbError) {
        console.warn('[useGallery] Supabase error, using fallback:', sbError.message)
        return FALLBACK_SLIDES
      }

      if (!rows || rows.length === 0) {
        return FALLBACK_SLIDES
      }

      return rows.map((r): GalleryItem => ({
        id:           r.id,
        title:        r.title ?? undefined,
        mediaUrl:     r.media_url,
        mediaType:    r.media_type as 'image' | 'video',
        altText:      r.alt_text ?? undefined,
        categoryId:   r.category_id ?? undefined,
        eventId:      r.event_id ?? undefined,
        programId:    r.program_id ?? undefined,
        isPublished:  r.is_published,
        displayOrder: r.display_order,
        createdAt:    r.created_at,
      }))
    },
    {
      default: () => FALLBACK_SLIDES,
    }
  )

  return {
    items: data,
    pending,
    error,
    refresh,
  }
}
