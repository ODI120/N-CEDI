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
</script>

<template>
  <section class="section-timeline">
    <div class="container">
      <div class="section-timeline__header">
        <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
        <h2 v-if="title" class="section-timeline__title">{{ title }}</h2>
      </div>

      <div class="timeline">
        <!-- Center line -->
        <div class="timeline__line"></div>

        <div class="timeline__items">
          <div
            v-for="(item, index) in (items.length > 0 ? items : defaultItems)"
            :key="index"
            class="timeline__item"
            :class="{
              'timeline__item--left': index % 2 === 0,
              'timeline__item--right': index % 2 !== 0
            }"
          >
            <!-- Timeline dot -->
            <div class="timeline__dot">
              <span class="timeline__dot-inner"></span>
            </div>

            <!-- Content Card -->
            <div class="timeline__content-wrapper">
              <MotionWrapper
                :variant="index % 2 === 0 ? 'slideRight' : 'slideLeft'"
                :delay="index * 100"
                :duration="0.7"
              >
                <div class="timeline__card">
                  <div class="timeline__card-header">
                    <span class="timeline__year">{{ item.year }}</span>
                    <span v-if="item.badge" class="timeline__badge">{{ item.badge }}</span>
                  </div>
                  <h3 class="timeline__item-title">{{ item.title }}</h3>
                  <p class="timeline__item-desc">{{ item.description }}</p>
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
  background-color: var(--color-surface-muted);
  padding: var(--section-padding-y) 0;
  border-bottom: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
}

.section-timeline__header {
  text-align: center;
  margin-bottom: var(--space-16);
}

.section-timeline__title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  color: var(--color-brand-primary);
  margin-top: var(--space-2);
}

/* Timeline Layout */
.timeline {
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-4) 0;
}

.timeline__line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--color-border-strong);
  transform: translateX(-50%);
}

.timeline__items {
  position: relative;
}

.timeline__item {
  display: flex;
  justify-content: flex-end;
  position: relative;
  margin-bottom: var(--space-10);
  width: 50%;
}

.timeline__item--left {
  align-self: flex-start;
  justify-content: flex-start;
  left: 0;
}

.timeline__item--right {
  align-self: flex-end;
  justify-content: flex-start;
  left: 50%;
}

/* Dots on the line */
.timeline__dot {
  position: absolute;
  top: 24px;
  width: 24px;
  height: 24px;
  background-color: var(--color-surface);
  border: 2px solid var(--color-brand-primary);
  border-radius: 50%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline__item--left .timeline__dot {
  right: -12px;
}

.timeline__item--right .timeline__dot {
  left: -12px;
}

.timeline__dot-inner {
  width: 10px;
  height: 10px;
  background-color: var(--color-brand-accent);
  border-radius: 50%;
}

/* Content wrapper and card */
.timeline__content-wrapper {
  width: 90%;
}

.timeline__item--left .timeline__content-wrapper {
  margin-right: auto;
}

.timeline__item--right .timeline__content-wrapper {
  margin-left: auto;
  padding-left: var(--space-6);
}

.timeline__item--left .timeline__content-wrapper {
  padding-right: var(--space-6);
}

.timeline__card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6) var(--space-8);
  box-shadow: var(--shadow-md);
  transition: transform 0.3s var(--easing-snappy), box-shadow 0.3s var(--easing-snappy);
}

.timeline__card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
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
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  background-color: var(--color-accent-50);
  color: var(--color-accent-700);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
}

.timeline__item-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-brand-primary);
  margin-bottom: var(--space-2);
}

.timeline__item-desc {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
  margin: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .timeline__line {
    left: var(--space-4);
  }

  .timeline__item {
    width: 100%;
    margin-bottom: var(--space-8);
  }

  .timeline__item--left,
  .timeline__item--right {
    align-self: flex-start;
    justify-content: flex-start;
    left: 0;
    padding-left: var(--space-10);
  }

  .timeline__item--left .timeline__dot,
  .timeline__item--right .timeline__dot {
    left: calc(var(--space-4) - 12px);
    right: auto;
  }

  .timeline__content-wrapper {
    width: 100%;
  }

  .timeline__item--left .timeline__content-wrapper,
  .timeline__item--right .timeline__content-wrapper {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
