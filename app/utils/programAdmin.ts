import { resolveStorageRef } from '~/utils/storage'

export interface ProgramFormState {
  title: string
  slug: string
  subtitle: string
  description: string
  overview: string
  labExperience: string
  requirements: string
  testimonialQuote: string
  testimonialCaption: string
  outcomes: string[]
  coverImageUrl: string
  galleryUrls: string[]
  metaTitle: string
  metaDescription: string
  categoryId: string
  isFeatured: boolean
  isPublished: boolean
}

export interface ProgramDbRow {
  id: string
  title: string
  slug: string
  subtitle?: string | null
  description: string
  overview?: string | null
  lab_experience?: string | null
  requirements?: string | null
  body?: Record<string, unknown>[] | null
  outcomes?: string[] | null
  cover_image_url: string
  gallery_urls?: string[] | null
  meta_title?: string | null
  meta_description?: string | null
  category_id?: string | null
  is_featured: boolean
  is_published: boolean
  updated_at?: string
}

export function createEmptyProgramForm(): ProgramFormState {
  return {
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    overview: '',
    labExperience: '',
    requirements: 'Active enrollment in an NCAT NBTE academic program (AMS, ATE, or AME schools).',
    testimonialQuote: '',
    testimonialCaption: '',
    outcomes: [''],
    coverImageUrl: '',
    galleryUrls: [],
    metaTitle: '',
    metaDescription: '',
    categoryId: '',
    isFeatured: false,
    isPublished: false,
  }
}

export function slugifyTitle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function resolveProgramMediaUrl(url?: string | null): string {
  return resolveStorageRef(url)
}

export function parseOverviewFromBody(body?: Record<string, unknown>[] | null): string {
  if (!body?.length) return ''

  const overviewIndex = body.findIndex(
    (block) =>
      block.type === 'heading'
      && typeof block.data === 'object'
      && block.data
      && (block.data as { text?: string }).text === 'Program Overview',
  )

  if (overviewIndex >= 0) {
    const next = body[overviewIndex + 1]
    if (next?.type === 'paragraph' && typeof next.data === 'object' && next.data) {
      return (next.data as { text?: string }).text ?? ''
    }
  }

  const firstParagraph = body.find((block) => block.type === 'paragraph')
  if (firstParagraph && typeof firstParagraph.data === 'object' && firstParagraph.data) {
    return (firstParagraph.data as { text?: string }).text ?? ''
  }

  return ''
}

export function parseBodyFields(body?: Record<string, unknown>[] | null): Pick<ProgramFormState, 'testimonialQuote' | 'testimonialCaption'> {
  if (!body?.length) {
    return { testimonialQuote: '', testimonialCaption: '' }
  }

  const quoteBlock = body.find((block) => block.type === 'quote')
  if (!quoteBlock || typeof quoteBlock.data !== 'object' || !quoteBlock.data) {
    return { testimonialQuote: '', testimonialCaption: '' }
  }

  const data = quoteBlock.data as { text?: string; caption?: string }
  return {
    testimonialQuote: data.text ?? '',
    testimonialCaption: data.caption ?? '',
  }
}

export function rowToProgramForm(row: ProgramDbRow): ProgramFormState {
  const quoteFields = parseBodyFields(row.body)

  return {
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle ?? '',
    description: row.description,
    overview: row.overview ?? parseOverviewFromBody(row.body) ?? '',
    labExperience: row.lab_experience ?? '',
    requirements: row.requirements ?? '',
    testimonialQuote: quoteFields.testimonialQuote,
    testimonialCaption: quoteFields.testimonialCaption,
    outcomes: row.outcomes?.length ? [...row.outcomes] : [''],
    coverImageUrl: row.cover_image_url,
    galleryUrls: row.gallery_urls ? [...row.gallery_urls] : [],
    metaTitle: row.meta_title ?? '',
    metaDescription: row.meta_description ?? '',
    categoryId: row.category_id ?? '',
    isFeatured: row.is_featured,
    isPublished: row.is_published,
  }
}

export function buildProgramBody(form: ProgramFormState): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = []

  if (form.overview.trim()) {
    blocks.push({ type: 'heading', data: { level: 2, text: 'Program Overview' } })
    blocks.push({ type: 'paragraph', data: { text: form.overview.trim() } })
  }

  if (form.testimonialQuote.trim()) {
    blocks.push({
      type: 'quote',
      data: {
        text: form.testimonialQuote.trim(),
        caption: form.testimonialCaption.trim() || undefined,
      },
    })
  }

  return blocks
}

export function formToDbPayload(form: ProgramFormState): Record<string, unknown> {
  const outcomes = form.outcomes.map((item) => item.trim()).filter(Boolean)

  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    subtitle: form.subtitle.trim() || null,
    description: form.description.trim(),
    overview: form.overview.trim() || null,
    lab_experience: form.labExperience.trim() || null,
    requirements: form.requirements.trim() || null,
    body: buildProgramBody(form),
    outcomes,
    cover_image_url: form.coverImageUrl,
    gallery_urls: form.galleryUrls,
    meta_title: form.metaTitle.trim() || null,
    meta_description: form.metaDescription.trim() || null,
    category_id: form.categoryId || null,
    is_featured: form.isFeatured,
    is_published: form.isPublished,
    updated_at: new Date().toISOString(),
  }
}

export interface ProgramFormErrors {
  title?: string
  slug?: string
  description?: string
  coverImageUrl?: string
}

export function validateProgramForm(
  form: ProgramFormState,
  options: { isCreate?: boolean; hasPendingCover?: boolean } = {},
): ProgramFormErrors {
  const errors: ProgramFormErrors = {}

  if (!form.title.trim()) errors.title = 'Program title is required.'
  if (!form.slug.trim()) errors.slug = 'URL slug is required.'
  if (!form.description.trim()) errors.description = 'Short description is required for program cards.'

  const hasCover = Boolean(form.coverImageUrl || options.hasPendingCover)
  if (options.isCreate && !hasCover) {
    errors.coverImageUrl = 'A hero cover image is required before saving a new program.'
  }

  return errors
}

export function hasFormErrors(errors: ProgramFormErrors): boolean {
  return Object.keys(errors).length > 0
}
