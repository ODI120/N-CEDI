<script setup lang="ts">
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import TextReveal from '~/components/motion/TextReveal.vue'
</script>

<template>
  <section class="hero-home" aria-label="Welcome to N-CEDI">
    <div class="hero-home__background">
      <!-- Gradient overlay for visual richness -->
      <div class="hero-home__overlay" />
    </div>

    <div class="hero-home__container container">
      <div class="hero-home__grid">
        <!-- Left Column: Content -->
        <div class="hero-home__content">
          <MotionWrapper variant="fadeUp" :delay="200" :duration="0.6">
            <span class="eyebrow hero-home__eyebrow">NCAT Centre for Entrepreneurship</span>
          </MotionWrapper>

          <TextReveal
            text="Empowering Africa's Next Innovators"
            tag="h1"
            :delay="400"
            class="hero-home__title"
          />

          <MotionWrapper variant="fadeUp" :delay="800" :duration="0.8">
            <p class="hero-home__lead">
              N-CEDI accelerates high-impact career development through world-class tech training, vocational innovation, and venture incubation. Secure your future in the global economy.
            </p>
          </MotionWrapper>

          <MotionWrapper variant="fadeUp" :delay="1000" :duration="0.8">
            <div class="hero-home__actions">
              <BaseButton variant="accent" size="lg" to="/programs">
                Explore Programs
              </BaseButton>
              <BaseButton variant="ghost" size="lg" to="/about" class="btn-secondary-inverse">
                Learn More
              </BaseButton>
            </div>
          </MotionWrapper>
        </div>

        <!-- Right Column: Visual -->
        <div class="hero-home__visual">
          <MotionWrapper variant="scale" :delay="600" :duration="1.2" class="hero-home__visual-wrapper">
            <div class="hero-home__image-placeholder">
              <!-- Visual overlay -->
              <div class="visual-gradient-shim" />
              <!-- Placeholder content showing institutional excellence -->
              <div class="placeholder-graphic">
                <span class="placeholder-graphic__icon">⚡</span>
                <span class="placeholder-graphic__text">Centre for Entrepreneurship & Innovation</span>
              </div>
            </div>
          </MotionWrapper>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-home {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background-color: var(--color-brand-primary);
  overflow: hidden;
  padding-top: 100px;
  padding-bottom: var(--space-12);
}

.hero-home__background {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.hero-home__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-primary-900) 0%, rgba(10, 37, 64, 0.9) 100%);
}

.hero-home__container {
  position: relative;
  z-index: 2;
  width: 100%;
}

.hero-home__grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: var(--space-12);
  align-items: center;
}

@media (max-width: 1024px) {
  .hero-home__grid {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
}

.hero-home__content {
  max-width: 720px;
}

.hero-home__eyebrow {
  color: var(--color-brand-accent);
  margin-bottom: var(--space-4);
  display: block;
}

.hero-home__title {
  color: #ffffff;
  font-family: var(--font-display);
  font-size: var(--text-hero);
  font-weight: 800;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--space-6);
}

.hero-home__lead {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: rgba(245, 245, 240, 0.8);
  margin-bottom: var(--space-8);
}

.hero-home__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.btn-secondary-inverse {
  color: #ffffff !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.btn-secondary-inverse:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
  border-color: #ffffff !important;
}

.hero-home__visual {
  width: 100%;
  display: flex;
  justify-content: center;
}

.hero-home__visual-wrapper {
  width: 100%;
  aspect-ratio: 4 / 3;
}

.hero-home__image-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--color-primary-800);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-2xl), var(--shadow-accent);
}

.visual-gradient-shim {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 70% 30%, rgba(212, 168, 83, 0.15) 0%, transparent 70%);
  z-index: 2;
}

.placeholder-graphic {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--space-3);
  padding: var(--space-8);
  text-align: center;
}

.placeholder-graphic__icon {
  font-size: var(--text-3xl);
  filter: drop-shadow(0 0 10px rgba(212, 168, 83, 0.5));
}

.placeholder-graphic__text {
  font-family: var(--font-display);
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-brand-accent);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}
</style>
