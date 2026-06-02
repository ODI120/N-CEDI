<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, createError } from '#app'
import HeroInner from '~/components/sections/HeroInner.vue'
import RichTextRenderer from '~/components/cms/RichTextRenderer.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import BaseBadge from '~/components/ui/BaseBadge.vue'
import { usePageSeo } from '~/composables/useSeo'
import { useSupabase } from '~/composables/useSupabase'
import { resolveStorageRef } from '~/utils/storage'

const route = useRoute()
const slug = route.params.slug as string
const { client } = useSupabase()

// Fetch event from database
const { data: dbEvent } = await useAsyncData(`event-${slug}`, async () => {
  try {
    const { data, error } = await client
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (err) {
    console.warn(`Supabase fetch failed for event ${slug}, using static fallback`, err)
    return null
  }
})

if (!dbEvent.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Event "${slug}" not found`,
    fatal: true
  })
}

const event = computed(() => {
  const e = dbEvent.value!
  return {
    title: e.title,
    slug: e.slug,
    description: e.description || '',
    coverImageUrl: e.cover_image_url ? resolveStorageRef(e.cover_image_url) : '',
    galleryUrls: e.gallery_urls || [],
    body: e.body || [
      { type: 'heading', data: { level: 2, text: 'About the Event' } },
      { type: 'paragraph', data: { text: e.description || '' } }
    ]
  }
})

// Wire SEO
usePageSeo({
  title: event.value.title,
  description: event.value.description,
  image: event.value.coverImageUrl
})

const breadcrumbs = computed(() => [
  { label: 'Events', to: '/events' },
  { label: event.value.title, to: `/events/${event.value.slug}` }
])

// ─── Slider State & Methods ──────────────────────────────────
const allImages = computed(() => {
  const list: string[] = []
  if (event.value?.coverImageUrl) {
    list.push(event.value.coverImageUrl)
  }
  if (event.value?.galleryUrls) {
    event.value.galleryUrls.forEach(url => {
      if (url && !list.includes(url)) {
        list.push(resolveStorageRef(url))
      }
    })
  }
  return list
})

const currentSlide = ref(0)
const touchStartX = ref(0)
const touchEndX = ref(0)

const nextSlide = () => {
  if (!allImages.value.length) return
  currentSlide.value = (currentSlide.value + 1) % allImages.value.length
}

const prevSlide = () => {
  if (!allImages.value.length) return
  currentSlide.value =
    currentSlide.value === 0
      ? allImages.value.length - 1
      : currentSlide.value - 1
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

// Swipe Support
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.changedTouches[0].screenX
}

const handleTouchMove = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].screenX
}

const handleTouchEnd = () => {
  const swipeThreshold = 50
  if (touchStartX.value - touchEndX.value > swipeThreshold) {
    nextSlide()
  } else if (touchEndX.value - touchStartX.value > swipeThreshold) {
    prevSlide()
  }
}
</script>

<template>
  <div v-if="event" class="event-detail-page">
    <HeroInner
      :title="event.title"
      :subtitle="event.description"
      :breadcrumbs="breadcrumbs"
    />

    <div class="event-detail-layout container">
      <!-- Main Content -->
      <div class="event-detail-layout__main">
        <MotionWrapper variant="fadeUp" :delay="100">
          
          <!-- Premium Image Slider -->
          <div class="event-gallery-slider">
            <div 
              class="slider-viewport"
              @touchstart="handleTouchStart"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
            >
              <div 
                class="slider-track"
                :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
              >
                <div 
                  v-for="(imgUrl, idx) in allImages" 
                  :key="idx" 
                  class="slider-slide"
                >
                  <NuxtImg
                    :src="imgUrl"
                    :alt="`${event.title} slide ${idx + 1}`"
                    sizes="sm:100vw md:80vw lg:60vw xl:800px"
                    format="webp"
                    class="slider-image"
                    loading="lazy"
                  />
                </div>
              </div>
              
              <!-- Navigation Controls -->
              <button 
                v-if="allImages.length > 1" 
                class="slider-arrow slider-arrow--prev" 
                aria-label="Previous Slide" 
                @click="prevSlide"
              >
                <UIcon name="i-lucide-chevron-left" />
              </button>
              <button 
                v-if="allImages.length > 1" 
                class="slider-arrow slider-arrow--next" 
                aria-label="Next Slide" 
                @click="nextSlide"
              >
                <UIcon name="i-lucide-chevron-right" />
              </button>
            </div>

            <!-- Thumbnail strip below -->
            <div v-if="allImages.length > 1" class="thumbnail-strip">
              <button 
                v-for="(imgUrl, idx) in allImages" 
                :key="`thumb-${idx}`" 
                class="thumbnail-btn" 
                :class="{ 'is-active': currentSlide === idx }"
                :aria-label="`Go to slide ${idx + 1}`"
                @click="goToSlide(idx)"
              >
                <NuxtImg 
                  :src="imgUrl" 
                  alt="Thumbnail" 
                  class="thumbnail-image" 
                  width="100" 
                  height="56" 
                  format="webp" 
                />
              </button>
            </div>
          </div>

          <!-- Event Body Content -->
          <div class="event-body-section">
            <RichTextRenderer :body="event.body" />
          </div>
        </MotionWrapper>
      </div>

      <!-- Sidebar -->
      <aside class="event-detail-layout__sidebar">
        <MotionWrapper variant="fadeUp" :delay="200">
          <div class="event-sidebar-card">
            <div class="event-sidebar-header">
              <BaseBadge type="advanced" label="NCAT NBTE Event" />
            </div>

            <div class="event-info-panel">
              <h4 class="event-info-title">Student Admission</h4>
              <p class="event-info-desc">
                This activity is organized exclusively for enrolled NCAT students under NBTE.
              </p>
              
              <hr class="event-info-divider" />

              <div class="event-bullet-list">
                <div class="event-bullet-item">
                  <UIcon name="i-lucide-badge-check" class="bullet-icon" />
                  <span>No registration or signup required.</span>
                </div>
                <div class="event-bullet-item">
                  <UIcon name="i-lucide-smile" class="bullet-icon" />
                  <span>Free entry with student ID.</span>
                </div>
                <div class="event-bullet-item">
                  <UIcon name="i-lucide-map" class="bullet-icon" />
                  <span>Held at N-CEDI Incubator/Campus halls.</span>
                </div>
              </div>
            </div>

            <div class="event-sidebar-cta">
              <p class="event-cta-note">
                Contact your Student Union or NBTE department coordinators for schedule details.
              </p>
            </div>
          </div>
        </MotionWrapper>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.event-detail-page {
  background-color: var(--color-surface);
}

.event-detail-layout {
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: var(--space-12);
  padding: var(--space-12) var(--section-padding-x);
}

@media (max-width: 1024px) {
  .event-detail-layout {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
}

.event-gallery-slider {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.slider-viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
  background-color: var(--color-surface-inset);
}

.slider-track {
  display: flex;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.slider-slide {
  min-width: 100%;
  height: 100%;
  position: relative;
}

.slider-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
  padding: 0;
}

.slider-arrow:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.05);
}

.slider-arrow--prev {
  left: var(--space-4);
}

.slider-arrow--next {
  right: var(--space-4);
}

.thumbnail-strip {
  display: flex;
  gap: var(--space-3);
  overflow-x: auto;
  padding: var(--space-1) 0;
  scrollbar-width: thin;
}

.thumbnail-btn {
  padding: 0;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 16 / 9;
  width: 96px;
  flex-shrink: 0;
  background: var(--color-surface-inset);
  transition: all 0.2s;
}

.thumbnail-btn:hover {
  transform: scale(1.02);
}

.thumbnail-btn.is-active {
  border-color: var(--color-brand-accent);
  box-shadow: var(--shadow-sm);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.event-body-section {
  margin-bottom: var(--space-8);
}

/* Sidebar styling */
.event-sidebar-card {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-xs);
  position: sticky;
  top: var(--space-24);
}

.event-sidebar-header {
  margin-bottom: var(--space-6);
}

.event-info-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.event-info-title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 800;
  color: var(--color-brand-primary);
  margin: 0;
}

.event-info-desc {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-normal);
  margin: 0;
}

.event-info-divider {
  border: 0;
  height: 1px;
  background: var(--color-border);
  margin: var(--space-2) 0;
}

.event-bullet-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.event-bullet-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
}

.bullet-icon {
  color: var(--color-brand-secondary);
  font-size: 1.15rem;
  margin-top: 1px;
  flex-shrink: 0;
}

.event-sidebar-cta {
  margin-top: var(--space-8);
}

.event-cta-note {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--leading-normal);
  text-align: center;
  margin: 0;
  padding-top: var(--space-4);
  border-top: 1px dashed var(--color-border);
}
</style>
