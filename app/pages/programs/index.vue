<script setup lang="ts">
  import HeroInner from '~/components/sections/HeroInner.vue'
  import ProgramCard from '~/components/cards/ProgramCard.vue'
  import MotionWrapper from '~/components/motion/MotionWrapper.vue'
  import { usePageSeo } from '~/composables/useSeo'

  usePageSeo({
    title: 'Programs | N-CEDI - Vocational Training & Entrepreneurship',
    description: 'Explore N-CEDI\'s professional vocational and technology tracks, designed to equip you with real-world entrepreneurial skills.'
  })

  const { programs, pending, error, refresh } = usePrograms({ orderBy: 'updated_at' })

  const breadcrumbs = [
    { label: 'Programs', to: '/programs' }
  ]
</script>

<template>
  <div class="programs-page">
    <HeroInner
      title="Skill Development Tracks"
      subtitle="N-CEDI is an integrated academic ecosystem automatically available to all NCAT NBTE students. Choose a skill track and develop it continuously from ND1 through HND2."
      :breadcrumbs="breadcrumbs"
    />

    <section class="programs-section">
      <div class="container">
        <div class="programs-section__intro">
          <MotionWrapper variant="fadeUp" :delay="100">
            <span class="eyebrow">Integrated Skill Tracks</span>
            <h2 class="programs-section__heading">Select Your Development Track</h2>
            <p class="programs-section__lead">
              As an NCAT NBTE student in AMS, ATE, or AME schools, you are automatically part of the N-CEDI ecosystem.
              Browse the available skill and innovation tracks below, then visit the N-CEDI centre to register your preferred track and begin your development journey from ND1 to HND2.
            </p>
          </MotionWrapper>
        </div>

        <div v-if="error" class="programs-empty-state">
          <p class="programs-empty">Could not load programs. Please try again.</p>
          <BaseButton variant="secondary" size="md" @click="refresh()">Retry</BaseButton>
        </div>

        <div v-else-if="pending" class="programs-grid programs-grid--loading">
          <p class="programs-empty">Loading programs…</p>
        </div>

        <div v-else-if="!programs?.length" class="programs-empty-state">
          <p class="programs-empty">Published programs will appear here once they are live in the admin dashboard.</p>
          <BaseButton variant="secondary" size="md" to="/contact">Contact N-CEDI</BaseButton>
        </div>

        <div v-else class="programs-grid">
          <div
            v-for="(program, index) in programs"
            :key="program.slug"
            class="programs-grid__item"
          >
            <MotionWrapper variant="fadeUp" :delay="index * 100" :duration="0.6">
              <ProgramCard :program="program" />
            </MotionWrapper>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.programs-page {
  background-color: var(--color-surface);
}

.programs-section {
  padding: var(--section-padding-y) 0;
}

.programs-section__intro {
  max-width: 800px;
  margin-bottom: var(--space-16);
}

.programs-section__heading {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  color: var(--color-brand-primary);
  margin-top: var(--space-2);
  margin-bottom: var(--space-4);
}

.programs-section__lead {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  margin: 0;
}

.programs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
}

@media (max-width: 1024px) {
  .programs-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
}

@media (max-width: 640px) {
  .programs-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}

.programs-empty-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-6);
  padding: var(--space-12) 0;
}

.programs-empty {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  color: var(--color-text-muted);
  margin: 0;
  line-height: var(--leading-relaxed);
}
</style>
