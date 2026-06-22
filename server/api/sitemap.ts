import { serverSupabaseClient } from '#supabase/server'

interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: number
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const entries: SitemapEntry[] = []

  // Add static pages
  const staticPages = [
    { loc: '/', priority: 1.0, changefreq: 'daily' },
    { loc: '/about', priority: 0.8, changefreq: 'monthly' },
    { loc: '/programs', priority: 0.9, changefreq: 'weekly' },
    { loc: '/events', priority: 0.9, changefreq: 'daily' },
    { loc: '/blog', priority: 0.8, changefreq: 'daily' },
    { loc: '/gallery', priority: 0.7, changefreq: 'weekly' },
    { loc: '/partners', priority: 0.6, changefreq: 'monthly' },
    { loc: '/contact', priority: 0.7, changefreq: 'monthly' }
  ]

  for (const page of staticPages) {
    entries.push(page)
  }

  const warnings: string[] = []

  // 1. Fetch published programs
  const { data: programs, error: programsError } = await client
    .from('programs')
    .select('slug, updated_at')
    .eq('is_published', true)

  if (programsError) {
    console.error('[sitemap] Failed to fetch programs:', programsError.message)
    warnings.push(`programs: ${programsError.message}`)
  } else if (programs) {
    programs.forEach((prog: any) => {
      entries.push({
        loc: `/programs/${prog.slug}`,
        lastmod: prog.updated_at,
        changefreq: 'weekly',
        priority: 0.8
      })
    })
  }

  // 2. Fetch published events
  const { data: events, error: eventsError } = await client
    .from('events')
    .select('slug, updated_at')
    .eq('is_published', true)

  if (eventsError) {
    console.error('[sitemap] Failed to fetch events:', eventsError.message)
    warnings.push(`events: ${eventsError.message}`)
  } else if (events) {
    events.forEach((evt: any) => {
      entries.push({
        loc: `/events/${evt.slug}`,
        lastmod: evt.updated_at,
        changefreq: 'daily',
        priority: 0.8
      })
    })
  }

  // 3. Fetch published blog posts
  const { data: posts, error: postsError } = await client
    .from('posts')
    .select('slug, updated_at')
    .eq('is_published', true)

  if (postsError) {
    console.error('[sitemap] Failed to fetch posts:', postsError.message)
    warnings.push(`posts: ${postsError.message}`)
  } else if (posts) {
    posts.forEach((post: any) => {
      entries.push({
        loc: `/blog/${post.slug}`,
        lastmod: post.updated_at,
        changefreq: 'weekly',
        priority: 0.7
      })
    })
  }

  if (warnings.length) {
    console.warn(`[sitemap] Partial sitemap generated with ${warnings.length} error(s)`)
  }

  return entries
})
