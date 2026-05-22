/**
 * N-CEDI — Motion design tokens
 *
 * Single source of truth for every animation parameter used across
 * GSAP timelines, CSS transitions, and Vue transition hooks.
 */

export const EASING = {
  smooth:    [0.25, 0.1, 0.25, 1] as const,
  snappy:    [0.77, 0, 0.175, 1] as const,
  bouncy:    [0.34, 1.56, 0.64, 1] as const,
  cinematic: [0.76, 0, 0.24, 1] as const,
  enter:     [0.0, 0.0, 0.2, 1.0] as const,
  exit:      [0.4, 0.0, 1.0, 1.0] as const,
} as const

export const DURATION = {
  instant:   0.1,
  fast:      0.3,
  base:      0.6,
  slow:      1.0,
  cinematic: 1.6,
} as const

export const STAGGER = {
  tight:  0.05,
  base:   0.10,
  loose:  0.18,
} as const

export type EasingName   = keyof typeof EASING
export type DurationName = keyof typeof DURATION
export type StaggerName  = keyof typeof STAGGER

/**
 * Helper — convert a 4-value cubic-bezier tuple to a CSS string.
 *
 * @example cssEasing(EASING.smooth) → "cubic-bezier(0.25, 0.1, 0.25, 1)"
 */
export function cssEasing(values: readonly [number, number, number, number]): string {
  return `cubic-bezier(${values.join(', ')})`
}
