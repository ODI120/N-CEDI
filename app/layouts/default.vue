<template>
  <div class="layout-default">
    <AppNavbar />

    <main id="main-content">
      <slot />
    </main>

    <AppFooter />
    <AppCookieBanner />
  </div>
</template>

<style scoped>
.layout-default {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#main-content {
  flex: 1;
}
</style>
