/**
 * N-CEDI — usePageSeo
 */

import type { ProgramDetail } from '~/composables/usePrograms'
import { resolveProgramMediaUrl } from '~/utils/programAdmin'

interface PageSeoOptions {
  title: string
  description: string
  image?: string
  type?: 'website' | 'article'
  publishedAt?: string
}

const SITE_NAME = 'N-CEDI'
const TWITTER_HANDLE = '@ncedi_ng'
const DEFAULT_OG_IMAGE = '/og/default.png'

export function resolveAbsoluteMediaUrl(url?: string | null): string {
  if (!url) {
    return resolveAbsoluteMediaUrl(DEFAULT_OG_IMAGE)
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  if (url.startsWith('/')) {
    const siteUrl = useSiteConfig().url || 'https://n-cedi.vercel.app'
    return `${siteUrl.replace(/\/$/, '')}${url}`
  }

  const resolved = resolveProgramMediaUrl(url)
  return resolved || resolveAbsoluteMediaUrl(DEFAULT_OG_IMAGE)
}

export function usePageSeo(options: PageSeoOptions) {
  const {
    title,
    description,
    image = DEFAULT_OG_IMAGE,
    type = 'website',
    publishedAt,
  } = options

  const absoluteImage = resolveAbsoluteMediaUrl(image)
  const fullTitle = `${title} | ${SITE_NAME}`
  const route = useRoute()
  const siteUrl = useSiteConfig().url || 'https://n-cedi.vercel.app'
  const canonicalUrl = `${siteUrl.replace(/\/$/, '')}${route.path}`

  useSeoMeta({
    title: fullTitle,
    description,
    ogTitle: fullTitle,
    ogDescription: description,
    ogImage: absoluteImage,
    ogType: type,
    ogSiteName: SITE_NAME,
    twitterCard: 'summary_large_image',
    twitterSite: TWITTER_HANDLE,
    twitterTitle: fullTitle,
    twitterDescription: description,
    twitterImage: absoluteImage,
  })

  // Add canonical URL via head
  useHead({
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl
      }
    ]
  })

  if (type === 'article' && publishedAt) {
    useSchemaOrg([
      defineArticle({
        headline: title,
        description,
        image: absoluteImage,
        datePublished: publishedAt,
        url: canonicalUrl,
        publisher: {
          name: SITE_NAME,
          logo: resolveAbsoluteMediaUrl(DEFAULT_OG_IMAGE),
        },
      }),
    ])
  } else {
    useSchemaOrg([
      defineWebPage({
        name: fullTitle,
        description,
        url: canonicalUrl,
      }),
    ])
  }
}

export function useProgramPageSeo(program: ProgramDetail) {
  const description =
    program.metaDescription
    || program.subtitle
    || program.description

  const image = resolveAbsoluteMediaUrl(program.coverImageUrl)

  usePageSeo({
    title: program.metaTitle || program.title,
    description,
    image,
  })

  useSchemaOrg([
    {
      '@type': 'Course',
      name: program.title,
      description,
      image,
      provider: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: useSiteConfig().url || 'https://n-cedi.vercel.app',
      },
      url: `${(useSiteConfig().url || 'https://n-cedi.vercel.app').replace(/\/$/, '')}/programs/${program.slug}`,
    },
  ])
}
