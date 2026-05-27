<script setup lang="ts">
import MotionWrapper from '~/components/motion/MotionWrapper.vue'

interface Breadcrumb {
  label: string
  to: string
}

interface HeroInnerProps {
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
}

withDefaults(defineProps<HeroInnerProps>(), {
  subtitle: undefined,
  breadcrumbs: () => []
})
</script>

<template>
  <section class="hero-inner">
    <div class="hero-inner__overlay" />

    <div class="hero-inner__container container">
      <!-- Breadcrumbs -->
      <nav
        v-if="breadcrumbs && breadcrumbs.length > 0"
        class="hero-inner__breadcrumbs"
        aria-label="Breadcrumb"
      >
        <ol class="hero-inner__breadcrumbs-list">
          <li>
            <NuxtLink to="/">Home</NuxtLink>
          </li>
          <li
            v-for="(crumb, index) in breadcrumbs"
            :key="index"
          >
            <span class="hero-inner__breadcrumbs-separator">/</span>
            <NuxtLink
              :to="crumb.to"
              :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined"
            >
              {{ crumb.label }}
            </NuxtLink>
          </li>
        </ol>
      </nav>

      <div class="hero-inner__content">
        <MotionWrapper
          variant="fadeUp"
          :delay="100"
          :duration="0.6"
        >
          <h1 class="hero-inner__title">
            {{ title }}
          </h1>
        </MotionWrapper>

        <MotionWrapper
          v-if="subtitle"
          variant="fadeUp"
          :delay="300"
          :duration="0.6"
        >
          <p class="hero-inner__subtitle">
            {{ subtitle }}
          </p>
        </MotionWrapper>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-inner {
  position: relative;
  height: 45vh;
  min-height: 320px;
  max-height: 450px;
  background: #0a0e17;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-top: 72px; /* AppNavbar height offset */
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.hero-inner__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-image:
    /* Grid pattern */
    linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    /* Radial gradients for depth */
    radial-gradient(circle at 15% 20%, rgba(107, 89, 255, 0.12) 0%, transparent 40%),
    radial-gradient(circle at 85% 85%, rgba(1, 156, 154, 0.08) 0%, transparent 35%);
  background-size:
    60px 60px,
    60px 60px,
    auto,
    auto;
  pointer-events: none;
}

.hero-inner__container {
  position: relative;
  z-index: 2;
  width: 100%;
}

.hero-inner__breadcrumbs {
  margin-bottom: var(--space-6);
}

.hero-inner__breadcrumbs-list {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  list-style: none;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  padding: 6px 16px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.hero-inner__breadcrumbs-list a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.2s;
}

.hero-inner__breadcrumbs-list a:hover,
.hero-inner__breadcrumbs-list a[aria-current="page"] {
  color: var(--color-brand-accent);
}

.hero-inner__breadcrumbs-separator {
  color: rgba(255, 255, 255, 0.25);
  margin-right: var(--space-2);
}

.hero-inner__content {
  max-width: 800px;
}

.hero-inner__title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 900;
  color: var(--color-text-light);
  margin-top: 0;
  margin-bottom: var(--space-4);
  line-height: var(--leading-tight);
}

.hero-inner__subtitle {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: rgba(255, 255, 255, 0.7);
  line-height: var(--leading-relaxed);
  margin: 0;
  max-width: 650px;
}
</style>
