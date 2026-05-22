<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'N-CEDI — NCAT Centre for Entrepreneurship Development and Innovation'
const description = 'Empowering the next generation of African innovators through hands-on vocational and tech training at NCAT, Nigeria.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/og/default.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: '@ncedi_ng'
})
</script>

<template>
  <a href="#main-content" class="skip-to-content">
    Skip to main content
  </a>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
