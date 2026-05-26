<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Partner {
  id: string
  name: string
  acronym: string
  logoUrl: string
  description: string
  websiteUrl?: string
  icon: string
  tier: 'platinum'
}

interface SectionPartnersProps {
  partners?: Partner[]
}

const props = withDefaults(defineProps<SectionPartnersProps>(), {
  partners: () => []
})

const defaultPartners: Partner[] = [
  {
    id: '1',
    name: 'Federal Ministry of Innovation, Science and Technology',
    acronym: 'FMIST',
    logoUrl: '/partners/fmict.png',
    description: 'Federal agency driving Nigeria\'s science, technology and innovation policy framework.',
    icon: 'bi-bank2',
    tier: 'platinum'
  },
  {
    id: '2',
    name: 'Nigerian College of Aviation Technology',
    acronym: 'NCAT',
    logoUrl: '/partners/ncat.png',
    description: 'Pioneering AI research and innovation to advance Nigeria\'s digital transformation.',
    icon: 'bi-rocket-takeoff',
    tier: 'platinum'
  },
  {
    id: '3',
    name: 'National Board for Technical Education',
    acronym: 'NBTE',
    logoUrl: '/partners/nbte.png',
    description: 'Regulating and setting standards for technical and vocational education in Nigeria.',
    icon: 'bi-mortarboard',
    tier: 'platinum'
  }
]

import { computed } from 'vue'

const partnersList = computed(() => {
  return props.partners.length > 0 ? props.partners : defaultPartners
})

// Staggered reveal animation
const isVisible = ref(false)
const cardRevealed = ref<boolean[]>([])

onMounted(() => {
  // Initialize card reveal states
  cardRevealed.value = new Array(partnersList.value.length).fill(false)

  // Use IntersectionObserver for scroll-triggered reveal
  const section = document.querySelector('.section-partners')
  if (!section) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          // Stagger card reveals
          partnersList.value.forEach((_, index) => {
            setTimeout(() => {
              cardRevealed.value[index] = true
            }, 200 + index * 180)
          })
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15 }
  )
  observer.observe(section)
})
</script>

<template>
  <section class="section-partners" aria-label="Institutional Anchor Partners">
    <!-- Ambient glow orbs -->
    <div class="partners-glow partners-glow--1" aria-hidden="true"></div>
    <div class="partners-glow partners-glow--2" aria-hidden="true"></div>

    <div class="container">
      <!-- Section Header -->
      <div class="partners-header" :class="{ 'partners-header--visible': isVisible }">
        <span class="partners-eyebrow">
          <i class="bi bi-shield-check" aria-hidden="true"></i>
          Institutional Anchors
        </span>
        <h2 class="partners-headline">
          Backed by <span class="partners-headline__accent">Nigeria's</span> Leading Institutions
        </h2>
        <p class="partners-subtext">
          Our programmes are anchored by federal agencies that shape the future of technology, 
          education and innovation across the nation.
        </p>

        <!-- Decorative divider -->
        <div class="partners-divider" aria-hidden="true">
          <span class="partners-divider__line"></span>
          <span class="partners-divider__diamond">
            <i class="bi bi-diamond-fill"></i>
          </span>
          <span class="partners-divider__line"></span>
        </div>
      </div>

      <!-- Partner Cards Grid -->
      <div class="partners-grid">
        <article
          v-for="(partner, index) in partnersList"
          :key="partner.id"
          class="partner-card"
          :class="{ 'partner-card--revealed': cardRevealed[index] }"
          :style="{ '--card-index': index }"
        >
          

          <!-- Card inner content -->
          <div class="partner-card__body">
            <!-- Logo area -->
            <div class="partner-card__logo-wrapper">
              <img v-if="partner.logoUrl" :src="partner.logoUrl" :alt="partner.name" class="partner-card__logo" />
              <i v-else :class="['bi', partner.icon || 'bi-bank2']" aria-hidden="true" class="partner-card__fallback-icon"></i>
            </div>

            <!-- Acronym chip -->
            <span class="partner-card__acronym">{{ partner.acronym }}</span>

            <!-- Partner name -->
            <h3 class="partner-card__name">{{ partner.name }}</h3>

          </div>

          <!-- Corner flourish -->
          <div class="partner-card__corner" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M0 0 L40 0 L40 40" stroke="rgba(0,141,209,0.3)" stroke-width="1" fill="none" />
            </svg>
          </div>
        </article>
      </div>

      <!-- Bottom trust badge -->
      <div class="partners-trust" :class="{ 'partners-trust--visible': isVisible }">
        <div class="partners-trust__badge">
          <i class="bi bi-patch-check-fill" aria-hidden="true"></i>
          <span>All partnerships are formally recognised under Nigeria's innovation policy framework</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════
   SECTION PARTNERS — Premium Light Section
   ═══════════════════════════════════════════════════ */

.section-partners {
  position: relative;
  overflow: hidden;
  background-color: var(--color-surface);
  background-image:
    radial-gradient(rgba(0, 141, 209, 0.06) 1px, transparent 1px);
  background-size: 24px 24px;
  padding: var(--section-padding-y) 0;
  border-top: 1px solid var(--color-border);
}


/* ─── Container ─── */
.container {
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: var(--section-padding-x);
}

/* ═══════════════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════════════ */

.partners-header {
  text-align: center;
  max-width: 720px;
  margin-inline: auto;
  margin-bottom: var(--space-16);
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.partners-header--visible {
  opacity: 1;
  transform: translateY(0);
}

.partners-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
  color: #6B59FF;
  background: #6B59FF10;
  border: 1px solid #6B59FF10;
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-6);
}

.partners-eyebrow .bi {
  font-size: 0.85em;
}

.partners-headline {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 900;
  color: var(--color-brand-primary);
  line-height: var(--leading-tight);
  margin: 0 0 var(--space-5) 0;
  letter-spacing: var(--tracking-tight);
}

.partners-subtext {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* ─── Decorative Divider ─── */
.partners-divider {
  display: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-top: var(--space-8);
}

.partners-divider__line {
  display: block;
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #6B59FF25, transparent);
}

.partners-divider__diamond {
  color:#6B59FF50;
  font-size: 0.5rem;
  animation: pulse-diamond 3s ease-in-out infinite;
}

@keyframes pulse-diamond {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

/* ═══════════════════════════════════════════════════
   PARTNER CARDS GRID
   ═══════════════════════════════════════════════════ */

.partners-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
  margin-bottom: var(--space-16);
}

.partner-card {
  position: relative;
  background: var(--color-surface-muted);
  border: 1px solid #6B59FF20;
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition:
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.5s ease,
    box-shadow 0.5s ease;

  /* Pre-reveal state */
  opacity: 0;
  transform: translateY(40px) scale(0.96);
}

.partner-card--revealed {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition:
    opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.5s ease,
    box-shadow 0.5s ease;
}

.partner-card:hover {
  /* transform: translateY(-6px); */
  border-color: #6B59FF20;
  box-shadow: 0 12px 40px #6B59FF10;
}


/* Card body */
.partner-card__body {
  padding: var(--space-10) var(--space-8) var(--space-8);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
}

/* Logo wrapper */
.partner-card__logo-wrapper {
  width: 96px;
  height: 96px;
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #6B59FF20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              background 0.5s ease,
              box-shadow 0.5s ease;
  flex-shrink: 0;
  overflow: hidden;
}

.partner-card__logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.partner-card__fallback-icon {
  font-size: 2.5rem;
  color: #6B59FF;
}

.partner-card:hover .partner-card__logo-wrapper {
  border-color: var(--color--muted)  ;
}

/* Acronym chip */
.partner-card__acronym {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #6B59FF;
  background: #6B59FF20;
  border: 1px solid #6B59FF10;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
}

/* Partner name */
.partner-card__name {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 800;
  color: var(--color-brand-primary);
  line-height: var(--leading-snug);
  margin: 0;
}

/* Description */
.partner-card__description {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* Status indicator */
.partner-card__status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.35);
  margin-top: var(--space-2);
}


/* Corner flourish */
.partner-card__corner {
  position: absolute;
  bottom: 0;
  right: 0;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.partner-card:hover .partner-card__corner {
  opacity: 1;
}

/* ═══════════════════════════════════════════════════
   TRUST BADGE
   ═══════════════════════════════════════════════════ */

.partners-trust {
  display: flex;
  justify-content: center;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s,
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s;
}

.partners-trust--visible {
  opacity: 1;
  transform: translateY(0);
}

.partners-trust__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  background: #6B59FF10;
  border: 1px solid #6B59FF10;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
}

.partners-trust__badge .bi {
  color: #6B59FF;
  font-size: 1rem;
}

/* ═══════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════ */

@media (max-width: 1024px) {
  .partners-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Center the 3rd card below the first two */
  .partner-card:last-child {
    grid-column: 1 / -1;
    max-width: 420px;
    justify-self: center;
  }
}

@media (max-width: 640px) {
  .partners-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .partner-card:last-child {
    max-width: none;
  }

  .partners-headline {
    font-size: var(--text-2xl);
  }

  .partner-card__body {
    padding: var(--space-8) var(--space-6) var(--space-6);
  }

  .partner-card__logo-wrapper {
    width: 60px;
    height: 60px;
  }

  .partner-card__fallback-icon {
    font-size: 1.4rem;
  }

  .partners-glow--1 {
    width: 300px;
    height: 300px;
  }

  .partners-glow--2 {
    width: 250px;
    height: 250px;
  }
}
</style>
