<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface TextRevealProps {
  text: string
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p'
  delay?: number // in ms
}

const props = withDefaults(defineProps<TextRevealProps>(), {
  tag: 'h2',
  delay: 0
})

const containerRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const words = computed(() => props.text.split(' '))

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) {
    isVisible.value = true
    return
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          isVisible.value = true
        }, props.delay)
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.15 }
  )

  if (containerRef.value) {
    observer.observe(containerRef.value)
  }
})
</script>

<template>
  <component
    :is="tag"
    ref="containerRef"
    class="text-reveal-container"
    :class="{ 'is-revealed': isVisible }"
  >
    <span
      v-for="(word, index) in words"
      :key="index"
      class="text-reveal__word-wrapper"
    >
      <span
        class="text-reveal__word"
        :style="{
          'transition-delay': `${index * 0.05}s`
        }"
      >
        {{ word }}&nbsp;
      </span>
    </span>
  </component>
</template>

<style scoped>
.text-reveal-container {
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  margin: 0;
}

.text-reveal__word-wrapper {
  display: inline-block;
  overflow: hidden;
}

.text-reveal__word {
  display: inline-block;
  transform: translateY(105%);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

/* Revealed class triggered by observer */
.is-revealed .text-reveal__word {
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .text-reveal__word {
    transform: none !important;
    transition: none !important;
  }
}
</style>
