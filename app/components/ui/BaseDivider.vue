<script setup lang="ts">
import { useSlots } from 'vue'

const slots = useSlots()
const hasIcon = !!slots.icon
</script>

<template>
  <div
    :class="['base-divider', { 'base-divider--with-icon': hasIcon }]"
    role="separator"
    aria-orientation="horizontal"
  >
    <template v-if="hasIcon">
      <span class="base-divider__line" />
      <span class="base-divider__icon">
        <slot name="icon" />
      </span>
      <span class="base-divider__line" />
    </template>
  </div>
</template>

<style scoped>
.base-divider {
  width: 100%;
  height: 1px;
  background-color: var(--color-border);
}

.base-divider--with-icon {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  height: auto;
  background: none;
}

.base-divider__line {
  flex: 1;
  height: 1px;
  background-color: var(--color-border);
}

.base-divider__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: var(--text-lg);
  flex-shrink: 0;
}
</style>
