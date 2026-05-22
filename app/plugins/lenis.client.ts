/**
 * N-CEDI — Lenis smooth-scroll client plugin
 *
 * Creates a Lenis instance (lerp: 0.08, smoothWheel) and hooks it
 * into the GSAP ticker + ScrollTrigger.scrollerProxy so every
 * scroll-driven animation uses the same smooth value.
 *
 * Completely skipped when `prefers-reduced-motion: reduce` is active.
 */
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin(() => {
  const { safe } = useMotionSafe()

  // Bail out – respect the user's accessibility preference
  if (!safe.value) {
    return
  }

  const lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true
  })

  // Pipe Lenis' scroll position into ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update)

  // Drive Lenis on every GSAP tick so both systems stay in sync
  gsap.ticker.add((time: number) => {
    lenis.raf(time * 1000) // Lenis expects milliseconds
  })

  // Prevent GSAP's internal lag-smoothing from fighting Lenis
  gsap.ticker.lagSmoothing(0)

  // Tear down on app unmount
  const nuxtApp = useNuxtApp()
  nuxtApp.hook('app:beforeMount', () => {
    /* no-op — Lenis is already running */
  })

  // Clean up when the Nuxt app is suspended / unmounted
  const cleanup = () => {
    gsap.ticker.remove(lenis.raf as unknown as gsap.TickerCallback)
    lenis.destroy()
  }

  if (import.meta.hot) {
    import.meta.hot.dispose(cleanup)
  }

  return {
    provide: {
      lenis
    }
  }
})
