<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CounterAnimate from '~/components/motion/CounterAnimate.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'

// ─── Props ────────────────────────────────────────────────────
interface SectionStatsProps {
  title?: string
  eyebrow?: string
}

const props = withDefaults(defineProps<SectionStatsProps>(), {
  title: 'Life at N-CEDI & Our Impact',
  eyebrow: 'Experience',
})

// ─── Live data from Supabase (parallel fetch) ──────────────
const { stats, pending: statsPending } = useHomepageStats()
const { items: galleryItems } = useHomepageGallerySlider(6)

// Normalize gallery items so the template stays readable
const galleryDisplayItems = useGalleryDisplayItems(() => galleryItems.value ?? [])

const gallerySlides = computed(() =>
  galleryDisplayItems.value.map((item) => ({
    id: item.id,
    image: item.mediaUrl,
    title: item.title ?? '',
    description: item.altText ?? '',
  })),
)

// ─── Slider logic ──────────────────────────────────────────────
const currentSlide = ref(0)
const isHovered = ref(false)
let slideInterval: ReturnType<typeof setInterval> | null = null

// Touch state for swipe support
const touchStartX = ref(0)
const touchEndX = ref(0)

const slideCount = computed(() => gallerySlides.value.length)

const nextSlide = () => {
  if (!slideCount.value) return
  currentSlide.value = (currentSlide.value + 1) % slideCount.value
}

const prevSlide = () => {
  if (!slideCount.value) return
  currentSlide.value =
    currentSlide.value === 0
      ? slideCount.value - 1
      : currentSlide.value - 1
}

const goToSlide = (index: number) => {
  currentSlide.value = index
  resetInterval()
}

const startInterval = () => {
  if (slideInterval || !slideCount.value) return
  slideInterval = setInterval(() => {
    if (document.visibilityState === 'visible' && !isHovered.value) {
      nextSlide()
    }
  }, 5000)
}

const pauseInterval = () => {
  if (slideInterval) {
    clearInterval(slideInterval)
    slideInterval = null
  }
}

const resetInterval = () => {
  pauseInterval()
  startInterval()
}

// Touch event handlers for mobile swiping
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.changedTouches[0]?.screenX || 0
  pauseInterval()
}

const handleTouchMove = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0]?.screenX || 0
}

const handleTouchEnd = () => {
  const swipeThreshold = 50
  if (touchStartX.value - touchEndX.value > swipeThreshold) {
    nextSlide()
  } else if (touchEndX.value - touchStartX.value > swipeThreshold) {
    prevSlide()
  }
  startInterval()
}

const handleVisibilityChange = () => {
  if (document.hidden) {
    pauseInterval()
  } else {
    startInterval()
  }
}

// Mouse-tracking glow effect for pro-cards
const handleMouseMove = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  target.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
  target.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
}

onMounted(() => {
  startInterval()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  document.querySelectorAll('.pro-card').forEach((card) => {
    card.addEventListener('mousemove', handleMouseMove as EventListener)
  })
})

onUnmounted(() => {
  pauseInterval()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  document.querySelectorAll('.pro-card').forEach((card) => {
    card.removeEventListener('mousemove', handleMouseMove as EventListener)
  })
})
</script>

<template>
  <section class="section-stats-pro" aria-label="N-CEDI Statistics and Experience">
    <!-- Ambient Background Glows -->
    <div class="stats-bg-glow stats-bg-glow--left"></div>
    <div class="stats-bg-glow stats-bg-glow--right"></div>

    <div class="container">
      <div v-if="props.title || props.eyebrow" class="pro-header">
        <MotionWrapper variant="fadeUp">
          <span v-if="props.eyebrow" class="pro-eyebrow">{{ props.eyebrow }}</span>
          <h2 v-if="props.title" class="pro-title">{{ props.title }}</h2>
        </MotionWrapper>
      </div>

      <!-- Integrated Bento UI Grid -->
      <div class="pro-bento-grid">
        
        <!-- ==========================================
             CARD 1: NCAT ADVERT (Tall Left)
             ========================================== -->
        <MotionWrapper variant="fadeUp" :delay="0.1" :duration="0.8" class="pro-card pro-card--ncat">
          <div class="pro-card__glow"></div>
          <div class="pro-card__content ncat-content">
            
            <div class="ncat-content__top">
              <div class="ncat-content__badge">Sponsor</div>
              <img src="/images/ncatlogo.webp" alt="NCAT Logo" class="ncat-content__logo" width="160" height="160" loading="lazy" />
            </div>

            <div class="ncat-content__middle">
              <h3 class="ncat-content__headline">
                Elevate your future in aviation with <span class="text-accent">NCAT</span>
              </h3>
            </div>
            
            <div class="ncat-content__image-wrapper">
              <img src="/images/plane-png.webp" alt="Airplane" class="ncat-content__plane" width="400" height="231" loading="lazy" />
            </div>

            <div class="ncat-content__bottom">
              <button class="ncat-content__btn">
                <span>Apply Now</span>
                <i class="bi bi-arrow-right-short"></i>
              </button>
            </div>

          </div>
        </MotionWrapper>

        <!-- ==========================================
             CARD 2: DYNAMIC SLIDER (Wide Top Right)
             ========================================== -->
        <MotionWrapper variant="fadeUp" :delay="0.2" :duration="0.8" class="pro-card pro-card--slider">
          <div class="pro-card__glow"></div>
          <div 
            class="slider-content"
            @mouseenter="isHovered = true; pauseInterval()" 
            @mouseleave="isHovered = false; startInterval()"
            @focusin="pauseInterval()"
            @focusout="startInterval()"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <div 
              class="slider-track"
              :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
            >
              <div 
                v-for="(slide, index) in gallerySlides" 
                :key="slide.id" 
                class="slider-slide"
                :aria-hidden="currentSlide !== index"
              >
                <img :src="slide.image" :alt="slide.title" class="slider-image" loading="lazy" />
                <div class="slider-overlay">
                  <div class="slider-overlay__glass">
                    <h4 class="slider-title">{{ slide.title }}</h4>
                    <p class="slider-desc">{{ slide.description }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Modern Pagination -->
            <div class="slider-pagination">
              <button 
                v-for="(slide, index) in gallerySlides" 
                :key="`dot-${slide.id}`"
                class="slider-dot"
                :class="{ 'slider-dot--active': currentSlide === index }"
                @click.stop="goToSlide(index)"
                :aria-label="`Go to slide ${index + 1}`"
              ></button>
            </div>
          </div>
        </MotionWrapper>

        <!-- ==========================================
             CARDS 3, 4, 5, 6: STATS (Glassmorphism)
             ========================================== -->
        <MotionWrapper
          v-for="(stat, index) in stats"
          :key="`stat-${stat.id ?? index}`"
          variant="fadeUp"
          :delay="0.3 + (index * 0.1)"
          :duration="0.8"
          class="pro-card pro-card--stat"
          :class="`stat-${index + 1}`"
        >
          <div class="pro-card__glow"></div>
          <div class="stat-content">
            
            <div class="stat-number-wrapper">
              <span v-if="stat.prefix" class="stat-prefix">{{ stat.prefix }}</span>
              <CounterAnimate
                :target="stat.value"
                :decimals="Number.isInteger(stat.value) ? 0 : 1"
                class="stat-number"
              />
              <span v-if="stat.suffix" class="stat-suffix">{{ stat.suffix }}</span>
            </div>
            <p class="stat-label">{{ stat.label }}</p>
          </div>
        </MotionWrapper>

        <div
          v-if="statsPending && !stats?.length"
          class="pro-card pro-card--stat stat-loading"
          aria-busy="true"
        >
          <div class="stat-content">
            <p class="stat-label">Loading impact stats…</p>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════
   SECTION GLOBALS
   ═══════════════════════════════════════════════════ */
.section-stats-pro {
  position: relative;
  background-color: #6c59ff;
  background-image:
    radial-gradient(rgba(255, 255, 255, 0.10) 1px, transparent 1px),
    linear-gradient(145deg, #0a0e17 0%, #0d1526 50%, #0a1020 100%);
  background-size: 32px 32px, 100% 100%;
  padding: var(--section-padding-y) 0;
  overflow: hidden;
  color: #fff;
}

.stats-bg-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(150px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
}

.stats-bg-glow--left {
  background: radial-gradient(circle, #6B59FF80, transparent 70%);
  top: -100px;
  left: -200px;
}

.stats-bg-glow--right {
  background: radial-gradient(circle, rgba(107, 89, 255, 0.6), transparent 70%);
  bottom: -200px;
  right: -200px;
}

.container {
  position: relative;
  z-index: 1;
}

/* ─── Header ─── */
.pro-header {
  text-align: center;
  margin-bottom: var(--space-16);
}

.pro-eyebrow {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #887af5;
  margin-bottom: var(--space-4);
  padding: var(--space-2) var(--space-4);
  background:   rgba(108, 89, 255, 0.1);
  border: 1px solid rgba(108, 89, 255, 0.2);
  border-radius: var(--radius-full);
}

.pro-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4rem);
  /* font-weight: 900; */
  line-height: var(--leading-tight);
  letter-spacing: -0.03em;
  margin: 0;
}

/* ═══════════════════════════════════════════════════
   BENTO GRID ARCHITECTURE
   ═══════════════════════════════════════════════════ */
.pro-bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(180px, auto);
  gap: var(--space-6);
}

/* Desktop positioning */
.pro-card--ncat {
  grid-column: 1 / 2;
  grid-row: 1 / 3;
}

.pro-card--slider {
  grid-column: 2 / 4;
  grid-row: 1 / 2;
  height: 430px;
}

.stat-1 { grid-column: 4 / 5; grid-row: 1 / 2; }
.stat-2 { grid-column: 2 / 3; grid-row: 2 / 3; }
.stat-3 { grid-column: 3 / 4; grid-row: 2 / 3; }
.stat-4 { grid-column: 4 / 5; grid-row: 2 / 3; }

/* ═══════════════════════════════════════════════════
   PRO CARD COMPONENT (Glassmorphism & Glows)
   ═══════════════════════════════════════════════════ */
.pro-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.5s ease;
}

/* Mouse-tracking border glow effect */
.pro-card::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: inherit;
  padding: 1px;
  background: radial-gradient(
    600px circle at var(--mouse-x, 0) var(--mouse-y, 0),
    #6B59FF90,
    transparent 40%
  );
  -webkit-mask: linear-gradient(#6B59FF 0 0) content-box, linear-gradient(#6B59FF 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none; 
  z-index: 10;
}

/* Mouse-tracking inner background glow */
.pro-card__glow {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(
    800px circle at var(--mouse-x, 0) var(--mouse-y, 0),
    #6B59FF18,
    transparent 40%
  );
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: 0;
}

.pro-card:hover {
  transform: translateY(-4px);
  border-color: transparent; /* Let the ::before gradient take over */
}

.pro-card:hover::before,
.pro-card:hover .pro-card__glow {
  opacity: 1;
}

/* ═══════════════════════════════════════════════════
   NCAT AD SPECIFICS
   ═══════════════════════════════════════════════════ */
.pro-card--ncat {
  background: linear-gradient(145deg, #004d73 0%, #001f33 100%);
  border: 1px solid rgba(0, 141, 209, 0.3);
}

.pro-card--ncat::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 0;
}

.ncat-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--space-8);
}

.ncat-content__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
}

.ncat-content__badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: rgba(255, 255, 255, 0.15);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  backdrop-filter: blur(4px);
}

.ncat-content__logo {
  height: 40px;
  width: auto;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
}

.ncat-content__headline {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 2vw, 2rem);
  font-weight: 800;
  line-height: 1.2;
  margin: 0;
}

.text-accent {
  color: #FBCF03;
}

.ncat-content__image-wrapper {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: var(--space-4) 0;
}

.ncat-content__plane {
  max-width: 120%;
  height: auto;
  transform: scale(1) translateZ(0);
  filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.5));
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.pro-card--ncat:hover .ncat-content__plane {
  transform: scale(1.1) translateY(-10px) rotate(-2deg);
}

.ncat-content__btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  background: #ffffff;
  color: #000;
  border: none;
  border-radius: var(--radius-xl);
  font-weight: 700;
  font-size: var(--text-base);
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease;
}

.ncat-content__btn:hover {
  background: #FBCF03;
  transform: scale(1.02);
}

/* ═══════════════════════════════════════════════════
   SLIDER SPECIFICS
   ═══════════════════════════════════════════════════ */
.slider-content {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 2;
}

.slider-track {
  display: flex;
  height: 100%;
  transition: transform 0.7s cubic-bezier(0.65, 0, 0.35, 1);
}

.slider-slide {
  min-width: 100%;
  position: relative;
  height: 100%;
  overflow: hidden;
}

.slider-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
  transform: scale(1.01); /* Prevent edge bleeding */
}

.pro-card--slider:hover .slider-image {
  transform: scale(1.06);
}

.slider-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--space-6);
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
}

.slider-overlay__glass {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform: translateY(10px);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.pro-card--slider:hover .slider-overlay__glass {
  transform: translateY(0);
  opacity: 1;
}

.slider-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 800;
  margin: 0 0 var(--space-1) 0;
}

.slider-desc {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.slider-pagination {
  position: absolute;
  top: var(--space-6);
  right: var(--space-6);
  display: flex;
  gap: var(--space-2);
  z-index: 10;
  background: rgba(0, 0, 0, 0.3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  backdrop-filter: blur(8px);
}

.slider-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.slider-dot--active {
  width: 24px;
  background: #ffffff;
}

/* ═══════════════════════════════════════════════════
   STAT CARDS SPECIFICS
   ═══════════════════════════════════════════════════ */
.stat-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100%;
  padding: var(--space-8) var(--space-4);
  gap: var(--space-2);
}

.stat-icon {
  font-size: 1.5rem;
  color: rgba(107, 89, 255, 0.85);
  margin-bottom: var(--space-1);
}

.stat-loading {
  grid-column: 2 / 5;
  grid-row: 2 / 3;
  opacity: 0.6;
}

.stat-number-wrapper {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: var(--space-2);
}

.stat-number {
  font-family: var(--font-display);
  font-size: clamp(3rem, 5vw, 5rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-prefix, .stat-suffix {
  font-size: clamp(1.5rem, 2.5vw, 2.5rem);
  font-weight: 700;
  color: #6B59FF;
  margin: 0 var(--space-1);
}

.stat-label {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* ═══════════════════════════════════════════════════
   RESPONSIVE DESIGN
   ═══════════════════════════════════════════════════ */
@media (max-width: 1200px) {
  .pro-bento-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .pro-card--ncat { grid-column: 1 / 2; grid-row: 1 / 3; }
  .pro-card--slider { grid-column: 2 / 4; grid-row: 1 / 2; }
  
  .stat-1 { grid-column: 2 / 3; grid-row: 2 / 3; }
  .stat-2 { grid-column: 3 / 4; grid-row: 2 / 3; }
  .stat-3 { grid-column: 1 / 3; grid-row: 3 / 4; }
  .stat-4 { grid-column: 3 / 4; grid-row: 3 / 4; }
}

@media (max-width: 768px) {
  .pro-bento-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }
  
  .pro-card--ncat { 
    grid-column: 1 / -1; 
    grid-row: auto; 
    min-height: 500px;
  }
  
  .pro-card--slider { 
    grid-column: 1 / -1; 
    grid-row: auto;
    height: auto;
    min-height: 400px;
  }
  
  .stat-1, .stat-2, .stat-3, .stat-4 { 
    grid-column: 1 / -1; 
    grid-row: auto; 
    min-height: 200px;
  }

  .ncat-content__plane {
    max-width: 90%;
  }

  /* Show text on mobile always instead of hover reveal */
  .slider-overlay__glass {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
