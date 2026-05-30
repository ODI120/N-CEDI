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

export const FALLBACK_HOMEPAGE_PARTNERS: SectionPartnerDisplay[] = [
  {
    id: 'fallback-1',
    name: 'Federal Ministry of Innovation, Science and Technology',
    acronym: 'FMIST',
    logoUrl: '/images/fg.png',
    description: '',
    websiteUrl: undefined,
    icon: 'bi-bank2',
    tier: 'platinum',
  },
  {
    id: 'fallback-2',
    name: 'National Board for Technology Incubation',
    acronym: 'NBTI',
    logoUrl: '/images/ncatlogo.png',
    description: '',
    websiteUrl: undefined,
    icon: 'bi-rocket-takeoff',
    tier: 'platinum',
  },
  {
    id: 'fallback-3',
    name: 'National Board for Technical Education',
    acronym: 'NBTE',
    logoUrl: '/images/nbte.png',
    description: '',
    websiteUrl: undefined,
    icon: 'bi-mortarboard',
    tier: 'platinum',
  },
]

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

export async function usePartners(options: FetchPartnersOptions = {}) {
  const { activeOnly = true, tier, limit = 100 } = options
  const cacheKey = `partners-${activeOnly}-${tier ?? 'all'}-${limit}`

  const { data, pending, error, refresh } = await useAsyncData<Partner[]>(
    cacheKey,
    () => fetchPartners(options),
    { default: () => [] },
  )

  return { partners: data, pending, error, refresh }
}

/** Homepage institutional anchors — active partners, prefer platinum. */
export async function useHomepagePartners(limit = 6) {
  const { data, pending, error, refresh } = await useAsyncData<SectionPartnerDisplay[]>(
    `partners-home-${limit}`,
    async () => {
      const all = await fetchPartners({ activeOnly: true, limit: 50 })
      if (!all.length) return FALLBACK_HOMEPAGE_PARTNERS

      const platinum = all.filter((p) => p.tier === 'platinum')
      const picked = (platinum.length ? platinum : all).slice(0, limit)
      return picked.map(mapPartnerToSectionDisplay)
    },
    { default: () => FALLBACK_HOMEPAGE_PARTNERS },
  )

  return { partners: data, pending, error, refresh }
}

export interface PartnersPageData {
  partners: Partner[]
  fromDatabase: boolean
}

/** Public /partners page. */
export async function usePartnersPage() {
  const { data, pending, error, refresh } = await useAsyncData<PartnersPageData>(
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
