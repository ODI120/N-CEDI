<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, createError } from '#app'
import HeroInner from '~/components/sections/HeroInner.vue'
import RichTextRenderer from '~/components/cms/RichTextRenderer.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import { usePageSeo } from '~/composables/useSeo'
import { useSupabase } from '~/composables/useSupabase'
import { formatDate } from '~/utils/formatDate'

const route = useRoute()
const slug = route.params.slug as string
const { client } = useSupabase()

// Fetch post from database
const { data: dbPost } = await useAsyncData(`post-${slug}`, async () => {
  try {
    const { data, error } = await client
      .from('posts')
      .select('*, author:team_members(name, avatar_url, role), category:categories(name, slug)')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (err) {
    console.warn(`Supabase fetch failed for blog post ${slug}, using static fallback`, err)
    return null
  }
})

// Detailed static fallback blog posts
const defaultPosts = [
  {
    title: 'The Future of Solar Energy in Northern Nigeria',
    slug: 'future-solar-energy-nigeria',
    excerpt: 'Exploring the massive economic potential of distributed mini-grids and professional training frameworks to power local businesses.',
    coverImageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200',
    publishedAt: '2026-05-10T08:00:00+01:00',
    readTimeMinutes: 5,
    category: { name: 'Renewables', slug: 'renewables' },
    author: { name: 'Dr. Ibrahim Yusuf', role: 'Energy Advisor', avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200' },
    body: [
      {
        type: 'paragraph',
        data: { text: 'Nigeria faces unique challenges in grid power distribution. However, this deficit presents a massive opportunity for solar tech solutions. At N-CEDI, we focus on training certified installers who can deploy and service solar hybrid systems across urban and rural communities.' }
      },
      {
        type: 'heading',
        data: { level: 2, text: 'The Economic Case for Solar In Kaduna & Environs' }
      },
      {
        type: 'paragraph',
        data: { text: 'With high insolation levels in Northern Nigeria, solar power yields significant energy per square meter. Commercial enterprises like cold storage spaces, agricultural processing units, and school facilities are rapidly transitioning to solar arrays.' }
      },
      {
        type: 'quote',
        data: {
          text: 'Off-grid solar is not just an alternative energy source; it is the cornerstone of new enterprise creation in northern Kaduna.',
          caption: 'Dr. Ibrahim Yusuf'
        }
      }
    ]
  },
  {
    title: 'Bridging the Gap: Tech Meets Craftsmanship',
    slug: 'bridging-gap-tech-craft',
    excerpt: 'How traditional carpentry and garment fabrication are leveraging modern user interface designs and smart technologies to capture global markets.',
    coverImageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1200',
    publishedAt: '2026-05-02T09:00:00+01:00',
    readTimeMinutes: 6,
    category: { name: 'Tech & Craft', slug: 'tech-craft' },
    author: { name: 'Engr. Sarah Alabi', role: 'Innovation Lead', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200' },
    body: [
      {
        type: 'paragraph',
        data: { text: 'Vocational work is traditionally seen as isolated from the software developer ecosystem. At N-CEDI, we are breaking down this barrier. Our students in Web Design collaborate directly with Woodwork and Fashion departments to deploy online commerce systems, customize 3D furniture models, and design IoT-interactive clothing.' }
      }
    ]
  },
  {
    title: 'Incubation Success: How Halima Built Bello Couture',
    slug: 'halima-bello-couture',
    excerpt: 'An interview with a Cohort 2 design graduate who turned a ₦150k N-CEDI seed grant into a multi-city sustainable fashion boutique.',
    coverImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200',
    publishedAt: '2026-04-18T10:00:00+01:00',
    readTimeMinutes: 4,
    category: { name: 'Incubation', slug: 'incubation' },
    author: { name: 'Michael Obi', role: 'Communications Officer', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200' },
    body: [
      {
        type: 'paragraph',
        data: { text: 'When Halima Bello enrolled in our Fashion Design track, she was seeking to move away from generic designs. Under the mentorship of our industry leads, she mastered tailoring mechanics, digital pattern making, and structured collections scheduling. Following graduation, she pitched her capsule collection and secured a ₦150,000 equity-free seed grant.' }
      }
    ]
  }
]

const post = computed(() => {
  if (dbPost.value) {
    const p = dbPost.value
    return {
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || '',
      coverImageUrl: p.cover_image_url || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200',
      publishedAt: p.published_at || p.created_at,
      readTimeMinutes: p.read_time_minutes || 5,
      category: p.category ? { name: p.category.name, slug: p.category.slug } : { name: 'General', slug: 'general' },
      author: p.author ? { name: p.author.name, role: p.author.role, avatarUrl: p.author.avatar_url } : { name: 'N-CEDI Team', role: 'Staff' },
      body: p.body || [
        { type: 'heading', data: { level: 2, text: 'Article Content' } },
        { type: 'paragraph', data: { text: p.excerpt || '' } }
      ]
    }
  }

  const fallback = defaultPosts.find(p => p.slug === slug)
  return fallback || null
})

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Blog post "${slug}" not found`,
    fatal: true
  })
}

// Wire SEO
usePageSeo({
  title: post.value.title,
  description: post.value.excerpt,
  image: post.value.coverImageUrl,
  type: 'article',
  publishedAt: post.value.publishedAt
})

const breadcrumbs = computed(() => [
  { label: 'Blog', to: '/blog' },
  { label: post.value.title, to: `/blog/${post.value.slug}` }
])
</script>

<template>
  <div v-if="post" class="blog-detail-page">
    <HeroInner
      :title="post.title"
      :subtitle="`${post.readTimeMinutes} min read • Published on ${formatDate(post.publishedAt)}`"
      :breadcrumbs="breadcrumbs"
    />

    <article class="blog-detail-layout container">
      <!-- Author metadata bar -->
      <div class="blog-author-bar">
        <div class="blog-author-bar__author">
          <NuxtImg
            v-if="post.author.avatarUrl"
            :src="post.author.avatarUrl"
            :alt="post.author.name"
            class="author-avatar"
            width="48"
            height="48"
          />
          <div v-else class="author-avatar-fallback">
            {{ post.author.name.charAt(0) }}
          </div>
          <div class="author-info">
            <span class="author-name">{{ post.author.name }}</span>
            <span class="author-role">{{ post.author.role }}</span>
          </div>
        </div>

        <div class="blog-category-badge">
          {{ post.category.name }}
        </div>
      </div>

      <!-- Cover Image -->
      <div class="blog-cover-wrapper">
        <NuxtImg
          :src="post.coverImageUrl"
          :alt="post.title"
          sizes="sm:100vw md:90vw lg:80vw xl:1200px"
          format="webp"
          class="blog-cover-image"
          priority
        />
      </div>

      <!-- Body Content -->
      <div class="blog-content-wrapper">
        <MotionWrapper variant="fadeUp" :delay="100">
          <RichTextRenderer :body="post.body" />
        </MotionWrapper>
      </div>
    </article>
  </div>
</template>

<style scoped>
.blog-detail-page {
  background-color: var(--color-surface);
}

.blog-detail-layout {
  max-width: 900px;
  padding: var(--space-12) var(--section-padding-x);
}

.blog-author-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-8);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-4);
}

.blog-author-bar__author {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 1px solid var(--color-border-strong);
}

.author-avatar-fallback {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary-100);
  color: var(--color-brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: var(--text-lg);
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-primary);
}

.author-role {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.blog-category-badge {
  background-color: var(--color-accent-50);
  color: var(--color-accent-700);
  padding: var(--space-1) var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  border-radius: var(--radius-full);
}

.blog-cover-wrapper {
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--space-10);
}

.blog-cover-image {
  width: 100%;
  height: auto;
  max-height: 560px;
  object-fit: cover;
  display: block;
}

.blog-content-wrapper {
  margin-top: var(--space-6);
}
</style>
