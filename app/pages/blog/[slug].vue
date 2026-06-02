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

  return null
})

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Blog post "${slug}" not found`,
    fatal: true
  })
}

// Wire SEO
if (post.value) {
  usePageSeo({
    title: post.value.title,
    description: post.value.excerpt,
    image: post.value.coverImageUrl,
    type: 'article',
    publishedAt: post.value.publishedAt
  })
}

const breadcrumbs = computed(() => {
  if (!post.value) return []
  return [
    { label: 'Blog', to: '/blog' },
    { label: post.value.title, to: `/blog/${post.value.slug}` }
  ]
})
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
  border: 1px solid var(--color-border);
}

.author-avatar-fallback {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background-color: var(--color-surface-inset);
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
  color: var(--color-text-dark);
}

.author-role {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.blog-category-badge {
  background-color: var(--color-surface-muted);
  color: var(--color-brand-accent);
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
  box-shadow: var(--shadow-xs);
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
