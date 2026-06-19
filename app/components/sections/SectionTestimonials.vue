<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'

interface Testimonial {
  name: string
  role?: string
  organization?: string
  quote: string
  avatarUrl?: string
}

interface SectionTestimonialsProps {
  testimonials: Testimonial[]
}

const props = defineProps<SectionTestimonialsProps>()

const activeIndex = ref(0)
const isPaused = ref(false)
const progress = ref(0)

const ROTATION_INTERVAL = 5000 // 5s per slide
const PROGRESS_TICK = 50        // update progress every 50ms

const activeTestimonial = computed(() => props.testimonials?.[activeIndex.value])

let rotationTimer: ReturnType<typeof setInterval> | null = null
let progressTimer: ReturnType<typeof setInterval> | null = null

function resetProgress() {
  progress.value = 0
}

function startTimers() {
  stopTimers()
  resetProgress()

  progressTimer = setInterval(() => {
    if (isPaused.value) return
    progress.value = Math.min(progress.value + (PROGRESS_TICK / ROTATION_INTERVAL) * 100, 100)
  }, PROGRESS_TICK)

  rotationTimer = setInterval(() => {
    if (isPaused.value || !props.testimonials?.length) return
    activeIndex.value = (activeIndex.value + 1) % props.testimonials.length
    resetProgress()
  }, ROTATION_INTERVAL)
}

function stopTimers() {
  if (rotationTimer) { clearInterval(rotationTimer); rotationTimer = null }
  if (progressTimer) { clearInterval(progressTimer); progressTimer = null }
}

function selectTestimonial(index: number) {
  activeIndex.value = index
  startTimers() // restart timer on manual selection
}

function pause() { isPaused.value = true }
function resume() { isPaused.value = false }

// Start auto-rotation when testimonials arrive (SSR data already present on mount)
watch(() => props.testimonials?.length, (len) => {
  if (len && len > 1) startTimers()
}, { immediate: true })

onMounted(() => {
  if (props.testimonials?.length > 1) startTimers()
})

onUnmounted(() => {
  stopTimers()
})
</script>

<template>
  <section class="section-testimonials-pro" aria-label="Student Testimonials">
    <div class="container">

      <div class="testimonials-header">
        <MotionWrapper variant="fadeUp">
          <span class="testimonials-eyebrow">Student Success</span>
          <h2 class="testimonials-title">Voices of N-CEDI Alumni</h2>
        </MotionWrapper>
      </div>

      <!-- No testimonials state -->
      <div v-if="!testimonials || testimonials.length === 0" class="testimonials-empty">
        <p>Check back soon for alumni stories.</p>
      </div>

      <!-- Main testimonials carousel -->
      <div
        v-else
        class="testimonials-grid"
        @mouseenter="pause"
        @mouseleave="resume"
        @focusin="pause"
        @focusout="resume"
      >

        <!-- Statement Card -->
        <MotionWrapper variant="fadeUp" :delay="0.1" class="statement-card-wrapper">
          <div class="statement-card">
            <div class="statement-card__glow"></div>

            <div class="statement-card__content">
              <span class="quote-mark" aria-hidden="true">"</span>

              <Transition name="fade-blur" mode="out-in">
                <blockquote :key="activeIndex" class="statement-card__quote">
                  {{ activeTestimonial?.quote }}
                </blockquote>
              </Transition>

              <Transition name="fade-slide" mode="out-in">
                <div :key="activeIndex" class="statement-card__author-info">
                  <span class="author-name">{{ activeTestimonial?.name }}</span>
                  <span class="author-role">
                    {{ activeTestimonial?.role }}
                    <template v-if="activeTestimonial?.organization">
                      <span class="author-org">@ {{ activeTestimonial?.organization }}</span>
                    </template>
                  </span>
                </div>
              </Transition>
            </div>
          </div>
        </MotionWrapper>

        <!-- Avatar Selector -->
        <MotionWrapper variant="fadeUp" :delay="0.2" class="avatar-selector">
          <div class="avatar-list" role="tablist" aria-label="Select testimonial">
            <button
              v-for="(testimonial, index) in testimonials"
              :key="index"
              class="avatar-btn"
              :class="{ 'avatar-btn--active': index === activeIndex }"
              role="tab"
              :aria-selected="index === activeIndex"
              :aria-label="`View testimonial from ${testimonial.name}`"
              @click="selectTestimonial(index)"
            >
              <!-- Progress ring SVG for active avatar -->
              <svg
                v-if="index === activeIndex && testimonials.length > 1"
                class="avatar-btn__progress-ring"
                viewBox="0 0 72 72"
                aria-hidden="true"
              >
                <circle class="progress-ring__track" cx="36" cy="36" r="32" />
                <circle
                  class="progress-ring__fill"
                  cx="36"
                  cy="36"
                  r="32"
                  :style="{ strokeDashoffset: 201 - (201 * progress) / 100 }"
                />
              </svg>
              <div class="avatar-btn__ring"></div>
              <NuxtImg
                v-if="testimonial.avatarUrl"
                :src="testimonial.avatarUrl"
                :alt="testimonial.name"
                class="avatar-btn__img"
                width="64"
                height="64"
                loading="lazy"
              />
              <div v-else class="avatar-btn__fallback">
                {{ testimonial.name.charAt(0) }}
              </div>
            </button>
          </div>

          <!-- Dot indicators -->
          <div v-if="testimonials.length > 1" class="dot-indicators" aria-hidden="true">
            <button
              v-for="(_, i) in testimonials"
              :key="i"
              class="dot"
              :class="{ 'dot--active': i === activeIndex }"
              @click="selectTestimonial(i)"
            />
          </div>
        </MotionWrapper>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════
   TESTIMONIALS SECTION (Dark Mode Pro)
   ═══════════════════════════════════════════════════ */
.section-testimonials-pro {
  position: relative;
  background-color: #6c59ff;
  background-image:
    radial-gradient(rgba(0, 141, 209, 0.07) 1px, transparent 1px),
    linear-gradient(145deg, #0a0e17 0%, #0d1526 50%, #0a1020 100%);
  background-size: 24px 24px, 100% 100%;
  padding: var(--section-padding-y) 0;
  overflow: hidden;
  color: var(--color-text-light);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.testimonials-header {
  text-align: center;
  margin-bottom: var(--space-16);
}

.testimonials-eyebrow {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #8372ff;
  margin-bottom: var(--space-4);
  padding: var(--space-2) var(--space-4);
  background: #8474fa20;
  border: 1px solid #6B59FF20;
  border-radius: var(--radius-full);
}

.testimonials-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: var(--leading-tight);
  letter-spacing: -0.03em;
  margin: 0;
}

/* ─── Empty state ─── */
.testimonials-empty {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  padding: var(--space-12) 0;
  font-size: var(--text-sm);
}

/* ─── Grid Layout ─── */
.testimonials-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-12);
  max-width: 900px;
  margin: 0 auto;
}

/* ─── Massive Statement Card ─── */
.statement-card-wrapper {
  width: 100%;
}

.statement-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid #6B59FF25;
  border-radius: var(--radius-2xl);
  padding: clamp(var(--space-8), 8vw, var(--space-16));
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.statement-card__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, #6B59FF20 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.statement-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quote-mark {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-display);
  font-size: 14rem;
  font-weight: 900;
  line-height: 1;
  color: #775cff25;
  z-index: -1;
  pointer-events: none;
}

.statement-card__quote {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 600;
  color: var(--color-text-light);
  line-height: 1.4;
  letter-spacing: -0.01em;
  margin: 0 0 var(--space-8) 0;
}

.statement-card__author-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.author-name {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-text-light);
}

.author-role {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.author-org {
  color: #FBCF03;
}

/* ─── Avatar Selector ─── */
.avatar-selector {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.avatar-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--space-6);
}

.avatar-btn {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
}

.avatar-btn:hover {
  transform: scale(1.1);
}

.avatar-btn__img,
.avatar-btn__fallback {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 2;
  border: 2px solid transparent;
  transition: all 0.35s ease;
  filter: grayscale(100%) opacity(0.55);
}

.avatar-btn__fallback {
  background: rgba(119, 92, 255, 0.2);
  color: #a89bff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
}

/* Static ring (non-active) */
.avatar-btn__ring {
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border-radius: 50%;
  border: 2px solid #775cff;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1;
}

/* SVG progress ring for active avatar */
.avatar-btn__progress-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  width: calc(100% + 16px);
  height: calc(100% + 16px);
  z-index: 3;
  transform: rotate(-90deg);
  pointer-events: none;
}

.progress-ring__track {
  fill: none;
  stroke: rgba(119, 92, 255, 0.2);
  stroke-width: 3;
  stroke-dasharray: 201;
  stroke-dashoffset: 0;
}

.progress-ring__fill {
  fill: none;
  stroke: #a89bff;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 201;
  stroke-dashoffset: 201;
  transition: stroke-dashoffset 0.05s linear;
}

.avatar-btn--active .avatar-btn__img,
.avatar-btn--active .avatar-btn__fallback {
  filter: grayscale(0%) opacity(1);
}

.avatar-btn--active .avatar-btn__ring {
  opacity: 0; /* hidden when progress ring SVG is shown */
}

/* ─── Dot indicators ─── */
.dot-indicators {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  padding: 0;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.dot--active {
  background: #a89bff;
  width: 20px;
  border-radius: 3px;
}

/* ─── Transitions ─── */
.fade-blur-enter-active,
.fade-blur-leave-active {
  transition: opacity 0.45s ease, filter 0.45s ease, transform 0.45s ease;
}

.fade-blur-enter-from,
.fade-blur-leave-to {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(10px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ─── Responsive ─── */
@media (max-width: 640px) {
  .statement-card {
    padding: var(--space-8) var(--space-6);
  }

  .quote-mark {
    font-size: 8rem;
    top: -20px;
  }

  .avatar-btn {
    width: 48px;
    height: 48px;
  }
}
</style>
