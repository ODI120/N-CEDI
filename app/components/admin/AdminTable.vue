<script setup lang="ts">
defineProps<{
  columns: Array<{ key: string; label: string; align?: 'left' | 'right' | 'center' }>
  rows: any[]
  loading?: boolean
  emptyIcon?: string
  emptyTitle?: string
  emptyText?: string
}>()
</script>

<template>
  <div class="at-wrapper">
    <!-- Loading skeleton -->
    <div v-if="loading" class="at-loading">
      <div v-for="i in 4" :key="i" class="at-skel-row">
        <div class="at-skel" v-for="j in columns.length" :key="j" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!rows.length" class="ap-empty">
      <div class="ap-empty__icon-wrap">
        <svg class="ap-empty__icon" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4"/></svg>
      </div>
      <h3 class="ap-empty__title">{{ emptyTitle || 'No records found' }}</h3>
      <p class="ap-empty__text">{{ emptyText || 'Nothing to display here yet.' }}</p>
      <slot name="empty-actions" />
    </div>

    <!-- Table -->
    <div v-else class="at-scroll">
      <table class="at">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" :class="{ 'at-right': col.align === 'right', 'at-center': col.align === 'center' }">
              {{ col.label }}
            </th>
            <th v-if="$slots.actions" class="at-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in rows" :key="row.id || idx">
            <td v-for="col in columns" :key="col.key" :class="{ 'at-right': col.align === 'right', 'at-center': col.align === 'center' }">
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] ?? '—' }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="at-right">
              <div class="at-actions">
                <slot name="actions" :row="row" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.at-loading { padding: var(--sp-6); display: flex; flex-direction: column; gap: var(--sp-3); }
.at-skel-row { display: flex; gap: var(--sp-4); }
.at-skel {
  flex: 1;
  height: 14px;
  background: var(--admin-border);
  border-radius: 6px;
  animation: shimmer 1.4s ease infinite alternate;
}
@keyframes shimmer { from { opacity: 0.5 } to { opacity: 1 } }
.at-center { text-align: center; }
.at-actions { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
</style>
