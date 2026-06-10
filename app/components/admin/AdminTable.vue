<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  columns: Array<{ key: string; label: string; align?: 'left' | 'right' | 'center' }>
  rows: any[]
  loading?: boolean
  emptyIcon?: string
  emptyTitle?: string
  emptyText?: string
  totalRows?: number
  pageSize?: number
  currentPage?: number
  ariaLabel?: string
}>()

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
}>()

const totalPages = computed(() => {
  if (!props.totalRows || !props.pageSize) return 0
  return Math.ceil(props.totalRows / props.pageSize)
})

const paginationText = computed(() => {
  if (!props.totalRows || !props.pageSize || !props.currentPage) return ''
  const start = (props.currentPage - 1) * props.pageSize + 1
  const end = Math.min(props.currentPage * props.pageSize, props.totalRows)
  return `Showing ${start} to ${end} of ${props.totalRows} entries`
})

const visiblePages = computed(() => {
  const current = props.currentPage || 1
  const total = totalPages.value
  const maxVisible = 5
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  let start = current - Math.floor(maxVisible / 2)
  let end = current + Math.floor(maxVisible / 2)
  if (start < 1) {
    start = 1
    end = maxVisible
  } else if (end > total) {
    end = total
    start = total - maxVisible + 1
  }
  const pages: (number | string)[] = []
  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('...')
  }
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  if (end < total) {
    if (end < total - 1) pages.push('...')
    pages.push(total)
  }
  return pages
})

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  emit('update:currentPage', page)
}
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
      <table class="at" :aria-label="ariaLabel || 'Admin data table'">
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

    <!-- Pagination controls -->
    <div v-if="totalRows !== undefined && totalRows > 0" class="at-pagination">
      <span class="at-pagination__info">{{ paginationText }}</span>
      <div class="at-pagination__actions">
        <button
          class="at-pagination__btn"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
          aria-label="Previous page"
        >
          <UIcon name="i-lucide-chevron-left" />
        </button>
        
        <template v-for="(page, idx) in visiblePages" :key="idx">
          <span v-if="page === '...'" class="at-pagination__dots">...</span>
          <button
            v-else
            class="at-pagination__btn"
            :class="{ 'is-active': page === currentPage }"
            @click="changePage(page as number)"
            :aria-label="`Page ${page}`"
            :aria-current="page === currentPage ? 'page' : undefined"
          >
            {{ page }}
          </button>
        </template>

        <button
          class="at-pagination__btn"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
          aria-label="Next page"
        >
          <UIcon name="i-lucide-chevron-right" />
        </button>
      </div>
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

.at-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-4) var(--sp-6);
  border-top: 1px solid var(--admin-border);
  background: var(--admin-surface);
  border-radius: 0 0 var(--admin-radius-2xl) var(--admin-radius-2xl);
  font-size: 0.8125rem;
  color: var(--admin-text-secondary);
}

.at-pagination__info {
  font-weight: 600;
}

.at-pagination__actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.at-pagination__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border-radius: var(--admin-radius-lg);
  border: 1px solid var(--admin-border-strong);
  background: var(--admin-surface-opaque);
  color: var(--admin-text-primary);
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.at-pagination__btn:hover:not(:disabled) {
  border-color: var(--admin-brand-accent);
  background: rgba(212, 168, 83, 0.06);
  color: var(--admin-brand-accent);
}

.at-pagination__btn.is-active {
  background: var(--admin-brand-accent);
  border-color: var(--admin-brand-accent);
  color: white;
}

.at-pagination__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.at-pagination__dots {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  color: var(--admin-text-muted);
  font-weight: 600;
}
</style>
