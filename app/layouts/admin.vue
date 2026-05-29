<script setup lang="ts">
import AdminSidebar from '~/components/admin/AdminSidebar.vue'
import AdminTopbar from '~/components/admin/AdminTopbar.vue'

const isSidebarOpen = useState('admin-sidebar-open', () => false)

// Close sidebar on route change
const route = useRoute()
watch(() => route.fullPath, () => {
  isSidebarOpen.value = false
})
</script>

<template>
  <div class="admin-shell">
    <a href="#admin-main" class="skip-to-content">
      Skip to main content
    </a>

    <!-- Mobile sidebar backdrop -->
    <Transition name="fade">
      <div 
        v-if="isSidebarOpen" 
        class="mobile-backdrop" 
        @click="isSidebarOpen = false"
      />
    </Transition>

    <AdminSidebar 
      class="admin-sidebar" 
      :class="{ 'is-mobile-open': isSidebarOpen }"
    />

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
  background: var(--admin-bg);
}

@media (max-width: 1024px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }
  
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex !important;
    width: 280px;
    box-shadow: var(--admin-shadow-lg);
  }

  .admin-sidebar.is-mobile-open {
    transform: translateX(0);
  }
}

.mobile-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 21, 41, 0.4);
  backdrop-filter: blur(4px);
  z-index: 45;
}

.admin-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.admin-main {
  padding: var(--space-8);
  flex: 1;
}

@media (max-width: 640px) {
  .admin-main {
    padding: var(--space-6) var(--space-4);
  }
}

/* Slide/fade animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

