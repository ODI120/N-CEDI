<script setup lang="ts">
import AppLogo from '~/components/AppLogo.vue'

const nav = [
  { label: 'Overview', to: '/admin', icon: 'i-lucide-layout-dashboard' },
  { label: 'Categories', to: '/admin/categories', icon: 'i-lucide-tags' },
  { label: 'Events', to: '/admin/events', icon: 'i-lucide-calendar-days' },
  { label: 'Gallery', to: '/admin/gallery', icon: 'i-lucide-images' },
  { label: 'Inquiries', to: '/admin/inquiries', icon: 'i-lucide-inbox' },
  { label: 'Partners', to: '/admin/partners', icon: 'i-lucide-handshake' },
  { label: 'Posts', to: '/admin/posts', icon: 'i-lucide-newspaper' },
  { label: 'Programs', to: '/admin/programs', icon: 'i-lucide-graduation-cap' },
  { label: 'Projects', to: '/admin/projects', icon: 'i-lucide-folder-kanban' },
  { label: 'Site Stats', to: '/admin/site-stats', icon: 'i-lucide-bar-chart-3' },
  { label: 'Team Members', to: '/admin/team-members', icon: 'i-lucide-users' },
  { label: 'Testimonials', to: '/admin/testimonials', icon: 'i-lucide-message-square-quote' },
  { label: 'Admin Users', to: '/admin/users', icon: 'i-lucide-shield-check' },
  { label: 'System Logs', to: '/admin/logs', icon: 'i-lucide-activity' }
]

const user = useSupabaseUser()
const supabase = useSupabaseClient()

const { data: adminProfile } = useAsyncData('sidebar-admin-role', async () => {
  if (!user.value?.id) return null
  const { data } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.value.id)
    .maybeSingle()
  return data
})
</script>

<template>
  <aside class="sidebar" aria-label="Admin navigation">
    <div class="sidebar__header">
      <NuxtLink to="/admin" class="brand" aria-label="N-CEDI Admin Home">
        <AppLogo class="brand__logo" />
        <div class="brand__text">
          <span class="brand__name">N-CEDI</span>
          <span class="brand__meta">Admin Portal</span>
        </div>
      </NuxtLink>
    </div>

    <nav class="sidebar__nav" @wheel.prevent>
      <ul class="sidebar__list">
        <li v-for="item in nav" :key="item.to">
          <NuxtLink :to="item.to" class="sidebar__link" active-class="is-active">
            <UIcon :name="item.icon" class="sidebar__icon" />
            <span class="sidebar__label">{{ item.label }}</span>
            <span class="sidebar__indicator" />
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="sidebar__footer">
      <div v-if="user" class="sidebar__profile">
        <div class="profile__avatar">
          {{ user.email?.[0].toUpperCase() || 'A' }}
        </div>
        <div class="profile__details">
          <span class="profile__email" :title="user.email">{{ user.email }}</span>
          <span class="profile__role">{{ adminProfile?.role?.replace('_', ' ') || 'Editor' }}</span>
        </div>
      </div>
      
      <NuxtLink to="/" class="sidebar__footer-link">
        <UIcon name="i-lucide-arrow-left" class="sidebar__footer-icon" />
        Public site
      </NuxtLink>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--admin-border);
  background: var(--admin-surface);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.sidebar__header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--admin-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: inherit;
}

.brand__logo {
  width: 36px;
  height: auto;
  color: var(--admin-brand-accent);
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand__name {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: var(--text-lg);
  letter-spacing: var(--tracking-tight);
  color: var(--admin-text-primary);
}

.brand__meta {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
  color: var(--admin-brand-accent);
  margin-top: 1px;
}

.sidebar__nav {
  padding: var(--space-5) var(--space-4);
  flex: 1;
  overflow-y: auto;
}

.sidebar__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
}

.sidebar__link {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 12px 14px;
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--admin-text-secondary);
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar__link:hover {
  background: rgba(212, 168, 83, 0.06);
  border-color: rgba(212, 168, 83, 0.1);
  color: var(--admin-text-primary);
  transform: translateX(4px);
}

.sidebar__link.is-active {
  background: rgba(212, 168, 83, 0.12);
  border-color: rgba(212, 168, 83, 0.2);
  color: var(--admin-text-primary);
  font-weight: 600;
}

.sidebar__indicator {
  position: absolute;
  left: 0;
  top: 25%;
  height: 50%;
  width: 3px;
  background-color: var(--admin-brand-accent);
  border-radius: 0 4px 4px 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.sidebar__link.is-active .sidebar__indicator {
  opacity: 1;
}

.sidebar__icon {
  width: 18px;
  height: 18px;
  color: var(--admin-text-muted);
  transition: color 0.2s;
}

.sidebar__link:hover .sidebar__icon,
.sidebar__link.is-active .sidebar__icon {
  color: var(--admin-brand-accent);
}

.sidebar__label {
  font-size: var(--text-sm);
}

.sidebar__footer {
  padding: var(--space-5) var(--space-6);
  border-top: 1px solid var(--admin-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.sidebar__profile {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 10px;
  background: rgba(148, 163, 184, 0.06);
  border-radius: var(--radius-xl);
  border: 1px solid var(--admin-border);
}

.profile__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--admin-brand-primary) 0%, #1e293b 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--text-sm);
  border: 2px solid var(--admin-brand-accent);
}

.profile__details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.profile__email {
  font-size: 12px;
  font-weight: 600;
  color: var(--admin-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile__role {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--admin-brand-accent);
  letter-spacing: 0.5px;
}

.sidebar__footer-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--admin-text-muted);
  text-decoration: none;
  font-weight: 600;
  font-size: var(--text-sm);
  transition: color 0.2s;
}

.sidebar__footer-link:hover {
  color: var(--admin-brand-accent);
}

.sidebar__footer-icon {
  width: 16px;
  height: 16px;
}
</style>
