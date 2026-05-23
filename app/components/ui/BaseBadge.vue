<script setup lang="ts">
interface BaseBadgeProps {
  type: 'beginner' | 'intermediate' | 'advanced' | 'featured' | 'new'
  label: string
}

defineProps<BaseBadgeProps>()
</script>

<template>
  <span
    :class="['base-badge', `base-badge--${type}`]"
    role="status"
  >
    {{ label }}
  </span>
</template>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.05em;
  line-height: 1.5;
  border-radius: var(--radius-full);
  white-space: nowrap;
  border: 1px solid transparent;
}

.base-badge--beginner {
  background-color: var(--color-surface-muted);
  color: var(--color-brand-secondary);
  border-color: var(--color-surface-inset);
}

.base-badge--intermediate {
  background-color: var(--color-surface-muted);
  color: var(--color-brand-accent);
  border-color: var(--color-surface-inset);
}

.base-badge--advanced {
  background-color: var(--color-surface);
  color: var(--color-brand-primary);
  border-color: var(--color-surface-inset);
}

.base-badge--featured {
  background: var(--color-brand-primary);
  color: var(--color-text-light);
}

.base-badge--new {
  background: var(--color-brand-secondary);
  color: var(--color-text-light);
}
</style>
