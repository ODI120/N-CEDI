<script setup lang="ts">
definePageMeta({
  layout: 'minimal'
})

useSeoMeta({
  title: 'Admin Setup | N-CEDI'
})

const step = ref<'check' | 'create' | 'login' | 'success' | 'disabled'>('check')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const initSecret = ref('')
const loading = ref(false)
const message = ref('')
const errorMessage = ref('')

onMounted(async () => {
  // Check if any admin users exist
  await checkAdminStatus()
})

const checkAdminStatus = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await fetch('/api/admin/users', {
      method: 'GET'
    })
    
    if (response.status === 401) {
      // Not authenticated - that's expected on first setup
      step.value = 'create'
    } else if (response.ok) {
      // Admins exist - redirect to login
      step.value = 'disabled'
    } else if (response.status === 503) {
      step.value = 'disabled'
      errorMessage.value = 'Admin setup is not enabled. Contact your system administrator.'
    } else {
      // Any other status code - assume no admins exist yet
      step.value = 'create'
    }
  } catch (err) {
    // Network error or endpoint doesn't exist yet
    step.value = 'create'
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  if (!email.value.trim()) {
    errorMessage.value = 'Email is required'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Invalid email format'
    return false
  }

  if (!password.value) {
    errorMessage.value = 'Password is required'
    return false
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters'
    return false
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return false
  }

  if (!initSecret.value) {
    errorMessage.value = 'Initialization secret is required'
    return false
  }

  return true
}

const handleCreateAdmin = async () => {
  errorMessage.value = ''
  message.value = ''

  if (!validateForm()) return

  loading.value = true

  try {
    const response = await fetch('/api/admin/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value.trim(),
        temporaryPassword: password.value,
        initSecret: initSecret.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.statusMessage || 'Failed to create admin user'
      return
    }

    message.value = 'Super admin created successfully!'
    step.value = 'success'

    // Reset form
    setTimeout(() => {
      email.value = ''
      password.value = ''
      confirmPassword.value = ''
      initSecret.value = ''
      navigateTo('/admin/login')
    }, 2000)
  } catch (err: any) {
    errorMessage.value = err.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  navigateTo('/admin/login')
}
</script>

<template>
  <div class="admin-setup-wrapper">
    <!-- Visual background blobs and grid -->
    <div class="setup-bg">
      <div class="orb orb-1" />
      <div class="orb orb-2" />
      <div class="grid-overlay" />
    </div>

    <div class="setup-card glass-card glass-card-accent-gold">
      <div class="setup-header">
        <span class="eyebrow">SYSTEM INITIALIZATION</span>
        <h1 class="title">Admin Portal Setup</h1>
        <p class="subtitle">One-time initialization for system administrators.</p>
      </div>

      <!-- Check Status -->
      <div v-if="step === 'check'" class="setup-content">
        <USkeleton class="h-12 w-full mb-4" />
        <USkeleton class="h-4 w-3/4 mb-2" />
        <USkeleton class="h-4 w-2/3" />
        <p class="mt-4 text-sm text-(--admin-text-muted)">Checking admin status...</p>
      </div>

      <!-- Create Admin -->
      <div v-if="step === 'create'" class="setup-content">
        <UAlert
          v-if="errorMessage"
          color="red"
          variant="soft"
          title="Setup failed"
          :description="errorMessage"
          class="mb-6"
        />

        <div class="info-box">
          <UIcon name="i-lucide-info" class="info-icon" />
          <div class="info-content">
            <p class="info-title">First-time Setup</p>
            <p class="info-text">
              This is a one-time process to initialize your super admin account.
              You will need the initialization secret configured on your server environment.
            </p>
          </div>
        </div>

        <form class="form" @submit.prevent="handleCreateAdmin">
          <UFormField label="Admin Email Address">
            <UInput
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="admin@ncedi.edu.ng"
              class="w-full admin-form-input"
              size="lg"
              :disabled="loading"
              icon="i-lucide-mail"
            />
          </UFormField>

          <UFormField label="Password" class="mt-4">
            <UInput
              v-model="password"
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full admin-form-input"
              size="lg"
              :disabled="loading"
              icon="i-lucide-lock"
            />
          </UFormField>

          <UFormField label="Confirm Password" class="mt-4">
            <UInput
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full admin-form-input"
              size="lg"
              :disabled="loading"
              icon="i-lucide-shield-check"
            />
          </UFormField>

          <UFormField label="Initialization Secret" class="mt-4">
            <UInput
              v-model="initSecret"
              type="password"
              placeholder="••••••••••••••••"
              class="w-full admin-form-input"
              size="lg"
              :disabled="loading"
              icon="i-lucide-key"
            />
            <p class="mt-2 text-xs text-(--admin-text-muted)">
              Contact your system administrator for this secret
            </p>
          </UFormField>

          <UButton
            type="submit"
            color="neutral"
            size="lg"
            class="mt-6 w-full justify-center setup-btn"
            :loading="loading"
            icon="i-lucide-shield-plus"
          >
            Create Super Admin
          </UButton>
        </form>
      </div>

      <!-- Success -->
      <div v-if="step === 'success'" class="setup-content">
        <UAlert
          color="green"
          variant="soft"
          title="✓ Success"
          :description="message"
          class="mb-4"
        />
        <p class="text-sm text-(--admin-text-muted)">Redirecting to login...</p>
      </div>

      <!-- Disabled -->
      <div v-if="step === 'disabled'" class="setup-content">
        <UAlert
          color="amber"
          variant="soft"
          title="Setup Complete"
          description="Admin users already exist. Redirecting to login page..."
          class="mb-6"
        />
        <UButton
          color="neutral"
          size="lg"
          class="w-full justify-center setup-btn"
          icon="i-lucide-arrow-right"
          @click="goToLogin"
        >
          Go to Login
        </UButton>
      </div>

      <div class="setup-footer">
        <NuxtLink to="/admin/login" class="footer-link">
          Already have an account? Sign in
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-setup-wrapper {
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

/* Background graphics */
.setup-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.25;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: #d4a853;
  top: -10%;
  left: -10%;
  animation: float-orb 15s ease-in-out infinite alternate;
}

.orb-2 {
  width: 450px;
  height: 450px;
  background: #0a2540;
  bottom: -10%;
  right: -10%;
  animation: float-orb 18s ease-in-out infinite alternate-reverse;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

@keyframes float-orb {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(50px) scale(1.1); }
}

.setup-card {
  position: relative;
  z-index: 5;
  width: 100%;
  max-width: 520px;
  padding: var(--space-8);
  background: rgba(15, 23, 42, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.4) !important;
}

.setup-header {
  margin-bottom: var(--space-6);
}

.eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--admin-brand-accent);
  display: block;
}

.title {
  margin: var(--space-2) 0;
  font-size: var(--text-3xl) !important;
  font-weight: 800;
  color: #ffffff;
}

.subtitle {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--admin-text-muted);
  line-height: var(--leading-relaxed);
}

.info-box {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-6);
}

.info-icon {
  width: 20px;
  height: 20px;
  color: #60a5fa;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-title {
  font-weight: 700;
  font-size: var(--text-sm);
  margin-bottom: 2px;
  color: #ffffff;
}

.info-text {
  font-size: var(--text-xs);
  color: var(--admin-text-secondary);
  line-height: var(--leading-relaxed);
}

.setup-btn {
  background: var(--admin-brand-accent) !important;
  color: #090e1a !important;
  font-weight: 700;
  letter-spacing: 0.3px;
  border: none;
  transition: transform 0.2s, box-shadow 0.2s !important;
}

.setup-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212, 168, 83, 0.3) !important;
}

.setup-btn:active {
  transform: translateY(0);
}

.setup-footer {
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: var(--space-6);
  margin-top: var(--space-6);
}

.footer-link {
  font-size: var(--text-sm);
  color: var(--admin-text-muted);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #ffffff;
}
</style>
