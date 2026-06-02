<script setup lang="ts">
import { computed } from 'vue'
import HeroInner from '~/components/sections/HeroInner.vue'
import EventCard from '~/components/cards/EventCard.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import { usePageSeo } from '~/composables/useSeo'
import { useSupabase } from '~/composables/useSupabase'
import { resolveStorageRef } from '~/utils/storage'

usePageSeo({
  title: 'NCAT Student Events',
  description: 'Participate in N-CEDI\'s yearly student activities, Entrepreneurship Days, and Student Weeks under NBTE at NCAT.'
})

const { client } = useSupabase()

const { data: dbEvents } = await useAsyncData('events-list', async () => {
  try {
    const { data, error } = await client
      .from('events')
      .select('id, slug, title, description, cover_image_url, is_published, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (err) {
    console.error('Supabase fetch failed:', err)
    return null
  }
})

const events = computed(() => {
  if (dbEvents.value) {
    return dbEvents.value.map(e => ({
      title: e.title,
      slug: e.slug,
      description: e.description || '',
      coverImageUrl: e.cover_image_url ? resolveStorageRef(e.cover_image_url) : ''
    }))
  }
  return []
})

const breadcrumbs = [
  { label: 'Events', to: '/events' }
]
</script>

<template>
  <div class="events-page">
    <HeroInner
      title="Student Yearly Events"
      subtitle="Exhibits, Student Weeks, and Entrepreneurship Days for vocational students at NCAT under NBTE."
      :breadcrumbs="breadcrumbs"
    />

    <section class="events-section">
      <div class="container">
        <!-- Empty State -->
        <div v-if="events.length === 0" class="events-empty-state">
          <MotionWrapper variant="fadeUp" :delay="100">
            <div class="empty-icon-wrap">
              <UIcon name="i-lucide-calendar-x" class="empty-icon" />
            </div>
            <h3 class="empty-title">No Yearly Events Scheduled</h3>
            <p class="empty-description">
              We are currently organizing upcoming yearly student events. Please check back later or contact the department coordinators for scheduling updates.
            </p>
          </MotionWrapper>
        </div>

        <!-- Grid of Events -->
        <div v-else class="events-grid">
          <div
            v-for="(event, index) in events"
            :key="event.slug"
            class="events-grid__item"
          >
            <MotionWrapper variant="fadeUp" :delay="index * 100" :duration="0.6">
              <EventCard :event="event" />
            </MotionWrapper>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.events-page {
  background-color: var(--color-surface);
}

.events-section {
  padding: var(--section-padding-y) 0;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-8);
}

.events-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 600px;
  margin: var(--space-12) auto;
  padding: var(--space-12) var(--space-6);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-2xl);
  background-color: var(--color-surface-inset);
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(var(--color-brand-primary-rgb, 212, 168, 83), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-6);
  color: var(--color-brand-primary);
  border: 1px solid rgba(var(--color-brand-primary-rgb, 212, 168, 83), 0.15);
}

.empty-icon {
  font-size: 2.25rem;
}

.empty-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-brand-primary);
  margin: 0 0 var(--space-3) 0;
}

.empty-description {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-normal);
  margin: 0;
}

@media (max-width: 768px) {
  .events-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}
</style>
