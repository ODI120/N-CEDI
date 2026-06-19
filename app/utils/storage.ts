/**
 * Supabase Storage — bucket registry and URL helpers.
 *
 * Buckets (project):
 *   media, site_assets, gallery_media, program_media, teams_avatars
 *
 * Database fields store a storage reference: `bucket:object/path`
 * Example: program_media:woodwork-furniture/cover-abc.jpg
 */

import { processImageBeforeUpload } from './imageProcessing'

export interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: number
}

/** Canonical bucket ids (must match Supabase Storage). */
export const STORAGE_BUCKETS = {
  media: 'media',
  site_assets: 'site_assets',
  gallery_media: 'gallery_media',
  program_media: 'program_media',
  teams_avatars: 'teams_avatars',
  testimonial_avatars: 'testimonial_avatars',
} as const

export type StorageBucketId = keyof typeof STORAGE_BUCKETS

const BUCKET_IDS = new Set<string>(Object.values(STORAGE_BUCKETS))

const REF_SEPARATOR = ':'

const BUCKET_PATH_PREFIXES: StorageBucketId[] = [
  STORAGE_BUCKETS.program_media,
  STORAGE_BUCKETS.gallery_media,
  STORAGE_BUCKETS.site_assets,
  STORAGE_BUCKETS.teams_avatars,
  STORAGE_BUCKETS.media,
]

export function isStorageBucketId(value: string): value is StorageBucketId {
  return BUCKET_IDS.has(value)
}

/** Build value persisted in `cover_image_url`, `gallery_urls`, etc. */
export function formatStorageRef(bucket: StorageBucketId, path: string): string {
  const normalized = path.replace(/^\/+/, '')
  return `${bucket}${REF_SEPARATOR}${normalized}`
}

/** Parse `bucket:path` or return null if not a storage reference. */
export function parseStorageRef(
  ref: string,
): { bucket: StorageBucketId; path: string } | null {
  const idx = ref.indexOf(REF_SEPARATOR)
  if (idx <= 0) return null

  const bucket = ref.slice(0, idx)
  const path = ref.slice(idx + 1)

  if (!isStorageBucketId(bucket) || !path) return null

  return { bucket, path }
}

/** `program_media/slug/cover.jpg` → bucket + path */
function parseBucketSlashRef(ref: string): { bucket: StorageBucketId; path: string } | null {
  for (const bucket of BUCKET_PATH_PREFIXES) {
    const prefix = `${bucket}/`
    if (ref.startsWith(prefix)) {
      return { bucket, path: ref.slice(prefix.length) }
    }
  }
  return null
}

export function getSupabaseProjectUrl(): string {
  const config = useRuntimeConfig()
  const pub = config.public as Record<string, unknown>

  const candidates = [
    pub.supabaseUrl,
    (pub.supabase as { url?: string } | undefined)?.url,
    process.env.SUPABASE_URL,
    process.env.NUXT_PUBLIC_SUPABASE_URL,
    process.env.NUXT_SUPABASE_URL,
  ]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.replace(/\/$/, '')
    }
  }

  return ''
}

export function appendTransformParams(url: string, options?: ImageTransformOptions): string {
  if (!options) return url

  const isImage = /\.(jpg|jpeg|png|webp|avif|gif|svg|tiff|bmp)($|\?)/i.test(url)
  if (!isImage) return url

  const params = new URLSearchParams()
  if (options.width) params.set('width', String(options.width))
  if (options.height) params.set('height', String(options.height))
  if (options.quality) params.set('quality', String(options.quality))

  const qs = params.toString()
  if (!qs) return url

  let transformedUrl = url
  if (url.includes('/storage/v1/object/public/')) {
    transformedUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
  }

  return `${transformedUrl}${transformedUrl.includes('?') ? '&' : '?'}${qs}`
}

/** Public object URL for a bucket + path (uses Supabase client when available). */
export function getStoragePublicUrl(
  bucket: StorageBucketId,
  path: string,
  options?: ImageTransformOptions,
): string {
  const objectPath = path.replace(/^\/+/, '')

  try {
    const client = useSupabaseClient()
    const { data } = client.storage.from(bucket).getPublicUrl(objectPath)
    if (data.publicUrl) {
      return appendTransformParams(data.publicUrl, options)
    }
  } catch {
    // Outside Nuxt/Vue setup — fall through to manual URL
  }

  const projectUrl = getSupabaseProjectUrl()
  if (!projectUrl) {
    return ''
  }

  const encodedPath = objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  const base = `${projectUrl}/storage/v1/object/public/${bucket}/${encodedPath}`
  return appendTransformParams(base, options)
}

/**
 * Resolve any stored media value to a browser-ready URL.
 * Supports storage refs, legacy paths, absolute URLs, and local `/public` paths.
 */
export function resolveStorageRef(
  ref?: string | null,
  options?: ImageTransformOptions,
): string {
  if (!ref) return ''

  const trimmed = ref.trim()
  if (!trimmed) return ''

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    return trimmed
  }

  const colonRef = parseStorageRef(trimmed)
  if (colonRef) {
    return getStoragePublicUrl(colonRef.bucket, colonRef.path, options)
  }

  const slashRef = parseBucketSlashRef(trimmed)
  if (slashRef) {
    return getStoragePublicUrl(slashRef.bucket, slashRef.path, options)
  }

  if (trimmed.startsWith('programs/') || trimmed.startsWith('gallery/')) {
    return getStoragePublicUrl(STORAGE_BUCKETS.media, trimmed, options)
  }

  if (trimmed.startsWith('items/')) {
    return getStoragePublicUrl(STORAGE_BUCKETS.gallery_media, trimmed, options)
  }

  return getStoragePublicUrl(STORAGE_BUCKETS.gallery_media, trimmed, options)
}

export async function uploadStorageObject(
  client: { storage: { from: (bucket: string) => { upload: (path: string, file: File, opts: object) => Promise<{ error: Error | null }> } } },
  bucket: StorageBucketId,
  path: string,
  file: File,
  options: { upsert?: boolean } = {},
): Promise<string> {
  let processedFile = file
  let objectPath = path.replace(/^\/+/, '')

  try {
    processedFile = await processImageBeforeUpload(file, bucket)
    // If the file extension changed to webp, update the objectPath extension
    if (processedFile.type === 'image/webp' && !objectPath.endsWith('.webp')) {
      const lastDot = objectPath.lastIndexOf('.')
      if (lastDot !== -1) {
        objectPath = objectPath.slice(0, lastDot) + '.webp'
      } else {
        objectPath = objectPath + '.webp'
      }
    }
  } catch (e) {
    console.warn('[storage] Client-side image processing failed, falling back to original:', e)
  }

  const { error } = await client.storage.from(bucket).upload(objectPath, processedFile, {
    cacheControl: '2592000', // 30 days cache for optimized uploads
    upsert: options.upsert ?? false,
  })

  if (error) {
    throw new Error(`Upload to ${bucket}/${objectPath} failed: ${error.message}`)
  }

  return formatStorageRef(bucket, objectPath)
}

/** Partner logo path inside `site_assets`. */
export function partnerLogoObjectPath(filename: string): string {
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  return `partners/${uuid}-${safeFilename}`
}

/** Gallery item image path inside `gallery_media`. */
export function galleryMediaObjectPath(filename: string): string {
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  return `items/${uuid}-${safeFilename}`
}

/** Media file path inside `media`. */
export function mediaObjectPath(filename: string): string {
  const safeFilename = filename.replace(/[^a-zA-Z0-9._\/\-]/g, '_')
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  return `${safeFilename}-${uuid}`
}

/** Program cover / gallery object path inside `program_media`. */
export function programMediaObjectPath(
  slug: string,
  prefix: 'cover' | 'gallery',
  filename: string,
): string {
  const safeSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-') || 'program'
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  return `${safeSlug}/${prefix}-${uuid}-${safeFilename}`
}

/** Testimonial avatar image path inside `testimonial_avatars`. */
export function testimonialAvatarObjectPath(filename: string): string {
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  return `avatars/${uuid}-${safeFilename}`
}

/** Team member avatar image path inside `teams_avatars`. */
export function teamMemberAvatarObjectPath(filename: string): string {
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  return `avatars/${uuid}-${safeFilename}`
}

/** Collect non-empty storage refs from a program row or form. */
export function collectProgramStorageRefs(
  cover?: string | null,
  gallery?: string[] | null,
): string[] {
  const refs: string[] = []
  if (cover?.trim()) refs.push(cover.trim())
  gallery?.forEach((url) => {
    if (url?.trim()) refs.push(url.trim())
  })
  return refs
}

/** Resolve a stored value to bucket + object path for deletion. */
export function resolveStorageRefForDelete(
  ref: string,
): { bucket: StorageBucketId; path: string } | null {
  return parseStorageRef(ref) || parseBucketSlashRef(ref)
}

/** Delete storage objects referenced by program media fields. Best-effort; logs warnings. */
export async function deleteStorageRefs(
  client: {
    storage: {
      from: (bucket: string) => {
        remove: (paths: string[]) => Promise<{ error: Error | null }>
      }
    }
  },
  refs: Array<string | null | undefined>,
): Promise<void> {
  const byBucket = new Map<StorageBucketId, string[]>()

  for (const ref of refs) {
    if (!ref?.trim()) continue
    const parsed = resolveStorageRefForDelete(ref.trim())
    if (!parsed) continue
    const paths = byBucket.get(parsed.bucket) ?? []
    paths.push(parsed.path)
    byBucket.set(parsed.bucket, paths)
  }

  for (const [bucket, paths] of byBucket.entries()) {
    const { error } = await client.storage.from(bucket).remove(paths)
    if (error) {
      console.warn(`[storage] Failed to delete from ${bucket}:`, error.message)
    }
  }
}

/** True when the URL should bypass Nuxt Image IPX (external Supabase storage). */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('/storage/v1/object/public/')
}
