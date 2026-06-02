<script setup lang="ts">
import { computed } from 'vue'
import HeroInner from '~/components/sections/HeroInner.vue'
import BlogCard from '~/components/cards/BlogCard.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import { usePageSeo } from '~/composables/useSeo'
import { useSupabase } from '~/composables/useSupabase'

usePageSeo({
  title: 'Insights & Innovation Blog',
  description: 'Read the latest updates, thought leadership articles, and success stories from the N-CEDI entrepreneurship community.'
})

const { client } = useSupabase()

const { data: dbPosts } = await useAsyncData('blog-posts', async () => {
  try {
    const { data, error } = await client
      .from('posts')
      .select('*, author:team_members(name, avatar_url, role), category:categories(name, slug)')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase fetch failed, using fallback static blog posts:', err)
    return null
  }
})



const posts = computed(() => {
  if (dbPosts.value && dbPosts.value.length > 0) {
    return dbPosts.value.map((p: any) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || '',
      coverImageUrl: p.cover_image_url || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800',
      publishedAt: p.published_at || p.created_at,
      readTimeMinutes: p.read_time_minutes || 5,
      category: p.category ? { name: p.category.name, slug: p.category.slug } : { name: 'General', slug: 'general' },
      author: p.author ? { name: p.author.name, role: p.author.role, avatarUrl: p.author.avatar_url } : { name: 'N-CEDI Team', role: 'Staff' }
    }))
  }
  return []
})

const breadcrumbs = [
  { label: 'Blog', to: '/blog' }
]
</script>

<template>
  <div class="blog-page">
    <HeroInner
      title="N-CEDI Blog & Insights"
      subtitle="Read about vocational innovation trends, business incubation stories, and development benchmarks."
      :breadcrumbs="breadcrumbs"
    />

    <section class="blog-section">
      <div class="container">
        <!-- Empty State -->
        <div v-if="posts.length === 0" class="blog-empty-state">
          <MotionWrapper variant="fadeUp" :delay="100">
            <div class="empty-icon-wrap">
              <UIcon name="i-lucide-newspaper" class="empty-icon" />
            </div>
            <h3 class="empty-title">No Blog Posts Yet</h3>
            <p class="empty-description">
              We haven't published any articles or insights yet. Please check back later for updates from the N-CEDI team.
            </p>
          </MotionWrapper>
        </div>

        <!-- Grid of Posts -->
        <div v-else class="blog-grid">
          <div
            v-for="(post, index) in posts"
            :key="post.slug"
            class="blog-grid__item"
          >
            <MotionWrapper variant="fadeUp" :delay="Number(index) * 100" :duration="0.6">
              <BlogCard :post="post" />
            </MotionWrapper>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.blog-page {
  background-color: var(--color-surface);
}

.blog-section {
  padding: var(--section-padding-y) 0;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
}

@media (max-width: 1024px) {
  .blog-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
}

@media (max-width: 640px) {
  .blog-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}

/* Empty State Styling */
.blog-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 600px;
  margin: var(--space-12) auto;
  padding: var(--space-12) var(--space-6);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-2xl);
  background-color: var(--color-surface-inset);
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(var(--color-brand-primary-rgb, 212, 168, 83), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-6);
  color: var(--color-brand-primary);
  border: 1px solid rgba(var(--color-brand-primary-rgb, 212, 168, 83), 0.15);
}

.empty-icon {
  font-size: 2.25rem;
}

.empty-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-brand-primary);
  margin: 0 0 var(--space-3) 0;
}

.empty-description {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-normal);
  margin: 0;
}
</style>
