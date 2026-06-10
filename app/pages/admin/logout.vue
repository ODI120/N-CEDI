<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({
  layout: 'minimal'
})

const supabase = useSupabaseClient()

onMounted(async () => {
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Error during sign out:', error)
  } finally {
    await navigateTo('/admin/login')
  }
})
</script>

<template>
  <div class="logout-container">
    <div class="spinner"></div>
    <p class="logout-text">Signing you out...</p>
  </div>
</template>

<style scoped>
.logout-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(212, 168, 83, 0.15);
  border-top-color: #d4a853;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.logout-text {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  letter-spacing: -0.01em;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
