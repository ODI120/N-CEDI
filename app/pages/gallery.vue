<script setup lang="ts">
import { ref, computed } from 'vue'
import HeroInner from '~/components/sections/HeroInner.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import { usePageSeo } from '~/composables/useSeo'
import { useSupabase } from '~/composables/useSupabase'

usePageSeo({
  title: 'Media Gallery',
  description: 'View photos and videos of N-CEDI\'s modern facility labs, students working, and showcase exhibitions.'
})

const { client } = useSupabase()

const { data: dbGallery } = await useAsyncData('gallery-items', async () => {
  try {
    const { data, error } = await client
      .from('gallery')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase fetch failed, using fallback static gallery items:', err)
    return null
  }
})

const defaultItems = [
  {
    title: 'Solar Inverter Lab Practical',
    mediaUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800',
    mediaType: 'image' as const,
    altText: 'Students working on solar power modules',
    category: 'labs'
  },
  {
    title: 'Woodwork Shop Assembly Floor',
    mediaUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=800',
    mediaType: 'image' as const,
    altText: 'Advanced timber machinery workshop',
    category: 'labs'
  },
  {
    title: 'Garment Construction Pattern Class',
    mediaUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800',
    mediaType: 'image' as const,
    altText: 'Drafting board sessions in fashion design',
    category: 'labs'
  },
  {
    title: 'Incubated Venture Pitch Session',
    mediaUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=800',
    mediaType: 'image' as const,
    altText: 'Students presenting pitch slides to jury panel',
    category: 'projects'
  },
  {
    title: 'Modern Coffee Table Design',
    mediaUrl: 'https://images.unsplash.com/photo-1532372320978-9b4d7a92b24d?q=80&w=800',
    mediaType: 'image' as const,
    altText: 'Solid oak table crafted by student',
    category: 'projects'
  },
  {
    title: 'Annual Creative Runway',
    mediaUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800',
    mediaType: 'image' as const,
    altText: 'Graduating collection fashion model runway',
    category: 'events'
  }
]

const galleryItems = computed(() => {
  if (dbGallery.value && dbGallery.value.length > 0) {
    return dbGallery.value.map(g => ({
      title: g.title || 'N-CEDI Moment',
      mediaUrl: g.media_url,
      mediaType: (g.media_type || 'image') as 'image' | 'video',
      altText: g.alt_text || '',
      category: g.category_id || 'labs' // simplifed fallback
    }))
  }
  return defaultItems
})

const activeFilter = ref('all')

const filteredItems = computed(() => {
  if (activeFilter.value === 'all') return galleryItems.value
  return galleryItems.value.filter(item => item.category === activeFilter.value)
})

const filters = [
  { label: 'All Media', value: 'all' },
  { label: 'Labs & Facilities', value: 'labs' },
  { label: 'Student Projects', value: 'projects' },
  { label: 'Exhibitions & Events', value: 'events' }
]

const breadcrumbs = [
  { label: 'Gallery', to: '/gallery' }
]
</script>

<template>
  <div class="gallery-page">
    <HeroInner
      title="Media Showcase"
      subtitle="Step inside our active learning environment. Witness our students translating vocational concepts into tangible designs."
      :breadcrumbs="breadcrumbs"
    />

    <section class="gallery-section">
      <div class="container">
        <!-- Filter Tabs -->
        <div class="gallery-filters">
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="gallery-filter-btn"
            :class="{ 'gallery-filter-btn--active': activeFilter === filter.value }"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>

        <!-- Grid -->
        <div class="gallery-grid">
          <div
            v-for="(item, index) in filteredItems"
            :key="index"
            class="gallery-grid__item"
          >
            <MotionWrapper variant="scale" :delay="index * 80" :duration="0.5">
              <div class="gallery-card">
                <div class="gallery-card__media-wrapper">
                  <video
                    v-if="item.mediaType === 'video'"
                    :src="item.mediaUrl"
                    controls
                    preload="metadata"
                    class="gallery-card__media"
                  ></video>
                  <NuxtImg
                    v-else
                    :src="item.mediaUrl"
                    :alt="item.altText || item.title"
                    sizes="sm:100vw md:50vw lg:33vw xl:400px"
                    format="webp"
                    class="gallery-card__media"
                    loading="lazy"
                  />
                  <div class="gallery-card__info-overlay">
                    <h3 class="gallery-card__title">{{ item.title }}</h3>
                    <span class="gallery-card__tag capitalize">{{ item.category }}</span>
                  </div>
                </div>
              </div>
            </MotionWrapper>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.gallery-page {
  background-color: var(--color-surface);
}

.gallery-section {
  padding: var(--section-padding-y) 0;
}

.gallery-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-12);
}

.gallery-filter-btn {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s ease;
}

.gallery-filter-btn:hover {
  border-color: var(--color-brand-primary);
  color: var(--color-brand-primary);
}

.gallery-filter-btn--active {
  background-color: var(--color-brand-primary);
  border-color: var(--color-brand-primary);
  color: var(--color-text-inverse) !important;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

@media (max-width: 900px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }
}

@media (max-width: 540px) {
  .gallery-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}

.gallery-card {
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  aspect-ratio: 4/3;
  background-color: var(--color-surface-inset);
  position: relative;
}

.gallery-card__media-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.gallery-card__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.gallery-card:hover .gallery-card__media {
  transform: scale(1.04);
}

.gallery-card__info-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 37, 64, 0) 40%, rgba(10, 37, 64, 0.9) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--space-5);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
}

.gallery-card:hover .gallery-card__info-overlay {
  opacity: 1;
}

.gallery-card__title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 var(--space-1) 0;
}

.gallery-card__tag {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-brand-accent);
}
</style>
