import type { Partner } from '~/types'
import {
  parseStorageRef,
  STORAGE_BUCKETS,
  getStoragePublicUrl,
  resolveStorageRef,
  type StorageBucketId,
} from '~/utils/storage'

export type PartnerTier = Partner['tier']

export interface PartnerDbRow {
  id: string
  name: string
  website_url: string | null
  logo_url: string
  tier: PartnerTier
  is_active: boolean
  display_order: number
  created_at: string
}

export interface PartnerFormState {
  name: string
  websiteUrl: string
  logoUrl: string
  tier: PartnerTier
  displayOrder: number
  isActive: boolean
}

export interface PartnerFormErrors {
  name?: string
  logoUrl?: string
  displayOrder?: string
}

export interface SectionPartnerDisplay {
  id: string
  name: string
  acronym: string
  logoUrl: string
  description: string
  websiteUrl?: string
  icon: string
  tier: PartnerTier
}

const TIER_ICONS: Record<PartnerTier, string> = {
  platinum: 'bi-gem',
  gold: 'bi-award',
  silver: 'bi-star-fill',
  community: 'bi-people-fill',
}

const STOP_WORDS = new Set(['of', 'and', 'the', 'for', 'in', 'on', 'a', 'an'])

/** Derive a display acronym when none is stored (e.g. FMIST from ministry name). */
export function partnerAcronymFromName(name: string): string {
  const words = name
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, ''))
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w.toLowerCase()))

  if (words.length >= 2) {
    return words
      .slice(0, 4)
      .map((w) => w[0]!)
      .join('')
      .toUpperCase()
  }

  const compact = name.replace(/[^a-zA-Z]/g, '')
  return (compact.slice(0, 5) || 'N/C').toUpperCase()
}

export function parsePartnerLogoLocation(
  ref: string,
): { bucket: StorageBucketId; path: string } | null {
  const trimmed = ref.trim()
  if (!trimmed) return null

  const colonRef = parseStorageRef(trimmed)
  if (colonRef) return colonRef

  if (trimmed.startsWith('site_assets/')) {
    return {
      bucket: STORAGE_BUCKETS.site_assets,
      path: trimmed.slice('site_assets/'.length),
    }
  }

  if (trimmed.startsWith('partners/')) {
    return { bucket: STORAGE_BUCKETS.site_assets, path: trimmed }
  }

  if (!trimmed.includes('://') && !trimmed.startsWith('/')) {
    return { bucket: STORAGE_BUCKETS.site_assets, path: trimmed }
  }

  return null
}

export function resolvePartnerLogoUrl(ref?: string | null): string {
  if (!ref?.trim()) return ''

  const trimmed = ref.trim()

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    return trimmed
  }

  const location = parsePartnerLogoLocation(trimmed)

  if (location) {
    try {
      const client = useSupabaseClient()
      const { data } = client.storage.from(location.bucket).getPublicUrl(location.path)
      if (data.publicUrl) return data.publicUrl
    } catch {
      // fall through
    }

    const built = getStoragePublicUrl(location.bucket, location.path)
    if (built) return built
  }

  return resolveStorageRef(trimmed) || trimmed
}

export function mapPartnerRow(row: PartnerDbRow): Partner {
  return {
    id: row.id,
    name: row.name,
    websiteUrl: row.website_url ?? undefined,
    logoUrl: row.logo_url,
    tier: row.tier,
    isActive: row.is_active,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  }
}

export function mapPartnerToSectionDisplay(partner: Partner): SectionPartnerDisplay {
  return {
    id: partner.id,
    name: partner.name,
    acronym: partnerAcronymFromName(partner.name),
    logoUrl: partner.logoUrl,
    description: '',
    websiteUrl: partner.websiteUrl,
    icon: TIER_ICONS[partner.tier],
    tier: partner.tier,
  }
}

export function createEmptyPartnerForm(): PartnerFormState {
  return {
    name: '',
    websiteUrl: '',
    logoUrl: '',
    tier: 'gold',
    displayOrder: 0,
    isActive: true,
  }
}

export function rowToPartnerForm(row: PartnerDbRow): PartnerFormState {
  return {
    name: row.name,
    websiteUrl: row.website_url ?? '',
    logoUrl: row.logo_url,
    tier: row.tier,
    displayOrder: row.display_order,
    isActive: row.is_active,
  }
}

export function formToPartnerPayload(form: PartnerFormState): Record<string, unknown> {
  return {
    name: form.name.trim(),
    website_url: form.websiteUrl.trim() || null,
    logo_url: form.logoUrl.trim(),
    tier: form.tier,
    display_order: form.displayOrder,
    is_active: form.isActive,
  }
}

export function validatePartnerForm(
  form: PartnerFormState,
  options?: { hasLogoUpload?: boolean },
): PartnerFormErrors {
  const errors: PartnerFormErrors = {}

  if (!form.name.trim()) errors.name = 'Partner name is required.'
  if (!form.logoUrl.trim() && !options?.hasLogoUpload) {
    errors.logoUrl = 'Upload a logo or provide a logo URL.'
  }
  if (form.displayOrder < 0) errors.displayOrder = 'Display order cannot be negative.'

  return errors
}

export function hasPartnerFormErrors(errors: PartnerFormErrors): boolean {
  return Object.keys(errors).length > 0
}

export function partnerLogoStorageRefForRow(
  row: Pick<PartnerDbRow, 'logo_url'>,
): string | null {
  const ref = row.logo_url?.trim()
  if (!ref || ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('/')) {
    return null
  }
  return ref
}

export const PARTNER_TIER_OPTIONS: { value: PartnerTier; label: string }[] = [
  { value: 'platinum', label: 'Platinum' },
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'community', label: 'Community' },
]
