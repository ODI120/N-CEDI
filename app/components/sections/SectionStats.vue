<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import CounterAnimate from '~/components/motion/CounterAnimate.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'

// Placeholder data for the database-driven slider
const gallerySlides = ref([
  { id: 1, image: '/images/student2.jpg', title: 'Robotics Lab', description: 'Students working on advanced robotics and automation.' },
  { id: 2, image: '/images/student3.jpg', title: 'Coding Bootcamp', description: 'Intensive software engineering programs.' },
  { id: 3, image: '/images/student4.jpg', title: 'Aviation Tech', description: 'State of the art aviation training facilities.' }
])

const currentSlide = ref(0)
const isHovered = ref(false)
let slideInterval: ReturnType<typeof setInterval> | null = null

// Touch state for swipe support
const touchStartX = ref(0)
const touchEndX = ref(0)

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % gallerySlides.value.length
}

const prevSlide = () => {
  currentSlide.value = currentSlide.value === 0 
    ? gallerySlides.value.length - 1 
    : currentSlide.value - 1
}

const goToSlide = (index: number) => {
  currentSlide.value = index
  resetInterval()
}

const startInterval = () => {
  if (slideInterval) return
  slideInterval = setInterval(() => {
    if (document.visibilityState === 'visible' && !isHovered.value) {
      nextSlide()
    }
  }, 7000)
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
  touchStartX.value = e.changedTouches[0].screenX
  pauseInterval()
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
  startInterval()
}

const handleVisibilityChange = () => {
  if (document.hidden) {
    pauseInterval()
  } else {
    startInterval()
  }
}

onMounted(() => {
  startInterval()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  pauseInterval()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

interface StatItem {
  value: number
  prefix?: string
  suffix?: string
  label: string
}

interface SectionStatsProps {
  stats?: StatItem[]
  title?: string
  eyebrow?: string
}

// Fallback statistics if none are provided
const defaultStats: StatItem[] = [
  { value: 1200, suffix: '+', label: 'Trained Graduates' },
  { value: 85, suffix: '%', label: 'Employment Rate' },
  { value: 45, suffix: '+', label: 'Partner Startups' },
  { value: 12, label: 'Tech & Vocational Labs' }
]

withDefaults(defineProps<SectionStatsProps>(), {
  stats: () => [],
  title: 'Life at N-CEDI & Our Impact',
  eyebrow: 'Experience'
})
</script>

<template>
  <section class="section-stats">
    <div class="container">
      <div v-if="title || eyebrow" class="section-stats__header">
        <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
        <h2 v-if="title" class="section-stats__title">{{ title }}</h2>
      </div>

      <!-- Bento Grid Section (Images Only) -->
      <div class="bento-container">
        <div class="bento-grid">
          <!-- Left Tall Card (NCAT Ad) -->
          <MotionWrapper variant="fadeUp" :delay="0" :duration="0.6" class="bento-card bento-card--left bento-card--ncat-ad">
            <div class="ncat-ad">
              <div class="ncat-ad__bg-glow"></div>

              <div class="ncat-ad__center">
                <img src="/images/ncatlogo.png" alt="NCAT Logo" class="ncat-ad__logo" />
                <h5>Nigerian college of aviation and technology zaria</h5>
              </div>

              <div class="ncat-ad__top">
                <h3 class="ncat-ad__headline">Elevate your future in aviation with <span class="bold">NCAT</span> </h3>
              </div>
              
              <img src="/images/plane-png.png" alt="NCAT Logo" class="ncat-ad__image" />

              <div class="ncat-ad__bottom">
                <button class="ncat-ad__btn">
                  Apply Now!
                </button>
              </div>
            </div>
          </MotionWrapper>

          <!-- Top Right Wide Card (Slider) -->
          <MotionWrapper variant="fadeUp" :delay="100" :duration="0.6" class="bento-card bento-card--top-right">
            <div 
              class="bento-slider" 
              role="region" 
              aria-roledescription="carousel" 
              aria-label="Student activities gallery"
              @mouseenter="isHovered = true; pauseInterval()" 
              @mouseleave="isHovered = false; startInterval()"
              @focusin="pauseInterval()"
              @focusout="startInterval()"
              @touchstart="handleTouchStart"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
            >
              <div 
                class="bento-slider__track"
                :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
                aria-live="polite"
              >
                <div 
                  v-for="(slide, index) in gallerySlides" 
                  :key="slide.id" 
                  class="bento-slider__slide"
                  role="group"
                  aria-roledescription="slide"
                  :aria-label="`${index + 1} of ${gallerySlides.length}`"
                  :aria-hidden="currentSlide !== index"
                >
                  <img :src="slide.image" :alt="slide.title" class="bento-image" loading="lazy" />
                  <div class="bento-slider__overlay" :class="{ 'is-visible': currentSlide === index }">
                    <h4 class="bento-slider__title">{{ slide.title }}</h4>
                    <p class="bento-slider__desc">{{ slide.description }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Professional Pagination with Keyboard Support -->
              <div class="bento-slider__pagination" role="tablist" aria-label="Slides">
                <button 
                  v-for="(slide, index) in gallerySlides" 
                  :key="`dot-${slide.id}`"
                  role="tab"
                  :aria-selected="currentSlide === index"
                  :aria-label="`Go to slide ${index + 1}: ${slide.title}`"
                  class="bento-slider__dot"
                  :class="{ 'is-active': currentSlide === index }"
                  @click.stop="goToSlide(index)"
                  @keydown.enter.prevent="goToSlide(index)"
                  @keydown.space.prevent="goToSlide(index)"
                ></button>
              </div>
            </div>
          </MotionWrapper>

          <!-- Bottom Middle Square Card -->
          <MotionWrapper variant="fadeUp" :delay="200" :duration="0.6" class="bento-card bento-card--bottom-mid">
            <img src="/images/student3.jpg" alt="Coding hands" class="bento-image" />
          </MotionWrapper>

          <!-- Bottom Right Square Card -->
          <MotionWrapper variant="fadeUp" :delay="300" :duration="0.6" class="bento-card bento-card--bottom-right">
            <img src="/images/student4.jpg" alt="Confident student" class="bento-image" />
          </MotionWrapper>
        </div>
      </div>

      <!-- Completely Redesigned Stats Showcase -->
      <div class="stats-showcase">
        <div class="stats-showcase__glow"></div>
        <div class="stats-showcase__grid">
          <div
            v-for="(item, index) in (stats.length > 0 ? stats : defaultStats)"
            :key="index"
            class="stats-showcase__card"
          >
            <MotionWrapper variant="fadeUp" :delay="index * 150" :duration="0.8">
              <div class="stats-showcase__number-wrapper">
                <CounterAnimate
                  :target="item.value"
                  :prefix="item.prefix || ''"
                  :suffix="item.suffix || ''"
                  class="stats-showcase__number"
                />
              </div>
              
              <p class="stats-showcase__label">
                {{ item.label }}
              </p>
            </MotionWrapper>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-stats {
  background-color: var(--color-surface);
  padding-top: var(--section-padding-x);
  /* padding-bottom: var(--space-8); */
}

.section-stats__header {
  text-align: center;
  margin-bottom: var(--space-12);
}

.section-stats__title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 900;
  color: var(--color-brand-primary);
  margin-top: var(--space-2);
  letter-spacing: -0.02em;
}

/* ─── Bento Grid Styles ─── */
.bento-container {
  margin-bottom: var(--space-24);
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 360px);
  gap: var(--space-6);
  padding: var(--space-8);
  background-color: #6B59FF10;
  border: 1px solid var(--color-border);
  border-radius: 16px;
}

@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
  }
  
  .bento-card--left {
    grid-column: 1 / -1;
    grid-row: auto;
    min-height: 400px;
  }
  
  .bento-card--top-right {
    grid-column: 1 / -1;
    grid-row: auto;
    min-height: 360px;
  }
  
  .bento-card--bottom-mid,
  .bento-card--bottom-right {
    grid-column: span 1;
    min-height: 360px;
  }
}

@media (max-width: 640px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
  
  .bento-card--bottom-mid,
  .bento-card--bottom-right {
    grid-column: 1 / -1;
  }
}

/* Base Bento Card */
.bento-card {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  background-color: var(--color-surface-muted); /* Fallback */
}

/* Image styles for the bento cards */
.bento-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.bento-card:hover .bento-image {
  transform: scale(1.05);
}

/* Grid Layout Positions */
.bento-card--left {
  grid-column: 1;
  grid-row: 1 / 3;
}

.bento-card--top-right {
  grid-column: 2 / 4;
  grid-row: 1;
}

.bento-card--bottom-mid {
  grid-column: 2;
  grid-row: 2;
}

.bento-card--bottom-right {
  grid-column: 3;
  grid-row: 2;
}

/* NCAT Ad Premium Styles (Huel/Factor Inspired) */
.bento-card--ncat-ad {
  background-color: #008DD1;
  background-image: 
    radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px),
    linear-gradient(145deg, rgba(10, 10, 11, 0.8) 0%, rgba(22, 22, 26, 0.8) 100%);
  background-size: 32px 32px, 100% 100%;
  border: 1px solid rgba(255, 255, 255, 0.03);
  display: flex;
  overflow: hidden;
  position: relative;
}

.ncat-ad {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-8) var(--space-6);
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 2;
  text-align: center;
}

/* Subtle background glow mimicking the reference ad glow */
.ncat-ad__bg-glow {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  z-index: -1;
  pointer-events: none;
}

.ncat-ad__top {
  margin-bottom: var(--space-6);
  width: 100%;
}

.ncat-ad__headline {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.2rem, 3vw, 2.5rem);
  font-weight: 900;
  color: #ffffff;
  line-height: 1.3;
}
.ncat-ad__headline .bold{
  color: #FBCF03;
}

.ncat-ad__subheadline {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(2rem, 3vw, 3rem);
  color: #ffffff;
  font-weight: 800;
  line-height: 1.4;
}

.ncat-ad__image {
  max-width: 100%;
  max-height: auto;
  object-fit: contain;
  margin: 0px;
  filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.5));
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.ncat-ad__subheadline-light {
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
}

.ncat-ad__center {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  gap: 10px;
  background: linear-gradient(145deg, #008DD1 0%, #008DD1 0%);
  border-radius: 15px;
  padding: 10px;  
  backdrop-filter: blur(5px) saturate(180%);
  -webkit-backdrop-filter: blur(5px) saturate(180%);
  
}
.ncat-ad__center h5{  
  font-family: var(--font-display);
  color: #fff;
  font-weight: 700;
  margin-bottom: var(--space-2);
  text-transform: uppercase;  
  text-align: left;
  font-size: clamp(13px, 2vw, 15px);
  
}

.ncat-ad__logo {
  max-width: 18%;
  max-height: auto;
  object-fit: contain;
  margin: 0px;
  filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.5));
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  
}

.ncat-ad__bottom {
  margin-top: var(--space-8);
  width: 100%;
  display: flex;
  justify-content: center;
}

.ncat-ad__btn {
  background-color: #008DD1;
  color: #ffffff;
  font-family: var(--font-body);
  font-weight: 800;
  font-size: 1.125rem;
  padding: 0.875rem 2.5rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  letter-spacing: -0.01em;
}

.ncat-ad__btn:hover {
  transform: scale(1.05);
}
/* ─── Bento Slider Styles ─── */
.bento-slider {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
}

.bento-slider__track {
  display: flex;
  height: 100%;
  transition: transform 1.2s cubic-bezier(0.65, 0, 0.35, 1);
  will-change: transform;
  backface-visibility: hidden;
  touch-action: pan-y pinch-zoom;
}

.bento-slider__slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.bento-slider__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
  padding: var(--space-8);
  padding-bottom: var(--space-12); /* leave room for pagination */
  color: white;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 70%;
  z-index: 5;
  pointer-events: none;
}

@media (hover: hover) {
  .bento-slider:hover .bento-slider__overlay,
  .bento-slider:focus-within .bento-slider__overlay {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (hover: none) {
  .bento-slider__overlay.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
}

.bento-slider__title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.bento-slider__desc {
  font-family: var(--font-body);
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

/* Pagination */
.bento-slider__pagination {
  position: absolute;
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--space-2);
  z-index: 10;
}

.bento-slider__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.bento-slider__dot:hover,
.bento-slider__dot:focus-visible {
  background: rgba(255, 255, 255, 0.8);
  outline: none;
}

.bento-slider__dot:focus-visible {
  box-shadow: 0 0 0 2px var(--color-brand-primary);
}

.bento-slider__dot.is-active {
  background: white;
  transform: scale(1.3);
}

/* ─── NEW: Completely Redesigned Premium Stats ─── */
.stats-showcase {
  position: relative;
  background-color: #008DD1;
  background-image: 
    radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px),
    linear-gradient(145deg, rgba(10, 10, 11, 0.8) 0%, rgba(22, 22, 26, 0.8) 100%);
  background-size: 32px 32px, 100% 100%;
  border-radius: 16px;
  padding: var(--space-8) var(--space-8);
  overflow: hidden;
  
}

/* Glowing ambient orb behind the stats */
.stats-showcase__glow {
  position: absolute;
  top: -50%;
  left: 20%;
  width: 60%;
  height: 200%;
  background: radial-gradient(ellipse at center, rgba(107, 89, 255, 0.15) 0%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 1;
}

.stats-showcase__grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8);
}

@media (max-width: 1024px) {
  .stats-showcase__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-12) var(--space-8);
  }
}

@media (max-width: 640px) {
  .stats-showcase__grid {
    grid-template-columns: 1fr;
    gap: var(--space-12);
  }
}

.stats-showcase__card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-showcase__number-wrapper {
  margin-bottom: var(--space-4);
}

/* Gradient Text for the Numbers */
.stats-showcase__number {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
  background: linear-gradient(to right, #ffffff 20%, #a5a5a5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-showcase__label {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.7);
  margin: 0;

}
</style>
