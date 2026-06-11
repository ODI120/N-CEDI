<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, createError } from '#app'
import HeroInner from '~/components/sections/HeroInner.vue'
import RichTextRenderer from '~/components/cms/RichTextRenderer.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import { formatDate } from '~/utils/formatDate'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const slug = route.params.slug as string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = useSupabaseClient() as any

// Fetch post from database (including unpublished rows since admins bypass RLS via policies)
const { data: row, error } = await useAsyncData(`admin-post-preview-${slug}`, async () => {
  const { data, error: fetchError } = await supabase
    .from('posts')
    .select('*, author:team_members(name, avatar_url, role), category:categories(name, slug)')
    .eq('slug', slug)
    .maybeSingle()

  if (fetchError) throw fetchError
  return data
})

if (error.value || !row.value) {
  throw createError({
    statusCode: error.value ? 503 : 404,
    statusMessage: error.value ? 'Unable to load preview' : `Blog post "${slug}" not found`
  })
}

const post = computed(() => {
  const p = row.value!
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
    ],
    isPublished: p.is_published
  }
})

useSeoMeta({ title: `Preview: ${post.value.title} | Admin | N-CEDI` })

const breadcrumbs = computed(() => [
  { label: 'Posts', to: '/admin/posts' },
  { label: post.value.title, to: `/admin/posts/preview/${post.value.slug}` }
])
</script>

<template>
  <!-- eslint-disable link-checker/valid-route, link-checker/valid-sitemap-link -->
  <section class="admin-preview">
    <!-- Admin Preview Header Bar -->
    <header class="admin-preview__bar">
      <div>
        <span class="ap-eyebrow">Draft preview</span>
        <h1>{{ post.title }}</h1>
        <p class="admin-preview__meta">
          <span
            class="badge"
            :class="post.isPublished ? 'badge-green' : 'badge-gray'"
          >
            {{ post.isPublished ? 'Published' : 'Draft' }}
          </span>
          <code>/blog/{{ post.slug }}</code>
        </p>
      </div>
      <div class="admin-preview__actions">
        <NuxtLink
          to="/admin/posts"
          class="btn btn-ghost"
        >
          <UIcon name="i-lucide-arrow-left" />Back to posts
        </NuxtLink>
        <NuxtLink
          v-if="post.isPublished"
          :to="`/blog/${post.slug}`"
          target="_blank"
          class="btn btn-primary"
        >
          <UIcon name="i-lucide-external-link" />Live page
        </NuxtLink>
      </div>
    </header>

    <!-- Canvas wrapping the public page style layout -->
    <div class="admin-preview__canvas">
      <div class="blog-detail-page">
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
              <div
                v-else
                class="author-avatar-fallback"
              >
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
            <MotionWrapper
              variant="fadeUp"
              :delay="100"
            >
              <RichTextRenderer :body="post.body" />
            </MotionWrapper>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin-preview {
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}

.admin-preview__bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--sp-4);
  padding: var(--sp-6);
  background: var(--admin-surface-opaque);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-xl);
}

.admin-preview__bar h1 {
  margin: var(--sp-1) 0;
  font-size: 1.5rem;
}

.admin-preview__meta {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin: 0;
  color: var(--admin-text-muted);
  font-size: 0.875rem;
}

.admin-preview__actions {
  display: flex;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.admin-preview__canvas {
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-xl);
  overflow: hidden;
  background: #fff;
  color: #0f172a;
}

/* Include public page styles to render correctly */
.blog-detail-page {
  background-color: var(--color-surface, #fff);
  color: #334155;
}

.blog-detail-layout {
  max-width: 900px;
  padding: var(--space-12, 3rem) var(--section-padding-x, 2rem);
  margin: 0 auto;
}

.blog-author-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-8, 2rem);
  border-bottom: 1px solid var(--color-border, #e2e8f0);
  padding-bottom: var(--space-4, 1rem);
}

.blog-author-bar__author {
  display: flex;
  align-items: center;
  gap: var(--space-3, 0.75rem);
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full, 50%);
  object-fit: cover;
  border: 1px solid var(--color-border, #e2e8f0);
}

.author-avatar-fallback {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full, 50%);
  background-color: var(--color-surface-inset, #f8fafc);
  color: var(--color-brand-primary, #0a2540);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body, inherit);
  font-weight: 700;
  font-size: var(--text-lg, 1.125rem);
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-family: var(--font-body, inherit);
  font-size: var(--text-sm, 0.875rem);
  font-weight: 700;
  color: var(--color-text-dark, #0f172a);
}

.author-role {
  font-family: var(--font-body, inherit);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-text-muted, #64748b);
}

.blog-category-badge {
  background-color: var(--color-surface-muted, #f1f5f9);
  color: var(--color-brand-accent, #d4a853);
  padding: var(--space-1, 0.25rem) var(--space-4, 1rem);
  font-family: var(--font-body, inherit);
  font-size: var(--text-xs, 0.75rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide, 0.05em);
  border-radius: var(--radius-full, 9999px);
}

.blog-cover-wrapper {
  border-radius: var(--radius-xl, 1rem);
  overflow: hidden;
  border: 1px solid var(--color-border, #e2e8f0);
  box-shadow: var(--shadow-xs, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  margin-bottom: var(--space-10, 2.5rem);
}

.blog-cover-image {
  width: 100%;
  height: auto;
  max-height: 560px;
  object-fit: cover;
  display: block;
}

.blog-content-wrapper {
  margin-top: var(--space-6, 1.5rem);
}
</style>
