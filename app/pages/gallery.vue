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
const showInfo = ref(true)
const showFilmstrip = ref(true)
const isControlsVisible = ref(true)
let idleTimer: ReturnType<typeof setTimeout> | null = null

function resetIdleTimer() {
  isControlsVisible.value = true
  if (idleTimer) clearTimeout(idleTimer)
  // Only auto-dim controls when slideshow is active
  if (!isSlideshowRunning.value || isZoomed.value) return
  idleTimer = setTimeout(() => {
    if (lightboxIndex.value !== null && isSlideshowRunning.value) {
      isControlsVisible.value = false
    }
  }, 4000)
}

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
let slideshowTimer: ReturnType<typeof setInterval> | null = null

function startSlideshow() {
  isSlideshowRunning.value = true
  resetIdleTimer()
  slideshowTimer = setInterval(() => {
    nextItem()
  }, 4000)
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
  isControlsVisible.value = true
  document.body.style.overflow = 'hidden'
  resetIdleTimer()
}

function closeLightbox() {
  stopSlideshow()
  if (idleTimer) clearTimeout(idleTimer)
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
  resetIdleTimer()
}

function nextItem() {
  if (lightboxIndex.value === null) return
  isZoomed.value = false
  lightboxIndex.value = (lightboxIndex.value + 1) % filteredItems.value.length
  resetIdleTimer()
}

function toggleZoom() {
  isZoomed.value = !isZoomed.value
  resetIdleTimer()
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
  resetIdleTimer()
}

// ── Event Handlers ────────────────────────────────────────
function handleKeydown(e: KeyboardEvent) {
  if (lightboxIndex.value === null) return
  resetIdleTimer()
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevItem()
  if (e.key === 'ArrowRight') nextItem()
  if (e.key === ' ') {
    e.preventDefault()
    toggleSlideshow()
  }
  if (e.key === 'f' || e.key === 'F') {
    toggleFullscreen()
  }
  if (e.key === 'z' || e.key === 'Z') {
    toggleZoom()
  }
  if (e.key === 'i' || e.key === 'I') {
    showInfo.value = !showInfo.value
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
  if (idleTimer) clearTimeout(idleTimer)
})

// Auto-scroll active thumbnail into view smoothly without window jitter
const thumbnailContainer = ref<HTMLElement | null>(null)
watch(lightboxIndex, (newVal) => {
  if (newVal === null || !thumbnailContainer.value) return
  setTimeout(() => {
    const container = thumbnailContainer.value
    if (!container) return
    const activeThumb = container.children[newVal] as HTMLElement
    if (activeThumb) {
      const scrollLeft =
        activeThumb.offsetLeft - container.offsetWidth / 2 + activeThumb.offsetWidth / 2
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
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

    <!-- ── Cinematic Large-to-Screen Lightbox Modal ─────────── -->
    <Teleport to="body">
      <div
        v-if="lightboxIndex !== null"
        class="lightbox"
        :class="{
          'lightbox--closing': lightboxClosing,
          'lightbox--fullscreen': isFullscreen,
          'lightbox--zoomed': isZoomed,
          'lightbox--idle': !isControlsVisible,
          'lightbox--filmstrip-hidden': !showFilmstrip || filteredItems.length <= 1,
          'lightbox--info-hidden': !showInfo,
        }"
        role="dialog"
        aria-modal="true"
        aria-label="Cinematic Media Preview"
        @mousemove="resetIdleTimer"
        @touchstart="resetIdleTimer"
        @click.self="closeLightbox"
      >
        <!-- Deep Dark Vignette Backdrop -->
        <div class="lightbox-backdrop" @click="closeLightbox" />

        <!-- Ambient Dynamic Backlight Glow (Philips Ambilight / Cinema glow effect) -->
        <div
          v-if="activeLightboxItem?.mediaType !== 'video' && activeLightboxItem?.mediaUrl"
          :key="activeLightboxItem.id + '-ambient-glow'"
          class="lightbox-ambient-glow"
          :style="{ backgroundImage: `url(${activeLightboxItem.mediaUrl})` }"
          aria-hidden="true"
        />

        <!-- Floating Glass Top Control Bar -->
        <header class="lightbox-hud-bar" :class="{ 'hud-hidden': !isControlsVisible }">
          <div class="hud-pill hud-pill--meta">
            <span class="hud-counter">
              <span class="hud-current">{{ String((lightboxIndex ?? 0) + 1).padStart(2, '0') }}</span>
              <span class="hud-sep">/</span>
              <span class="hud-total">{{ String(filteredItems.length).padStart(2, '0') }}</span>
            </span>
            <span v-if="activeLightboxItem?.categoryName" class="hud-badge">
              {{ activeLightboxItem.categoryName }}
            </span>
          </div>

          <div class="hud-pill hud-pill--actions">
            <!-- Slideshow Button -->
            <button
              type="button"
              class="hud-btn"
              :class="{ 'hud-btn--active': isSlideshowRunning }"
              :title="isSlideshowRunning ? 'Pause Slideshow (Space)' : 'Play Slideshow (Space)'"
              @click="toggleSlideshow"
            >
              <i :class="['bi', isSlideshowRunning ? 'bi-pause-fill' : 'bi-play-fill']"></i>
              <span class="hud-btn-label">{{ isSlideshowRunning ? 'Pause' : 'Play' }}</span>
            </button>

            <!-- Zoom Button -->
            <button
              v-if="activeLightboxItem?.mediaType !== 'video'"
              type="button"
              class="hud-btn"
              :class="{ 'hud-btn--active': isZoomed }"
              :title="isZoomed ? 'Zoom Out (Z)' : 'Zoom In (Z)'"
              @click="toggleZoom"
            >
              <i :class="['bi', isZoomed ? 'bi-zoom-out' : 'bi-zoom-in']"></i>
            </button>

            <!-- Caption / Info Toggle -->
            <button
              type="button"
              class="hud-btn"
              :class="{ 'hud-btn--active': showInfo }"
              title="Toggle Details (I)"
              @click="showInfo = !showInfo"
            >
              <i class="bi bi-info-circle"></i>
            </button>

            <!-- Filmstrip Carousel Toggle -->
            <button
              v-if="filteredItems.length > 1"
              type="button"
              class="hud-btn"
              :class="{ 'hud-btn--active': showFilmstrip }"
              title="Toggle Filmstrip"
              @click="showFilmstrip = !showFilmstrip"
            >
              <i class="bi bi-film"></i>
            </button>

            <!-- Fullscreen Button -->
            <button
              type="button"
              class="hud-btn"
              :class="{ 'hud-btn--active': isFullscreen }"
              title="Toggle Fullscreen (F)"
              @click="toggleFullscreen"
            >
              <i :class="['bi', isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen']"></i>
            </button>

            <!-- Close Button -->
            <button
              type="button"
              class="hud-btn hud-btn--close"
              title="Close Showcase (Esc)"
              @click="closeLightbox"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </header>

        <!-- Main Media Stage (Large-to-Screen) -->
        <main class="lightbox-stage" @click.self="closeLightbox">
          <!-- Left Navigation Arrow -->
          <button
            v-if="filteredItems.length > 1"
            type="button"
            class="stage-nav-arrow arrow-left"
            :class="{ 'hud-hidden': !isControlsVisible }"
            @click.stop="prevItem"
            aria-label="Previous media (Left Arrow)"
          >
            <i class="bi bi-chevron-left"></i>
          </button>

          <!-- Stage Media Viewport -->
          <div
            class="stage-content-container"
            :class="{ 'stage-content-container--zoomed': isZoomed }"
            @click="activeLightboxItem?.mediaType !== 'video' && toggleZoom()"
          >
            <Transition name="media-fade" mode="out-in">
              <div :key="activeLightboxItem?.id" class="stage-media-card" v-if="activeLightboxItem">
                <video
                  v-if="activeLightboxItem.mediaType === 'video'"
                  :src="activeLightboxItem.mediaUrl"
                  controls
                  autoplay
                  class="stage-media-element stage-media-element--video"
                  @click.stop
                />
                <img
                  v-else
                  :src="activeLightboxItem.mediaUrl"
                  :alt="activeLightboxItem.altText || activeLightboxItem.title || 'Showcase media'"
                  class="stage-media-element stage-media-element--image"
                  decoding="async"
                />
              </div>
            </Transition>
          </div>

          <!-- Right Navigation Arrow -->
          <button
            v-if="filteredItems.length > 1"
            type="button"
            class="stage-nav-arrow arrow-right"
            :class="{ 'hud-hidden': !isControlsVisible }"
            @click.stop="nextItem"
            aria-label="Next media (Right Arrow)"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </main>

        <!-- Floating Glass Caption / Details Card -->
        <Transition name="caption-fade">
          <aside
            v-if="showInfo && activeLightboxItem && !isZoomed"
            class="lightbox-caption-overlay"
            :class="{ 'hud-hidden': !isControlsVisible }"
            @click.stop
          >
            <div class="caption-glass-card">
              <div class="caption-meta-row">
                <span v-if="activeLightboxItem.categoryName" class="caption-category-tag">
                  {{ activeLightboxItem.categoryName }}
                </span>
                <span class="caption-format-tag">
                  <i :class="activeLightboxItem.mediaType === 'video' ? 'bi bi-film' : 'bi bi-camera'"></i>
                  {{ activeLightboxItem.mediaType === 'video' ? 'Video' : 'Photo' }}
                </span>
              </div>
              <h2 class="caption-title">{{ activeLightboxItem.title || 'N-CEDI Showcase' }}</h2>
              <p v-if="activeLightboxItem.altText" class="caption-desc">
                {{ activeLightboxItem.altText }}
              </p>
            </div>
          </aside>
        </Transition>

        <!-- Floating Filmstrip Dock -->
        <Transition name="filmstrip-fade">
          <nav
            v-if="showFilmstrip && filteredItems.length > 1 && !isZoomed"
            class="lightbox-filmstrip-dock"
            :class="{ 'hud-hidden': !isControlsVisible }"
            aria-label="Gallery media thumbnails"
            @click.stop
          >
            <div ref="thumbnailContainer" class="filmstrip-track">
              <button
                v-for="(thumb, tIdx) in filteredItems"
                :key="thumb.id"
                type="button"
                class="filmstrip-thumb-btn"
                :class="{ 'filmstrip-thumb-btn--active': tIdx === lightboxIndex }"
                @click.stop="lightboxIndex = tIdx"
                :aria-label="`Slide to ${thumb.title || tIdx + 1}`"
              >
                <img
                  v-if="thumb.mediaType === 'image'"
                  :src="thumb.mediaUrl"
                  class="thumb-image"
                  alt="thumbnail"
                  loading="lazy"
                />
                <div v-else class="thumb-video-placeholder">
                  <i class="bi bi-play-fill"></i>
                </div>
              </button>
            </div>
          </nav>
        </Transition>

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
   Cinematic Lightbox Custom Overlay System
   ═══════════════════════════════════════════════ */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  background: #030407;
  user-select: none;
  overflow: hidden;
  animation: lightbox-fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
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

/* OLED Deep Backdrop with Vignette */
.lightbox-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(ellipse at center, rgba(18, 22, 34, 0.75) 0%, #030407 100%);
  opacity: 0.98;
}

/* Ambient Dynamic Backlight Glow (Philips Ambilight effect) */
.lightbox-ambient-glow {
  position: absolute;
  inset: -10%;
  z-index: 1;
  pointer-events: none;
  background-position: center;
  background-size: cover;
  filter: blur(80px) saturate(200%) brightness(0.65);
  opacity: 0.35;
  transform: translateZ(0);
  will-change: opacity;
  transition: opacity 0.5s ease;
}

/* Floating Glass Top HUD Bar */
.lightbox-hud-bar {
  position: absolute;
  top: 24px;
  left: 28px;
  right: 28px;
  z-index: 30;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s ease;
}

.hud-pill {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: rgba(13, 15, 23, 0.75);
  backdrop-filter: blur(24px) saturate(190%);
  -webkit-backdrop-filter: blur(24px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  padding: 6px 14px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.55);
}

.hud-counter {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 4px;
}

.hud-current {
  color: #ffffff;
  font-weight: 700;
}

.hud-sep {
  color: rgba(255, 255, 255, 0.3);
}

.hud-total {
  color: rgba(255, 255, 255, 0.5);
}

.hud-badge {
  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-brand-accent);
  background: rgba(107, 89, 255, 0.15);
  border: 1px solid rgba(107, 89, 255, 0.3);
  padding: 3px 9px;
  border-radius: var(--radius-full);
  margin-left: 6px;
}

.hud-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.75);
  height: 38px;
  padding: 0 12px;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.hud-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  transform: translateY(-1px);
}

.hud-btn--active {
  background: rgba(107, 89, 255, 0.25) !important;
  color: #ffffff !important;
  border: 1px solid rgba(107, 89, 255, 0.5);
  box-shadow: 0 0 16px rgba(107, 89, 255, 0.4);
}

.hud-btn--close {
  width: 38px;
  padding: 0;
  border-radius: 50%;
  margin-left: 4px;
}

.hud-btn--close:hover {
  background: rgba(239, 68, 68, 0.85);
  color: #ffffff;
  transform: rotate(90deg) scale(1.05);
}

.hud-btn-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Lightbox Main Media Stage (Expansive, Cinematic) */
.lightbox-stage {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  pointer-events: auto;
  overflow: hidden;
}

.stage-content-container {
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 70px 60px 90px 60px;
  cursor: zoom-in;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.stage-content-container--zoomed {
  cursor: zoom-out;
  transform: scale(1.52);
}

@media (max-width: 768px) {
  .stage-content-container--zoomed {
    transform: scale(1.25);
  }
}

.stage-media-card {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: 0 30px 90px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08);
  background: #000;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.stage-media-element {
  max-width: 92vw;
  max-height: calc(100vh - 170px);
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

.lightbox--fullscreen .stage-media-element {
  max-height: 94vh;
  max-width: 97vw;
}

.stage-media-element--video {
  border-radius: var(--radius-xl);
}

/* Floating Navigation Chevrons */
.stage-nav-arrow {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(13, 15, 23, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  z-index: 25;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6);
}

.stage-nav-arrow:hover {
  background: var(--color-brand-accent);
  color: #ffffff;
  border-color: var(--color-brand-accent);
  box-shadow: 0 0 28px rgba(107, 89, 255, 0.65);
}

/* Floating Glass Caption Card */
.lightbox-caption-overlay {
  position: absolute;
  bottom: 104px;
  left: 32px;
  max-width: min(520px, calc(100vw - 64px));
  z-index: 25;
  pointer-events: none;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.lightbox--filmstrip-hidden .lightbox-caption-overlay {
  bottom: 28px;
}

.caption-glass-card {
  pointer-events: auto;
  background: rgba(13, 15, 23, 0.8);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  padding: 14px 20px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.75);
}

.caption-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.caption-category-tag {
  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-brand-accent);
  background: rgba(107, 89, 255, 0.15);
  border: 1px solid rgba(107, 89, 255, 0.3);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.caption-format-tag {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.5);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.caption-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  line-height: 1.35;
}

.caption-desc {
  font-size: 0.86rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.5;
  margin: 6px 0 0 0;
  max-height: 80px;
  overflow-y: auto;
}

/* Floating Bottom Filmstrip Dock */
.lightbox-filmstrip-dock {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  max-width: min(840px, calc(100vw - 48px));
  z-index: 25;
  pointer-events: auto;
  background: rgba(13, 15, 23, 0.78);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  padding: 8px 16px;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.75);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.filmstrip-track {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 2px;
  scroll-behavior: smooth;
}

.filmstrip-track::-webkit-scrollbar {
  display: none;
}

.filmstrip-thumb-btn {
  width: 58px;
  height: 42px;
  border-radius: 8px;
  border: 2px solid transparent;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0.45;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 0;
}

.filmstrip-thumb-btn:hover {
  opacity: 0.85;
  transform: translateY(-2px);
}

.filmstrip-thumb-btn--active {
  opacity: 1 !important;
  border-color: var(--color-brand-accent);
  box-shadow: 0 0 16px rgba(107, 89, 255, 0.7);
  transform: translateY(-3px) scale(1.08);
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-brand-accent);
  font-size: 1.15rem;
  background: rgba(0, 0, 0, 0.5);
}

/* Auto-Dimming Cinema Mode (Fade without positional jumps) */
.hud-hidden {
  opacity: 0 !important;
  pointer-events: none !important;
  transition: opacity 0.35s ease;
}

/* Stable Crossfade Transitions — No scaling or bouncing */
.media-fade-enter-active,
.media-fade-leave-active {
  transition: opacity 0.22s ease;
}

.media-fade-enter-from,
.media-fade-leave-to {
  opacity: 0;
}

.caption-fade-enter-active,
.caption-fade-leave-active {
  transition: opacity 0.22s ease;
}

.caption-fade-enter-from,
.caption-fade-leave-to {
  opacity: 0;
}

.filmstrip-fade-enter-active,
.filmstrip-fade-leave-active {
  transition: opacity 0.22s ease;
}

.filmstrip-fade-enter-from,
.filmstrip-fade-leave-to {
  opacity: 0;
}

/* Responsive Overrides */
@media (max-width: 900px) {
  .lightbox-hud-bar {
    top: 14px;
    left: 14px;
    right: 14px;
  }

  .hud-btn-label {
    display: none;
  }

  .stage-content-container {
    padding: 70px 40px 90px 40px;
  }

  .stage-nav-arrow {
    width: 48px;
    height: 48px;
    font-size: 1.2rem;
  }
}

@media (max-width: 640px) {
  .lightbox-hud-bar {
    top: 10px;
    left: 10px;
    right: 10px;
  }

  .hud-pill {
    padding: 4px 10px;
  }

  .hud-badge {
    display: none;
  }

  .stage-content-container {
    padding: 60px 10px 80px 10px;
  }

  .stage-media-element {
    max-width: 96vw;
    max-height: calc(100vh - 140px);
  }

  .stage-nav-arrow {
    width: 42px;
    height: 42px;
    font-size: 1.1rem;
  }

  .lightbox-caption-overlay {
    bottom: 76px;
    left: 12px;
    right: 12px;
    max-width: 100%;
  }

  .caption-glass-card {
    padding: 10px 14px;
  }

  .caption-title {
    font-size: 1rem;
  }

  .caption-desc {
    display: none;
  }

  .lightbox-filmstrip-dock {
    bottom: 10px;
    padding: 6px 10px;
    max-width: calc(100vw - 20px);
  }

  .filmstrip-thumb-btn {
    width: 44px;
    height: 32px;
  }
}
</style>
