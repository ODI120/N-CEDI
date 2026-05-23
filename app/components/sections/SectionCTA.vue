<script setup lang="ts">
import MotionWrapper from '~/components/motion/MotionWrapper.vue'

interface ActionItem {
  label: string
  to: string
}

interface SectionCTAProps {
  title?: string
  description?: string
  primaryAction?: ActionItem
  secondaryAction?: ActionItem
}

withDefaults(defineProps<SectionCTAProps>(), {
  title: 'Shape the Future of African Industry',
  description: 'Admissions are open for our next cohort. Explore programs in software development, vocational design, and business incubation.',
  primaryAction: () => ({ label: 'Apply Now', to: '/contact' }),
  secondaryAction: () => ({ label: 'Contact Admissions', to: '/contact' })
})
</script>

<template>
  <section class="section-cta" aria-label="Call to Action">
    <!-- Decorative background elements -->
    <div class="section-cta__background">
      <div class="section-cta__glow" />
    </div>

    <div class="container section-cta__container">
      <div class="section-cta__content">
        <MotionWrapper variant="fadeUp" :delay="100" :duration="0.6">
          <h2 class="section-cta__title">
            {{ title }}
          </h2>
        </MotionWrapper>

        <MotionWrapper variant="fadeUp" :delay="250" :duration="0.6">
          <p class="section-cta__description">
            {{ description }}
          </p>
        </MotionWrapper>

        <MotionWrapper variant="fadeUp" :delay="400" :duration="0.6">
          <div class="section-cta__actions">
            <BaseButton variant="accent" size="lg" :to="primaryAction.to">
              {{ primaryAction.label }}
            </BaseButton>
            <BaseButton variant="ghost" size="lg" :to="secondaryAction.to" class="btn-sec-inverse">
              {{ secondaryAction.label }}
            </BaseButton>
          </div>
        </MotionWrapper>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-cta {
  position: relative;
  background: var(--color-surface-muted);
  color: var(--color-text-dark);
  padding: var(--section-padding-y) 0;
  overflow: hidden;
}

.section-cta__background {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.section-cta__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50vw;
  height: 50vw;
  background: radial-gradient(circle, rgba(198, 146, 46, 0.12) 0%, transparent 62%);
  pointer-events: none;
}

.section-cta__container {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
}

.section-cta__content {
  text-align: center;
  max-width: 800px;
}

.section-cta__title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-text-dark);
  margin-top: 0;
  margin-bottom: var(--space-4);
  line-height: var(--leading-tight);
}

.section-cta__description {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  margin-bottom: var(--space-8);
}

.section-cta__actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.btn-sec-inverse {
  color: var(--color-text-dark) !important;
  border-color: var(--color-border) !important;
}

.btn-sec-inverse:hover {
  background-color: var(--color-surface-muted) !important;
  border-color: var(--color-border) !important;
}
</style>
