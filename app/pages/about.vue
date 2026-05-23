<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

usePageSeo({
  title: 'About',
  description: 'Learn about N-CEDI — the NCAT Centre for Entrepreneurship Development and Innovation. Our mission, vision, history, and the team driving innovation in Nigeria.'
})

const milestones = [
  { year: '2018', title: 'Foundation', description: 'N-CEDI was established as a centre of excellence within NCAT to bridge the gap between academic knowledge and practical skills.' },
  { year: '2019', title: 'First Programs Launched', description: 'Fashion Design and Woodwork programs launched with 50 inaugural students.' },
  { year: '2020', title: 'Digital Expansion', description: 'Web Development and Computer Hardware programs introduced to meet growing tech demand.' },
  { year: '2021', title: 'Renewable Energy Focus', description: 'Solar Installation program launched in partnership with international energy organizations.' },
  { year: '2022', title: 'Government Recognition', description: 'Officially recognized as a key innovation hub by the Federal Government of Nigeria.' },
  { year: '2023', title: 'Scaling Impact', description: 'Trained over 500 students with a 95% employment rate. Expanded partnerships across West Africa.' },
  { year: '2024', title: 'Centre of Excellence', description: 'Named a Centre of Excellence for vocational training and entrepreneurship development in Northern Nigeria.' }
]

const team = [
  { name: 'Dr. Aisha Mohammed', role: 'Director', bio: 'Leading N-CEDI\'s vision for innovation and entrepreneurship excellence in Nigeria.', avatarUrl: '/images/team/director.jpg', linkedinUrl: '#' },
  { name: 'Engr. Bello Abdullahi', role: 'Deputy Director, Programs', bio: 'Overseeing curriculum development and program delivery across all training tracks.', avatarUrl: '/images/team/deputy.jpg', linkedinUrl: '#' },
  { name: 'Mrs. Grace Okonkwo', role: 'Head of Partnerships', bio: 'Building strategic relationships with government, industry, and international partners.', avatarUrl: '/images/team/partnerships.jpg', linkedinUrl: '#' },
  { name: 'Mr. Ibrahim Musa', role: 'Head of Student Affairs', bio: 'Ensuring student success from enrollment through graduation and career placement.', avatarUrl: '/images/team/student-affairs.jpg', linkedinUrl: '#' }
]
</script>

<template>
  <div>
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
              <span class="eyebrow">Our Mission</span>
              <h2>Building Africa's Innovation Ecosystem</h2>
              <p>
                N-CEDI exists to bridge the gap between education and employment by providing
                hands-on, industry-relevant training that equips young Nigerians with the skills,
                knowledge, and entrepreneurial mindset needed to thrive in a rapidly changing world.
              </p>
            </div>
          </MotionWrapper>

          <MotionWrapper variant="fadeUp" :delay="0.15">
            <div class="mission-card">
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

        <div class="team-grid">
          <MotionWrapper
            v-for="(member, index) in team"
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
.about-mission {
  padding: var(--section-padding-y) 0;
  background: var(--color-surface);
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
  padding: var(--space-8);
  background: var(--color-surface-muted);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
}

.mission-card h2 {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-brand-primary);
  margin: var(--space-4) 0;
}

.mission-card p {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
}

.about-team {
  padding: var(--section-padding-y) 0;
  background: var(--color-surface-muted);
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-16);
}

.section-header h2 {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-brand-primary);
  margin: var(--space-4) 0;
}

.section-header p {
  font-size: var(--text-lg);
  color: var(--color-text-muted);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-8);
}

.eyebrow {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-brand-accent);
}
</style>
