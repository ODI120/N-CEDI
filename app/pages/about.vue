<script setup lang="ts">
import { useTeamMembers } from '~/composables/useTeamMembers'

definePageMeta({
  layout: 'default'
})

usePageSeo({
  title: 'About',
  description: 'Learn about N-CEDI — the NCAT Centre for Entrepreneurship Development and Innovation. Our mission, vision, history, and the team driving innovation in Nigeria.'
})

const milestones = [
  { year: '2018', title: 'Foundation', badge: 'Initiative', description: 'N-CEDI was established as a centre of excellence within NCAT to bridge the gap between academic knowledge and practical skills.' },
  { year: '2019', title: 'First Programs Launched', badge: 'Launch', description: 'Fashion Design and Woodwork programs launched with 50 inaugural students.' },
  { year: '2020', title: 'Digital Expansion', badge: 'Tech Era', description: 'Web Development and Computer Hardware programs introduced to meet growing tech demand.' },
  { year: '2021', title: 'Renewable Energy Focus', badge: 'Green Energy', description: 'Solar Installation program launched in partnership with international energy organizations.' },
  { year: '2022', title: 'Government Recognition', badge: 'Partnership', description: 'Officially recognized as a key innovation hub by the Federal Government of Nigeria.' },
  { year: '2023', title: 'Scaling Impact', badge: 'Expansion', description: 'Trained over 500 students with a 95% employment rate. Expanded partnerships across West Africa.' },
  { year: '2024', title: 'Centre of Excellence', badge: 'Excellence', description: 'Named a Centre of Excellence for vocational training and entrepreneurship development in Northern Nigeria.' }
]

const { teamMembers } = useTeamMembers()
</script>

<template>
  <div class="about-page">
    <HeroInner
      title="About N-CEDI"
      subtitle="Empowering Africa's next generation of innovators through world-class vocational training and entrepreneurship development."
      :breadcrumbs="[{ label: 'Home', to: '/' }, { label: 'About' }]"
    />

    <!-- Mission & Vision -->
    <section class="about-mission">
      <div class="container">
        <div class="mission-grid">
          <MotionWrapper variant="fadeUp">
            <div class="mission-card">
              <div class="mission-card__icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="var(--color-brand-accent)"
                    stroke-width="2"
                    stroke-dasharray="4 2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="5"
                    fill="rgba(107, 89, 255, 0.25)"
                  />
                  <path
                    d="M12 3v3M12 18v3M3 12h3M18 12h3"
                    stroke="var(--color-brand-accent)"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <span class="eyebrow">Our Mission</span>
              <h2>Building Africa's Innovation Ecosystem</h2>
              <p>
                N-CEDI exists to bridge the gap between education and employment by providing
                hands-on, industry-relevant training that equips young Nigerians with the skills,
                knowledge, and entrepreneurial mindset needed to thrive in a rapidly changing world.
              </p>
            </div>
          </MotionWrapper>

          <MotionWrapper
            variant="fadeUp"
            :delay="0.15"
          >
            <div class="mission-card">
              <div class="mission-card__icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
                    stroke="var(--color-brand-accent)"
                    stroke-width="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    fill="rgba(107, 89, 255, 0.25)"
                  />
                  <path
                    d="M12 5V3M12 21v-2"
                    stroke="var(--color-brand-accent)"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                  <path
                    d="M17 12h4M3 12h4"
                    stroke="var(--color-brand-accent)"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <span class="eyebrow">Our Vision</span>
              <h2>A Centre of Global Excellence</h2>
              <p>
                To become Africa's premier centre for entrepreneurship development and innovation,
                producing world-class graduates who drive economic growth, create jobs, and solve
                real-world problems through skilled craftsmanship and technology.
              </p>
            </div>
          </MotionWrapper>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <MotionWrapper variant="fadeUp">
      <SectionTimeline :items="milestones" />
    </MotionWrapper>

    <!-- Team -->
    <section class="about-team">
      <div class="container">
        <MotionWrapper variant="fadeUp">
          <div class="section-header">
            <span class="eyebrow">Our Leadership</span>
            <h2>Meet the Team</h2>
            <p>The passionate leaders driving N-CEDI's mission forward.</p>
          </div>
        </MotionWrapper>

        <!-- Empty State -->
        <div v-if="teamMembers.length === 0" class="team-empty-state">
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
.about-page {
  background: var(--color-surface);
}

.about-mission {
  padding: var(--section-padding-y) 0;
  background: var(--color-surface);
  position: relative;
  overflow: hidden;
}

.mission-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-8);
}

@media (min-width: 768px) {
  .mission-grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-12);
  }
}

.mission-card {
  padding: clamp(var(--space-8), 5vw, var(--space-12));
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-2xl);
  border: 1px solid #6B59FF25;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.mission-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(107, 89, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border-color: rgba(107, 89, 255, 0.35);
}

.mission-card__icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-xl);
  background: rgba(107, 89, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-6);
  border: 1px solid rgba(107, 89, 255, 0.15);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.mission-card:hover .mission-card__icon {
  transform: scale(1.1) rotate(5deg);
}

.mission-card h2 {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-brand-primary);
  margin: var(--space-3) 0 var(--space-4) 0;
  line-height: var(--leading-tight);
}

.mission-card p {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  margin-top: auto;
}

.about-team {
  padding: var(--section-padding-y) 0;
  background: var(--color-surface-muted);
  border-top: 1px solid var(--color-border);
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-16);
  max-width: 600px;
  margin-inline: auto;
}

.section-header h2 {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-brand-primary);
  margin: var(--space-3) 0;
  line-height: var(--leading-tight);
}

.section-header p {
  font-size: var(--text-lg);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-8);
}

.eyebrow {
  font-family: var(--font-display);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-brand-accent);
  display: inline-block;
  background: rgba(107, 89, 255, 0.06);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(107, 89, 255, 0.12);
}

.team-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 600px;
  margin: var(--space-8) auto;
  padding: var(--space-12) var(--space-6);
  border: 1px dashed rgba(107, 89, 255, 0.25);
  border-radius: var(--radius-2xl);
  background-color: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(8px);
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(107, 89, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-6);
  color: var(--color-brand-accent);
  border: 1px solid rgba(107, 89, 255, 0.15);
}

.empty-icon {
  font-size: 2.25rem;
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
  line-height: var(--leading-normal);
  margin: 0;
}
</style>
