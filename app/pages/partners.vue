<script setup lang="ts">
import { computed } from 'vue'
import HeroInner from '~/components/sections/HeroInner.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import { usePageSeo } from '~/composables/useSeo'
import { usePartnersForDisplay } from '~/composables/usePartnerLogoUrl'
import type { PartnerTier } from '~/utils/partnerAdmin'

usePageSeo({
  title: 'Strategic Partners',
  description:
    'Learn about the government agencies, corporate institutions, and foundations sponsoring vocational excellence at N-CEDI.',
})

const { page, pending, error, refresh } = usePartnersPage()

const partnerRows = computed(() => page.value?.partners ?? [])
const fromDatabase = computed(() => page.value?.fromDatabase ?? false)
const displayPartners = usePartnersForDisplay(partnerRows)

const partnersByTier = computed(() => {
  const tiers: Record<PartnerTier, typeof displayPartners.value> = {
    platinum: [],
    gold: [],
    silver: [],
    community: [],
  }

  displayPartners.value.forEach((p) => {
    tiers[p.tier].push(p)
  })

  return tiers
})

const breadcrumbs = [{ label: 'Partners', to: '/partners' }]
</script>

<template>
  <div class="partners-page">
    <HeroInner
      title="Our Strategic Partners"
      subtitle="Cooperating with leading governmental bodies, global tech foundations, and cooperative unions to fund vocational scaling."
      :breadcrumbs="breadcrumbs"
    />

    <section class="partners-content" aria-label="Partner organizations">
      <div class="container">
        <div v-if="error" class="partners-state partners-state--error">
          <p>We couldn’t load partners right now.</p>
          <button type="button" class="btn-retry" @click="refresh()">Try again</button>
        </div>

        <p v-else-if="pending && !displayPartners.length" class="partners-state">Loading partners…</p>

        <div
          v-else-if="!displayPartners.length && !pending"
          class="partners-state"
        >
          <h3>Partners coming soon</h3>
          <p v-if="!fromDatabase">
            Published partners from Admin → Partners will appear here.
          </p>
        </div>

        <template v-else>
          <div v-if="partnersByTier.platinum.length > 0" class="partner-group">
            <h2 class="partner-group__title">Platinum Institutional Sponsors</h2>
            <div class="partner-group__grid partner-group__grid--large">
              <div
                v-for="(partner, index) in partnersByTier.platinum"
                :key="partner.id"
                class="partner-card"
              >
                <MotionWrapper variant="fadeUp" :delay="index * 100">
                  <a
                    :href="partner.websiteUrl || '#'"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="partner-card__link"
                  >
                    <div class="partner-card__logo-box">
                      <img
                        v-if="partner.logoUrl"
                        :src="partner.logoUrl"
                        :alt="partner.name"
                        class="partner-card__logo-img"
                        loading="lazy"
                      />
                      <span v-else class="partner-card__logo-text">{{ partner.acronym }}</span>
                    </div>
                    <p class="partner-card__name">{{ partner.name }}</p>
                  </a>
                </MotionWrapper>
              </div>
            </div>
          </div>

          <div
            v-if="partnersByTier.gold.length > 0 || partnersByTier.silver.length > 0"
            class="partner-group"
          >
            <h2 class="partner-group__title">Corporate & Development Partners</h2>
            <div class="partner-group__grid partner-group__grid--medium">
              <div
                v-for="(partner, index) in [...partnersByTier.gold, ...partnersByTier.silver]"
                :key="partner.id"
                class="partner-card"
              >
                <MotionWrapper variant="fadeUp" :delay="index * 80">
                  <a
                    :href="partner.websiteUrl || '#'"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="partner-card__link"
                  >
                    <div class="partner-card__logo-box">
                      <img
                        v-if="partner.logoUrl"
                        :src="partner.logoUrl"
                        :alt="partner.name"
                        class="partner-card__logo-img"
                        loading="lazy"
                      />
                      <span v-else class="partner-card__logo-text partner-card__logo-text--small">
                        {{ partner.acronym }}
                      </span>
                    </div>
                    <p class="partner-card__name partner-card__name--small">{{ partner.name }}</p>
                  </a>
                </MotionWrapper>
              </div>
            </div>
          </div>

          <div v-if="partnersByTier.community.length > 0" class="partner-group">
            <h2 class="partner-group__title">Community & Cooperative Partners</h2>
            <div class="partner-group__grid partner-group__grid--medium">
              <div
                v-for="(partner, index) in partnersByTier.community"
                :key="partner.id"
                class="partner-card"
              >
                <MotionWrapper variant="fadeUp" :delay="index * 60">
                  <a
                    :href="partner.websiteUrl || '#'"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="partner-card__link"
                  >
                    <div class="partner-card__logo-box">
                      <img
                        v-if="partner.logoUrl"
                        :src="partner.logoUrl"
                        :alt="partner.name"
                        class="partner-card__logo-img"
                        loading="lazy"
                      />
                      <span v-else class="partner-card__logo-text partner-card__logo-text--small">
                        {{ partner.acronym }}
                      </span>
                    </div>
                    <p class="partner-card__name partner-card__name--small">{{ partner.name }}</p>
                  </a>
                </MotionWrapper>
              </div>
            </div>
          </div>
        </template>

        <div class="partner-cta">
          <MotionWrapper variant="fadeUp">
            <div class="partner-cta__card">
              <h2 class="partner-cta__title">Partner With N-CEDI</h2>
              <p class="partner-cta__desc">
                Invest in vocational infrastructure, sponsor student innovation projects, or co-create custom tech curriculums to drive sustainable growth.
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

.partners-state {
  text-align: center;
  color: var(--color-text-muted);
  margin-bottom: var(--space-12);
}

.partners-state--error {
  color: var(--color-brand-primary);
}

.btn-retry {
  margin-top: var(--space-3);
  font-weight: 600;
  color: var(--color-brand-primary);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
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
  padding: var(--space-6);
  text-align: center;
}

.partner-card__logo-box {
  padding: var(--space-4);
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.partner-card__logo-img {
  max-width: 100%;
  max-height: 72px;
  object-fit: contain;
}

.partner-card__logo-text {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-brand-primary);
}

.partner-card__logo-text--small {
  font-size: var(--text-lg);
}

.partner-card__name {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  margin: var(--space-3) 0 0;
  line-height: var(--leading-snug);
}

.partner-card__name--small {
  font-size: var(--text-xs);
}

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
