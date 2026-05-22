<script setup lang="ts">
import { computed } from 'vue'
import HeroInner from '~/components/sections/HeroInner.vue'
import EventCard from '~/components/cards/EventCard.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import { usePageSeo } from '~/composables/useSeo'
import { useSupabase } from '~/composables/useSupabase'

usePageSeo({
  title: 'Events & Workshops',
  description: 'Participate in N-CEDI\'s upcoming skills masterclasses, hackathons, open days, and business seminars in Nigeria.'
})

const { client } = useSupabase()

const { data: dbEvents } = await useAsyncData('events-list', async () => {
  try {
    const { data, error } = await client
      .from('events')
      .select('*')
      .eq('is_published', true)
      .order('starts_at', { ascending: true })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase fetch failed, using fallback static events:', err)
    return null
  }
})

const defaultEvents = [
  {
    title: 'Tech & Vocational Hackathon 2026',
    slug: 'tech-vocational-hackathon-2026',
    description: 'A 48-hour challenge where students team up to prototype physical and digital solutions for local market challenges.',
    coverImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800',
    eventType: 'competition' as const,
    startsAt: '2026-06-15T09:00:00+01:00',
    location: 'Main Incubation Hall',
    isVirtual: false
  },
  {
    title: 'Solar Energy Systems Masterclass',
    slug: 'solar-energy-systems-masterclass',
    description: 'Learn the core principles of hybrid inverter configurations and residential battery sizing calculations.',
    coverImageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800',
    eventType: 'workshop' as const,
    startsAt: '2026-06-22T10:00:00+01:00',
    location: 'Energy Lab A',
    isVirtual: false
  },
  {
    title: 'African Creative Fashion & Bead Exhibition',
    slug: 'creative-fashion-exhibition',
    description: 'A public exhibition showcasing high-fashion designs, bead jewelry collection lines, and student project portfolios.',
    coverImageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800',
    eventType: 'exhibition' as const,
    startsAt: '2026-07-02T14:00:00+01:00',
    location: 'N-CEDI Exhibition Pavilion',
    isVirtual: false
  },
  {
    title: 'Digital Branding for Craft Entrepreneurs',
    slug: 'digital-branding-seminar',
    description: 'Master tools, pricing strategies, and social commerce mechanics to scale your vocational workshop business online.',
    coverImageUrl: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?q=80&w=800',
    eventType: 'seminar' as const,
    startsAt: '2026-07-10T11:00:00+01:00',
    location: 'Virtual Classroom (Zoom)',
    isVirtual: true
  }
]

const events = computed(() => {
  if (dbEvents.value && dbEvents.value.length > 0) {
    return dbEvents.value.map(e => ({
      title: e.title,
      slug: e.slug,
      description: e.description || '',
      coverImageUrl: e.cover_image_url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800',
      eventType: (e.event_type || 'workshop') as 'workshop' | 'seminar' | 'exhibition' | 'competition' | 'open_day',
      startsAt: e.starts_at,
      location: e.location || 'N-CEDI Campus',
      isVirtual: e.is_virtual || false
    }))
  }
  return defaultEvents
})

const breadcrumbs = [
  { label: 'Events', to: '/events' }
]
</script>

<template>
  <div class="events-page">
    <HeroInner
      title="Upcoming Events & Workshops"
      subtitle="Connect with sector experts, participate in practical workshops, and witness student innovation showcases."
      :breadcrumbs="breadcrumbs"
    />

    <section class="events-section">
      <div class="container">
        <div class="events-grid">
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

@media (max-width: 768px) {
  .events-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}
</style>
