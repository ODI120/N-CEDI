<script setup lang="ts">
import { computed } from 'vue'

interface BaseButtonProps {
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  to?: string
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<BaseButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
  to: undefined,
  type: 'button'
})

const isLink = computed(() => !!props.to)

const componentTag = computed(() => {
  if (isLink.value) return resolveComponent('NuxtLink')
  return 'button'
})

const bindProps = computed(() => {
  if (isLink.value) {
    return { to: props.to }
  }
  return {
    type: props.type,
    disabled: props.disabled || props.loading
  }
})
</script>

<template>
  <component
    :is="componentTag"
    v-bind="bindProps"
    :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${size}`,
      {
        'base-button--disabled': disabled,
        'base-button--loading': loading,
        'base-button--block': block
      }
    ]"
    :aria-disabled="disabled || loading || undefined"
    :aria-busy="loading || undefined"
  >
    <span v-if="loading" class="base-button__spinner" aria-hidden="true">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
      </svg>
    </span>
    <span class="base-button__content" :class="{ 'base-button__content--hidden': loading }">
      <slot />
    </span>
  </component>
</template>

<style scoped>
.base-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition:
    background-color 0.3s cubic-bezier(0.77, 0, 0.175, 1),
    color 0.3s cubic-bezier(0.77, 0, 0.175, 1),
    transform 0.3s cubic-bezier(0.77, 0, 0.175, 1),
    box-shadow 0.3s cubic-bezier(0.77, 0, 0.175, 1);
  white-space: nowrap;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* ─── Variants ─── */
.base-button--primary {
  background-color: var(--color-brand-primary);
  color: var(--color-text-inverse);
}

.base-button--primary:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: var(--color-primary-800);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.base-button--accent {
  background-color: var(--color-brand-accent);
  color: var(--color-brand-primary);
}

.base-button--accent:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: var(--color-accent-600);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.base-button--secondary {
  background-color: transparent;
  color: var(--color-brand-primary);
  border: 1px solid var(--color-border);
}

.base-button--secondary:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: var(--color-primary-50);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.base-button--ghost {
  background-color: transparent;
  color: var(--color-brand-primary);
}

.base-button--ghost:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: var(--color-surface-muted);
}

/* ─── Sizes ─── */
.base-button--sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-xs);
  border-radius: var(--radius-sm);
}

.base-button--md {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-sm);
  border-radius: var(--radius-md);
}

.base-button--lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-base);
  border-radius: var(--radius-md);
}

.base-button--xl {
  padding: var(--space-5) var(--space-10);
  font-size: var(--text-lg);
  border-radius: var(--radius-lg);
}

/* ─── States ─── */
.base-button:focus-visible {
  outline: 2px solid var(--color-brand-accent);
  outline-offset: 2px;
}

.base-button:active:not(.base-button--disabled):not(.base-button--loading) {
  transform: scale(0.97);
}

.base-button--disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.base-button--block {
  display: flex;
  width: 100%;
}

.base-button--loading {
  cursor: wait;
}

/* ─── Spinner ─── */
.base-button__spinner {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spin 0.8s linear infinite;
}

.base-button__content--hidden {
  visibility: hidden;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ─── Reduced Motion ─── */
@media (prefers-reduced-motion: reduce) {
  .base-button {
    transition: none;
  }

  .base-button__spinner {
    animation-duration: 1.5s;
  }
}
</style>
