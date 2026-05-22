<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface MotionWrapperProps {
  variant?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale'
  delay?: number // in ms
  duration?: number // in seconds
  threshold?: number // trigger threshold
}

const props = withDefaults(defineProps<MotionWrapperProps>(), {
  variant: 'fadeUp',
  delay: 0,
  duration: 0.8,
  threshold: 0.15
})

const elementRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

onMounted(() => {
  // Respect prefers-reduced-motion
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
        // Once visible, stop observing
        observer.unobserve(entry.target)
      }
    },
    {
      threshold: props.threshold
    }
  )

  if (elementRef.value) {
    observer.observe(elementRef.value)
  }
})
</script>

<template>
  <div
    ref="elementRef"
    class="motion-wrapper"
    :class="[
      `motion-wrapper--${variant}`,
      { 'is-visible': isVisible }
    ]"
    :style="{
      '--motion-duration': `${duration}s`
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.motion-wrapper {
  opacity: 0;
  transition-property: opacity, transform;
  transition-duration: var(--motion-duration, 0.8s);
  transition-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform, opacity;
}

/* ─── Variants ─── */
.motion-wrapper--fadeUp {
  transform: translateY(40px);
}

.motion-wrapper--fadeIn {
  transform: none;
}

.motion-wrapper--slideLeft {
  transform: translateX(40px);
}

.motion-wrapper--slideRight {
  transform: translateX(-40px);
}

.motion-wrapper--scale {
  transform: scale(0.95);
}

/* ─── Visible State ─── */
.motion-wrapper.is-visible {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .motion-wrapper {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
</style>
