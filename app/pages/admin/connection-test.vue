<script setup lang="ts">
import { useSupabaseClient } from '#imports';
import { ref, onMounted } from 'vue';

definePageMeta({
  layout: 'admin'
})

useSeoMeta({
  title: 'Diagnostic Test | Admin | N-CEDI'
})

const supabase = useSupabaseClient();
const result = ref('Loading diagnostics...');

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
      result.value = `Success: Role Level = ${data.role}, Authorization = ${data.is_active ? 'Active' : 'Restricted'}`;
    } else {
      result.value = 'No admin record found for this session.';
    }
  } catch (e) {
    result.value = `Exception: ${e}`;
  }
});
</script>

<template>
  <section class="page">
    <div class="header">
      <div>
        <span class="eyebrow">DIAGNOSTICS & SYSTEM</span>
        <h2 class="h2">Database Connectivity</h2>
        <p class="lead">Check direct query channels to the Supabase postgreSQL server.</p>
      </div>
    </div>

    <div class="glass-card diagnostic-block mt-6">
      <div class="diagnostic-title">
        <UIcon name="i-lucide-activity" class="diag-icon" />
        <span>Connectivity Diagnostics</span>
      </div>
      <div class="diagnostic-result font-mono text-sm bg-slate-900 text-emerald-400 p-4 rounded-xl border border-slate-800">
        {{ result }}
      </div>
      <div class="info-block mt-4 text-xs text-(--admin-text-muted)">
        This checks the status of your current auth token against the <code>admin_users</code> RBAC table schema.
      </div>
    </div>
  </section>
</template>

<style scoped>
.page {
  max-width: 1400px;
}

.header {
  margin-bottom: var(--space-8);
}

.eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--admin-brand-accent);
  display: block;
}

.h2 {
  margin: var(--space-2) 0;
  font-size: var(--text-3xl) !important;
  color: var(--admin-text-primary);
}

.lead {
  margin: 0;
  color: var(--admin-text-muted);
  font-size: var(--text-sm);
}

.diagnostic-block {
  padding: var(--space-6);
  max-width: 640px;
}

.diagnostic-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: var(--admin-text-primary);
  margin-bottom: var(--space-4);
}

.diag-icon {
  color: var(--admin-brand-accent);
  width: 20px;
  height: 20px;
}

.diagnostic-result {
  line-height: var(--leading-relaxed);
  word-break: break-all;
}
</style>
