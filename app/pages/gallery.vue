<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import HeroInner from '~/components/sections/HeroInner.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import { usePageSeo } from '~/composables/useSeo'
import { useGalleryDisplayItems } from '~/composables/useGalleryMediaUrl'

usePageSeo({
  title: 'Gallery | N-CEDI - Facilities & Student Work',
  description:
    "View photos and videos of N-CEDI's modern facility labs, students working, and showcase exhibitions.",
})

const { gallery, pending, error, refresh } = useGalleryPage()

const activeFilter = ref('all')
const searchQuery = ref('')
const layoutMode = ref<'masonry' | 'grid'>('masonry')

// Lightbox state
const lightboxIndex = ref<number | null>(null)
const lightboxClosing = ref(false)
const isSlideshowRunning = ref(false)
const isZoomed = ref(false)
const isFullscreen = ref(false)

const galleryItems = computed(() => gallery.value?.items ?? [])
const categoryOptions = computed(() => gallery.value?.categories ?? [])
const fromDatabase = computed(() => gallery.value?.fromDatabase ?? false)

/** Resolve storage refs on SSR + again after hydration (Supabase client URL). */
const displayItems = useGalleryDisplayItems(galleryItems)

const filters = computed(() => {
  const base = [{ label: 'All Media', value: 'all' }]
  for (const cat of categoryOptions.value) {
    base.push({ label: cat.name, value: cat.slug })
  }
  return base
})

// Combined Filter & Search
const filteredItems = computed(() => {
  let items = displayItems.value

  if (activeFilter.value !== 'all') {
    items = items.filter((item) => item.categorySlug === activeFilter.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    items = items.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.altText?.toLowerCase().includes(q) ||
        item.categoryName?.toLowerCase().includes(q),
    )
  }

  return items
})

const breadcrumbs = [{ label: 'Gallery', to: '/gallery' }]

// ── Slideshow Timer ───────────────────────────────────────
let slideshowTimer: any = null

function startSlideshow() {
  isSlideshowRunning.value = true
  slideshowTimer = setInterval(() => {
    nextItem()
  }, 3500)
}

function stopSlideshow() {
  isSlideshowRunning.value = false
  if (slideshowTimer) {
    clearInterval(slideshowTimer)
    slideshowTimer = null
  }
}

function toggleSlideshow() {
  if (isSlideshowRunning.value) {
    stopSlideshow()
  } else {
    startSlideshow()
  }
}

// ── Lightbox Navigation ──────────────────────────────────
function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxClosing.value = false
  isZoomed.value = false
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  stopSlideshow()
  lightboxClosing.value = true
  if (isFullscreen.value) {
    document.exitFullscreen().catch(() => {})
    isFullscreen.value = false
  }
  setTimeout(() => {
    lightboxIndex.value = null
    lightboxClosing.value = false
    document.body.style.overflow = ''
  }, 280)
}

function prevItem() {
  if (lightboxIndex.value === null) return
  isZoomed.value = false
  lightboxIndex.value =
    (lightboxIndex.value - 1 + filteredItems.value.length) % filteredItems.value.length
}

function nextItem() {
  if (lightboxIndex.value === null) return
  isZoomed.value = false
  lightboxIndex.value = (lightboxIndex.value + 1) % filteredItems.value.length
}

function toggleZoom() {
  isZoomed.value = !isZoomed.value
}

function toggleFullscreen() {
  const lbEl = document.querySelector('.lightbox')
  if (!lbEl) return
  
  if (!document.fullscreenElement) {
    lbEl.requestFullscreen()
      .then(() => {
        isFullscreen.value = true
      })
      .catch((err) => {
        console.error('Error enabling fullscreen:', err)
      })
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// ── Event Handlers ────────────────────────────────────────
function handleKeydown(e: KeyboardEvent) {
  if (lightboxIndex.value === null) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevItem()
  if (e.key === 'ArrowRight') nextItem()
  if (e.key === ' ') {
    e.preventDefault()
    toggleSlideshow()
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  stopSlideshow()
})

// Auto-scroll active thumbnail into view
const thumbnailContainer = ref<HTMLElement | null>(null)
watch(lightboxIndex, (newVal) => {
  if (newVal === null || !thumbnailContainer.value) return
  setTimeout(() => {
    const activeThumb = thumbnailContainer.value?.children[newVal] as HTMLElement
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, 50)
})

const activeLightboxItem = computed(() =>
  lightboxIndex.value !== null ? filteredItems.value[lightboxIndex.value] : null,
)
</script>

<template>
  <div class="gallery-page">
    <HeroInner
      title="Media Showcase"
      subtitle="Explore our advanced facility labs, active student collaborations, and showcase design portfolios."
      :breadcrumbs="breadcrumbs"
    />

    <section class="gallery-section" aria-label="N-CEDI Media Gallery">
      <div class="container">
        
        <!-- Controls Toolbar (Search, Filter, Layout toggles) -->
        <div class="gallery-toolbar">
          <!-- Search Block -->
          <div class="gallery-search-wrap">
            <i class="bi bi-search search-icon"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by title, category, keyword..."
              class="gallery-search-input"
              aria-label="Search gallery items"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="search-clear-btn"
              @click="searchQuery = ''"
              aria-label="Clear search"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>

          <!-- Filters Segment Control -->
          <div class="gallery-filters" role="group" aria-label="Filter category">
            <button
              v-for="filter in filters"
              :key="filter.value"
              type="button"
              class="gallery-filter-pill"
              :class="{ 'gallery-filter-pill--active': activeFilter === filter.value }"
              :aria-pressed="activeFilter === filter.value"
              @click="activeFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>

          <!-- Layout & Info Block -->
          <div class="gallery-layout-toggles">
            <span class="gallery-items-count">
              <strong>{{ filteredItems.length }}</strong> displayed
            </span>
            <div class="toggle-group">
              <button
                type="button"
                class="toggle-btn"
                :class="{ 'toggle-btn--active': layoutMode === 'masonry' }"
                title="Masonry Layout"
                @click="layoutMode = 'masonry'"
                aria-label="Toggle masonry layout"
              >
                <i class="bi bi-columns-gap"></i>
              </button>
              <button
                type="button"
                class="toggle-btn"
                :class="{ 'toggle-btn--active': layoutMode === 'grid' }"
                title="Fixed Grid Layout"
                @click="layoutMode = 'grid'"
                aria-label="Toggle fixed grid layout"
              >
                <i class="bi bi-grid-3x3-gap-fill"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="gallery-state-error">
          <div class="error-circle">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h3>Failed to Load Media</h3>
          <p>We encountered a connection issue while fetching the showcase portfolio.</p>
          <button type="button" class="btn-retry" @click="refresh()">
            <i class="bi bi-arrow-clockwise"></i> Try Again
          </button>
        </div>

        <!-- Loading State -->
        <div v-else-if="pending && !galleryItems.length" class="gallery-shimmer-grid">
          <div v-for="n in 9" :key="n" class="shimmer-card">
            <div class="shimmer-img"></div>
            <div class="shimmer-meta">
              <div class="shimmer-line line-title"></div>
              <div class="shimmer-line line-subtitle"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!filteredItems.length && !pending"
          class="gallery-empty-state"
          aria-live="polite"
        >
          <div class="empty-illustration">
            <i class="bi bi-folder-x"></i>
          </div>
          <h3>{{ fromDatabase ? 'No Media Found' : 'Gallery Coming Soon' }}</h3>
          <p v-if="fromDatabase">
            We couldn't find matches for your search criteria. Try modifying your filter choices.
          </p>
          <p v-else>
            Published gallery items from the admin portal will appear here. Add media under Admin → Gallery and mark them as published.
          </p>
          <button
            v-if="fromDatabase && (searchQuery || activeFilter !== 'all')"
            type="button"
            class="btn-reset-filters"
            @click="activeFilter = 'all'; searchQuery = ''"
          >
            Reset Filters
          </button>
        </div>

        <!-- Content Grid (Masonry vs Grid) -->
        <div
          v-else
          :class="[layoutMode === 'masonry' ? 'gallery-masonry' : 'gallery-fixed-grid']"
          role="list"
        >
          <MotionWrapper
            v-for="(item, index) in filteredItems"
            :key="item.id"
            variant="fadeUp"
            :delay="Math.min(index * 45, 300)"
            :duration="0.4"
          >
            <div
              class="premium-card"
              role="listitem"
              tabindex="0"
              :aria-label="`View ${item.title || 'media asset'}`"
              @click="openLightbox(index)"
              @keydown.enter="openLightbox(index)"
              @keydown.space.prevent="openLightbox(index)"
            >
              <div class="card-inner">
                <!-- Media Area -->
                <div class="card-media-wrap">
                  <video
                    v-if="item.mediaType === 'video'"
                    :src="item.mediaUrl"
                    muted
                    preload="metadata"
                    class="card-media-element"
                  />
                  <img
                    v-else
                    :src="item.mediaUrl"
                    :alt="item.altText || item.title || 'Showcase image'"
                    class="card-media-element"
                    loading="lazy"
                    decoding="async"
                  />

                  <!-- Indicators & Badges -->
                  <div class="card-badges">
                    <span v-if="item.mediaType === 'video'" class="badge-play-icon">
                      <i class="bi bi-play-fill"></i>
                    </span>
                    <span v-if="item.categoryName" class="badge-category">
                      {{ item.categoryName }}
                    </span>
                  </div>

                  <!-- Overlay visual mask -->
                  <div class="card-interactive-mask">
                    <div class="mask-expand-icon">
                      <i class="bi bi-fullscreen"></i>
                    </div>
                  </div>
                </div>

                <!-- Footer Card Details -->
                <div class="card-info">
                  <h3 class="card-title">{{ item.title || 'Showcase Asset' }}</h3>
                  <div class="card-footer-meta">
                    <span class="meta-label">
                      <i class="bi bi-eye"></i> View details
                    </span>
                    <span v-if="item.mediaType === 'video'" class="meta-type-tag">
                      <i class="bi bi-film"></i> Video
                    </span>
                    <span v-else class="meta-type-tag">
                      <i class="bi bi-camera"></i> Image
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </MotionWrapper>
        </div>

      </div>
    </section>

    <!-- ── Lightbox Component ───────────────────────────────── -->
    <Teleport to="body">
      <div
        v-if="lightboxIndex !== null"
        class="lightbox"
        :class="{ 'lightbox--closing': lightboxClosing, 'lightbox--fullscreen': isFullscreen }"
        role="dialog"
        aria-modal="true"
        @click.self="closeLightbox"
      >
        <!-- Backdrop -->
        <div class="lightbox-backdrop" @click="closeLightbox" />

        <!-- Control Bar -->
        <div class="lightbox-actions-panel">
          <div class="actions-left">
            <span class="lightbox-index-indicator">
              {{ (lightboxIndex ?? 0) + 1 }} of {{ filteredItems.length }}
            </span>
          </div>
          <div class="actions-right">
            <!-- Slideshow Button -->
            <button
              type="button"
              class="action-icon-btn"
              :class="{ 'action-icon-btn--active': isSlideshowRunning }"
              :title="isSlideshowRunning ? 'Pause Slideshow' : 'Play Slideshow'"
              @click="toggleSlideshow"
            >
              <i :class="['bi', isSlideshowRunning ? 'bi-pause-fill' : 'bi-play-fill']"></i>
            </button>

            <!-- Zoom Button -->
            <button
              v-if="activeLightboxItem?.mediaType !== 'video'"
              type="button"
              class="action-icon-btn"
              :class="{ 'action-icon-btn--active': isZoomed }"
              title="Zoom In/Out"
              @click="toggleZoom"
            >
              <i :class="['bi', isZoomed ? 'bi-zoom-out' : 'bi-zoom-in']"></i>
            </button>

            <!-- Fullscreen Button -->
            <button
              type="button"
              class="action-icon-btn"
              title="Toggle Fullscreen"
              @click="toggleFullscreen"
            >
              <i :class="['bi', isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen']"></i>
            </button>

            <!-- Close Button -->
            <button
              type="button"
              class="action-icon-btn action-close-btn"
              title="Close Showcase"
              @click="closeLightbox"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <!-- Main Media Stage -->
        <div class="lightbox-stage">
          <!-- Left Arrow -->
          <button
            v-if="filteredItems.length > 1"
            type="button"
            class="stage-nav-arrow arrow-left"
            @click.stop="prevItem"
            aria-label="Previous image"
          >
            <i class="bi bi-chevron-left"></i>
          </button>

          <!-- Stage Media Box -->
          <div
            class="stage-content-container"
            :class="{ 'stage-content-container--zoomed': isZoomed }"
            @click="activeLightboxItem?.mediaType !== 'video' && toggleZoom()"
          >
            <div class="stage-media-card" v-if="activeLightboxItem">
              <video
                v-if="activeLightboxItem.mediaType === 'video'"
                :src="activeLightboxItem.mediaUrl"
                controls
                autoplay
                class="stage-media-element"
                @click.stop
              />
              <img
                v-else
                :src="activeLightboxItem.mediaUrl"
                :alt="activeLightboxItem.altText || activeLightboxItem.title || 'Lightbox media'"
                class="stage-media-element"
                decoding="async"
              />
            </div>
          </div>

          <!-- Right Arrow -->
          <button
            v-if="filteredItems.length > 1"
            type="button"
            class="stage-nav-arrow arrow-right"
            @click.stop="nextItem"
            aria-label="Next image"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>

        <!-- Sidebar / Bottom Info Metadata -->
        <div class="lightbox-details-panel" v-if="activeLightboxItem">
          <div class="details-text">
            <span v-if="activeLightboxItem.categoryName" class="details-category-pill">
              {{ activeLightboxItem.categoryName }}
            </span>
            <h2 class="details-title">{{ activeLightboxItem.title || 'Untitled Project' }}</h2>
            <p class="details-description" v-if="activeLightboxItem.altText">
              {{ activeLightboxItem.altText }}
            </p>
          </div>
        </div>

        <!-- Bottom Thumbnail Strip Slider -->
        <div class="lightbox-thumbnails-carousel" v-if="filteredItems.length > 1">
          <div ref="thumbnailContainer" class="thumbnails-inner-strip">
            <button
              v-for="(thumb, tIdx) in filteredItems"
              :key="thumb.id"
              type="button"
              class="carousel-thumb-btn"
              :class="{ 'carousel-thumb-btn--active': tIdx === lightboxIndex }"
              @click.stop="lightboxIndex = tIdx"
              :aria-label="`Slide to ${thumb.title || tIdx + 1}`"
            >
              <img
                v-if="thumb.mediaType === 'image'"
                :src="thumb.mediaUrl"
                class="thumb-img"
                alt="preview thumbnail"
              />
              <div v-else class="thumb-video-fallback">
                <i class="bi bi-play-circle-fill"></i>
              </div>
            </button>
          </div>
        </div>

      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════
   Page Framework & Backgrounds
   ═══════════════════════════════════════════════ */
.gallery-page {
  background-color: #fcfcfd;
  background-image: radial-gradient(rgba(107, 89, 255, 0.15) 1.5px, transparent 1.5px);
  background-size: 24px 24px;
  color: var(--color-text-dark);
  min-height: 100vh;
}

.gallery-section {
  padding: var(--space-12) 0 var(--space-24);
}

/* ═══════════════════════════════════════════════
   Advanced Controls Toolbar
   ═══════════════════════════════════════════════ */
.gallery-toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-2xl);
  padding: var(--space-4) var(--space-6);
  margin-bottom: var(--space-12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

@media (max-width: 1100px) {
  .gallery-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }
}

/* Search Box */
.gallery-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 380px;
  background: #ffffff;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 0 var(--space-4);
  transition: all 0.3s ease;
}

.gallery-search-wrap:focus-within {
  border-color: var(--color-brand-accent);
  box-shadow: 0 0 0 4px rgba(107, 89, 255, 0.15);
}

.search-icon {
  color: var(--color-text-muted);
  font-size: 1.05rem;
  margin-right: var(--space-3);
}

.gallery-search-input {
  width: 100%;
  height: 44px;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text-dark);
  font-family: var(--font-body);
  font-size: var(--text-sm);
}

.gallery-search-input::placeholder {
  color: var(--color-text-placeholder);
}

.search-clear-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--space-1);
  font-size: 1.2rem;
  transition: color 0.2s ease;
}

.search-clear-btn:hover {
  color: var(--color-text-dark);
}

/* Category Filters Segment Control */
.gallery-filters {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-2);
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  padding-bottom: 2px;
}

.gallery-filters::-webkit-scrollbar {
  display: none; /* Safari/Chrome */
}

.gallery-filter-pill {
  font-family: var(--font-body);
  font-size: 0.825rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--color-text-muted);
  background-color: #ffffff;
  border: 1px solid var(--color-border);
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-full);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s ease;
}

.gallery-filter-pill:hover {
  border-color: var(--color-brand-accent);
  color: var(--color-brand-accent);
}

.gallery-filter-pill--active {
  background-color: var(--color-brand-accent);
  border-color: var(--color-brand-accent);
  color: #fff !important;
  box-shadow: 0 4px 15px rgba(107, 89, 255, 0.3);
}

/* Layout switches & counting info */
.gallery-layout-toggles {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  flex-shrink: 0;
}

.gallery-items-count {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.toggle-group {
  display: flex;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 3px;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.toggle-btn:hover {
  color: var(--color-text-dark);
}

.toggle-btn--active {
  background: #ffffff;
  color: var(--color-brand-accent) !important;
  box-shadow: var(--shadow-xs);
}

/* ═══════════════════════════════════════════════
   Showcase Grid layouts
   ═══════════════════════════════════════════════ */
/* True Masonry Layout using CSS columns */
.gallery-masonry {
  column-count: 3;
  column-gap: var(--space-6);
}

@media (max-width: 950px) {
  .gallery-masonry {
    column-count: 2;
    column-gap: var(--space-5);
  }
}

@media (max-width: 600px) {
  .gallery-masonry {
    column-count: 1;
  }
}

/* CSS Grid layout for Uniform option */
.gallery-fixed-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

@media (max-width: 950px) {
  .gallery-fixed-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-5);
  }
}

@media (max-width: 600px) {
  .gallery-fixed-grid {
    grid-template-columns: 1fr;
  }
}

/* ═══════════════════════════════════════════════
   Premium Card Styling
   ═══════════════════════════════════════════════ */
.premium-card {
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  cursor: pointer;
  outline: none;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.4s ease,
    box-shadow 0.4s ease;
  margin-bottom: var(--space-6); /* Masonry bottom gap */
  display: inline-block;
  width: 100%;
}

.gallery-fixed-grid .premium-card {
  margin-bottom: 0; /* Clear grid margins */
}

.premium-card:hover {
  transform: translateY(-5px);
  border-color: rgba(107, 89, 255, 0.3);
  box-shadow: 0 15px 35px rgba(107, 89, 255, 0.08),
    0 5px 15px rgba(0, 0, 0, 0.04);
}

.premium-card:focus-visible {
  border-color: var(--color-brand-accent);
  box-shadow: 0 0 0 4px rgba(107, 89, 255, 0.3);
}

.card-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.card-media-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.2);
}

/* Masonry items have their natural height, fixed grid cards have uniform height */
.gallery-fixed-grid .card-media-wrap {
  aspect-ratio: 16/10;
}

.card-media-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-card:hover .card-media-element {
  transform: scale(1.05);
}

/* Indicators and Overlays */
.card-badges {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
  right: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  z-index: 2;
}

.badge-play-icon {
  width: 32px;
  height: 32px;
  background: var(--color-brand-accent);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  box-shadow: 0 4px 10px rgba(107, 89, 255, 0.4);
}

.badge-category {
  background: rgba(0, 0, 0, 0.6);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.card-interactive-mask {
  position: absolute;
  inset: 0;
  background: rgba(11, 12, 16, 0.4);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.premium-card:hover .card-interactive-mask {
  opacity: 1;
}

.mask-expand-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transform: scale(0.9);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.premium-card:hover .mask-expand-icon {
  transform: scale(1);
  background: rgba(255, 255, 255, 0.25);
}

/* Card details (footer) */
.card-info {
  padding: var(--space-5);
  background: #ffffff;
  border-top: 1px solid var(--color-border);
}

.card-title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-text-dark);
  margin: 0 0 var(--space-3) 0;
  line-height: var(--leading-snug);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.meta-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.meta-type-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  background: rgba(0, 0, 0, 0.04);
  border-radius: var(--radius-sm);
  padding: 2px 6px;
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.03em;
}

/* ═══════════════════════════════════════════════
   State Layouts (Retry, Loading, Empty)
   ═══════════════════════════════════════════════ */
.gallery-state-error {
  text-align: center;
  max-width: 440px;
  margin: var(--space-20) auto;
}

.error-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  border: 1.5px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto var(--space-5);
}

.gallery-state-error h3 {
  font-size: var(--text-lg);
  font-weight: 800;
  margin-bottom: var(--space-2);
}

.gallery-state-error p {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin-bottom: var(--space-6);
  line-height: var(--leading-relaxed);
}

.btn-retry {
  background: var(--color-brand-accent);
  color: #fff;
  border: none;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 700;
  padding: var(--space-3) var(--space-8);
  border-radius: var(--radius-full);
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(107, 89, 255, 0.3);
  transition: all 0.2s ease;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 89, 255, 0.45);
}

/* Empty State */
.gallery-empty-state {
  text-align: center;
  max-width: 440px;
  margin: var(--space-24) auto;
}

.empty-illustration {
  font-size: 3.5rem;
  color: rgba(0, 0, 0, 0.1);
  margin-bottom: var(--space-4);
}

.gallery-empty-state h3 {
  font-size: var(--text-lg);
  font-weight: 800;
  margin-bottom: var(--space-2);
}

.gallery-empty-state p {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-6);
}

.btn-reset-filters {
  background: #ffffff;
  color: var(--color-text-dark);
  border: 1px solid var(--color-border);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset-filters:hover {
  background: var(--color-border);
}

/* Shimmer Skeletal Loading */
.gallery-shimmer-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

@media (max-width: 950px) {
  .gallery-shimmer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .gallery-shimmer-grid {
    grid-template-columns: 1fr;
  }
}

.shimmer-card {
  border-radius: var(--radius-2xl);
  border: 1px solid var(--color-border);
  overflow: hidden;
  background: #ffffff;
}

.shimmer-img {
  width: 100%;
  aspect-ratio: 16/10;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.02) 25%,
    rgba(0, 0, 0, 0.06) 50%,
    rgba(0, 0, 0, 0.02) 75%
  );
  background-size: 200% 100%;
  animation: shimmer-effect 1.6s infinite;
}

.shimmer-meta {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.shimmer-line {
  background: rgba(0, 0, 0, 0.06);
  border-radius: var(--radius-xs);
  height: 12px;
}

.line-title {
  width: 70%;
  height: 14px;
}

.line-subtitle {
  width: 40%;
}

@keyframes shimmer-effect {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ═══════════════════════════════════════════════
   Lightbox Custom Overlay System
   ═══════════════════════════════════════════════ */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  background: #06070a;
  user-select: none;
  animation: lightbox-fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.lightbox--closing {
  animation: lightbox-fade-out 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes lightbox-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes lightbox-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.lightbox-backdrop {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(circle at center, rgba(17, 19, 26, 0.8) 0%, #06070a 100%);
  opacity: 0.95;
}

/* Action Control Bar */
.lightbox-actions-panel {
  height: 72px;
  padding: 0 var(--space-8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.4);
  z-index: 10;
}

@media (max-width: 600px) {
  .lightbox-actions-panel {
    padding: 0 var(--space-4);
  }
}

.lightbox-index-indicator {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: var(--tracking-wider);
}

.actions-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.action-icon-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.65);
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.action-icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.action-icon-btn--active {
  background: rgba(107, 89, 255, 0.15) !important;
  color: var(--color-brand-accent) !important;
}

.action-close-btn {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  margin-left: var(--space-2);
}

.action-close-btn:hover {
  background: rgba(239, 68, 68, 0.8);
  transform: rotate(90deg);
}

/* Lightbox Stage */
.lightbox-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  padding: 0 var(--space-16);
}

@media (max-width: 768px) {
  .lightbox-stage {
    padding: 0 var(--space-4);
  }
}

.stage-nav-arrow {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  cursor: pointer;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.25s ease;
  z-index: 5;
}

.stage-nav-arrow:hover {
  background: var(--color-brand-accent);
  color: #fff;
  border-color: var(--color-brand-accent);
  box-shadow: 0 4px 15px rgba(107, 89, 255, 0.4);
}

.arrow-left:hover { transform: translateX(-4px); }
.arrow-right:hover { transform: translateX(4px); }

@media (max-width: 600px) {
  .stage-nav-arrow {
    width: 44px;
    height: 44px;
    font-size: 1rem;
  }
}

.stage-content-container {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: calc(100% - 160px);
  cursor: zoom-in;
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .stage-content-container {
    max-width: 100%;
  }
}

.stage-content-container--zoomed {
  cursor: zoom-out;
  transform: scale(1.35);
}

@media (max-width: 768px) {
  .stage-content-container--zoomed {
    transform: scale(1.15);
  }
}

.stage-media-card {
  max-width: 100%;
  max-height: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.7);
  background: #000;
  animation: stage-entry 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes stage-entry {
  from { opacity: 0; transform: scale(0.96) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.stage-media-element {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  display: block;
}

/* Lightbox details panel */
.lightbox-details-panel {
  padding: var(--space-4) var(--space-8);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
  display: flex;
  justify-content: center;
  text-align: center;
  z-index: 5;
}

@media (max-width: 600px) {
  .lightbox-details-panel {
    padding: var(--space-3) var(--space-4);
  }
}

.details-text {
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.details-category-pill {
  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-brand-accent);
  background: rgba(107, 89, 255, 0.12);
  border: 1px solid rgba(107, 89, 255, 0.25);
  padding: 3px 10px;
  border-radius: var(--radius-full);
}

.details-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.details-description {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.55);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* Bottom carousel strip slider */
.lightbox-thumbnails-carousel {
  height: 96px;
  background: rgba(0, 0, 0, 0.65);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-6);
  z-index: 10;
}

.thumbnails-inner-strip {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  padding: var(--space-2) 0;
  max-width: 100%;
}

.thumbnails-inner-strip::-webkit-scrollbar {
  height: 4px;
}

.thumbnails-inner-strip::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

.carousel-thumb-btn {
  width: 60px;
  height: 44px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1.5px solid transparent;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  opacity: 0.45;
  transition: all 0.25s ease;
}

.carousel-thumb-btn:hover {
  opacity: 0.85;
}

.carousel-thumb-btn--active {
  opacity: 1 !important;
  border-color: var(--color-brand-accent);
  box-shadow: 0 0 10px rgba(107, 89, 255, 0.4);
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-video-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-brand-accent);
  font-size: 1.15rem;
  background: rgba(0, 0, 0, 0.4);
}
</style>
