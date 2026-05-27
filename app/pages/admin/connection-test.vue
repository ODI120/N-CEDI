<script setup lang="ts">
import { useSupabaseClient } from '#imports';
import { ref, onMounted } from 'vue';

const supabase = useSupabaseClient();
const result = ref('Loading...');

onMounted(async () => {
  try {
    // Get the currently‑authenticated user ID from Supabase
    const { data: { user } } = await supabase.auth.getUser();
    const testUserId = user?.id ?? '';
    if (!testUserId) {
      result.value = 'No authenticated user – please sign in first.';
      return;
    }
    const { data, error } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', testUserId)
      .maybeSingle();
    if (error) {
      result.value = `Error: ${error.message}`;
    } else if (data) {
      result.value = `Success: role=${data.role}, active=${data.is_active}`;
    } else {
      result.value = 'No admin record found';
    }
  } catch (e) {
    result.value = `Exception: ${e}`;
  }
});
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Admin DB Connection Test</h1>
    <p>{{ result }}</p>
    <p class="mt-4 text-sm text-gray-500">Edit the <code>testUserId</code> constant in this file with a valid admin UUID.</p>
  </div>
</template>
