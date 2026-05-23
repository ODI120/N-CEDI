<script setup lang="ts">
import CounterAnimate from '~/components/motion/CounterAnimate.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'

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
  title: undefined,
  eyebrow: undefined
})
</script>

<template>
  <section class="section-stats">
    <div class="container">
      <div v-if="title || eyebrow" class="section-stats__header">
        <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
        <h2 v-if="title" class="section-stats__title">{{ title }}</h2>
      </div>

      <div class="section-stats__grid">
        <div
          v-for="(item, index) in (stats.length > 0 ? stats : defaultStats)"
          :key="index"
          class="section-stats__card"
        >
          <MotionWrapper variant="fadeUp" :delay="index * 150" :duration="0.6">
            <div class="section-stats__number-wrapper">
              <CounterAnimate
                :target="item.value"
                :prefix="item.prefix || ''"
                :suffix="item.suffix || ''"
                class="section-stats__number"
              />
            </div>
            <p class="section-stats__label">
              {{ item.label }}
            </p>
          </MotionWrapper>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-stats {
  background-color: var(--color-surface);
  padding: var(--section-padding-y) 0;
  border-bottom: 1px solid var(--color-border);
}

.section-stats__header {
  text-align: center;
  margin-bottom: var(--space-12);
}

.section-stats__title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  color: var(--color-brand-primary);
  margin-top: var(--space-2);
}

.section-stats__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8);
}

@media (max-width: 1024px) {
  .section-stats__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
}

@media (max-width: 540px) {
  .section-stats__grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}

.section-stats__card {
  text-align: center;
  padding: var(--space-6);
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.section-stats__number-wrapper {
  margin-bottom: var(--space-2);
}

.section-stats__number {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-brand-primary);
  line-height: var(--leading-tight);
}

.section-stats__label {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  margin: 0;
}
</style>
