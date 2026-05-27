<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const user = useSupabaseUser()
const supabase = useSupabaseClient()

const signingOut = ref(false)
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
  if (route.path === '/admin') return 'Overview'
  if (route.path.startsWith('/admin/inquiries')) return 'Inquiries'
  if (route.path.startsWith('/admin/site-stats')) return 'Site Stats'
  if (route.path.startsWith('/admin/programs')) return 'Programs'
  return 'Admin'
})
</script>

<template>
  <header class="topbar">
    <div class="topbar__left">
      <div class="topbar__title">
        <span class="topbar__eyebrow">Operations</span>
        <h1 class="topbar__h1">
          {{ title }}
        </h1>
      </div>
    </div>

    <div class="topbar__right">
      <div v-if="user" class="topbar__user">
        <span class="topbar__user-label">Signed in</span>
        <span class="topbar__user-value">{{ user?.email }}</span>
      </div>

      <UButton
        color="primary"
        variant="soft"
        size="sm"
        :loading="signingOut"
        icon="i-lucide-log-out"
        @click="handleSignOut"
      >
        Sign out
      </UButton>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  padding: var(--space-6) var(--space-8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  border-bottom: 1px solid var(--color-border);
  background: rgba(249, 249, 249, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

@media (max-width: 640px) {
  .topbar {
    padding: var(--space-5) var(--space-4);
  }
}

.topbar__eyebrow {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
  color: var(--color-text-muted);
  font-weight: 800;
  display: block;
}

.topbar__h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 900;
  color: var(--color-brand-primary);
  letter-spacing: var(--tracking-tight);
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
  font-size: 11px;
  font-weight: 800;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.topbar__user-value {
  font-size: var(--text-sm);
  font-weight: 800;
  color: var(--color-brand-primary);
}
</style>
