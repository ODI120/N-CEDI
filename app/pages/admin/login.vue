<script setup lang="ts">
definePageMeta({
  layout: 'minimal'
})

useSeoMeta({
  title: 'Admin Sign In | N-CEDI'
})

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
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    })

    if (error) {
      errorMessage.value = error.message
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
  <!-- eslint-disable vue/singleline-html-element-content-newline -->
  <div class="admin-login">
    <div class="login-card">
      <div class="login-card__header">
        <span class="eyebrow">N-CEDI</span>
        <h1 class="title">
          Admin Portal
        </h1>
        <p class="subtitle">
          Secure access for institutional operations.
        </p>
      </div>

      <UAlert
        v-if="route.query.reason === 'not_admin'"
        color="amber"
        variant="soft"
        title="Access restricted"
        description="Your account is authenticated, but not enrolled as an admin user."
        class="mb-4"
      />

      <UAlert
        v-if="errorMessage"
        color="red"
        variant="soft"
        title="Sign in failed"
        :description="errorMessage"
        class="mb-4"
      />

      <UForm class="form" @submit.prevent="handleLogin">
        <UFormField label="Email" required>
          <UInput v-model="email" type="email" autocomplete="email" placeholder="you@ncedi.edu.ng" />
        </UFormField>

        <UFormField label="Password" required class="mt-3">
          <UInput v-model="password" type="password" autocomplete="current-password" placeholder="••••••••" />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          size="lg"
          class="mt-5 w-full justify-center"
          :loading="loading"
          icon="i-lucide-shield-check"
        >
          Sign in
        </UButton>
      </UForm>

      <div class="login-card__footer">
        <NuxtLink to="/" class="back-link">Back to public site</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-login {
  width: 100%;
  padding: var(--space-8) var(--space-4);
}

.login-card {
  width: 100%;
  max-width: 520px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(107, 89, 255, 0.18);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: 0 30px 70px rgba(20, 20, 20, 0.08);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.login-card__header {
  margin-bottom: var(--space-6);
}

.eyebrow {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-brand-accent);
}

.title {
  margin: var(--space-2) 0 var(--space-2);
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 900;
  letter-spacing: var(--tracking-tight);
  color: var(--color-brand-primary);
}

.subtitle {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
}

.login-card__footer {
  margin-top: var(--space-6);
  display: flex;
  justify-content: center;
}

.back-link {
  font-weight: 800;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-decoration: none;
}

.back-link:hover {
  color: var(--color-brand-primary);
}
</style>
