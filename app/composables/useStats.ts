/**
 * N-CEDI — useStats
 *
 * Fetches published KPI statistics from the `site_stats` table
 * for the homepage SectionStats bento grid.
 */

import type { SiteStat } from '~/types'
import { mapSiteStatRow, type SiteStatDbRow } from '~/utils/siteStatAdmin'

export interface FetchSiteStatsOptions {
  limit?: number
}

/** Matches seed data in 002_site_stats.sql — used when DB is empty or unavailable. */
export const FALLBACK_SITE_STATS: SiteStat[] = [
  {
    id: 'fallback-1',
    value: 1200,
    suffix: '+',
    label: 'Trained Graduates',
    icon: 'bi-people-fill',
    displayOrder: 1,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'fallback-2',
    value: 85,
    suffix: '%',
    label: 'Employment Rate',
    icon: 'bi-briefcase-fill',
    displayOrder: 2,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'fallback-3',
    value: 45,
    suffix: '+',
    label: 'Partner Startups',
    icon: 'bi-rocket-takeoff-fill',
    displayOrder: 3,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'fallback-4',
    value: 12,
    label: 'Tech & Vocational Labs',
    icon: 'bi-cpu-fill',
    displayOrder: 4,
    isPublished: true,
    createdAt: '',
    updatedAt: '',
  },
]

/** Homepage bento grid is designed for up to four KPI cards. */
export const HOMEPAGE_STAT_LIMIT = 4

export async function fetchPublishedSiteStats(
  options: FetchSiteStatsOptions = {},
): Promise<SiteStat[]> {
  const { client } = useSupabase()
  const { limit } = options

  let query = client
    .from('site_stats')
    .select('id, value, prefix, suffix, label, icon, display_order, is_published, created_at, updated_at')
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  if (limit) query = query.limit(limit)

  const { data: rows, error: sbError } = await query

  if (sbError) {
    throw new Error(`[useStats] ${sbError.message}`)
  }

  if (!rows?.length) return []

  return rows.map((row) => mapSiteStatRow(row as SiteStatDbRow))
}

export async function useStats(options: FetchSiteStatsOptions = {}) {
  const cacheKey = `site-stats-${options.limit ?? 'all'}`

  const { data, pending, error, refresh } = await useAsyncData<SiteStat[]>(
    cacheKey,
    () => fetchPublishedSiteStats(options),
    { default: () => [] },
  )

  return {
    stats: data,
    pending,
    error,
    refresh,
  }
}

/** Homepage section: published stats from DB, else seeded fallbacks (max 4). */
export async function useHomepageStats() {
  const { data, pending, error, refresh } = await useAsyncData<SiteStat[]>(
    'site-stats-home',
    async () => {
      const stats = await fetchPublishedSiteStats({ limit: HOMEPAGE_STAT_LIMIT })
      if (stats.length) return stats
      return FALLBACK_SITE_STATS.slice(0, HOMEPAGE_STAT_LIMIT)
    },
    { default: () => FALLBACK_SITE_STATS },
  )

  return {
    stats: data,
    pending,
    error,
    refresh,
  }
}
