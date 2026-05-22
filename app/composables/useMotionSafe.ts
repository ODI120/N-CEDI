/**
 * N-CEDI — useMotionSafe
 *
 * Reactively tracks `prefers-reduced-motion` and exposes a boolean
 * that GSAP animations, Lenis, and CSS transitions can use to
 * gracefully degrade when the user prefers reduced motion.
 *
 * SSR-safe: returns `true` (motion allowed) during server-side rendering
 * so initial HTML is always the "full" version; the client then hydrates
 * and may flip the value.
 */
export function useMotionSafe() {
  const safe = ref(true)

  if (import.meta.client) {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    safe.value = !mql.matches

    const onChange = (e: MediaQueryListEvent) => {
      safe.value = !e.matches
    }

    mql.addEventListener('change', onChange)
    onScopeDispose(() => {
      mql.removeEventListener('change', onChange)
    })
  }

  return { safe: readonly(safe) }
}
