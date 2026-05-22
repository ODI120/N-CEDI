<script setup lang="ts">
import { computed } from 'vue'
import HeroInner from '~/components/sections/HeroInner.vue'
import ProgramCard from '~/components/cards/ProgramCard.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import { usePageSeo } from '~/composables/useSeo'
import { useSupabase } from '~/composables/useSupabase'

usePageSeo({
  title: 'Entrepreneurship & Innovation Programs',
  description: 'Explore N-CEDI\'s professional vocational and technology tracks, designed to equip you with real-world entrepreneurial skills.'
})

const { client } = useSupabase()

const { data: dbPrograms, error } = await useAsyncData('programs-list', async () => {
  try {
    const { data, error } = await client
      .from('programs')
      .select('*')
      .eq('is_published', true)
      .order('title', { ascending: true })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase fetch failed, using fallback static programs:', err)
    return null
  }
})

const defaultPrograms = [
  {
    title: 'Fashion Design',
    slug: 'fashion-design',
    description: 'Learn modern garment construction, pattern drafting, and entrepreneurial fashion branding.',
    coverImageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800',
    durationWeeks: 12,
    level: 'beginner' as const,
    isFeatured: true
  },
  {
    title: 'Woodwork & Furniture Design',
    slug: 'woodwork-furniture-design',
    description: 'Master precision carpentry, modern furniture construction, and spatial installation designs.',
    coverImageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=800',
    durationWeeks: 16,
    level: 'intermediate' as const,
    isFeatured: false
  },
  {
    title: 'Web Design & Development',
    slug: 'web-design-development',
    description: 'Build premium responsive websites using Nuxt, Tailwind CSS, Javascript and database integrations.',
    coverImageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800',
    durationWeeks: 12,
    level: 'intermediate' as const,
    isFeatured: true
  },
  {
    title: 'Computer Hardware Engineering',
    slug: 'computer-hardware-engineering',
    description: 'Understand computer architecture, component diagnostics, micro-soldering, and system repairs.',
    coverImageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=800',
    durationWeeks: 12,
    level: 'beginner' as const,
    isFeatured: false
  },
  {
    title: 'Solar Installation & Energy Systems',
    slug: 'solar-installation-energy-systems',
    description: 'Design and install sustainable solar panels, inverter systems, battery storage, and hybrid microgrids.',
    coverImageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800',
    durationWeeks: 8,
    level: 'beginner' as const,
    isFeatured: true
  },
  {
    title: 'Bakery & Bead Making',
    slug: 'bakery-bead-making',
    description: 'Combine culinary pastry arts with intricate traditional African bead crafts for commercial enterprise.',
    coverImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800',
    durationWeeks: 8,
    level: 'beginner' as const,
    isFeatured: false
  }
]

const programs = computed(() => {
  if (dbPrograms.value && dbPrograms.value.length > 0) {
    return dbPrograms.value.map(p => ({
      title: p.title,
      slug: p.slug,
      description: p.description || '',
      coverImageUrl: p.cover_image_url || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800',
      durationWeeks: p.duration_weeks || 12,
      level: (p.level || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
      isFeatured: p.is_featured || false
    }))
  }
  return defaultPrograms
})

const breadcrumbs = [
  { label: 'Programs', to: '/programs' }
]
</script>

<template>
  <div class="programs-page">
    <HeroInner
      title="Our Academic Programs"
      subtitle="Comprehensive hands-on curriculum bridging traditional crafts and software innovation to build self-sustaining enterprises."
      :breadcrumbs="breadcrumbs"
    />

    <section class="programs-section">
      <div class="container">
        <div class="programs-section__intro">
          <MotionWrapper variant="fadeUp" :delay="100">
            <span class="eyebrow">Practical Skillsets</span>
            <h2 class="programs-section__heading">Empowering Nigerian Youth</h2>
            <p class="programs-section__lead">
              Our training methodology combines rigorous technical instruction with essential business incubation.
              Graduates leave not only with a mastery of their craft, but with a fully realized business model to start their own enterprises.
            </p>
          </MotionWrapper>
        </div>

        <div class="programs-grid">
          <div
            v-for="(program, index) in programs"
            :key="program.slug"
            class="programs-grid__item"
          >
            <MotionWrapper variant="fadeUp" :delay="index * 100" :duration="0.6">
              <ProgramCard :program="program" />
            </MotionWrapper>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.programs-page {
  background-color: var(--color-surface);
}

.programs-section {
  padding: var(--section-padding-y) 0;
}

.programs-section__intro {
  max-width: 800px;
  margin-bottom: var(--space-16);
}

.programs-section__heading {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  color: var(--color-brand-primary);
  margin-top: var(--space-2);
  margin-bottom: var(--space-4);
}

.programs-section__lead {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0;
}

.programs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
}

@media (max-width: 1024px) {
  .programs-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
}

@media (max-width: 640px) {
  .programs-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}
</style>
