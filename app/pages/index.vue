<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

usePageSeo({
  title: 'Home',
  description: 'N-CEDI — NCAT Centre for Entrepreneurship Development and Innovation. Empowering Africa\'s next generation of innovators through world-class vocational and tech training in Nigeria.'
})

// Programs are above the fold, so we await them for SSR
const { programs } = await useHomepagePrograms(6)

// Below fold data is loaded lazily (non-blocking)
const { partners: homepagePartners } = useHomepagePartners(6)
const displayPartners = useResolvedSectionPartners(homepagePartners)

const { testimonials, pending: testimonialsPending } = useHomepageTestimonials(6)

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
      <SectionTestimonials :testimonials="testimonials ?? []" :loading="testimonialsPending" />
    </MotionWrapper>

    <MotionWrapper variant="fadeUp" :delay="0.1">
      <SectionPartners :partners="displayPartners" />
    </MotionWrapper>

    <SectionCTA
      title="Ready to Build Your Future?"
      description="Join hundreds of students who have transformed their lives through hands-on innovation training at N-CEDI."
      :primary-action="{ label: 'Explore Programs', to: '/programs' }"
      :secondary-action="{ label: 'Contact Us', to: '/contact' }"
    />
  </div>
</template>
