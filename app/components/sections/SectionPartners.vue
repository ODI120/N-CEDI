<script setup lang="ts">
import { computed } from 'vue'

interface Partner {
  id: string
  name: string
  logoUrl: string
  websiteUrl?: string
  tier: 'platinum' | 'gold' | 'silver' | 'community'
}

interface SectionPartnersProps {
  partners?: Partner[]
}

const props = withDefaults(defineProps<SectionPartnersProps>(), {
  partners: () => []
})

// Fallback partners if none are provided
const defaultPartners: Partner[] = [
  { id: '1', name: 'Federal Ministry of Innovation', logoUrl: '/partners/fmict.png', tier: 'platinum' },
  { id: '2', name: 'National Board for Technology Incubation', logoUrl: '/partners/nbti.png', tier: 'platinum' },
  { id: '3', name: 'Africa Tech Ventures', logoUrl: '/partners/atv.png', tier: 'gold' },
  { id: '4', name: 'Sterling Innovation Lab', logoUrl: '/partners/sterling.png', tier: 'gold' },
  { id: '5', name: 'Lagos Innovates', logoUrl: '/partners/lagos_innovates.png', tier: 'silver' },
  { id: '6', name: 'Co-Creation Hub (CcHub)', logoUrl: '/partners/cchub.png', tier: 'silver' },
  { id: '7', name: 'Founder Institute Lagos', logoUrl: '/partners/fi.png', tier: 'community' },
  { id: '8', name: 'Devs Association', logoUrl: '/partners/devs.png', tier: 'community' }
]

const partnersList = computed(() => {
  return props.partners.length > 0 ? props.partners : defaultPartners
})

// Group partners by tier
const groupedPartners = computed(() => {
  const groups: Record<Partner['tier'], Partner[]> = {
    platinum: [],
    gold: [],
    silver: [],
    community: []
  }
  partnersList.value.forEach(partner => {
    if (partner.tier in groups) {
      groups[partner.tier].push(partner)
    }
  })
  return groups
})
</script>

<template>
  <section class="section-partners" aria-label="Our Institutional Partners">
    <div class="container">
      <div class="section-partners__header">
        <span class="eyebrow">Collaboration Network</span>
        <h2 class="section-partners__title">Supported by Trusted Organizations</h2>
        <p class="section-partners__subtitle">We work alongside leading ministries, corporations, and ecosystems to create pathways for entrepreneurship.</p>
      </div>

      <div class="section-partners__groups">
        <!-- Platinum Partners Group -->
        <div v-if="groupedPartners.platinum.length > 0" class="section-partners__tier-group">
          <h4 class="section-partners__tier-title">Institutional Anchors</h4>
          <div class="logo-grid logo-grid--platinum">
            <div
              v-for="partner in groupedPartners.platinum"
              :key="partner.id"
              class="logo-item"
            >
              <a v-if="partner.websiteUrl" :href="partner.websiteUrl" target="_blank" rel="noopener noreferrer" :aria-label="partner.name">
                <div class="logo-placeholder">{{ partner.name }}</div>
              </a>
              <div v-else class="logo-placeholder">{{ partner.name }}</div>
            </div>
          </div>
        </div>

        <!-- Gold & Silver Combined Group -->
        <div v-if="groupedPartners.gold.length > 0 || groupedPartners.silver.length > 0" class="section-partners__tier-group">
          <h4 class="section-partners__tier-title">Ecosystem & Corporate Partners</h4>
          <div class="logo-grid logo-grid--sub">
            <div
              v-for="partner in [...groupedPartners.gold, ...groupedPartners.silver]"
              :key="partner.id"
              class="logo-item"
            >
              <a v-if="partner.websiteUrl" :href="partner.websiteUrl" target="_blank" rel="noopener noreferrer" :aria-label="partner.name">
                <div class="logo-placeholder logo-placeholder--sm">{{ partner.name }}</div>
              </a>
              <div v-else class="logo-placeholder logo-placeholder--sm">{{ partner.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-partners {
  background-color: var(--color-surface);
  padding: var(--section-padding-y) 0;
  border-bottom: 1px solid var(--color-border);
}

.section-partners__header {
  text-align: center;
  max-width: 700px;
  margin-inline: auto;
  margin-bottom: var(--space-16);
}

.section-partners__title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  color: var(--color-brand-primary);
  margin-top: var(--space-2);
}

.section-partners__subtitle {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
}

.section-partners__groups {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.section-partners__tier-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.section-partners__tier-title {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
}

.logo-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: var(--space-6) var(--space-10);
  width: 100%;
}

.logo-item {
  transition: opacity 0.3s;
  opacity: 0.7;
}

.logo-item:hover {
  opacity: 1;
}

.logo-placeholder {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-brand-primary);
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  padding: var(--space-4) var(--space-8);
  border-radius: var(--radius-md);
  text-align: center;
  min-width: 180px;
  box-shadow: var(--shadow-xs);
}

.logo-placeholder--sm {
  font-size: var(--text-sm);
  padding: var(--space-3) var(--space-6);
  min-width: 150px;
}
</style>
