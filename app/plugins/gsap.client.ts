/**
 * N-CEDI — GSAP client plugin
 *
 * Registers GSAP core + ScrollTrigger and provides them via Nuxt's
 * `useNuxtApp().$gsap` / `$ScrollTrigger` helpers.
 *
 * When the user prefers reduced motion, ScrollTrigger is still
 * registered (so layout-measuring code works) but all durations
 * are forced to 0 via `gsap.globalTimeline.timeScale()`.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger)

  const { safe } = useMotionSafe()

  // When reduced motion is preferred, collapse all animation durations
  if (!safe.value) {
    gsap.globalTimeline.timeScale(1_000)
    ScrollTrigger.defaults({ animation: undefined })
  }

  // React to runtime changes (e.g. user toggles the OS setting)
  watch(safe, (motionAllowed) => {
    gsap.globalTimeline.timeScale(motionAllowed ? 1 : 1_000)
  })

  return {
    provide: {
      gsap,
      ScrollTrigger
    }
  }
})
