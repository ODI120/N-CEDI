import type { SiteStat } from '~/types'

export interface SiteStatDbRow {
  id: string
  value: number | string
  prefix?: string | null
  suffix?: string | null
  label: string
  icon?: string | null
  display_order: number
  is_published: boolean
  created_at?: string
  updated_at?: string
}

export interface SiteStatFormState {
  label: string
  value: number
  prefix: string
  suffix: string
  icon: string
  displayOrder: number
  isPublished: boolean
}

export interface SiteStatFormErrors {
  label?: string
  value?: string
  displayOrder?: string
}

export const STAT_ICON_OPTIONS = [
  { value: 'bi-people-fill', label: 'People / Graduates' },
  { value: 'bi-briefcase-fill', label: 'Employment / Careers' },
  { value: 'bi-rocket-takeoff-fill', label: 'Startups / Innovation' },
  { value: 'bi-cpu-fill', label: 'Technology / Labs' },
  { value: 'bi-mortarboard-fill', label: 'Education' },
  { value: 'bi-building-fill', label: 'Institutions' },
  { value: 'bi-graph-up-arrow', label: 'Growth' },
  { value: 'bi-award-fill', label: 'Awards' },
] as const

export function mapSiteStatRow(row: SiteStatDbRow): SiteStat {
  return {
    id: row.id,
    value: Number(row.value),
    prefix: row.prefix ?? undefined,
    suffix: row.suffix ?? undefined,
    label: row.label,
    icon: row.icon ?? undefined,
    displayOrder: row.display_order,
    isPublished: row.is_published,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  }
}

export function formatStatDisplay(stat: Pick<SiteStat, 'value' | 'prefix' | 'suffix'>): string {
  const num = Number.isInteger(stat.value) ? String(stat.value) : String(stat.value)
  return `${stat.prefix ?? ''}${num}${stat.suffix ?? ''}`
}

export function createEmptySiteStatForm(): SiteStatFormState {
  return {
    label: '',
    value: 0,
    prefix: '',
    suffix: '',
    icon: 'bi-people-fill',
    displayOrder: 0,
    isPublished: true,
  }
}

export function rowToSiteStatForm(row: SiteStatDbRow): SiteStatFormState {
  return {
    label: row.label,
    value: Number(row.value),
    prefix: row.prefix ?? '',
    suffix: row.suffix ?? '',
    icon: row.icon ?? '',
    displayOrder: row.display_order,
    isPublished: row.is_published,
  }
}

export function formToSiteStatPayload(form: SiteStatFormState): Record<string, unknown> {
  return {
    label: form.label.trim(),
    value: form.value,
    prefix: form.prefix.trim() || null,
    suffix: form.suffix.trim() || null,
    icon: form.icon.trim() || null,
    display_order: form.displayOrder,
    is_published: form.isPublished,
    updated_at: new Date().toISOString(),
  }
}

export function validateSiteStatForm(form: SiteStatFormState): SiteStatFormErrors {
  const errors: SiteStatFormErrors = {}

  if (!form.label.trim()) errors.label = 'Label is required.'
  if (Number.isNaN(form.value) || form.value < 0) errors.value = 'Value must be zero or greater.'
  if (form.displayOrder < 0) errors.displayOrder = 'Display order cannot be negative.'

  return errors
}

export function hasSiteStatFormErrors(errors: SiteStatFormErrors): boolean {
  return Object.keys(errors).length > 0
}
