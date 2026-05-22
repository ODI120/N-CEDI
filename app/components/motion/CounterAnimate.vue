<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface CounterAnimateProps {
  target: number
  duration?: number // in ms
  prefix?: string
  suffix?: string
  decimals?: number
}

const props = withDefaults(defineProps<CounterAnimateProps>(), {
  duration: 2000,
  prefix: '',
  suffix: '',
  decimals: 0
})

const elementRef = ref<HTMLElement | null>(null)
const currentValue = ref(0)
const formattedValue = ref('')

// Initialize visual value
formattedValue.value = `${props.prefix}0${props.suffix}`

const startCounter = () => {
  const startTime = performance.now()

  const count = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / props.duration, 1)

    // Ease-out quad function for smooth deceleration
    const easeProgress = progress * (2 - progress)
    
    currentValue.value = easeProgress * props.target
    
    formattedValue.value = `${props.prefix}${currentValue.value.toFixed(props.decimals)}${props.suffix}`

    if (progress < 1) {
      requestAnimationFrame(count)
    } else {
      currentValue.value = props.target
      formattedValue.value = `${props.prefix}${props.target.toFixed(props.decimals)}${props.suffix}`
    }
  }

  requestAnimationFrame(count)
}

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) {
    formattedValue.value = `${props.prefix}${props.target.toFixed(props.decimals)}${props.suffix}`
    return
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        startCounter()
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.2 }
  )

  if (elementRef.value) {
    observer.observe(elementRef.value)
  }
})
</script>

<template>
  <span ref="elementRef" class="counter-value">
    {{ formattedValue }}
  </span>
</template>

<style scoped>
.counter-value {
  display: inline-block;
  font-variant-numeric: tabular-nums;
}
</style>
