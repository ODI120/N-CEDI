<script setup lang="ts">
definePageMeta({ layout: 'minimal' })
useSeoMeta({ title: 'Admin Sign In | N-CEDI' })

const route = useRoute()
const supabase = useSupabaseClient()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const redirectTo = computed(() => {
  const raw = route.query.redirect
  return typeof raw === 'string' && raw.startsWith('/admin') ? raw : '/admin'
})

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    })

    if (error) {
      errorMessage.value = error.message
      return
    }

    if (!data.user?.id) {
      errorMessage.value = 'Sign in succeeded, but the user session was not available. Please try again.'
      return
    }

    await navigateTo(redirectTo.value)
  } catch (e: unknown) {
    errorMessage.value = e instanceof Error ? e.message : 'Login failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="admin-login-wrapper">
    <!-- Visual background blobs and grid -->
    <div class="login-bg">
      <div class="orb orb-1" />
      <div class="orb orb-2" />
      <div class="grid-overlay" />
    </div>

    <div class="login-card glass-card glass-card-accent-gold">
      <div class="login-card__header">
        <span class="eyebrow">N-CEDI PORTAL</span>
        <h1 class="title">Sign In</h1>
        <p class="subtitle">Secure administration console for N-CEDI educational operations.</p>
      </div>

      <div v-if="route.query.reason === 'not_admin'" class="alert alert-warning">
        <strong>Access restricted:</strong> Your account is authenticated, but not enrolled as an admin user.
      </div>

      <div v-if="errorMessage" class="alert alert-danger">
        <strong>Sign in failed:</strong> {{ errorMessage }}
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="am-field">
          <label class="am-label">Email Address</label>
          <div class="input-with-icon">
            <UIcon name="i-lucide-mail" class="input-icon" />
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="admin@ncedi.edu.ng"
              class="am-input"
              required
            />
          </div>
        </div>

        <div class="am-field mt-field">
          <label class="am-label">Password</label>
          <div class="input-with-icon">
            <UIcon name="i-lucide-lock" class="input-icon" />
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="am-input"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary w-full mt-btn"
          :disabled="loading"
        >
          <UIcon v-if="!loading" name="i-lucide-shield-check" />
          <UIcon v-else name="i-lucide-loader-2" class="spin" />
          {{ loading ? 'Authenticating...' : 'Authenticate Securely' }}
        </button>
      </form>

      <div class="login-card__footer">
        <NuxtLink to="/" class="back-link">
          <UIcon name="i-lucide-arrow-left" class="back-icon" />
          Back to public site
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-login-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-4);
  background: #090e1a;
  overflow: hidden;
}

.login-bg { position: absolute; inset: 0; z-index: 1; }
.orb { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.25; }
.orb-1 { width: 500px; height: 500px; background: #d4a853; top: -10%; left: -10%; animation: float-orb 15s ease-in-out infinite alternate; }
.orb-2 { width: 450px; height: 450px; background: #0a2540; bottom: -10%; right: -10%; animation: float-orb 18s ease-in-out infinite alternate-reverse; }
.grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 50px 50px; }
@keyframes float-orb { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(50px) scale(1.1); } }

.login-card {
  position: relative;
  z-index: 5;
  width: 100%;
  max-width: 480px;
  padding: 40px;
  background: rgba(15, 23, 42, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.4) !important;
}

.login-card__header { margin-bottom: 32px; }
.eyebrow { font-size: 11px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: var(--admin-brand-accent); display: block; }
.title { margin: 8px 0; font-size: 1.875rem; font-weight: 800; color: #ffffff; }
.subtitle { margin: 0; font-size: 0.875rem; color: var(--admin-text-muted); line-height: 1.6; }

.alert { padding: 16px; border-radius: var(--admin-radius-md); font-size: 0.875rem; margin-bottom: 24px; line-height: 1.5; }
.alert-warning { background: rgba(212, 168, 83, 0.1); border: 1px solid rgba(212, 168, 83, 0.2); color: #fde68a; }
.alert-danger { background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.2); color: #fca5a5; }

.login-form { display: flex; flex-direction: column; }
.mt-field { margin-top: 20px; }
.mt-btn { margin-top: 32px; padding: 14px 24px; font-size: 1rem; }
.w-full { width: 100%; }

.input-with-icon { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 14px; width: 18px; height: 18px; color: var(--admin-text-muted); }
.am-input { padding-left: 42px !important; height: 48px; background: rgba(255, 255, 255, 0.03) !important; border-color: rgba(255, 255, 255, 0.1) !important; color: #fff !important; }
.am-input:focus { border-color: var(--admin-brand-accent) !important; background: rgba(255, 255, 255, 0.05) !important; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.login-card__footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.06); display: flex; justify-content: center; }
.back-link { font-weight: 600; font-size: 0.875rem; color: var(--admin-text-muted); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; transition: color 0.2s; }
.back-link:hover { color: #ffffff; }
.back-icon { width: 16px; height: 16px; }
</style>
