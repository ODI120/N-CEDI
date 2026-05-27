<script setup lang="ts">
import { ref } from 'vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'

interface TimelineItem {
  year: string
  title: string
  description: string
  badge?: string
}

interface SectionTimelineProps {
  title?: string
  eyebrow?: string
  items?: TimelineItem[]
}

const defaultItems: TimelineItem[] = [
  {
    year: '2021',
    title: 'Establishment & Vision',
    description: 'N-CEDI was established with the vision of bridging the gap between traditional vocational training and digital innovation, setting up our core foundation in Nigeria.',
    badge: 'Foundation'
  },
  {
    year: '2022',
    title: 'Advanced Labs Commissioning',
    description: 'Installed state-of-the-art facilities including modern woodwork machinery, computer hardware labs, fashion studio, and high-capacity solar incubation benches.',
    badge: 'Infrastructure'
  },
  {
    year: '2023',
    title: 'Inaugural Cohort Graduation',
    description: 'Celebrated the graduation of our first 350+ certified entrepreneurs with a 78% immediate employment/venture creation rate across the six core programs.',
    badge: 'Milestone'
  },
  {
    year: '2024',
    title: 'Enterprise Hub & Partnerships',
    description: 'Partnered with federal agencies and venture funds to provide seed grants and incubate graduate startups directly within the centre\'s ecosystem.',
    badge: 'Growth'
  },
  {
    year: '2025',
    title: 'Digital & Hybrid Expansion',
    description: 'Launched virtual learning portals and hybrid digital cohorts to scale access to N-CEDI curriculum across Nigeria, reaching 1,200+ active learners.',
    badge: 'Innovation'
  },
  {
    year: '2026',
    title: 'N-CEDI Elite Initiative',
    description: 'Initiating full scale pan-African incubator collaborations and launching specialized research domains in green energy and hardware engineering.',
    badge: 'Global'
  }
]

withDefaults(defineProps<SectionTimelineProps>(), {
  title: 'Our Journey of Innovation',
  eyebrow: 'Milestones & History',
  items: () => []
})

const timelineRef = ref<HTMLElement | null>(null)

const handleMouseMove = (e: MouseEvent) => {
  if (!timelineRef.value) return
  const rect = timelineRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  timelineRef.value.style.setProperty('--mouse-x', `${x}px`)
  timelineRef.value.style.setProperty('--mouse-y', `${y}px`)
}
</script>

<template>
  <section
    ref="timelineRef"
    class="section-timeline"
    @mousemove="handleMouseMove"
  >
    <div class="container">
      <div class="section-timeline__header">
        <span
          v-if="eyebrow"
          class="eyebrow"
        >{{ eyebrow }}</span>
        <h2
          v-if="title"
          class="section-timeline__title"
        >
          {{ title }}
        </h2>
      </div>

      <div class="timeline">
        <!-- Subtle vertical line -->
        <div class="timeline__line" />

        <div class="timeline__items">
          <div
            v-for="(item, index) in (items.length > 0 ? items : defaultItems)"
            :key="index"
            class="timeline__item"
          >
            <!-- Timeline dot -->
            <div class="timeline__dot">
              <span class="timeline__dot-inner" />
            </div>

            <!-- Content Card -->
            <div class="timeline__content-wrapper">
              <MotionWrapper
                variant="fadeUp"
                :delay="index * 100"
                :duration="0.6"
              >
                <div class="timeline__card">
                  <div class="timeline__card-content">
                    <div class="timeline__card-header">
                      <span class="timeline__year">{{ item.year }}</span>
                      <span
                        v-if="item.badge"
                        class="timeline__badge"
                      >{{ item.badge }}</span>
                    </div>
                    <h3 class="timeline__item-title">
                      {{ item.title }}
                    </h3>
                    <p class="timeline__item-desc">
                      {{ item.description }}
                    </p>
                  </div>
                </div>
              </MotionWrapper>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-timeline {
  background-color: var(--color-surface);
  padding: var(--section-padding-y) 0;
  border-bottom: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
}

/* Dot grid revealed by mouse spotlight */
.section-timeline::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    /* Layer 1 (top): dark mask with transparent spotlight hole */
    radial-gradient(
      550px circle at var(--mouse-x, -600px) var(--mouse-y, -600px),
      transparent 0%,
      var(--color-surface) 75%
    ),
    /* Layer 2 (bottom): subtle dot grid pattern */
    radial-gradient(circle, rgba(255, 255, 255, 0.13) 1.5px, transparent 1.5px);
  background-size: auto, 22px 22px;
  pointer-events: none;
  z-index: 0;
}

/* Ensure all content sits above the dot-mask pseudo */
.section-timeline .container {
  position: relative;
  z-index: 1;
}

.section-timeline__header {
  text-align: center;
  margin-bottom: var(--space-16);
  max-width: 600px;
  margin-inline: auto;
}

.section-timeline__title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-brand-primary);
  margin-top: var(--space-3);
  line-height: var(--leading-tight);
}

/* Timeline Layout */
.timeline {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-4) 0;
}

/* Left-aligned vertical line */
.timeline__line {
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--color-border);
}

.timeline__items {
  position: relative;
}

.timeline__item {
  display: flex;
  justify-content: flex-start;
  position: relative;
  margin-bottom: var(--space-10);
  width: 100%;
}

.timeline__item:last-child {
  margin-bottom: 0;
}

/* Dots on the line */
.timeline__dot {
  position: absolute;
  top: 24px;
  left: 9px; /* Centered with the 2px line at 20px (20 - 24/2 = 8px + 1px tweak) */
  width: 24px;
  height: 24px;
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 50%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 0 0 4px var(--color-surface);
}

.timeline__dot-inner {
  width: 8px;
  height: 8px;
  background-color: var(--color-border);
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

/* Hover effects */
.timeline__item:hover .timeline__dot {
  border-color: var(--color-brand-accent);
}

.timeline__item:hover .timeline__dot-inner {
  background-color: var(--color-brand-accent);
}

/* Content wrapper and card */
.timeline__content-wrapper {
  width: 100%;
  padding-left: var(--space-12);
}

.timeline__card {
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6) var(--space-8);
  box-shadow: var(--shadow-xs);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  position: relative;
  overflow: hidden;
}

.timeline__card-content {
  position: relative;
  z-index: 2;
}

.timeline__item:hover .timeline__card {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  border-color: var(--color-brand-accent);
}

.timeline__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.timeline__year {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-brand-primary);
}

.timeline__badge {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  background-color: var(--color-surface);
  color: var(--color-text-muted);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  transition: border-color 0.3s ease, color 0.3s ease;
}

.timeline__item:hover .timeline__badge {
  border-color: var(--color-brand-accent);
  color: var(--color-brand-accent);
}

.timeline__item-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 800;
  color: var(--color-brand-primary);
  margin-bottom: var(--space-2);
  line-height: var(--leading-tight);
}

.timeline__item-desc {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .timeline__line {
    left: 12px;
  }

  .timeline__dot {
    left: 0;
  }

  .timeline__content-wrapper {
    padding-left: var(--space-8);
  }

  .timeline__card {
    padding: var(--space-5) var(--space-6);
  }
}
</style>
