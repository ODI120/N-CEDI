<script setup lang="ts">
import BaseBadge from '~/components/ui/BaseBadge.vue'
import { formatDate } from '~/utils/formatDate'

interface Event {
  title: string
  slug: string
  description: string
  coverImageUrl: string
  eventType: 'workshop' | 'seminar' | 'exhibition' | 'competition' | 'open_day'
  startsAt: string
  location?: string
  isVirtual: boolean
}

defineProps<{
  event: Event
}>()

const getEventTypeName = (type: string) => {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
</script>

<template>
  <article class="event-card">
    <div class="event-card__image-container">
      <NuxtImg
        :src="event.coverImageUrl || '/og/default.jpg'"
        :alt="event.title"
        class="event-card__image"
        loading="lazy"
        width="480"
        height="270"
        format="webp"
      />
      <div class="event-card__type-badge">
        <BaseBadge type="advanced" :label="getEventTypeName(event.eventType)" />
      </div>
    </div>

    <div class="event-card__content">
      <div class="event-card__date-bar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="calendar-icon">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <time :datetime="event.startsAt">{{ formatDate(event.startsAt) }}</time>
      </div>

      <h3 class="event-card__title">
        {{ event.title }}
      </h3>

      <p class="event-card__description">
        {{ event.description }}
      </p>

      <div class="event-card__footer">
        <div class="event-card__location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="location-icon">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{{ event.isVirtual ? 'Virtual Event' : (event.location || 'N-CEDI Campus') }}</span>
        </div>

        <NuxtLink :to="`/events/${event.slug}`" class="event-card__link">
          <span>Details</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="arrow-icon">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.event-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform, box-shadow;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xs);
}

.event-card__image-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  overflow: hidden;
  background-color: var(--color-surface-inset);
}

.event-card__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.event-card:hover .event-card__image {
  transform: scale(1.03);
}

.event-card__type-badge {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  z-index: 2;
}

.event-card__content {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.event-card__date-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-brand-secondary);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  margin-bottom: var(--space-2);
}

.event-card__title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-brand-primary);
  margin: 0 0 var(--space-2) 0;
  line-height: var(--leading-snug);
}

.event-card__description {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-normal);
  margin: 0 0 var(--space-4) 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-3);
}

.event-card__location {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  max-width: 60%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-card__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: var(--text-xs);
  color: var(--color-brand-primary);
  text-decoration: none;
  transition: color 0.2s;
}

.event-card__link:hover {
  color: var(--color-brand-accent);
}

.arrow-icon {
  transition: transform 0.2s ease;
}

.event-card__link:hover .arrow-icon {
  transform: translateX(3px);
}
</style>
