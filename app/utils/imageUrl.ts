/**
 * N-CEDI — Supabase Storage image URL builder
 *
 * Builds a public URL pointing at a file inside a Supabase Storage
 * bucket, optionally appending image-transform query parameters
 * (width, height, quality) so the CDN returns optimised variants.
 *
 * @example
 *   getImageUrl('programs/cover.jpg')
 *   // → "https://<project>.supabase.co/storage/v1/object/public/media/programs/cover.jpg"
 *
 *   getImageUrl('programs/cover.jpg', { width: 800, quality: 75 })
 *   // → ".../cover.jpg?width=800&quality=75"
 */

interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: number
}

const DEFAULT_BUCKET = 'media'

export function getImageUrl(
  path: string,
  options?: ImageTransformOptions
): string {
  const config = useRuntimeConfig()
  const supabaseUrl: string = (config.public as Record<string, unknown>).supabaseUrl as string
    || 'https://placeholder.supabase.co'

  const base = `${supabaseUrl}/storage/v1/object/public/${DEFAULT_BUCKET}/${path}`

  if (!options) {
    return base
  }

  const params = new URLSearchParams()

  if (options.width) {
    params.set('width', String(options.width))
  }
  if (options.height) {
    params.set('height', String(options.height))
  }
  if (options.quality) {
    params.set('quality', String(options.quality))
  }

  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}
