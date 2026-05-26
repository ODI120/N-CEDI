<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

usePageSeo({
  title: 'Home',
  description: 'N-CEDI — NCAT Centre for Entrepreneurship Development and Innovation. Empowering Africa\'s next generation of innovators through world-class vocational and tech training in Nigeria.'
})

// Placeholder data — will be replaced with Supabase fetch
const stats = [
  { value: 500, suffix: '+', label: 'Students Trained', icon: 'users' },
  { value: 6, label: 'Programs Offered', icon: 'book' },
  { value: 95, suffix: '%', label: 'Employment Rate', icon: 'trending-up' },
  { value: 12, suffix: '+', label: 'Partner Organizations', icon: 'handshake' }
]

const programs: Array<{
  title: string
  slug: string
  description: string
  coverImageUrl: string
  durationWeeks: number
  level: 'beginner' | 'intermediate' | 'advanced'
  isFeatured: boolean
}> = [
  {
    title: 'Fashion Design',
    slug: 'fashion-design',
    description: 'Master the art of fashion from concept to creation. Learn pattern making, sewing, and fashion business.',
    coverImageUrl: '/images/programs/fashion-design.jpg',
    durationWeeks: 24,
    level: 'beginner',
    isFeatured: true
  },
  {
    title: 'Web Design & Development',
    slug: 'web-design-development',
    description: 'Build modern, responsive websites and web applications using industry-standard tools and frameworks.',
    coverImageUrl: '/images/programs/web-development.jpg',
    durationWeeks: 16,
    level: 'intermediate',
    isFeatured: true
  },
  {
    title: 'Solar Installation',
    slug: 'solar-installation-energy-systems',
    description: 'Gain practical skills in solar panel installation, maintenance, and renewable energy systems.',
    coverImageUrl: '/images/programs/solar-installation.jpg',
    durationWeeks: 12,
    level: 'beginner',
    isFeatured: true
  },
  {
    title: 'Computer Hardware',
    slug: 'computer-hardware-engineering',
    description: 'Learn computer assembly, repair, networking, and hardware troubleshooting from industry experts.',
    coverImageUrl: '/images/programs/computer-hardware.jpg',
    durationWeeks: 16,
    level: 'intermediate',
    isFeatured: false
  },
  {
    title: 'Woodwork',
    slug: 'woodwork-furniture-design',
    description: 'Develop craftsmanship in furniture making, carpentry, and wood finishing techniques.',
    coverImageUrl: '/images/programs/woodwork.jpg',
    durationWeeks: 20,
    level: 'beginner',
    isFeatured: false
  },
  {
    title: 'Bakery & Bead Making',
    slug: 'bakery-bead-making',
    description: 'Master baking, confectionery, and traditional bead-making crafts for entrepreneurship.',
    coverImageUrl: '/images/programs/bakery.jpg',
    durationWeeks: 12,
    level: 'beginner',
    isFeatured: false
  }
]

const testimonials = [
  {
    name: 'Amina Ibrahim',
    role: 'Fashion Design Graduate, 2024',
    quote: 'N-CEDI transformed my passion for fashion into a thriving business. The hands-on training and mentorship were exactly what I needed to launch my own brand.',
    avatarUrl: '/images/testimonials/amina.jpg'
  },
  {
    name: 'Chukwuemeka Obi',
    role: 'Web Development Graduate, 2023',
    quote: 'The web development program at N-CEDI gave me the skills to land a remote job with an international company. The curriculum is truly world-class.',
    avatarUrl: '/images/testimonials/chukwuemeka.jpg'
  },
  {
    name: 'Fatima Yusuf',
    role: 'Solar Installation Graduate, 2024',
    quote: 'As a woman in solar energy, N-CEDI gave me the confidence and technical expertise to lead installation projects across the region.',
    avatarUrl: '/images/testimonials/fatima.jpg'
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
    tier: 'platinum' as const 
  },
  { 
    id: '2',
    name: 'National Board for Technology Incubation', 
    acronym: 'NBTI',
    logoUrl: '/images/ncatlogo.png', 
    description: 'Fostering technology-based entrepreneurship through incubation centres nationwide.',
    websiteUrl: '#', 
    tier: 'platinum' as const 
  },
  { 
    id: '3',
    name: 'National Board for Technical Education', 
    acronym: 'NBTE',
    logoUrl: '/images/nbte.png', 
    description: 'Regulating and setting standards for technical and vocational education in Nigeria.',
    websiteUrl: '#', 
    tier: 'platinum' as const 
  }
]
</script>

<template>
  <div>
    <HeroHome />

    <MotionWrapper variant="fadeUp">
      <SectionStats :stats="stats" />
    </MotionWrapper>

    <MotionWrapper variant="fadeUp" :delay="0.1">
      <SectionPrograms
        :programs="programs"
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
