<script setup lang="ts">
definePageMeta({
  layout: 'minimal'
})

const supabase = useSupabaseClient()

await supabase.auth.signOut()
await navigateTo('/admin/login')
</script>

<template>
  <div class="p-6 text-center">
    <USkeleton class="h-6 w-40 mx-auto" />
    <p class="mt-3 text-sm text-gray-500">
      Signing you out…
    </p>
  </div>
</template>
