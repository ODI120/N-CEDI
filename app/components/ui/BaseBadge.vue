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
}

.base-badge--beginner {
  background-color: var(--color-secondary-50);
  color: var(--color-brand-secondary);
}

.base-badge--intermediate {
  background-color: var(--color-accent-50);
  color: var(--color-accent-700);
}

.base-badge--advanced {
  background-color: var(--color-primary-50);
  color: var(--color-brand-primary);
}

.base-badge--featured {
  background-color: var(--color-brand-accent);
  color: var(--color-brand-primary);
}

.base-badge--new {
  background-color: var(--color-brand-secondary);
  color: #ffffff;
}
</style>
