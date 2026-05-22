<script setup lang="ts">
import BaseBadge from '~/components/ui/BaseBadge.vue'

interface Program {
  title: string
  slug: string
  description: string
  coverImageUrl: string
  durationWeeks: number
  level: 'beginner' | 'intermediate' | 'advanced'
  isFeatured?: boolean
}

defineProps<{
  program: Program
}>()
</script>

<template>
  <article class="program-card" :class="{ 'program-card--featured': program.isFeatured }">
    <div class="program-card__image-container">
      <NuxtImg
        :src="program.coverImageUrl || '/og/default.jpg'"
        :alt="program.title"
        class="program-card__image"
        loading="lazy"
        width="400"
        height="300"
        format="webp"
      />
      <div v-if="program.isFeatured" class="program-card__featured-badge">
        <BaseBadge type="featured" label="Featured" />
      </div>
    </div>

    <div class="program-card__content">
      <div class="program-card__meta">
        <BaseBadge :type="program.level" :label="program.level" />
        <span class="program-card__duration">{{ program.durationWeeks }} weeks</span>
      </div>

      <h3 class="program-card__title">
        {{ program.title }}
      </h3>
      
      <p class="program-card__description">
        {{ program.description }}
      </p>

      <div class="program-card__footer">
        <NuxtLink :to="`/programs/${program.slug}`" class="program-card__link">
          <span>Learn More</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="arrow-icon">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.program-card {
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s;
  will-change: transform, box-shadow;
}

.program-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-brand-accent);
}

.program-card--featured {
  border-color: rgba(212, 168, 83, 0.4);
  box-shadow: var(--shadow-sm);
}

.program-card__image-container {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 Aspect Ratio */
  overflow: hidden;
  background-color: var(--color-surface-inset);
}

.program-card__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.program-card:hover .program-card__image {
  transform: scale(1.05);
}

.program-card__featured-badge {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
  z-index: 2;
}

.program-card__content {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.program-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.program-card__duration {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.program-card__title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-brand-primary);
  margin-top: 0;
  margin-bottom: var(--space-2);
  line-height: var(--leading-snug);
}

.program-card__description {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
  margin-top: 0;
  margin-bottom: var(--space-6);
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.program-card__footer {
  margin-top: auto;
}

.program-card__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: var(--text-sm);
  color: var(--color-brand-primary);
  text-decoration: none;
  transition: color 0.2s;
}

.program-card__link:hover {
  color: var(--color-brand-accent);
}

.arrow-icon {
  transition: transform 0.25s ease;
}

.program-card__link:hover .arrow-icon {
  transform: translateX(4px);
}
</style>
