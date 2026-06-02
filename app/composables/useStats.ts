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

  return rows.map((row: any) => mapSiteStatRow(row as SiteStatDbRow))
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

/** Homepage section: published stats from DB (max 4). */
export async function useHomepageStats() {
  const { data, pending, error, refresh } = await useAsyncData<SiteStat[]>(
    'site-stats-home',
    async () => {
      const stats = await fetchPublishedSiteStats({ limit: HOMEPAGE_STAT_LIMIT })
      return stats
    },
    { default: () => [] },
  )

  return {
    stats: data,
    pending,
    error,
    refresh,
  }
}
