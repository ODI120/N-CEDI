<template>
  <span class="app-logo" aria-hidden="true">
    <img
      src="/logo.png"
      alt=""
      class="app-logo__image"
      loading="eager"
      decoding="async"
    >
    <span class="app-logo__text">N-CEDI</span>
  </span>
</template>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  line-height: 0;
}

.app-logo__image {
  display: block;
  width: auto;
  height: 100%;
  object-fit: contain;
}

.app-logo__text {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 800;
  letter-spacing: var(--tracking-tight);
  color: var(--color-brand-primary);
  line-height: 1;
}
</style>
