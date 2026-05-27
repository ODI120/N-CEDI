<script setup lang="ts">
import BaseBadge from '~/components/ui/BaseBadge.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import MagneticEl from '~/components/motion/MagneticEl.vue'

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

      <div class="hero-program__grid">
        <div class="hero-program__content">
          <MotionWrapper variant="fadeUp" :delay="100" :duration="0.6">
            <div class="hero-program__meta">
              <span class="hero-program__duration">
                <i class="bi bi-mortarboard duration-icon"></i>
                Continuous ND1 – HND2 Progression
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
              <MagneticEl :strength="0.25">
                <BaseButton variant="accent" size="lg" to="#specifications" class="btn-enroll-hero">
                  Track Selection Guide
                  <i class="bi bi-arrow-down-short ms-1"></i>
                </BaseButton>
              </MagneticEl>
              <MagneticEl :strength="0.25">
                <BaseButton variant="secondary" size="lg" to="/about" class="btn-sec-inverse">
                  N-CEDI Hub Info
                </BaseButton>
              </MagneticEl>
            </div>
          </MotionWrapper>
        </div>

        <!-- Hero Stats Cards Grid -->
        <div class="hero-program__stats-sidebar">
          <MotionWrapper variant="scale" :delay="400" :duration="0.7">
            <div class="quick-specs-grid">
              <div class="quick-spec-card">
                <div class="quick-spec-icon-wrapper duration-icon-bg">
                  <i class="bi bi-calendar-range"></i>
                </div>
                <div class="quick-spec-info">
                  <span class="quick-spec-title">Academic Path</span>
                  <span class="quick-spec-val">ND1 to HND2</span>
                </div>
              </div>

              <div class="quick-spec-card">
                <div class="quick-spec-icon-wrapper level-icon-bg">
                  <i class="bi bi-buildings"></i>
                </div>
                <div class="quick-spec-info">
                  <span class="quick-spec-title">Eligible Schools</span>
                  <span class="quick-spec-val">AMS, ATE, AME</span>
                </div>
              </div>

              <div class="quick-spec-card">
                <div class="quick-spec-icon-wrapper funding-icon-bg">
                  <i class="bi bi-check2-circle"></i>
                </div>
                <div class="quick-spec-info">
                  <span class="quick-spec-title">Enrollment</span>
                  <span class="quick-spec-val highlight-green">Automatic</span>
                </div>
              </div>

              <div class="quick-spec-card">
                <div class="quick-spec-icon-wrapper intake-icon-bg">
                  <i class="bi bi-gear-wide-connected"></i>
                </div>
                <div class="quick-spec-info">
                  <span class="quick-spec-title">Integration</span>
                  <span class="quick-spec-val">Embedded Track</span>
                </div>
              </div>
            </div>
          </MotionWrapper>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-program {
  position: relative;
  height: 72vh;
  min-height: 520px;
  max-height: 800px;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-top: 80px; /* Header spacing */
  background-color: #0b0f19;
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
  animation: heroImageZoom 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes heroImageZoom {
  from {
    transform: scale(1.1);
    filter: brightness(0.7) blur(2px);
  }
  to {
    transform: scale(1);
    filter: brightness(0.6) blur(0);
  }
}

.hero-program__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(11, 15, 25, 0.3) 0%, rgba(11, 15, 25, 0.95) 100%),
              radial-gradient(circle at 80% 20%, rgba(107, 89, 255, 0.15) 0%, transparent 60%);
  z-index: 2;
}

.hero-program__container {
  position: relative;
  z-index: 3;
  width: 100%;
}

.hero-program__breadcrumbs {
  margin-bottom: var(--space-8);
}

.hero-program__breadcrumbs-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  list-style: none;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
}

.hero-program__breadcrumbs-list a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.3s ease;
}

.hero-program__breadcrumbs-list a:hover {
  color: var(--color-brand-accent);
}

.hero-program__breadcrumbs-separator {
  color: rgba(255, 255, 255, 0.3);
  margin-right: var(--space-2);
}

.active-crumb {
  color: var(--color-brand-accent);
}

.hero-program__grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: var(--space-12);
  align-items: center;
}

@media (max-width: 1024px) {
  .hero-program__grid {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
  .hero-program {
    height: auto;
    min-height: auto;
    max-height: none;
    padding-top: 100px;
    padding-bottom: var(--space-12);
  }
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
  font-weight: 700;
  color: #e5e7eb;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  letter-spacing: var(--tracking-wide);
}

.duration-icon {
  color: var(--color-brand-accent);
  font-size: 1.1rem;
}

.hero-program__title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  color: #ffffff;
  margin-top: 0;
  margin-bottom: var(--space-4);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.hero-program__subtitle {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  color: rgba(255, 255, 255, 0.85);
  line-height: var(--leading-relaxed);
  margin-top: 0;
  margin-bottom: var(--space-8);
  max-width: 700px;
}

.hero-program__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: center;
}

.btn-enroll-hero {
  box-shadow: 0 4px 20px rgba(107, 89, 255, 0.4);
  transition: box-shadow 0.3s ease !important;
}

.btn-enroll-hero:hover {
  box-shadow: 0 8px 25px rgba(107, 89, 255, 0.6);
}

.btn-sec-inverse {
  color: #ffffff !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  background-color: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(8px);
}

.btn-sec-inverse:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-color: #ffffff !important;
}

.ms-1 {
  margin-left: 0.25rem;
}

/* ─── Hero Quick Specs Grid ─── */
.quick-specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3),
              inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

@media (max-width: 480px) {
  .quick-specs-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
    padding: var(--space-4);
  }
}

.quick-spec-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-xl);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.quick-spec-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(107, 89, 255, 0.3);
  transform: translateY(-2px);
}

.quick-spec-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.duration-icon-bg {
  background: rgba(107, 89, 255, 0.15);
  color: #9082ff;
}

.level-icon-bg {
  background: rgba(1, 156, 154, 0.15);
  color: #02c9c6;
}

.funding-icon-bg {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.intake-icon-bg {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.quick-spec-info {
  display: flex;
  flex-direction: column;
}

.quick-spec-title {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: rgba(255, 255, 255, 0.5);
}

.quick-spec-val {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 700;
  color: #ffffff;
  margin-top: 1px;
}

.highlight-green {
  color: #10b981 !important;
}
</style>

