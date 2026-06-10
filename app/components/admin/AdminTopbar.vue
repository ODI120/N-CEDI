<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const user = useSupabaseUser()
const supabase = useSupabaseClient()

const isSidebarOpen = useState('admin-sidebar-open', () => false)

const signingOut = ref(false)
const showLogoutConfirm = ref(false)
const handleSignOut = async () => {
  signingOut.value = true
  try {
    await supabase.auth.signOut()
    await navigateTo('/admin/login')
  } finally {
    signingOut.value = false
  }
}

const title = computed(() => {
  const path = route.path.replace(/\/$/, '')
  
  if (path === '/admin') return 'Overview'
  if (path === '/admin/inquiries') return 'Inquiries'
  if (path === '/admin/site-stats') return 'Site Stats'
  if (path === '/admin/categories') return 'Categories'
  if (path === '/admin/gallery') return 'Gallery'
  if (path === '/admin/partners') return 'Partners'
  if (path === '/admin/team-members') return 'Team Members'
  if (path === '/admin/testimonials') return 'Testimonials'
  if (path === '/admin/logs') return 'System Logs'
  if (path === '/admin/posts') return 'Posts'
  if (path === '/admin/projects') return 'Projects'
  if (path === '/admin/connection-test') return 'Connection Test'
  if (path === '/admin/setup') return 'Setup'

  // Events
  if (path === '/admin/events') return 'Events'
  if (path === '/admin/events/new') return 'New Event'
  if (path.startsWith('/admin/events/')) return 'Edit Event'

  // Programs
  if (path === '/admin/programs') return 'Programs'
  if (path === '/admin/programs/new') return 'New Program'
  if (path.startsWith('/admin/programs/preview/')) return 'Program Preview'
  if (path.startsWith('/admin/programs/')) return 'Edit Program'

  // Users
  if (path === '/admin/users') return 'Admin Users'
  if (path.startsWith('/admin/users/')) return 'User Details'

  return 'Admin'
})
</script>

<template>
  <header class="topbar">
    <div class="topbar__left">
      <!-- Mobile hamburger toggle -->
      <button 
        class="mobile-toggle" 
        aria-label="Toggle Navigation Menu"
        @click="isSidebarOpen = !isSidebarOpen"
      >
        <UIcon name="i-lucide-menu" class="mobile-toggle__icon" />
      </button>

      <div class="topbar__title">
        <div class="topbar__breadcrumbs">
          <span class="breadcrumb-item">Operations</span>
          <UIcon name="i-lucide-chevron-right" class="breadcrumb-separator" />
          <span class="breadcrumb-item current">{{ title }}</span>
        </div>
      </div>
    </div>

    <div class="topbar__right">
      <div v-if="user" class="topbar__user">
        <span class="topbar__user-label">Logged in</span>
        <span class="topbar__user-value">{{ user?.email }}</span>
      </div>

      <button
        class="btn btn-ghost logout-btn"
        :disabled="signingOut"
        @click="showLogoutConfirm = true"
      >
        <UIcon name="i-lucide-log-out" />
        <span v-if="signingOut">Signing out...</span>
        <span v-else>Sign out</span>
      </button>
    </div>
  </header>

  <AdminModal
    :open="showLogoutConfirm"
    title="Sign Out Confirmation"
    submit-label="Sign out"
    :submit-danger="true"
    :loading="signingOut"
    @close="showLogoutConfirm = false"
    @submit="handleSignOut"
  >
    <p class="logout-confirm-text">
      Are you sure you want to sign out? Any unsaved changes in active forms will be lost.
    </p>
  </AdminModal>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  padding: var(--space-4) var(--space-8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  border-bottom: 1px solid var(--admin-border);
  background: var(--admin-surface);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

@media (max-width: 640px) {
  .topbar {
    padding: var(--space-4) var(--space-4);
  }
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.mobile-toggle {
  display: none;
  background: transparent;
  border: 1px solid var(--admin-border);
  border-radius: var(--radius-md);
  padding: 8px;
  cursor: pointer;
  color: var(--admin-text-primary);
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.mobile-toggle:hover {
  background: rgba(148, 163, 184, 0.08);
}

.mobile-toggle__icon {
  width: 20px;
  height: 20px;
}

@media (max-width: 1024px) {
  .mobile-toggle {
    display: inline-flex;
  }
}

.topbar__breadcrumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-xs);
  font-weight: 500;
}

.breadcrumb-item {
  color: var(--admin-text-muted);
}

.breadcrumb-item.current {
  color: var(--admin-text-primary);
  font-weight: 700;
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--text-base);
}

.breadcrumb-separator {
  width: 12px;
  height: 12px;
  color: var(--admin-text-muted);
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.topbar__user {
  display: none;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.15;
}

@media (min-width: 768px) {
  .topbar__user {
    display: flex;
  }
}

.topbar__user-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--admin-text-muted);
}

.topbar__user-value {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--admin-text-primary);
}

.logout-btn {
  color: var(--admin-text-secondary);
  border: 1px solid var(--admin-border);
}

.logout-btn:hover {
  background-color: rgba(239, 68, 68, 0.08) !important;
  color: #ef4444 !important;
  border-color: rgba(239, 68, 68, 0.2) !important;
}

.logout-confirm-text {
  font-size: var(--text-sm);
  color: var(--admin-text-secondary);
  line-height: 1.5;
}
</style>
