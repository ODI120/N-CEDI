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
  title: 'Shape your Entrepreneurial Journey',
  description: 'N-CEDI tracks are automatically integrated into all NCAT NBTE academic programs. Explore available skill tracks to align with your career goals.',
  primaryAction: () => ({ label: 'Explore Tracks', to: '/programs' }),
  secondaryAction: () => ({ label: 'Center Guidelines', to: '/about' })
})
</script>

<template>
  <section class="section-cta-pro" aria-label="Call to Action">
    <div class="container">
      <MotionWrapper variant="fadeUp" class="cta-wrapper">
        <div class="cta-card">
          <!-- Animated Background Mesh -->
          <div class="cta-card__bg-mesh">
            <div class="mesh-blob mesh-blob--1"></div>
            <div class="mesh-blob mesh-blob--2"></div>
            <div class="mesh-blob mesh-blob--3"></div>
          </div>
          
          <div class="cta-card__noise"></div>

          <div class="cta-card__content">
            <h2 class="cta-card__title">
              {{ title }}
            </h2>

            <p class="cta-card__description">
              {{ description }}
            </p>

            <div class="cta-card__actions">
              <BaseButton variant="primary" size="lg" :to="primaryAction.to" class="btn-primary-glow">
                {{ primaryAction.label }}
              </BaseButton>
              <BaseButton variant="outline" size="lg" :to="secondaryAction.to" class="btn-glass">
                {{ secondaryAction.label }}
              </BaseButton>
            </div>
          </div>
        </div>
      </MotionWrapper>
    </div>
  </section>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════
   CTA SECTION (Light Mode Container, Vibrant Card)
   ═══════════════════════════════════════════════════ */
.section-cta-pro {
  position: relative;
  background-color: var(--color-surface); /* Light mode contrast */
  padding: clamp(4rem, 10vw, 8rem) 0;
  overflow: hidden;
}

.cta-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

/* ─── Massive Floating Card ─── */
.cta-card {
  position: relative;
  background-color: #0d1526;
  border-radius: var(--radius-3xl);
  overflow: hidden;
  padding: clamp(var(--space-8), 10vw, var(--space-20)) var(--space-6);
  text-align: center;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.1),
              0 10px 30px rgba(0, 141, 209, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ─── Animated Mesh Background ─── */
.cta-card__bg-mesh {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  filter: blur(60px);
  opacity: 0.8;
}

.mesh-blob {
  position: absolute;
  border-radius: 50%;
  animation: float-mesh 15s ease-in-out infinite alternate;
}

.mesh-blob--1 {
  width: 400px;
  height: 400px;
  background: rgba(0, 141, 209, 0.6);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.mesh-blob--2 {
  width: 500px;
  height: 500px;
  background: rgba(107, 89, 255, 0.5);
  bottom: -200px;
  right: -100px;
  animation-delay: -5s;
}

.mesh-blob--3 {
  width: 300px;
  height: 300px;
  background: rgba(251, 207, 3, 0.3); /* Gold */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
}

@keyframes float-mesh {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(50px, 30px) scale(1.1); }
  100% { transform: translate(-30px, -50px) scale(0.9); }
}

/* Subtle noise texture */
.cta-card__noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.05;
  mix-blend-mode: overlay;
  z-index: 1;
  pointer-events: none;
}

/* ─── Content ─── */
.cta-card__content {
  position: relative;
  z-index: 2;
  max-width: 600px;
}

.cta-card__title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  color: #ffffff;
  line-height: var(--leading-tight);
  letter-spacing: -0.03em;
  margin: 0 0 var(--space-4) 0;
}

.cta-card__description {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  color: rgba(255, 255, 255, 0.7);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--space-10) 0;
}

/* ─── Actions ─── */
.cta-card__actions {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.btn-primary-glow {
  background: #ffffff !important;
  color: #000000 !important;
  border: none !important;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.4) !important;
  transition: all 0.3s ease !important;
}

.btn-primary-glow:hover {
  transform: scale(1.05) !important;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.6) !important;
  background: #f0f0f0 !important;
}

.btn-glass {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
}

.btn-glass:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}
</style>
