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
  max-height: 500px;
  background: radial-gradient(circle at 10% 10%, rgba(2, 86, 255, 0.153) 20%, transparent 30%), radial-gradient(circle at 100% 100%, rgba(1, 156, 154, 0.153) 10%, transparent 10%);
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-top: 72px; /* AppNavbar height offset */
}

.hero-inner__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 254, 251, 0.94) 0%, rgba(247, 242, 234, 0.96) 100%);
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
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.hero-inner__breadcrumbs-list a:hover,
.hero-inner__breadcrumbs-list a[aria-current="page"] {
  color: var(--color-brand-accent);
}

.hero-inner__breadcrumbs-separator {
  color: var(--color-border);
  margin-right: var(--space-2);
}

.hero-inner__content {
  max-width: 800px;
}

.hero-inner__title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-text-dark);
  margin-top: 0;
  margin-bottom: var(--space-3);
  line-height: var(--leading-tight);
}

.hero-inner__subtitle {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  margin: 0;
  max-width: 600px;
}
</style>
