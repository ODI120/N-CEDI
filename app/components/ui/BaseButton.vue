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
  font-family: var(--font-body);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.base-button:focus-visible {
  outline: 2px solid var(--color-brand-accent);
  outline-offset: 2px;
}

/* ─── Sizes ─── */
.base-button--sm { padding: 6px 16px; font-size: 13px; min-height: 36px; }
.base-button--md { padding: 10px 24px; font-size: 15px; min-height: 44px; }
.base-button--lg { padding: 14px 32px; font-size: 16px; min-height: 48px; }
.base-button--xl { padding: 18px 40px; font-size: 18px; min-height: 56px; }

.base-button--block {
  width: 100%;
}

/* ─── Variants ─── */
.base-button--primary {
  background-color: var(--color-brand-accent);
  color: var(--color-text-light);
  border-color: transparent;
  border-radius: var(--radius-full);
}
.base-button--primary:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: var(--color-brand-accent);
  box-shadow: 0 4px 12px rgba(87, 73, 194, 0.3);
}

.base-button--secondary {
  background-color: var(--color-text-light);
  color: var(--color-brand-primary);
  border-color: #6B59FF50;
  border-radius: var(--radius-full);
}
.base-button--secondary:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #6B59FF10;
  border-color: #6B59FF;
  color: var(--color-brand-accent);
}

.base-button--accent {
  background-color: var(--color-brand-accent);
  color: var(--color-text-light);
  border-color: transparent;
}
.base-button--accent:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #5a47d1;
}

.base-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
