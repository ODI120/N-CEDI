<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

useSeoMeta({
  title: 'Admin Overview | N-CEDI'
})

const supabase = useSupabaseClient()

const { data: counts, pending, error, refresh } = useAsyncData('admin-overview-counts', async () => {
  const tables = ['programs', 'events', 'posts', 'gallery_items', 'inquiries', 'site_stats', 'partners', 'team_members'] as const

  const results = await Promise.all(
    tables.map(async (table) => {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      return [table, count ?? 0] as const
    })
  )

  return Object.fromEntries(results) as Record<(typeof tables)[number], number>
})
</script>

<template>
  <section class="admin-page">
    <div class="grid">
      <UCard class="card">
        <template #header>
          <div class="card-header">
            <span class="kpi-label">Programs</span>
            <UIcon name="i-lucide-graduation-cap" class="kpi-icon" />
          </div>
        </template>
        <div class="kpi-value">
          <USkeleton v-if="pending" class="h-8 w-16" />
          <span v-else>{{ counts?.programs ?? 0 }}</span>
        </div>
      </UCard>

      <UCard class="card">
        <template #header>
          <div class="card-header">
            <span class="kpi-label">Inquiries</span>
            <UIcon name="i-lucide-inbox" class="kpi-icon" />
          </div>
        </template>
        <div class="kpi-value">
          <USkeleton v-if="pending" class="h-8 w-16" />
          <span v-else>{{ counts?.inquiries ?? 0 }}</span>
        </div>
      </UCard>

      <UCard class="card">
        <template #header>
          <div class="card-header">
            <span class="kpi-label">Posts</span>
            <UIcon name="i-lucide-newspaper" class="kpi-icon" />
          </div>
        </template>
        <div class="kpi-value">
          <USkeleton v-if="pending" class="h-8 w-16" />
          <span v-else>{{ counts?.posts ?? 0 }}</span>
        </div>
      </UCard>

      <UCard class="card">
        <template #header>
          <div class="card-header">
            <span class="kpi-label">Gallery</span>
            <UIcon name="i-lucide-image" class="kpi-icon" />
          </div>
        </template>
        <div class="kpi-value">
          <USkeleton v-if="pending" class="h-8 w-16" />
          <span v-else>{{ counts?.gallery_items ?? 0 }}</span>
        </div>
      </UCard>
    </div>

    <UAlert
      v-if="error"
      class="mt-6"
      color="red"
      variant="soft"
      title="Overview failed to load"
      :description="String(error)"
    />

    <div class="mt-6 flex gap-3">
      <UButton color="primary" variant="soft" icon="i-lucide-refresh-cw" @click="refresh">
        Refresh
      </UButton>
      <UButton to="/admin/inquiries" color="primary" variant="solid" icon="i-lucide-inbox">
        Review inquiries
      </UButton>
    </div>
  </section>
</template>

<style scoped>
.admin-page {
  max-width: 1200px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  border-radius: var(--radius-2xl);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-label {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.kpi-icon {
  width: 18px;
  height: 18px;
  color: var(--color-brand-accent);
}

.kpi-value {
  font-family: var(--font-display);
  font-size: 2.25rem;
  font-weight: 900;
  letter-spacing: var(--tracking-tight);
  color: var(--color-brand-primary);
  padding: var(--space-2) 0 var(--space-1);
}
</style>
