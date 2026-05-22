<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface MagneticElProps {
  strength?: number // 0 to 1
}

const props = withDefaults(defineProps<MagneticElProps>(), {
  strength: 0.4
})

const elRef = ref<HTMLElement | null>(null)
const transformStyle = ref('')
const isReducedMotion = ref(false)

onMounted(() => {
  isReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

const handleMouseMove = (event: MouseEvent) => {
  if (isReducedMotion.value || !elRef.value) return

  const rect = elRef.value.getBoundingClientRect()
  
  // Calculate relative cursor position from element center
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const deltaX = event.clientX - centerX
  const deltaY = event.clientY - centerY

  // Compute transform distance based on strength
  const moveX = deltaX * props.strength
  const moveY = deltaY * props.strength

  transformStyle.value = `translate(${moveX}px, ${moveY}px)`
}

const handleMouseLeave = () => {
  transformStyle.value = ''
}
</script>

<template>
  <div
    ref="elRef"
    class="magnetic-container"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    :style="{ transform: transformStyle }"
  >
    <slot />
  </div>
</template>

<style scoped>
.magnetic-container {
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .magnetic-container {
    transform: none !important;
    transition: none !important;
  }
}
</style>
