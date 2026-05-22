<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface ParallaxLayerProps {
  speed?: number // speed multiplier (e.g. 0.1 to 0.8)
  direction?: 'up' | 'down'
}

const props = withDefaults(defineProps<ParallaxLayerProps>(), {
  speed: 0.3,
  direction: 'down'
})

const containerRef = ref<HTMLElement | null>(null)
const transformY = ref(0)
let animationId = 0
let isReducedMotion = false

const updateParallax = () => {
  if (!containerRef.value || isReducedMotion) return

  const rect = containerRef.value.getBoundingClientRect()
  const windowHeight = window.innerHeight
  
  // Calculate relative intersection center of the element
  const elementCenter = rect.top + rect.height / 2
  const viewportCenter = windowHeight / 2
  const distance = elementCenter - viewportCenter

  // Calculate translation
  const directionMultiplier = props.direction === 'down' ? 1 : -1
  transformY.value = distance * props.speed * directionMultiplier

  animationId = requestAnimationFrame(updateParallax)
}

onMounted(() => {
  isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!isReducedMotion) {
    animationId = requestAnimationFrame(updateParallax)
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<template>
  <div ref="containerRef" class="parallax-container">
    <div
      class="parallax-content"
      :style="{ transform: `translateY(${transformY}px)` }"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.parallax-container {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;
}

.parallax-content {
  will-change: transform;
  transition: transform 0.1s cubic-bezier(0.25, 1, 0.5, 1);
  height: 100%;
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .parallax-content {
    transform: none !important;
    transition: none !important;
  }
}
</style>
