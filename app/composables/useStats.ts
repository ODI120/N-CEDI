/**
 * N-CEDI — useStats
 *
 * Fetches published KPI statistics from the `site_stats` table.
 * Falls back to hardcoded defaults when Supabase returns no rows
 * (e.g. during local development before the DB is seeded).
 *
 * Usage:
 *   const { stats, pending, error } = await useStats()
 */

import type { SiteStat } from '~/types'

const FALLBACK_STATS: SiteStat[] = [
  { id: '1', value: 1200, suffix: '+', label: 'Trained Graduates',     icon: 'bi-people-fill',         displayOrder: 1, isPublished: true, createdAt: '', updatedAt: '' },
  { id: '2', value: 85,   suffix: '%', label: 'Employment Rate',        icon: 'bi-briefcase-fill',      displayOrder: 2, isPublished: true, createdAt: '', updatedAt: '' },
  { id: '3', value: 45,   suffix: '+', label: 'Partner Startups',       icon: 'bi-rocket-takeoff-fill', displayOrder: 3, isPublished: true, createdAt: '', updatedAt: '' },
  { id: '4', value: 12,               label: 'Tech & Vocational Labs',  icon: 'bi-cpu-fill',            displayOrder: 4, isPublished: true, createdAt: '', updatedAt: '' },
]

export function useStats() {
  const { client } = useSupabase()

  /**
   * Fetches stats — cached by Nuxt's useAsyncData so the query
   * only runs once per page navigation.
   */
  const { data, pending, error, refresh } = useAsyncData<SiteStat[]>(
    'site-stats',
    async () => {
      const { data: rows, error: sbError } = await client
        .from('site_stats')
        .select('id, value, prefix, suffix, label, icon, display_order, is_published, created_at, updated_at')
        .eq('is_published', true)
        .order('display_order', { ascending: true })

      if (sbError) {
        console.warn('[useStats] Supabase error, using fallback:', sbError.message)
        return FALLBACK_STATS
      }

      if (!rows || rows.length === 0) {
        return FALLBACK_STATS
      }

      // Map snake_case DB columns → camelCase TS interface
      return rows.map((r): SiteStat => ({
        id:           r.id,
        value:        Number(r.value),
        prefix:       r.prefix ?? undefined,
        suffix:       r.suffix ?? undefined,
        label:        r.label,
        icon:         r.icon ?? undefined,
        displayOrder: r.display_order,
        isPublished:  r.is_published,
        createdAt:    r.created_at,
        updatedAt:    r.updated_at,
      }))
    },
    {
      // Return fallback synchronously while the promise resolves
      default: () => FALLBACK_STATS,
    }
  )

  return {
    stats: data,
    pending,
    error,
    refresh,
  }
}
