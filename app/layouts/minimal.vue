<template>
  <div class="layout-minimal">
    <main id="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout-minimal {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
