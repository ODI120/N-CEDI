<script setup lang="ts">
import AppLogo from '~/components/AppLogo.vue'

const nav = [
  { label: 'Overview', to: '/admin', icon: 'i-lucide-layout-dashboard' },
  { label: 'Inquiries', to: '/admin/inquiries', icon: 'i-lucide-inbox' },
  { label: 'Site Stats', to: '/admin/site-stats', icon: 'i-lucide-bar-chart-3' },
  { label: 'Programs', to: '/admin/programs', icon: 'i-lucide-graduation-cap' }
]
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

    <nav class="sidebar__nav">
      <ul class="sidebar__list">
        <li v-for="item in nav" :key="item.to">
          <NuxtLink :to="item.to" class="sidebar__link" active-class="is-active">
            <UIcon :name="item.icon" class="sidebar__icon" />
            <span class="sidebar__label">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="sidebar__footer">
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
  border-right: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

@media (max-width: 1024px) {
  .sidebar {
    display: none;
  }
}

.sidebar__header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: inherit;
}

.brand__logo {
  width: 34px;
  height: auto;
  color: var(--color-brand-primary);
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand__name {
  font-family: var(--font-display);
  font-weight: 900;
  letter-spacing: var(--tracking-tight);
  color: var(--color-brand-primary);
}

.brand__meta {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
  color: var(--color-text-muted);
  margin-top: 2px;
}

.sidebar__nav {
  padding: var(--space-4);
  flex: 1;
}

.sidebar__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 10px 12px;
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--color-text-muted);
  border: 1px solid transparent;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.sidebar__link:hover {
  background: rgba(107, 89, 255, 0.06);
  border-color: rgba(107, 89, 255, 0.14);
  color: var(--color-brand-primary);
}

.sidebar__link.is-active {
  background: rgba(107, 89, 255, 0.12);
  border-color: rgba(107, 89, 255, 0.22);
  color: var(--color-brand-accent);
}

.sidebar__icon {
  width: 18px;
  height: 18px;
}

.sidebar__label {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: var(--text-sm);
}

.sidebar__footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
}

.sidebar__footer-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
  text-decoration: none;
  font-weight: 700;
  font-size: var(--text-sm);
}

.sidebar__footer-link:hover {
  color: var(--color-brand-primary);
}

.sidebar__footer-icon {
  width: 16px;
  height: 16px;
}
</style>
