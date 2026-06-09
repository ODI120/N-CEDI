/**
 * N-CEDI — usePartners
 *
 * Fetches partner records from the `partners` table for public pages.
 */

import type { Partner } from '~/types'
import {
  mapPartnerRow,
  mapPartnerToSectionDisplay,
  type PartnerDbRow,
  type PartnerTier,
  type SectionPartnerDisplay,
} from '~/utils/partnerAdmin'

export type { SectionPartnerDisplay }

export interface FetchPartnersOptions {
  activeOnly?: boolean
  tier?: PartnerTier
  limit?: number
}



export async function fetchPartners(options: FetchPartnersOptions = {}): Promise<Partner[]> {
  const { client } = useSupabase()
  const { activeOnly = true, tier, limit = 100 } = options

  let query = client
    .from('partners')
    .select('id, name, website_url, logo_url, tier, is_active, display_order, created_at')
    .order('display_order', { ascending: true })
    .limit(limit)

  if (activeOnly) query = query.eq('is_active', true)
  if (tier) query = query.eq('tier', tier)

  const { data: rows, error } = await query

  if (error) {
    throw new Error(`[usePartners] ${error.message}`)
  }

  return ((rows ?? []) as PartnerDbRow[]).map(mapPartnerRow)
}

export function usePartners(options: FetchPartnersOptions = {}) {
  const { activeOnly = true, tier, limit = 100 } = options
  const cacheKey = `partners-${activeOnly}-${tier ?? 'all'}-${limit}`

  const { data, pending, error, refresh } = useAsyncData<Partner[]>(
    cacheKey,
    () => fetchPartners(options),
    { default: () => [] },
  )

  return { partners: data, pending, error, refresh }
}

/** Homepage institutional anchors — active partners, prefer platinum. */
export function useHomepagePartners(limit = 6) {
  const { data, pending, error, refresh } = useAsyncData<SectionPartnerDisplay[]>(
    `partners-home-${limit}`,
    async () => {
      const all = await fetchPartners({ activeOnly: true, limit: 50 })
      if (!all.length) return []

      const platinum = all.filter((p) => p.tier === 'platinum')
      const picked = (platinum.length ? platinum : all).slice(0, limit)
      return picked.map(mapPartnerToSectionDisplay)
    },
    { default: () => [], lazy: true },
  )

  return { partners: data, pending, error, refresh }
}

export interface PartnersPageData {
  partners: Partner[]
  fromDatabase: boolean
}

/** Public /partners page. */
export function usePartnersPage() {
  const { data, pending, error, refresh } = useAsyncData<PartnersPageData>(
    'partners-page',
    async () => {
      const partners = await fetchPartners({ activeOnly: true, limit: 200 })
      return {
        partners,
        fromDatabase: partners.length > 0,
      }
    },
    {
      default: () => ({
        partners: [],
        fromDatabase: false,
      }),
    },
  )

  return {
    page: data,
    pending,
    error,
    refresh,
  }
}
