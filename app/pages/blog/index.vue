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

const defaultPosts = [
  {
    title: 'The Future of Solar Energy in Northern Nigeria',
    slug: 'future-solar-energy-nigeria',
    excerpt: 'Exploring the massive economic potential of distributed mini-grids and professional training frameworks to power local businesses.',
    coverImageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800',
    publishedAt: '2026-05-10T08:00:00+01:00',
    readTimeMinutes: 5,
    category: { name: 'Renewables', slug: 'renewables' },
    author: { name: 'Dr. Ibrahim Yusuf', role: 'Energy Advisor', avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200' }
  },
  {
    title: 'Bridging the Gap: Tech Meets Craftsmanship',
    slug: 'bridging-gap-tech-craft',
    excerpt: 'How traditional carpentry and garment fabrication are leveraging modern user interface designs and smart technologies to capture global markets.',
    coverImageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800',
    publishedAt: '2026-05-02T09:00:00+01:00',
    readTimeMinutes: 6,
    category: { name: 'Tech & Craft', slug: 'tech-craft' },
    author: { name: 'Engr. Sarah Alabi', role: 'Innovation Lead', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200' }
  },
  {
    title: 'Incubation Success: How Halima Built Bello Couture',
    slug: 'halima-bello-couture',
    excerpt: 'An interview with a Cohort 2 design graduate who turned a ₦150k N-CEDI seed grant into a multi-city sustainable fashion boutique.',
    coverImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800',
    publishedAt: '2026-04-18T10:00:00+01:00',
    readTimeMinutes: 4,
    category: { name: 'Incubation', slug: 'incubation' },
    author: { name: 'Michael Obi', role: 'Communications Officer', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200' }
  }
]

const posts = computed(() => {
  if (dbPosts.value && dbPosts.value.length > 0) {
    return dbPosts.value.map(p => ({
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
  return defaultPosts
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
        <div class="blog-grid">
          <div
            v-for="(post, index) in posts"
            :key="post.slug"
            class="blog-grid__item"
          >
            <MotionWrapper variant="fadeUp" :delay="index * 100" :duration="0.6">
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
</style>
