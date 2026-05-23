<script setup lang="ts">
import { computed } from 'vue'
import HeroInner from '~/components/sections/HeroInner.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import { usePageSeo } from '~/composables/useSeo'
import { useSupabase } from '~/composables/useSupabase'

usePageSeo({
  title: 'Strategic Partners',
  description: 'Learn about the government agencies, corporate institutions, and foundations sponsoring vocational excellence at N-CEDI.'
})

const { client } = useSupabase()

const { data: dbPartners } = await useAsyncData('partners-list', async () => {
  try {
    const { data, error } = await client
      .from('partners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase fetch failed, using fallback static partners list:', err)
    return null
  }
})

const defaultPartners = [
  {
    name: 'Federal Ministry of Aviation & Aerospace Development',
    tier: 'platinum' as const,
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?q=80&w=200',
    websiteUrl: 'https://aviation.gov.ng'
  },
  {
    name: 'National Board for Technical Education (NBTE)',
    tier: 'platinum' as const,
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?q=80&w=200',
    websiteUrl: 'https://nbte.gov.ng'
  },
  {
    name: 'Kaduna State Technology Hub',
    tier: 'gold' as const,
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?q=80&w=200',
    websiteUrl: 'https://kdsg.gov.ng'
  },
  {
    name: 'Green Energy Development Initiative',
    tier: 'gold' as const,
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?q=80&w=200',
    websiteUrl: '#'
  },
  {
    name: 'Nigeria Entrepreneurship Council',
    tier: 'silver' as const,
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?q=80&w=200',
    websiteUrl: '#'
  },
  {
    name: 'Kaduna Artisans Cooperative Union',
    tier: 'community' as const,
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?q=80&w=200',
    websiteUrl: '#'
  }
]

const partners = computed(() => {
  if (dbPartners.value && dbPartners.value.length > 0) {
    return dbPartners.value.map(p => ({
      name: p.name,
      tier: (p.tier || 'community') as 'platinum' | 'gold' | 'silver' | 'community',
      logoUrl: p.logo_url,
      websiteUrl: p.website_url || '#'
    }))
  }
  return defaultPartners
})

const partnersByTier = computed(() => {
  const tiers: Record<string, typeof partners.value> = {
    platinum: [],
    gold: [],
    silver: [],
    community: []
  }
  
  partners.value.forEach(p => {
    if (tiers[p.tier]) {
      tiers[p.tier].push(p)
    }
  })
  
  return tiers
})

const breadcrumbs = [
  { label: 'Partners', to: '/partners' }
]
</script>

<template>
  <div class="partners-page">
    <HeroInner
      title="Our Strategic Partners"
      subtitle="Cooperating with leading governmental bodies, global tech foundations, and cooperative unions to fund vocational scaling."
      :breadcrumbs="breadcrumbs"
    />

    <section class="partners-content">
      <div class="container">
        <!-- Platinum Tier -->
        <div v-if="partnersByTier.platinum.length > 0" class="partner-group">
          <h2 class="partner-group__title">Platinum Institutional Sponsors</h2>
          <div class="partner-group__grid partner-group__grid--large">
            <div
              v-for="(partner, index) in partnersByTier.platinum"
              :key="index"
              class="partner-card"
            >
              <MotionWrapper variant="fadeUp" :delay="index * 100">
                <a :href="partner.websiteUrl" target="_blank" rel="noopener noreferrer" class="partner-card__link">
                  <div class="partner-card__logo-box">
                    <!-- Placeholder/mock logo representation for nice aesthetics -->
                    <span class="partner-card__logo-text">{{ partner.name }}</span>
                  </div>
                </a>
              </MotionWrapper>
            </div>
          </div>
        </div>

        <!-- Gold & Silver Tiers -->
        <div v-if="partnersByTier.gold.length > 0 || partnersByTier.silver.length > 0" class="partner-group">
          <h2 class="partner-group__title">Corporate & Development Partners</h2>
          <div class="partner-group__grid partner-group__grid--medium">
            <div
              v-for="(partner, index) in [...partnersByTier.gold, ...partnersByTier.silver]"
              :key="index"
              class="partner-card"
            >
              <MotionWrapper variant="fadeUp" :delay="index * 80">
                <a :href="partner.websiteUrl" target="_blank" rel="noopener" class="partner-card__link">
                  <div class="partner-card__logo-box">
                    <span class="partner-card__logo-text partner-card__logo-text--small">{{ partner.name }}</span>
                  </div>
                </a>
              </MotionWrapper>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="partner-cta">
          <MotionWrapper variant="fadeUp">
            <div class="partner-cta__card">
              <h2 class="partner-cta__title">Partner With N-CEDI</h2>
              <p class="partner-cta__desc">
                Invest in vocational infrastructure, sponsor a student cohort, or co-create custom tech curriculums to drive sustainable growth.
              </p>
              <BaseButton variant="accent" size="lg" to="/contact">
                Become a Partner
              </BaseButton>
            </div>
          </MotionWrapper>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.partners-page {
  background-color: var(--color-surface);
}

.partners-content {
  padding: var(--section-padding-y) 0;
}

.partner-group {
  margin-bottom: var(--space-16);
}

.partner-group__title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-brand-primary);
  text-align: center;
  margin-top: 0;
  margin-bottom: var(--space-8);
}

.partner-group__grid {
  display: grid;
  gap: var(--space-6);
  justify-content: center;
}

.partner-group__grid--large {
  grid-template-columns: repeat(2, minmax(280px, 450px));
}

.partner-group__grid--medium {
  grid-template-columns: repeat(3, minmax(200px, 350px));
}

@media (max-width: 768px) {
  .partner-group__grid--large,
  .partner-group__grid--medium {
    grid-template-columns: 1fr;
  }
}

.partner-card {
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
}

.partner-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-brand-accent);
  box-shadow: var(--shadow-xs);
}

.partner-card__link {
  text-decoration: none;
  display: block;
}

.partner-card__logo-box {
  padding: var(--space-8);
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.partner-card__logo-text {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 800;
  color: var(--color-brand-primary);
  line-height: var(--leading-tight);
}

.partner-card__logo-text--small {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-muted);
}

/* CTA Card */
.partner-cta {
  max-width: 900px;
  margin: var(--space-12) auto 0 auto;
}

.partner-cta__card {
  background-color: var(--color-brand-primary);
  border: 2.5px solid var(--color-brand-accent);
  border-radius: var(--radius-xl);
  padding: var(--space-10) var(--space-8);
  text-align: center;
  color: var(--color-text-light);
  box-shadow: var(--shadow-xs);
}

.partner-cta__title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-brand-accent);
  margin-top: 0;
  margin-bottom: var(--space-3);
}

.partner-cta__desc {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text-light);
  line-height: var(--leading-relaxed);
  margin-top: 0;
  margin-bottom: var(--space-8);
  max-width: 600px;
  margin-inline: auto;
}
</style>
