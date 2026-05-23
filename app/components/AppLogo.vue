<template>
  <span class="app-logo" aria-hidden="true">
    <img
      src="/logo.png"
      alt=""
      class="app-logo__image"
      loading="eager"
      decoding="async"
    >
  </span>
</template>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  line-height: 0;
}

.app-logo__image {
  display: block;
  width: auto;
  height: 100%;
  object-fit: contain;
}
</style>
