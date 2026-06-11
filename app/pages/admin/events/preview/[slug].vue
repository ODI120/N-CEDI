<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, createError } from '#app'
import HeroInner from '~/components/sections/HeroInner.vue'
import RichTextRenderer from '~/components/cms/RichTextRenderer.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import BaseBadge from '~/components/ui/BaseBadge.vue'
import { resolveStorageRef } from '~/utils/storage'
import { rowToEventForm, type EventDbRow } from '~/utils/eventAdmin'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const slug = route.params.slug as string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = useSupabaseClient() as any

// Fetch event from database (including unpublished rows since admins bypass RLS via policies)
const { data: row, error } = await useAsyncData(`admin-event-preview-${slug}`, async () => {
  const { data, error: fetchError } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (fetchError) throw fetchError
  return data as EventDbRow | null
})

if (error.value || !row.value) {
  throw createError({
    statusCode: error.value ? 503 : 404,
    statusMessage: error.value ? 'Unable to load preview' : `Event "${slug}" not found`
  })
}

const event = computed(() => {
  const e = row.value!
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

const formSnapshot = computed(() => rowToEventForm(row.value as EventDbRow))

useSeoMeta({ title: `Preview: ${event.value.title} | Admin | N-CEDI` })

const breadcrumbs = computed(() => [
  { label: 'Events', to: '/admin/events' },
  { label: event.value.title, to: `/admin/events/preview/${event.value.slug}` }
])

// ─── Slider State & Methods ──────────────────────────────────
const allImages = computed(() => {
  const list: string[] = []
  if (event.value?.coverImageUrl) {
    list.push(event.value.coverImageUrl)
  }
  if (event.value?.galleryUrls) {
    event.value.galleryUrls.forEach((url: string) => {
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
  currentSlide.value
    = currentSlide.value === 0
      ? allImages.value.length - 1
      : currentSlide.value - 1
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const handleTouchStart = (e: TouchEvent) => {
  if (e.changedTouches && e.changedTouches[0]) {
    touchStartX.value = e.changedTouches[0].screenX
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (e.changedTouches && e.changedTouches[0]) {
    touchEndX.value = e.changedTouches[0].screenX
  }
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
  <section class="admin-preview">
    <!-- Admin Preview Header Bar -->
    <header class="admin-preview__bar">
      <div>
        <span class="ap-eyebrow">Draft preview</span>
        <h1>{{ event.title }}</h1>
        <p class="admin-preview__meta">
          <span
            class="badge"
            :class="formSnapshot.isPublished ? 'badge-green' : 'badge-gray'"
          >
            {{ formSnapshot.isPublished ? 'Published' : 'Draft' }}
          </span>
          <code>/events/{{ event.slug }}</code>
        </p>
      </div>
      <div class="admin-preview__actions">
        <NuxtLink
          :to="`/admin/events/${row?.id}`"
          class="btn btn-ghost"
        >
          <UIcon name="i-lucide-edit-3" />Edit
        </NuxtLink>
        <NuxtLink
          v-if="formSnapshot.isPublished"
          :to="`/events/${event.slug}`"
          target="_blank"
          class="btn btn-primary"
        >
          <UIcon name="i-lucide-external-link" />Live page
        </NuxtLink>
      </div>
    </header>

    <!-- Canvas wrapping the public page style layout -->
    <div class="admin-preview__canvas">
      <div class="event-detail-page">
        <HeroInner
          :title="event.title"
          :subtitle="event.description"
          :breadcrumbs="breadcrumbs"
        />

        <div class="event-detail-layout container">
          <!-- Main Content -->
          <div class="event-detail-layout__main">
            <MotionWrapper
              variant="fadeUp"
              :delay="100"
            >
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
                <div
                  v-if="allImages.length > 1"
                  class="thumbnail-strip"
                >
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
            <MotionWrapper
              variant="fadeUp"
              :delay="200"
            >
              <div class="event-sidebar-card">
                <div class="event-sidebar-header">
                  <BaseBadge
                    type="advanced"
                    label="NCAT NBTE Event"
                  />
                </div>

                <div class="event-info-panel">
                  <h4 class="event-info-title">
                    Student Admission
                  </h4>
                  <p class="event-info-desc">
                    This activity is organized exclusively for enrolled NCAT students under NBTE.
                  </p>

                  <hr class="event-info-divider">

                  <div class="event-bullet-list">
                    <div class="event-bullet-item">
                      <UIcon
                        name="i-lucide-badge-check"
                        class="bullet-icon"
                      />
                      <span>No registration or signup required.</span>
                    </div>
                    <div class="event-bullet-item">
                      <UIcon
                        name="i-lucide-smile"
                        class="bullet-icon"
                      />
                      <span>Free entry with student ID.</span>
                    </div>
                    <div class="event-bullet-item">
                      <UIcon
                        name="i-lucide-map"
                        class="bullet-icon"
                      />
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
.event-detail-page {
  background-color: var(--color-surface, #fff);
  color: #334155;
}

.event-detail-layout {
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: var(--space-12, 3rem);
  padding: var(--space-12, 3rem) var(--section-padding-x, 2rem);
}

@media (max-width: 1024px) {
  .event-detail-layout {
    grid-template-columns: 1fr;
    gap: var(--space-8, 2rem);
  }
}

.event-gallery-slider {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
  margin-bottom: var(--space-8, 2rem);
}

.slider-viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-xl, 1rem);
  overflow: hidden;
  border: 1px solid var(--color-border, #e2e8f0);
  box-shadow: var(--shadow-xs, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  background-color: var(--color-surface-inset, #f8fafc);
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
  left: var(--space-4, 1rem);
}

.slider-arrow--next {
  right: var(--space-4, 1rem);
}

.thumbnail-strip {
  display: flex;
  gap: var(--space-3, 0.75rem);
  overflow-x: auto;
  padding: var(--space-1, 0.25rem) 0;
  scrollbar-width: thin;
}

.thumbnail-btn {
  padding: 0;
  border: 2px solid transparent;
  border-radius: var(--radius-md, 0.5rem);
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 16 / 9;
  width: 96px;
  flex-shrink: 0;
  background: var(--color-surface-inset, #f8fafc);
  transition: all 0.2s;
}

.thumbnail-btn:hover {
  transform: scale(1.02);
}

.thumbnail-btn.is-active {
  border-color: var(--color-brand-accent, #d4a853);
  box-shadow: var(--shadow-sm, 0 1px 3px 0 rgba(0, 0, 0, 0.1));
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.event-body-section {
  margin-bottom: var(--space-8, 2rem);
}

.event-sidebar-card {
  background-color: var(--color-surface, #fff);
  border: 2px solid var(--color-border, #e2e8f0);
  border-radius: var(--radius-xl, 1rem);
  padding: var(--space-8, 2rem);
  box-shadow: var(--shadow-xs, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  position: sticky;
  top: var(--space-24, 6rem);
}

.event-sidebar-header {
  margin-bottom: var(--space-6, 1.5rem);
}

.event-info-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 0.75rem);
}

.event-info-title {
  font-family: var(--font-display, inherit);
  font-size: var(--text-base, 1rem);
  font-weight: 800;
  color: var(--color-brand-primary, #0a2540);
  margin: 0;
}

.event-info-desc {
  font-family: var(--font-body, inherit);
  font-size: var(--text-sm, 0.875rem);
  color: var(--color-text-muted, #64748b);
  line-height: var(--leading-normal, 1.5);
  margin: 0;
}

.event-info-divider {
  border: 0;
  height: 1px;
  background: var(--color-border, #e2e8f0);
  margin: var(--space-2, 0.5rem) 0;
}

.event-bullet-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 0.75rem);
}

.event-bullet-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2, 0.5rem);
  font-family: var(--font-body, inherit);
  font-size: var(--text-sm, 0.875rem);
  font-weight: 500;
  color: var(--color-text-muted, #64748b);
}

.bullet-icon {
  color: var(--color-brand-secondary, #d4a853);
  font-size: 1.15rem;
  margin-top: 1px;
  flex-shrink: 0;
}

.event-sidebar-cta {
  margin-top: var(--space-8, 2rem);
}

.event-cta-note {
  font-family: var(--font-body, inherit);
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-text-muted, #64748b);
  line-height: var(--leading-normal, 1.5);
  text-align: center;
  margin: 0;
  padding-top: var(--space-4, 1rem);
  border-top: 1px dashed var(--color-border, #e2e8f0);
}
</style>
