/**
 * N-CEDI — usePageSeo
 *
 * One-call composable that wires up both `useSeoMeta()` (from Nuxt) and
 * `useSchemaOrg()` (from `nuxt-schema-org`) for every page.
 *
 * Usage:
 *   usePageSeo({ title: 'Programs', description: 'Explore our programs.' })
 */

interface PageSeoOptions {
  title: string
  description: string
  image?: string
  type?: 'website' | 'article'
  publishedAt?: string
}

const SITE_NAME = 'N-CEDI'
const TWITTER_HANDLE = '@ncedi_ng'
const DEFAULT_OG_IMAGE = '/og/default.jpg'

export function usePageSeo(options: PageSeoOptions) {
  const {
    title,
    description,
    image = DEFAULT_OG_IMAGE,
    type = 'website',
    publishedAt
  } = options

  const fullTitle = `${title} | ${SITE_NAME}`

  // Standard + Open Graph + Twitter meta
  useSeoMeta({
    title: fullTitle,
    description,
    ogTitle: fullTitle,
    ogDescription: description,
    ogImage: image,
    ogType: type,
    ogSiteName: SITE_NAME,
    twitterCard: 'summary_large_image',
    twitterSite: TWITTER_HANDLE,
    twitterTitle: fullTitle,
    twitterDescription: description,
    twitterImage: image
  })

  // Structured data (JSON-LD)
  if (type === 'article' && publishedAt) {
    useSchemaOrg([
      defineArticle({
        headline: title,
        description,
        image,
        datePublished: publishedAt,
        publisher: {
          name: SITE_NAME,
          logo: DEFAULT_OG_IMAGE
        }
      })
    ])
  } else {
    useSchemaOrg([
      defineWebPage({
        name: fullTitle,
        description
      })
    ])
  }
}
