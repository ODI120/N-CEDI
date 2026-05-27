<script setup lang="ts">
import AdminSidebar from '~/components/admin/AdminSidebar.vue'
import AdminTopbar from '~/components/admin/AdminTopbar.vue'
</script>

<template>
  <div class="admin-shell">
    <a href="#admin-main" class="skip-to-content">
      Skip to main content
    </a>

    <AdminSidebar class="admin-sidebar" />

    <div class="admin-content">
      <AdminTopbar />

      <main id="admin-main" class="admin-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px 1fr;
  background: var(--color-surface);
}

@media (max-width: 1024px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }
}

.admin-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.admin-main {
  padding: var(--space-8);
}

@media (max-width: 640px) {
  .admin-main {
    padding: var(--space-6) var(--space-4);
  }
}
</style>

