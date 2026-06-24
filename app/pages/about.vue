<script setup lang="ts">
import { computed } from 'vue'
import { useTeamMembers } from '~/composables/useTeamMembers'
import { useStats } from '~/composables/useStats'
import { formatStatDisplay } from '~/utils/siteStatAdmin'

definePageMeta({
  layout: 'default'
})

usePageSeo({
  title: 'About N-CEDI - Entrepreneurship Development & Innovation Centre',
  description: 'Learn about N-CEDI — the NCAT Centre for Entrepreneurship Development and Innovation. Our mission, vision, history, and the team driving innovation in Nigeria.'
})

// Add Organization schema for About page
useSchemaOrg([
  defineOrganization({
    name: 'N-CEDI',
    alternateName: 'NCAT Centre for Entrepreneurship Development and Innovation',
    url: 'https://n-cedi.vercel.app',
    logo: 'https://n-cedi.vercel.app/logo.webp',
    description: 'A premier centre of excellence within the Nigerian College of Aviation Technology (NCAT), dedicated to vocational training and entrepreneurship development in Nigeria.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Zaria',
      addressRegion: 'Kaduna State',
      addressCountry: 'NG'
    },
    foundingDate: '2018',
    sameAs: [
      'https://twitter.com/ncedi_ng'
    ]
  })
])

const milestones = [
  { year: '2018', title: 'Foundation', badge: 'Initiative', description: 'N-CEDI was established as a centre of excellence within NCAT to bridge the gap between academic knowledge and practical skills.' },
  { year: '2019', title: 'First Programs Launched', badge: 'Launch', description: 'Fashion Design and Woodwork programs launched with 50 inaugural students.' },
  { year: '2020', title: 'Digital Expansion', badge: 'Tech Era', description: 'Web Development and Computer Hardware programs introduced to meet growing tech demand.' },
  { year: '2021', title: 'Renewable Energy Focus', badge: 'Green Energy', description: 'Solar Installation program launched in partnership with international energy organizations.' },
  { year: '2022', title: 'Government Recognition', badge: 'Partnership', description: 'Officially recognized as a key innovation hub by the Federal Government of Nigeria.' },
  { year: '2023', title: 'Scaling Impact', badge: 'Expansion', description: 'Trained over 500 students with a 95% employment rate. Expanded partnerships across West Africa.' },
  { year: '2024', title: 'Centre of Excellence', badge: 'Excellence', description: 'Named a Centre of Excellence for vocational training and entrepreneurship development in Northern Nigeria.' }
]

const values = [
  {
    icon: 'i-lucide-lightbulb',
    title: 'Innovation',
    description: 'We embrace creativity and forward-thinking approaches to solve real-world challenges through technology and skilled craftsmanship.'
  },
  {
    icon: 'i-lucide-heart-handshake',
    title: 'Excellence',
    description: 'We maintain the highest standards in training, facilities, and mentorship to produce world-class graduates.'
  },
  {
    icon: 'i-lucide-users',
    title: 'Community',
    description: 'We foster a collaborative environment where students, mentors, and partners grow together.'
  },
  {
    icon: 'i-lucide-target',
    title: 'Impact',
    description: 'We measure our success by the tangible outcomes and opportunities we create for our graduates.'
  }
]

const programs = [
  {
    icon: 'i-lucide-code',
    title: 'Technology & Digital Skills',
    description: 'Web development, computer hardware, and digital literacy programs preparing students for the modern economy.'
  },
  {
    icon: 'i-lucide-scissors',
    title: 'Vocational Crafts',
    description: 'Fashion design, woodwork, and hands-on craftsmanship programs that preserve traditional skills while modernizing techniques.'
  },
  {
    icon: 'i-lucide-sun',
    title: 'Renewable Energy',
    description: 'Solar installation and sustainable energy training in partnership with international organizations.'
  },
  {
    icon: 'i-lucide-briefcase',
    title: 'Entrepreneurship',
    description: 'Business development, financial literacy, and startup incubation to create job creators, not just job seekers.'
  }
]

// ─── Live stats from Supabase ───────────────────────────────
const { stats: impactStats, pending: statsPending } = useStats()

// Hero feature card: show the first stat prominently, rest as mini-stats
const heroStat = computed(() => impactStats.value?.[0] ?? null)
const miniStats = computed(() => impactStats.value?.slice(1, 4) ?? [])

const { teamMembers, loading } = useTeamMembers()
</script>

<template>
  <div class="about-page">
    <HeroInner
      title="About N-CEDI"
      subtitle="Empowering Africa's next generation of innovators through world-class vocational training and entrepreneurship development."
      :breadcrumbs="[{ label: 'About', to: '/about' }]"
    />

    <!-- ━━━ INTRO: Editorial Split Layout ━━━ -->
    <section class="about-intro">
      <div class="container">
        <MotionWrapper variant="fadeUp">
          <div class="intro-split">
            <div class="intro-text-col">
              <span class="label-tag">Who We Are</span>
              <h2 class="intro-heading">
                The NCAT Centre for Entrepreneurship Development
                <span class="heading-accent">&amp; Innovation</span>
              </h2>
              <p class="intro-lead">
                N-CEDI is a premier centre of excellence established within the Nigerian College of Aviation Technology (NCAT), dedicated to bridging the gap between academic education and practical industry skills.
              </p>
              <p class="intro-body">
                Located in Zaria, Kaduna State, our centre serves as a hub for innovation, skill development, and economic empowerment. Through partnerships with government agencies, international organizations, and industry leaders, we deliver training programs that meet global standards while addressing local needs.
              </p>
            </div>

            <div class="intro-feature-col">
              <div class="feature-card">
                <div class="feature-card__glow"></div>
                <div class="feature-card__inner">
                  <!-- Loading shimmer -->
                  <template v-if="statsPending && !impactStats?.length">
                    <div class="feature-stat-row">
                      <span class="feature-big-number feature-shimmer"></span>
                    </div>
                    <p class="feature-tagline">Loading impact data…</p>
                    <div class="feature-mini-stats">
                      <div v-for="n in 3" :key="n" class="mini-stat">
                        <span class="mini-val feature-shimmer--sm"></span>
                        <span class="mini-lbl feature-shimmer--xs"></span>
                      </div>
                    </div>
                  </template>

                  <!-- Live data -->
                  <template v-else-if="heroStat">
                    <div class="feature-stat-row">
                      <span class="feature-big-number">{{ formatStatDisplay(heroStat) }}</span>
                      <span class="feature-unit">{{ heroStat.label }}</span>
                    </div>
                    <p class="feature-tagline">Driven by world-class vocational training since 2018</p>
                    <div v-if="miniStats.length" class="feature-mini-stats">
                      <template v-for="(ms, idx) in miniStats" :key="ms.id">
                        <div v-if="idx > 0" class="mini-divider"></div>
                        <div class="mini-stat">
                          <span class="mini-val">{{ formatStatDisplay(ms) }}</span>
                          <span class="mini-lbl">{{ ms.label }}</span>
                        </div>
                      </template>
                    </div>
                  </template>

                  <!-- Fallback: no stats in DB -->
                  <template v-else>
                    <p class="feature-tagline">Impact statistics coming soon.</p>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </div>
    </section>

    <!-- ━━━ MISSION & VISION: Asymmetric Dark/Light Cards ━━━ -->
    <section class="about-mission">
      <div class="about-mission__deco-orb about-mission__deco-orb--1"></div>
      <div class="about-mission__deco-orb about-mission__deco-orb--2"></div>
      <div class="container">
        <div class="mission-layout">
          <MotionWrapper variant="fadeUp">
            <div class="mv-card mv-card--dark">
              <div class="mv-card__badge">01</div>
              <span class="label-tag label-tag--on-dark">Our Mission</span>
              
              <div class="mv-card__icon-wrap">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-dasharray="4 2" />
                  <circle cx="12" cy="12" r="5" fill="rgba(107, 89, 255, 0.35)" />
                  <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </div>

              <h2 class="mv-card__title mv-card__title--light">Building Africa's Innovation Ecosystem</h2>
              <p class="mv-card__text mv-card__text--light">
                N-CEDI exists to bridge the gap between education and employment by providing
                hands-on, industry-relevant training that equips young Nigerians with the skills,
                knowledge, and entrepreneurial mindset needed to thrive in a rapidly changing world.
              </p>
              
            </div>
          </MotionWrapper>

          <MotionWrapper variant="fadeUp" :delay="0.12">
            <div class="mv-card mv-card--light">
              <div class="mv-card__badge">02</div>
              <span class="label-tag">Our Vision</span>

              <div class="mv-card__icon-wrap mv-card__icon-wrap--accent">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="var(--color-brand-accent)" stroke-width="1.5" />
                  <circle cx="12" cy="12" r="3" fill="rgba(107, 89, 255, 0.25)" />
                  <path d="M12 5V3M12 21v-2" stroke="var(--color-brand-accent)" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </div>

              <h2 class="mv-card__title">A Centre of Global Excellence</h2>
              <p class="mv-card__text">
                To become Africa's premier centre for entrepreneurship development and innovation,
                producing world-class graduates who drive economic growth, create jobs, and solve
                real-world problems through skilled craftsmanship and technology.
              </p>
              
            </div>
          </MotionWrapper>
        </div>
      </div>
    </section>

    <!-- ━━━ PROGRAMS: Numbered Editorial List ━━━ -->
    <section class="about-programs">
      <div class="container">
        <MotionWrapper variant="fadeUp">
          <div class="section-header">
            <span class="label-tag">What We Do</span>
            <h2>Our Training Programs</h2>
            <p>Comprehensive vocational and entrepreneurship programs designed for real-world impact.</p>
          </div>
        </MotionWrapper>

        <div class="programs-list">
          <MotionWrapper
            v-for="(program, index) in programs"
            :key="program.title"
            variant="fadeUp"
            :delay="index * 0.08"
          >
            <div class="prog-item">
              <div class="prog-item__number">{{ String(index + 1).padStart(2, '0') }}</div>
              <div class="prog-item__icon-circle">
                <UIcon :name="program.icon" />
              </div>
              <div class="prog-item__body">
                <h3>{{ program.title }}</h3>
                <p>{{ program.description }}</p>
              </div>
              <div class="prog-item__arrow">
                <UIcon name="i-lucide-arrow-right" />
              </div>
            </div>
          </MotionWrapper>
        </div>
      </div>
    </section>

    <!-- ━━━ VALUES: Bento Grid ━━━ -->
    <section class="about-values">
      <div class="container">
        <MotionWrapper variant="fadeUp">
          <div class="section-header section-header--left">
            <span class="label-tag">Our Core Values</span>
            <h2>What Drives Us</h2>
          </div>
        </MotionWrapper>

        <div class="values-bento">
          <MotionWrapper
            v-for="(value, index) in values"
            :key="value.title"
            variant="fadeUp"
            :delay="index * 0.08"
          >
            <div class="val-card" :class="{ 'val-card--hero': index === 0 }">
              <div class="val-card__icon">
                <UIcon :name="value.icon" />
              </div>
              <h3>{{ value.title }}</h3>
              <p>{{ value.description }}</p>
            </div>
          </MotionWrapper>
        </div>
      </div>
    </section>

    <!-- ━━━ IMPACT: Dark Full-Bleed Section ━━━ -->
    <section class="about-impact">
      <div class="about-impact__mesh"></div>
      <div class="container">
        <MotionWrapper variant="fadeUp">
          <div class="impact-header">
            <span class="label-tag label-tag--on-dark">Our Impact</span>
            <h2>Numbers That Speak</h2>
          </div>
        </MotionWrapper>

        <MotionWrapper variant="fadeUp" :delay="0.1">
          <!-- Loading shimmer for impact stats -->
          <div v-if="statsPending && !impactStats?.length" class="impact-grid">
            <div v-for="n in 4" :key="n" class="impact-stat impact-stat--loading">
              <div class="impact-shimmer impact-shimmer--value"></div>
              <div class="impact-shimmer impact-shimmer--label"></div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="!impactStats?.length" class="impact-empty">
            <p>Impact statistics will appear here once published in the admin portal.</p>
          </div>

          <!-- Live data -->
          <div v-else class="impact-grid">
            <div
              v-for="stat in impactStats"
              :key="stat.id"
              class="impact-stat"
            >
              <div class="impact-stat__value">{{ formatStatDisplay(stat) }}</div>
              <div class="impact-stat__label">{{ stat.label }}</div>
            </div>
          </div>
        </MotionWrapper>
      </div>
    </section>

    <!-- ━━━ TIMELINE ━━━ -->
    <MotionWrapper variant="fadeUp">
      <SectionTimeline :items="milestones" />
    </MotionWrapper>

    <!-- ━━━ TEAM ━━━ -->
    <section class="about-team">
      <div class="container">
        <MotionWrapper variant="fadeUp">
          <div class="section-header">
            <span class="label-tag">Our Leadership</span>
            <h2>Meet the Team</h2>
            <p>The passionate leaders driving N-CEDI's mission forward.</p>
          </div>
        </MotionWrapper>

        <!-- Loading Skeleton -->
        <div v-if="loading && teamMembers.length === 0" class="team-grid">
          <div v-for="n in 3" :key="n" class="team-skeleton-card">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-text skeleton-name"></div>
            <div class="skeleton-text skeleton-role"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="teamMembers.length === 0" class="team-empty-state">
          <MotionWrapper variant="fadeUp" :delay="100">
            <div class="empty-icon-wrap">
              <UIcon name="i-lucide-users" class="empty-icon" />
            </div>
            <h3 class="empty-title">No Leadership Profiles Published</h3>
            <p class="empty-description">
              We are currently finalizing our leadership and contributor team list. Please check back shortly to meet the team!
            </p>
          </MotionWrapper>
        </div>

        <div v-else class="team-grid">
          <MotionWrapper
            v-for="(member, index) in teamMembers"
            :key="member.name"
            variant="fadeUp"
            :delay="index * 0.1"
          >
            <TeamCard :member="member" />
          </MotionWrapper>
        </div>
      </div>
    </section>

    <SectionCTA
      title="Join Our Mission"
      description="Whether as a student, partner, or supporter — there's a place for you in the N-CEDI story."
      :primary-action="{ label: 'Explore Programs', to: '/programs' }"
      :secondary-action="{ label: 'Partner With Us', to: '/contact' }"
    />
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   ABOUT PAGE — Creative Editorial Redesign
   ═══════════════════════════════════════════════════════════ */

/* ─── Keyframes ─── */
@keyframes driftOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-15px, 15px) scale(0.97); }
}

@keyframes meshShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes shimmerSlide {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulseGlow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.08); }
}

@keyframes countReveal {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ─── Page Root ─── */
.about-page {
  background-color: #fafafa;
  color: var(--color-text-dark);
}

/* ─── Shared Label Tag (replaces old .eyebrow) ─── */
.label-tag {
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-brand-accent);
  display: inline-block;
  padding: 6px 16px;
  border-radius: var(--radius-full);
  background: rgba(107, 89, 255, 0.06);
  border: 1px solid rgba(107, 89, 255, 0.14);
}

.label-tag--on-dark {
  color: #c4bbff;
  background: rgba(107, 89, 255, 0.15);
  border-color: rgba(107, 89, 255, 0.25);
}

/* ─── Section Header ─── */
.section-header {
  text-align: center;
  margin-bottom: var(--space-12);
  max-width: 620px;
  margin-inline: auto;
}

.section-header--left {
  text-align: left;
  margin-inline: 0;
}

.section-header h2 {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-brand-primary);
  margin: var(--space-4) 0 var(--space-2);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

.section-header p {
  font-size: var(--text-lg);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  margin: 0;
}


/* ═══════════════════════════════════════════════
   1. INTRO — Editorial Split Layout
   ═══════════════════════════════════════════════ */
.about-intro {
  padding: var(--section-padding-y) 0;
  background: #fafafa;
  position: relative;
  overflow: hidden;
}

.intro-split {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: var(--space-12);
  align-items: center;
}

@media (max-width: 900px) {
  .intro-split {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
}

@media (max-width: 480px) {
  .intro-split {
    gap: var(--space-6);
  }
}

.intro-text-col {
  position: relative;
}

.intro-heading {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 800;
  color: var(--color-brand-primary);
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin: var(--space-5) 0 var(--space-6);
}

.heading-accent {
  display: block;
  background: linear-gradient(135deg, #6B59FF, #9B8FFF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.intro-lead {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  color: var(--color-text-dark);
  line-height: var(--leading-relaxed);
  font-weight: 500;
  margin-bottom: var(--space-4);
}

.intro-body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
}

/* Feature Card */
.feature-card {
  position: relative;
  border-radius: var(--radius-2xl);
  padding: 3px;
  background: linear-gradient(135deg, rgba(107,89,255,0.4), rgba(107,89,255,0.08), rgba(107,89,255,0.3));
}

.feature-card__glow {
  position: absolute;
  inset: -30px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, rgba(107,89,255,0.12) 0%, transparent 65%);
  animation: pulseGlow 5s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

.feature-card__inner {
  position: relative;
  z-index: 1;
  background: #ffffff;
  border-radius: calc(var(--radius-2xl) - 2px);
  padding: var(--space-10) var(--space-8);
  text-align: center;
}

@media (max-width: 480px) {
  .feature-card__inner {
    padding: var(--space-8) var(--space-5);
  }
}

.feature-stat-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.feature-big-number {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 8vw, 5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #6B59FF, #9B8FFF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.feature-unit {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-muted);
}

.feature-tagline {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-8);
  line-height: var(--leading-normal);
}

.feature-mini-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-5);
  padding-top: var(--space-6);
  border-top: 1px solid rgba(107, 89, 255, 0.1);
  flex-wrap: wrap;
}

.mini-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
}

.mini-val {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-brand-primary);
  white-space: nowrap;
}

.mini-lbl {
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.mini-divider {
  width: 1px;
  height: 32px;
  background: rgba(107, 89, 255, 0.12);
}

@media (max-width: 400px) {
  .feature-mini-stats {
    gap: var(--space-3);
  }

  .mini-val {
    font-size: var(--text-lg);
  }

  .mini-lbl {
    font-size: 0.6rem;
    letter-spacing: 0.06em;
  }

  .mini-divider {
    height: 24px;
  }
}


/* ═══════════════════════════════════════════════
   2. MISSION & VISION — Asymmetric Dark/Light
   ═══════════════════════════════════════════════ */
.about-mission {
  padding: var(--section-padding-y) 0;
  background: linear-gradient(170deg, #f3f1fe 0%, #f9f9fb 45%, #fafafa 100%);
  position: relative;
  overflow: hidden;
}

.about-mission__deco-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.about-mission__deco-orb--1 {
  width: 320px;
  height: 320px;
  top: -80px;
  right: -100px;
  background: radial-gradient(circle, rgba(107, 89, 255, 0.07) 0%, transparent 60%);
  animation: driftOrb 14s ease-in-out infinite;
}

.about-mission__deco-orb--2 {
  width: 220px;
  height: 220px;
  bottom: -60px;
  left: -60px;
  background: radial-gradient(circle, rgba(107, 89, 255, 0.05) 0%, transparent 60%);
  animation: driftOrb 18s ease-in-out infinite reverse;
}

.mission-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
  position: relative;
  z-index: 1;
}

@media (max-width: 800px) {
  .mission-layout {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .mv-card {
    min-height: auto;
  }
}

/* ─── Mission/Vision Card base ─── */
.mv-card {
  position: relative;
  padding: clamp(var(--space-8), 4vw, var(--space-12));
  border-radius: var(--radius-2xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  overflow: hidden;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease;
  min-height: 340px;
}

.mv-card:hover {
  transform: translateY(-6px);
}

/* Dark variant (Mission) */
.mv-card--dark {
  background: linear-gradient(145deg, #18142e 0%, #1e1940 50%, #241f4d 100%);
  color: #fff;
  box-shadow:
    0 2px 4px rgba(0,0,0,0.1),
    0 12px 40px rgba(24, 20, 46, 0.3);
}

.mv-card--dark:hover {
  box-shadow:
    0 4px 8px rgba(0,0,0,0.12),
    0 24px 60px rgba(24, 20, 46, 0.4);
}

/* Light variant (Vision) */
.mv-card--light {
  background: #ffffff;
  border: 1px solid rgba(107, 89, 255, 0.12);
  box-shadow:
    0 1px 3px rgba(0,0,0,0.04),
    0 8px 30px rgba(107, 89, 255, 0.06);
}

.mv-card--light:hover {
  box-shadow:
    0 2px 6px rgba(0,0,0,0.06),
    0 20px 50px rgba(107, 89, 255, 0.1);
}

/* Badge number */
.mv-card__badge {
  position: absolute;
  top: var(--space-6);
  right: var(--space-6);
  font-family: var(--font-display);
  font-size: clamp(4rem, 8vw, 6rem);
  font-weight: 900;
  line-height: 1;
  opacity: 0.06;
  pointer-events: none;
  user-select: none;
}

.mv-card--dark .mv-card__badge {
  color: #ffffff;
  opacity: 0.08;
}

.mv-card--light .mv-card__badge {
  color: var(--color-brand-accent);
  opacity: 0.06;
}

.mv-card__title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 800;
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  margin: 0;
}

.mv-card__title--light {
  color: #ffffff;
}

.mv-card__text {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  margin-top: auto;
}

.mv-card__text--light {
  color: rgba(255,255,255,0.65);
}

.mv-card__icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--space-4);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.mv-card:hover .mv-card__icon-wrap {
  transform: scale(1.1) rotate(4deg);
}

.mv-card--dark .mv-card__icon-wrap {
  background: rgba(107, 89, 255, 0.15);
  border: 1px solid rgba(107, 89, 255, 0.25);
}

.mv-card__icon-wrap--accent {
  background: rgba(107, 89, 255, 0.06);
  border: 1px solid rgba(107, 89, 255, 0.15);
}


/* ═══════════════════════════════════════════════
   3. PROGRAMS — Numbered Editorial List
   ═══════════════════════════════════════════════ */
.about-programs {
  padding: var(--section-padding-y) 0;
  background: #ffffff;
}

.programs-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.prog-item {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-8) var(--space-6);
  border-bottom: 1px solid rgba(107, 89, 255, 0.08);
  position: relative;
  transition:
    background 0.35s ease,
    padding-left 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: var(--radius-xl);
  cursor: default;
}

.prog-item:first-child {
  border-top: 1px solid rgba(107, 89, 255, 0.08);
}

.prog-item:hover {
  background: rgba(107, 89, 255, 0.025);
  padding-left: var(--space-8);
}

.prog-item__number {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  color: rgba(107, 89, 255, 0.1);
  min-width: 72px;
  line-height: 1;
  transition: color 0.35s ease;
  flex-shrink: 0;
}

.prog-item:hover .prog-item__number {
  color: rgba(107, 89, 255, 0.22);
}

.prog-item__icon-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(107, 89, 255, 0.08), rgba(107, 89, 255, 0.02));
  border: 1.5px solid rgba(107, 89, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-brand-accent);
  font-size: 1.35rem;
  flex-shrink: 0;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.35s ease;
}

.prog-item:hover .prog-item__icon-circle {
  transform: scale(1.08) rotate(5deg);
  background: linear-gradient(135deg, rgba(107, 89, 255, 0.12), rgba(107, 89, 255, 0.04));
}

.prog-item__body {
  flex: 1;
  min-width: 0;
}

.prog-item__body h3 {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-brand-primary);
  margin: 0 0 var(--space-1);
  line-height: var(--leading-tight);
}

.prog-item__body p {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  margin: 0;
}

.prog-item__arrow {
  font-size: 1.25rem;
  color: rgba(107, 89, 255, 0.15);
  flex-shrink: 0;
  transition: color 0.3s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.prog-item:hover .prog-item__arrow {
  color: var(--color-brand-accent);
  transform: translateX(4px);
}

@media (max-width: 640px) {
  .prog-item {
    flex-wrap: wrap;
    gap: var(--space-4);
    padding: var(--space-6) var(--space-4);
  }

  .prog-item__number {
    min-width: 48px;
    font-size: 1.8rem;
  }

  .prog-item__arrow {
    display: none;
  }
}

@media (max-width: 420px) {
  .prog-item {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: var(--space-3);
    padding: var(--space-5) var(--space-3);
  }

  .prog-item__number {
    grid-row: 1 / 3;
    display: flex;
    align-items: center;
    min-width: 36px;
    font-size: 1.5rem;
  }

  .prog-item__icon-circle {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
  }

  .prog-item__body {
    grid-column: 2;
  }

  .prog-item__body h3 {
    font-size: var(--text-base);
  }

  .prog-item__body p {
    font-size: var(--text-xs);
  }

  .prog-item__arrow {
    display: none;
  }
}


/* ═══════════════════════════════════════════════
   4. VALUES — Bento Grid
   ═══════════════════════════════════════════════ */
.about-values {
  padding: var(--section-padding-y) 0;
  background: #fafafa;
  position: relative;
}

.values-bento {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);
}

@media (max-width: 1024px) {
  .values-bento {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .values-bento {
    grid-template-columns: 1fr;
  }
}

.val-card {
  background: #ffffff;
  border: 1px solid rgba(107, 89, 255, 0.08);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  position: relative;
  overflow: hidden;
  transition:
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.5s ease,
    border-color 0.35s ease;
    
}

/* Top accent gradient bar */
.val-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #6B59FF, #9B8FFF, #6B59FF);
  background-size: 200% auto;
  animation: meshShift 5s ease-in-out infinite;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.val-card:hover::before {
  opacity: 1;
}

.val-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(107, 89, 255, 0.08);
  border-color: rgba(107, 89, 255, 0.18);
}

.val-card--hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}

@media (max-width: 560px) {
  .val-card--hero {
    flex-direction: column;
  }
}

.val-card__icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, rgba(107, 89, 255, 0.08), rgba(107, 89, 255, 0.02));
  border: 1.5px solid rgba(107, 89, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-brand-accent);
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-bottom: var(--space-4);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.val-card:hover .val-card__icon {
  transform: scale(1.08) rotate(5deg);
}

.val-card--hero .val-card__icon {
  width: 64px;
  height: 64px;
  font-size: 1.75rem;
  margin-bottom: 0;
}

.val-card h3 {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-brand-primary);
  margin: 0 0 var(--space-2);
  line-height: var(--leading-tight);
}

.val-card p {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  margin: 0;
}


/* ═══════════════════════════════════════════════
   5. IMPACT — Dark Full-Bleed Section
   ═══════════════════════════════════════════════ */
.about-impact {
  padding: clamp(4rem, 10vw, 8rem) 0;
  background: linear-gradient(145deg, #0f0c24 0%, #18142e 40%, #1e1940 100%);
  position: relative;
  overflow: hidden;
}

.about-impact__mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(107, 89, 255, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 30%, rgba(107, 89, 255, 0.08) 0%, transparent 50%);
  animation: meshShift 12s ease-in-out infinite;
  background-size: 200% 200%;
  pointer-events: none;
}

.impact-header {
  text-align: center;
  margin-bottom: var(--space-12);
  position: relative;
  z-index: 1;
}

.impact-header h2 {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: #ffffff;
  margin: var(--space-4) 0 0;
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

.impact-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

@media (max-width: 800px) {
  .impact-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }
}

@media (max-width: 420px) {
  .impact-grid {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
}

.impact-stat {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  position: relative;
  animation: countReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Subtle glow ring */
.impact-stat::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 1px solid rgba(107, 89, 255, 0.15);
  pointer-events: none;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.impact-stat:hover::before {
  width: 130px;
  height: 130px;
  border-color: rgba(107, 89, 255, 0.3);
  box-shadow: 0 0 30px rgba(107, 89, 255, 0.1);
}

/* Vertical dividers */
.impact-stat + .impact-stat::after {
  content: '';
  position: absolute;
  top: 25%;
  left: 0;
  height: 50%;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(107, 89, 255, 0.2), transparent);
}

@media (max-width: 800px) {
  .impact-stat:nth-child(3)::after {
    display: none;
  }
}

@media (max-width: 420px) {
  .impact-stat + .impact-stat::after {
    display: none;
  }

  .impact-stat {
    padding: var(--space-5) var(--space-4);
  }

  .impact-stat::before {
    display: none;
  }
}

.impact-stat__value {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #ffffff;
  line-height: 1;
  margin-bottom: var(--space-2);
  position: relative;
  z-index: 1;
  text-shadow: 0 0 40px rgba(107, 89, 255, 0.3);
}

.impact-stat__label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.45);
  position: relative;
  z-index: 1;
}


/* ═══════════════════════════════════════════════
   6. TEAM
   ═══════════════════════════════════════════════ */
.about-team {
  padding: var(--section-padding-y) 0;
  background: #fafafa;
  position: relative;
}

.about-team::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(107, 89, 255, 0.15), transparent);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: var(--space-8);
}

@media (max-width: 640px) {
  .team-grid {
    gap: var(--space-6);
  }
}


/* ═══════════════════════════════════════════════
   Empty State / Skeletons
   ═══════════════════════════════════════════════ */
.team-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 520px;
  margin: var(--space-8) auto;
  padding: var(--space-16) var(--space-8);
  border: 1.5px dashed rgba(107, 89, 255, 0.15);
  border-radius: var(--radius-2xl);
  background: #ffffff;
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(107, 89, 255, 0.08), rgba(107, 89, 255, 0.02));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-5);
  color: var(--color-brand-accent);
  border: 1.5px solid rgba(107, 89, 255, 0.12);
}

.empty-icon {
  font-size: 2rem;
}

.empty-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 800;
  color: var(--color-brand-primary);
  margin: 0 0 var(--space-3) 0;
}

.empty-description {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  margin: 0;
  max-width: 400px;
}

/* Skeleton Cards */
.team-skeleton-card {
  padding: var(--space-8) var(--space-6);
  background: #ffffff;
  border-radius: var(--radius-2xl);
  border: 1px solid rgba(107, 89, 255, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.skeleton-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0eeff 25%, #e8e5ff 50%, #f0eeff 75%);
  background-size: 200% 100%;
  animation: shimmerSlide 1.8s ease-in-out infinite;
}

.skeleton-text {
  background: linear-gradient(90deg, #f0eeff 25%, #e8e5ff 50%, #f0eeff 75%);
  background-size: 200% 100%;
  height: 14px;
  border-radius: var(--radius-sm);
  animation: shimmerSlide 1.8s ease-in-out infinite;
}

.skeleton-name { width: 60%; }
.skeleton-role { width: 40%; height: 11px; }

/* ═══════════════════════════════════════════════
   Stats Loading Shimmers
   ═══════════════════════════════════════════════ */

/* Feature card shimmer (intro) */
.feature-shimmer {
  display: inline-block;
  width: 140px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: linear-gradient(90deg, #f0eeff 25%, #e8e5ff 50%, #f0eeff 75%);
  background-size: 200% 100%;
  animation: shimmerSlide 1.8s ease-in-out infinite;
}

.feature-shimmer--sm {
  display: inline-block;
  width: 48px;
  height: 24px;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, #f0eeff 25%, #e8e5ff 50%, #f0eeff 75%);
  background-size: 200% 100%;
  animation: shimmerSlide 1.8s ease-in-out infinite;
}

.feature-shimmer--xs {
  display: inline-block;
  width: 56px;
  height: 12px;
  border-radius: var(--radius-xs);
  background: linear-gradient(90deg, #f0eeff 25%, #e8e5ff 50%, #f0eeff 75%);
  background-size: 200% 100%;
  animation: shimmerSlide 1.8s ease-in-out infinite;
}

/* Impact section shimmer (dark) */
.impact-stat--loading {
  opacity: 0.5;
}

.impact-shimmer {
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, rgba(107,89,255,0.1) 25%, rgba(107,89,255,0.2) 50%, rgba(107,89,255,0.1) 75%);
  background-size: 200% 100%;
  animation: shimmerSlide 1.8s ease-in-out infinite;
  margin: 0 auto;
}

.impact-shimmer--value {
  width: 80px;
  height: 48px;
  margin-bottom: var(--space-2);
}

.impact-shimmer--label {
  width: 100px;
  height: 14px;
}

/* Impact empty state (dark section) */
.impact-empty {
  text-align: center;
  padding: var(--space-12) var(--space-6);
  position: relative;
  z-index: 1;
}

.impact-empty p {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}
</style>
