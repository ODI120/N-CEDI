<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

usePageSeo({
  title: 'Home',
  description: 'N-CEDI — NCAT Centre for Entrepreneurship Development and Innovation. Empowering Africa\'s next generation of innovators through world-class vocational and tech training in Nigeria.'
})

const { programs } = await usePrograms({ limit: 6 })

const testimonials = [
  {
    name: 'Amina Ibrahim',
    role: 'Fashion Design Graduate, 2024',
    quote: 'N-CEDI transformed my passion for fashion into a thriving business. The hands-on training and mentorship were exactly what I needed to launch my own brand.',
    avatarUrl: '/images/student1.jpg'
  },
  {
    name: 'Chukwuemeka Obi',
    role: 'Web Development Graduate, 2023',
    quote: 'The web development program at N-CEDI gave me the skills to land a remote job with an international company. The curriculum is truly world-class.',
    avatarUrl: '/images/student2.jpg'
  },
  {
    name: 'Fatima Yusuf',
    role: 'Solar Installation Graduate, 2024',
    quote: 'As a woman in solar energy, N-CEDI gave me the confidence and technical expertise to lead installation projects across the region.',
    avatarUrl: '/images/student3.jpg'
  }
]

const partners = [
  { 
    id: '1',
    name: 'Federal Ministry of Innovation, Science and Technology', 
    acronym: 'FMIST',
    logoUrl: '/images/fg.png', 
    description: 'Federal agency driving Nigeria\'s science, technology and innovation policy framework.',
    websiteUrl: '#',
    icon: 'bi-bank2',
    tier: 'platinum' as const 
  },
  { 
    id: '2',
    name: 'National Board for Technology Incubation', 
    acronym: 'NBTI',
    logoUrl: '/images/ncatlogo.png', 
    description: 'Fostering technology-based entrepreneurship through incubation centres nationwide.',
    websiteUrl: '#',
    icon: 'bi-rocket-takeoff',
    tier: 'platinum' as const 
  },
  { 
    id: '3',
    name: 'National Board for Technical Education', 
    acronym: 'NBTE',
    logoUrl: '/images/nbte.png', 
    description: 'Regulating and setting standards for technical and vocational education in Nigeria.',
    websiteUrl: '#',
    icon: 'bi-mortarboard',
    tier: 'platinum' as const 
  }
]
</script>

<template>
  <div>
    <HeroHome />

    <MotionWrapper variant="fadeUp">
      <SectionStats />
    </MotionWrapper>

    <MotionWrapper variant="fadeUp" :delay="0.1">
      <SectionPrograms
        :programs="programs ?? []"
        title="Our Programs"
        subtitle="Hands-on training designed to turn passion into profession. Each program combines practical skills with entrepreneurship fundamentals."
      />
    </MotionWrapper>

    <MotionWrapper variant="fadeUp" :delay="0.1">
      <SectionTestimonials :testimonials="testimonials" />
    </MotionWrapper>

    <MotionWrapper variant="fadeUp" :delay="0.1">
      <SectionPartners :partners="partners" />
    </MotionWrapper>

    <SectionCTA
      title="Ready to Build Your Future?"
      description="Join hundreds of students who have transformed their lives through hands-on innovation training at N-CEDI."
      :primary-action="{ label: 'Explore Programs', to: '/programs' }"
      :secondary-action="{ label: 'Contact Us', to: '/contact' }"
    />
  </div>
</template>
