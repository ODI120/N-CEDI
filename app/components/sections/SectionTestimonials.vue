<script setup lang="ts">
import { ref, computed } from 'vue'
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
  loading?: boolean
}

const props = withDefaults(defineProps<SectionTestimonialsProps>(), {
  loading: false
})
const activeIndex = ref(0)

const activeTestimonial = computed(() => props.testimonials?.[activeIndex.value])

const selectTestimonial = (index: number) => {
  activeIndex.value = index
}
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

      <!-- Skeleton Loading State -->
      <div v-if="loading && (!testimonials || testimonials.length === 0)" class="testimonials-grid">
        <div class="statement-card-wrapper">
          <div class="statement-card testimonial-skeleton">
            <div class="statement-card__glow"></div>
            <div class="statement-card__content">
              <div class="skeleton-line skeleton-quote-1"></div>
              <div class="skeleton-line skeleton-quote-2"></div>
              <div class="skeleton-line skeleton-author"></div>
            </div>
          </div>
        </div>
        <div class="avatar-selector">
          <div class="avatar-list">
            <div v-for="n in 3" :key="n" class="avatar-skeleton-pulse"></div>
          </div>
        </div>
      </div>

      <div v-else-if="testimonials && testimonials.length > 0" class="testimonials-grid">
        
        <!-- Massive Statement Card -->
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

        <!-- Interactive Avatar Selector -->
        <MotionWrapper variant="fadeUp" :delay="0.2" class="avatar-selector">
          <div class="avatar-list">
            <button
              v-for="(testimonial, index) in testimonials"
              :key="index"
              class="avatar-btn"
              :class="{ 'avatar-btn--active': index === activeIndex }"
              @click="selectTestimonial(index)"
              :aria-label="`View testimonial from ${testimonial.name}`"
            >
              <div class="avatar-btn__ring"></div>
              <NuxtImg
                v-if="testimonial.avatarUrl"
                :src="testimonial.avatarUrl"
                :alt="testimonial.name"
                class="avatar-btn__img"
                width="80"
                height="80"
              />
              <div v-else class="avatar-btn__fallback">
                {{ testimonial.name.charAt(0) }}
              </div>
            </button>
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
  /* font-weight: 900; */
  line-height: var(--leading-tight);
  letter-spacing: -0.03em;
  margin: 0;
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
  color: #775cff25; /* Gold accent with low opacity */
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

.avatar-btn__img, .avatar-btn__fallback {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 2;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  filter: grayscale(100%) opacity(0.6);
}

.avatar-btn__fallback {
  background: var(--color-surface-muted);
  color: var(--color-brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
}

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

.avatar-btn--active .avatar-btn__img,
.avatar-btn--active .avatar-btn__fallback {
  filter: grayscale(0%) opacity(1);
}

.avatar-btn--active .avatar-btn__ring {
  opacity: 1;
  transform: scale(1);
}

/* ─── Transitions ─── */
.fade-blur-enter-active,
.fade-blur-leave-active {
  transition: opacity 0.5s ease, filter 0.5s ease, transform 0.5s ease;
}

.fade-blur-enter-from,
.fade-blur-leave-to {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(10px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
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

/* ─── Skeleton Animations ─── */
@keyframes testimonialPulse {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.55; }
}

.testimonial-skeleton .skeleton-line {
  background: rgba(255, 255, 255, 0.08);
  height: 20px;
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
  animation: testimonialPulse 1.5s infinite ease-in-out;
}

.skeleton-quote-1 { width: 85%; margin-inline: auto; }
.skeleton-quote-2 { width: 65%; margin-inline: auto; }
.skeleton-author { width: 35%; margin-inline: auto; height: 16px !important; margin-top: var(--space-8); }

.avatar-skeleton-pulse {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
  animation: testimonialPulse 1.5s infinite ease-in-out;
}
</style>
