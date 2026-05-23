<script setup lang="ts">
import BaseBadge from '~/components/ui/BaseBadge.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'

interface Program {
  title: string
  subtitle?: string
  coverImageUrl: string
  durationWeeks: number
  level: 'beginner' | 'intermediate' | 'advanced'
}

defineProps<{
  program: Program
}>()
</script>

<template>
  <section class="hero-program" aria-label="Program Info">
    <div class="hero-program__background">
      <NuxtImg
        :src="program.coverImageUrl || '/og/default.jpg'"
        :alt="program.title"
        class="hero-program__image"
        priority
        width="1920"
        height="800"
        format="webp"
      />
      <div class="hero-program__overlay" />
    </div>

    <div class="hero-program__container container">
      <!-- Breadcrumbs -->
      <nav class="hero-program__breadcrumbs" aria-label="Breadcrumb">
        <ol class="hero-program__breadcrumbs-list">
          <li>
            <NuxtLink to="/">Home</NuxtLink>
          </li>
          <li>
            <span class="hero-program__breadcrumbs-separator">/</span>
            <NuxtLink to="/programs">Programs</NuxtLink>
          </li>
          <li>
            <span class="hero-program__breadcrumbs-separator">/</span>
            <span class="active-crumb">{{ program.title }}</span>
          </li>
        </ol>
      </nav>

      <div class="hero-program__content">
        <MotionWrapper variant="fadeUp" :delay="100" :duration="0.6">
          <div class="hero-program__meta">
            <BaseBadge :type="program.level" :label="program.level" />
            <span class="hero-program__duration">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="duration-icon">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {{ program.durationWeeks }} weeks duration
            </span>
          </div>
        </MotionWrapper>

        <MotionWrapper variant="fadeUp" :delay="200" :duration="0.6">
          <h1 class="hero-program__title">
            {{ program.title }}
          </h1>
        </MotionWrapper>

        <MotionWrapper v-if="program.subtitle" variant="fadeUp" :delay="350" :duration="0.6">
          <p class="hero-program__subtitle">
            {{ program.subtitle }}
          </p>
        </MotionWrapper>

        <MotionWrapper variant="fadeUp" :delay="500" :duration="0.6">
          <div class="hero-program__actions">
            <BaseButton variant="accent" size="lg" to="/contact">
              Enroll in Program
            </BaseButton>
            <BaseButton variant="secondary" size="lg" to="/contact" class="btn-sec-inverse">
              Inquire Now
            </BaseButton>
          </div>
        </MotionWrapper>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-program {
  position: relative;
  height: 65vh;
  min-height: 480px;
  max-height: 720px;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-top: 72px; /* Header spacing */
}

.hero-program__background {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.hero-program__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-program__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(23, 23, 23, 0.18) 0%, rgba(23, 23, 23, 0.78) 100%);
  z-index: 2;
}

.hero-program__container {
  position: relative;
  z-index: 3;
  width: 100%;
}

.hero-program__breadcrumbs {
  margin-bottom: var(--space-6);
}

.hero-program__breadcrumbs-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  list-style: none;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.hero-program__breadcrumbs-list a {
  color: var(--color-text-light);
  text-decoration: none;
  transition: color 0.2s;
}

.hero-program__breadcrumbs-list a:hover {
  color: var(--color-brand-accent);
}

.hero-program__breadcrumbs-separator {
  color: var(--color-text-light);
  margin-right: var(--space-2);
}

.active-crumb {
  color: var(--color-brand-accent);
}

.hero-program__content {
  max-width: 800px;
}

.hero-program__meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.hero-program__duration {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-light);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.duration-icon {
  color: var(--color-brand-accent);
}

.hero-program__title {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 800;
  color: var(--color-surface-muted);
  margin-top: 0;
  margin-bottom: var(--space-3);
  line-height: var(--leading-tight);
}

.hero-program__subtitle {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  color: var(--color-text-light);
  line-height: var(--leading-relaxed);
  margin-top: 0;
  margin-bottom: var(--space-8);
  max-width: 680px;
}

.hero-program__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.btn-sec-inverse {
  color: var(--color-surface-muted) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}

.btn-sec-inverse:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
  border-color: var(--color-surface-muted) !important;
}
</style>
