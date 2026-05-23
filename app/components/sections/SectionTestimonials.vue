<script setup lang="ts">
import { ref } from 'vue'
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

const nextTestimonial = () => {
  activeIndex.value = (activeIndex.value + 1) % props.testimonials.length
}

const prevTestimonial = () => {
  activeIndex.value = (activeIndex.value - 1 + props.testimonials.length) % props.testimonials.length
}

const selectTestimonial = (index: number) => {
  activeIndex.value = index
}
</script>

<template>
  <section class="section-testimonials" aria-label="Student Testimonials">
    <div class="container">
      <div class="section-testimonials__header">
        <span class="eyebrow">Student Success</span>
        <h2 class="section-testimonials__title">Voices of N-CEDI Alumni</h2>
      </div>

      <div v-if="testimonials && testimonials.length > 0" class="section-testimonials__slider">
        <div class="section-testimonials__carousel">
          <Transition name="fade-slide" mode="out-in">
            <div :key="activeIndex" class="testimonial-card">
              <!-- Large Gold Accent Quote Icon -->
              <span class="testimonial-card__quote-mark">“</span>
              
              <p class="testimonial-card__quote">
                {{ testimonials[activeIndex].quote }}
              </p>

              <div class="testimonial-card__author">
                <NuxtImg
                  v-if="testimonials[activeIndex].avatarUrl"
                  :src="testimonials[activeIndex].avatarUrl"
                  :alt="testimonials[activeIndex].name"
                  class="testimonial-card__avatar"
                  width="60"
                  height="60"
                />
                <div v-else class="testimonial-card__avatar-fallback">
                  {{ testimonials[activeIndex].name.charAt(0) }}
                </div>
                <div class="testimonial-card__info">
                  <span class="testimonial-card__name">{{ testimonials[activeIndex].name }}</span>
                  <span class="testimonial-card__role">
                    {{ testimonials[activeIndex].role }}
                    <template v-if="testimonials[activeIndex].organization">
                      at {{ testimonials[activeIndex].organization }}
                    </template>
                  </span>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Carousel Navigation Controls -->
        <div class="section-testimonials__controls">
          <button
            class="section-testimonials__btn"
            aria-label="Previous testimonial"
            @click="prevTestimonial"
          >
            ←
          </button>
          
          <div class="section-testimonials__indicators">
            <button
              v-for="(_, index) in testimonials"
              :key="index"
              class="section-testimonials__dot"
              :class="{ 'is-active': index === activeIndex }"
              :aria-label="`Go to testimonial ${index + 1}`"
              @click="selectTestimonial(index)"
            />
          </div>

          <button
            class="section-testimonials__btn"
            aria-label="Next testimonial"
            @click="nextTestimonial"
          >
            →
          </button>
        </div>
      </div>
      
      <div v-else class="section-testimonials__empty">
        No testimonials configured.
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-testimonials {
  background-color: var(--color-surface-muted);
  padding: var(--section-padding-y) 0;
  border-bottom: 1px solid var(--color-border);
}

.section-testimonials__header {
  text-align: center;
  margin-bottom: var(--space-12);
}

.section-testimonials__title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  color: var(--color-brand-primary);
  margin-top: var(--space-2);
}

.section-testimonials__slider {
  max-width: 800px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-testimonials__carousel {
  width: 100%;
  min-height: 280px;
}

.testimonial-card {
  position: relative;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-10) var(--space-8);
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
}

.testimonial-card__quote-mark {
  position: absolute;
  top: var(--space-4);
  left: var(--space-6);
  font-family: var(--font-display);
  font-size: 5rem;
  line-height: 1;
  color: var(--color-brand-accent);
  opacity: 0.15;
  pointer-events: none;
}

.testimonial-card__quote {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  font-style: italic;
  margin-bottom: var(--space-8);
  z-index: 2;
  position: relative;
}

.testimonial-card__author {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.testimonial-card__avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--color-brand-accent);
}

.testimonial-card__avatar-fallback {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background-color: var(--color-surface-inset);
  color: var(--color-brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-lg);
}

.testimonial-card__info {
  display: flex;
  flex-direction: column;
}

.testimonial-card__name {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-brand-primary);
}

.testimonial-card__role {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.section-testimonials__controls {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  margin-top: var(--space-8);
}

.section-testimonials__btn {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-base);
  cursor: pointer;
  background-color: var(--color-surface);
  transition: border-color 0.2s, background-color 0.2s, color 0.2s;
}

.section-testimonials__btn:hover {
  border-color: var(--color-brand-primary);
  background-color: var(--color-surface-muted);
  color: var(--color-brand-primary);
}

.section-testimonials__indicators {
  display: flex;
  gap: var(--space-2);
}

.section-testimonials__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background-color: var(--color-border);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s, background-color 0.2s;
}

.section-testimonials__dot.is-active {
  background-color: var(--color-brand-accent);
  transform: scale(1.3);
}

.section-testimonials__empty {
  text-align: center;
  color: var(--color-text-muted);
  font-style: italic;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
