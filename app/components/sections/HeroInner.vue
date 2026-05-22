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
      <nav v-if="breadcrumbs && breadcrumbs.length > 0" class="hero-inner__breadcrumbs" aria-label="Breadcrumb">
        <ol class="hero-inner__breadcrumbs-list">
          <li>
            <NuxtLink to="/">Home</NuxtLink>
          </li>
          <li v-for="(crumb, index) in breadcrumbs" :key="index">
            <span class="hero-inner__breadcrumbs-separator">/</span>
            <NuxtLink :to="crumb.to" :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined">
              {{ crumb.label }}
            </NuxtLink>
          </li>
        </ol>
      </nav>

      <div class="hero-inner__content">
        <MotionWrapper variant="fadeUp" :delay="100" :duration="0.6">
          <h1 class="hero-inner__title">
            {{ title }}
          </h1>
        </MotionWrapper>
        
        <MotionWrapper v-if="subtitle" variant="fadeUp" :delay="300" :duration="0.6">
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
  max-height: 500px;
  background-color: var(--color-brand-primary);
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-top: 72px; /* AppNavbar height offset */
}

.hero-inner__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--color-primary-900) 0%, rgba(10, 37, 64, 0.95) 100%);
  z-index: 1;
}

.hero-inner__container {
  position: relative;
  z-index: 2;
  width: 100%;
}

.hero-inner__breadcrumbs {
  margin-bottom: var(--space-4);
}

.hero-inner__breadcrumbs-list {
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

.hero-inner__breadcrumbs-list a {
  color: rgba(245, 245, 240, 0.6);
  text-decoration: none;
  transition: color 0.2s;
}

.hero-inner__breadcrumbs-list a:hover,
.hero-inner__breadcrumbs-list a[aria-current="page"] {
  color: var(--color-brand-accent);
}

.hero-inner__breadcrumbs-separator {
  color: rgba(245, 245, 240, 0.3);
  margin-right: var(--space-2);
}

.hero-inner__content {
  max-width: 800px;
}

.hero-inner__title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: #ffffff;
  margin-top: 0;
  margin-bottom: var(--space-3);
  line-height: var(--leading-tight);
}

.hero-inner__subtitle {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: rgba(245, 245, 240, 0.8);
  line-height: var(--leading-relaxed);
  margin: 0;
  max-width: 600px;
}
</style>
