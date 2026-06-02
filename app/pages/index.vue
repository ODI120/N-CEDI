<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

usePageSeo({
  title: 'Home',
  description: 'N-CEDI — NCAT Centre for Entrepreneurship Development and Innovation. Empowering Africa\'s next generation of innovators through world-class vocational and tech training in Nigeria.'
})

const { programs } = await useHomepagePrograms(6)
const { partners: homepagePartners } = await useHomepagePartners(6)
const displayPartners = useResolvedSectionPartners(homepagePartners)
const { testimonials } = await useHomepageTestimonials(6)

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
