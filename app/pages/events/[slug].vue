<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, createError } from '#app'
import HeroInner from '~/components/sections/HeroInner.vue'
import RichTextRenderer from '~/components/cms/RichTextRenderer.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseBadge from '~/components/ui/BaseBadge.vue'
import { usePageSeo } from '~/composables/useSeo'
import { useSupabase } from '~/composables/useSupabase'
import { formatDate } from '~/utils/formatDate'

const route = useRoute()
const slug = route.params.slug as string
const { client } = useSupabase()

// Fetch event from database
const { data: dbEvent } = await useAsyncData(`event-${slug}`, async () => {
  try {
    const { data, error } = await client
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (err) {
    console.warn(`Supabase fetch failed for event ${slug}, using static fallback`, err)
    return null
  }
})

// Detailed static fallback events
const defaultEvents = [
  {
    title: 'Tech & Vocational Hackathon 2026',
    slug: 'tech-vocational-hackathon-2026',
    description: 'A 48-hour challenge where students team up to prototype physical and digital solutions for local market challenges.',
    coverImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200',
    eventType: 'competition' as const,
    startsAt: '2026-06-15T09:00:00+01:00',
    endsAt: '2026-06-17T17:00:00+01:00',
    location: 'Main Incubation Hall, N-CEDI Center, Kaduna State',
    isVirtual: false,
    capacity: 100,
    registrationUrl: 'https://forms.gle/ncedihack2026',
    body: [
      {
        type: 'heading',
        data: { level: 2, text: 'About the Hackathon' }
      },
      {
        type: 'paragraph',
        data: { text: 'The N-CEDI annual hackathon brings together developers, designers, carpenters, tailors, and electrical installers. Teams are challenged to combine digital platforms with physical fabrication outputs to address specific commercial problems.' }
      },
      {
        type: 'heading',
        data: { level: 3, text: 'Prizes & Incubation' }
      },
      {
        type: 'list',
        data: {
          style: 'unordered',
          items: [
            '<strong>Grand Winner:</strong> ₦1,500,000 equity-free seed grant + 6 months free hub desk space.',
            '<strong>Second Place:</strong> ₦750,000 seed grant + access to N-CEDI workshop facilities.',
            '<strong>Third Place:</strong> ₦350,000 seed grant + dedicated technical mentorship.'
          ]
        }
      }
    ]
  },
  {
    title: 'Solar Energy Systems Masterclass',
    slug: 'solar-energy-systems-masterclass',
    description: 'Learn the core principles of hybrid inverter configurations and residential battery sizing calculations.',
    coverImageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200',
    eventType: 'workshop' as const,
    startsAt: '2026-06-22T10:00:00+01:00',
    endsAt: '2026-06-22T16:00:00+01:00',
    location: 'Energy Lab A, N-CEDI Campus',
    isVirtual: false,
    capacity: 40,
    registrationUrl: 'https://forms.gle/ncedisolarclass',
    body: [
      {
        type: 'heading',
        data: { level: 2, text: 'What We Cover' }
      },
      {
        type: 'paragraph',
        data: { text: 'This intensive 1-day workshop provides hands-on practical exercises. You will configure charge controllers, set up lithium battery modules, map wiring routing to prevent voltage drops, and learn safety procedures for grid-interactive setups.' }
      }
    ]
  },
  {
    title: 'African Creative Fashion & Bead Exhibition',
    slug: 'creative-fashion-exhibition',
    description: 'A public exhibition showcasing high-fashion designs, bead jewelry collection lines, and student project portfolios.',
    coverImageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200',
    eventType: 'exhibition' as const,
    startsAt: '2026-07-02T14:00:00+01:00',
    endsAt: '2026-07-02T20:00:00+01:00',
    location: 'N-CEDI Exhibition Pavilion',
    isVirtual: false,
    capacity: 250,
    registrationUrl: 'https://forms.gle/ncediexpo',
    body: [
      {
        type: 'heading',
        data: { level: 2, text: 'Celebrate Cultural Excellence' }
      },
      {
        type: 'paragraph',
        data: { text: 'Witness the combined output of N-CEDI fashion designers, woodwork furniture creators, and bead specialists. Join local and international buyers to view collection lines inspired by African craftsmanship.' }
      }
    ]
  },
  {
    title: 'Digital Branding for Craft Entrepreneurs',
    slug: 'digital-branding-seminar',
    description: 'Master tools, pricing strategies, and social commerce mechanics to scale your vocational workshop business online.',
    coverImageUrl: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?q=80&w=1200',
    eventType: 'seminar' as const,
    startsAt: '2026-07-10T11:00:00+01:00',
    endsAt: '2026-07-10T13:00:00+01:00',
    location: 'Virtual Classroom (Zoom)',
    isVirtual: true,
    capacity: 500,
    registrationUrl: 'https://zoom.us/webinar/register/ncedi',
    body: [
      {
        type: 'heading',
        data: { level: 2, text: 'Webinar Agenda' }
      },
      {
        type: 'list',
        data: {
          style: 'ordered',
          items: [
            '<strong>Understanding Your Cost Basis:</strong> Raw materials, labor overhead, and scaling product lines.',
            '<strong>Optimizing Social Assets:</strong> Visual storytelling on Instagram, Pinterest, and TikTok.',
            '<strong>Payment Gateways:</strong> Setting up simple digital checkouts for local and international orders.'
          ]
        }
      }
    ]
  }
]

const event = computed(() => {
  if (dbEvent.value) {
    const e = dbEvent.value
    return {
      title: e.title,
      slug: e.slug,
      description: e.description || '',
      coverImageUrl: e.cover_image_url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200',
      eventType: (e.event_type || 'workshop') as 'workshop' | 'seminar' | 'exhibition' | 'competition' | 'open_day',
      startsAt: e.starts_at,
      endsAt: e.ends_at || undefined,
      location: e.location || 'N-CEDI Campus',
      isVirtual: e.is_virtual || false,
      capacity: e.capacity || undefined,
      registrationUrl: e.registration_url || '/contact',
      body: e.body || [
        { type: 'heading', data: { level: 2, text: 'About the Event' } },
        { type: 'paragraph', data: { text: e.description || '' } }
      ]
    }
  }

  const fallback = defaultEvents.find(e => e.slug === slug)
  return fallback || null
})

if (!event.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Event "${slug}" not found`,
    fatal: true
  })
}

// Wire SEO
usePageSeo({
  title: event.value.title,
  description: event.value.description,
  image: event.value.coverImageUrl
})

const getEventTypeName = (type: string) => {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const breadcrumbs = computed(() => [
  { label: 'Events', to: '/events' },
  { label: event.value.title, to: `/events/${event.value.slug}` }
])
</script>

<template>
  <div v-if="event" class="event-detail-page">
    <HeroInner
      :title="event.title"
      :subtitle="event.description"
      :breadcrumbs="breadcrumbs"
    />

    <div class="event-detail-layout container">
      <!-- Main Content -->
      <div class="event-detail-layout__main">
        <MotionWrapper variant="fadeUp" :delay="100">
          <!-- Featured Image -->
          <div class="event-cover-wrapper">
            <NuxtImg
              :src="event.coverImageUrl"
              :alt="event.title"
              sizes="sm:100vw md:80vw lg:60vw xl:800px"
              format="webp"
              class="event-cover-image"
              loading="lazy"
            />
          </div>

          <div class="event-body-section">
            <RichTextRenderer :body="event.body" />
          </div>
        </MotionWrapper>
      </div>

      <!-- Sidebar -->
      <aside class="event-detail-layout__sidebar">
        <MotionWrapper variant="fadeUp" :delay="200">
          <div class="event-sidebar-card">
            <div class="event-sidebar-header">
              <BaseBadge type="advanced" :label="getEventTypeName(event.eventType)" />
            </div>

            <div class="event-spec-list">
              <div class="event-spec-item">
                <span class="event-spec-label">Starts At</span>
                <span class="event-spec-value">{{ formatDate(event.startsAt) }}</span>
              </div>
              <div v-if="event.endsAt" class="event-spec-item">
                <span class="event-spec-label">Ends At</span>
                <span class="event-spec-value">{{ formatDate(event.endsAt) }}</span>
              </div>
              <div class="event-spec-item">
                <span class="event-spec-label">Venue</span>
                <span class="event-spec-value">{{ event.isVirtual ? 'Virtual Webinar' : event.location }}</span>
              </div>
              <div v-if="event.capacity" class="event-spec-item">
                <span class="event-spec-label">Capacity</span>
                <span class="event-spec-value">{{ event.capacity }} Seats</span>
              </div>
            </div>

            <div class="event-sidebar-cta">
              <BaseButton variant="accent" block size="md" :to="event.registrationUrl" target="_blank" rel="noopener noreferrer">
                Register for Event
              </BaseButton>
              <p class="event-cta-note">Registration is free but mandatory to reserve seats.</p>
            </div>
          </div>
        </MotionWrapper>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.event-detail-page {
  background-color: var(--color-surface);
}

.event-detail-layout {
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: var(--space-12);
  padding: var(--space-12) var(--section-padding-x);
}

@media (max-width: 1024px) {
  .event-detail-layout {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
}

.event-cover-wrapper {
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--space-8);
}

.event-cover-image {
  width: 100%;
  height: auto;
  max-height: 480px;
  object-fit: cover;
  display: block;
}

.event-body-section {
  margin-bottom: var(--space-8);
}

/* Sidebar styling */
.event-sidebar-card {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: var(--space-24);
}

.event-sidebar-header {
  margin-bottom: var(--space-6);
}

.event-spec-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.event-spec-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-3);
}

.event-spec-label {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--color-text-muted);
}

.event-spec-value {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-brand-primary);
  line-height: var(--leading-snug);
}

.event-sidebar-cta {
  margin-top: var(--space-6);
}

.event-cta-note {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-align: center;
  margin-top: var(--space-3);
  margin-bottom: 0;
}
</style>
