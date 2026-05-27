<script setup lang="ts">
import ProgramCard from '~/components/cards/ProgramCard.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'

interface Program {
  title: string
  slug: string
  description: string
  coverImageUrl: string
  durationWeeks: number
  level: 'beginner' | 'intermediate' | 'advanced'
  isFeatured?: boolean
}

interface SectionProgramsProps {
  programs: Program[]
  title?: string
  subtitle?: string
}

withDefaults(defineProps<SectionProgramsProps>(), {
  title: 'Our Training Programs',
  subtitle: 'High-impact capacity building designed to fit global industry requirements and startup success.'
})
</script>

<template>
  <section class="section-programs">
    <div class="container">
      <div class="section-programs__header">
        <div class="section-programs__header-content">
          <span class="eyebrow">Academic Curriculum</span>
          <h2 class="section-programs__title">{{ title }}</h2>
          <p class="section-programs__subtitle">{{ subtitle }}</p>
        </div>
        <div class="section-programs__actions-header">
          <BaseButton variant="secondary" size="md" to="/programs">
            View All Programs
          </BaseButton>
        </div>
      </div>

      <div class="section-programs__grid">
        <div
          v-for="(prog, index) in programs"
          :key="prog.slug"
          class="section-programs__item"
        >
          <MotionWrapper variant="fadeUp" :delay="index * 100" :duration="0.8">
            <ProgramCard :program="prog" />
          </MotionWrapper>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-programs {
  padding: var(--section-padding-y) 0;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.section-programs__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--space-12);
}

@media (max-width: 768px) {
  .section-programs__header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-6);
  }
}

.section-programs__header-content {
  max-width: 650px;
}

.section-programs__title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 900;
  color: var(--color-brand-primary);
  margin-top: var(--space-2);
  margin-bottom: var(--space-4);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
}

.section-programs__subtitle {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  margin: 0;
}

.section-programs__actions-header {
  flex-shrink: 0;
}

.section-programs__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: var(--space-8);
}

@media (max-width: 640px) {
  .section-programs__grid {
    gap: var(--space-6);
  }
}
</style>
