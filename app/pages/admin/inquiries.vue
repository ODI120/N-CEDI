<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Inquiries | Admin | N-CEDI' })

const supabase = useSupabaseClient() as any
const toast = useToast()
const search = ref('')

const { data: adminProfile } = useNuxtData<{ role?: string } | null>('sidebar-admin-role')
const canDelete = computed(() => adminProfile.value?.role === 'admin' || adminProfile.value?.role === 'super_admin')

type Row = { id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; type: string; is_read: boolean; created_at: string }

const currentPage = ref(1)
const pageSize = ref(10)

watch([search], () => {
  currentPage.value = 1
})

const { data, pending, refresh } = useAsyncData('admin-inquiries', async () => {
  let q = supabase.from('inquiries').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (search.value.trim()) q = q.ilike('name', `%${search.value.trim()}%`)
  
  const from = (currentPage.value - 1) * pageSize.value
  const to = from + pageSize.value - 1
  q = q.range(from, to)

  const { data, count, error } = await q
  if (error) {
    if (error.code === '42P01') return { rows: [], total: 0 }
    throw error
  }
  return {
    rows: (data || []) as Row[],
    total: count || 0
  }
}, { watch: [currentPage, search] })

const columns = [
  { key: 'name', label: 'Sender' },
  { key: 'type', label: 'Type' },
  { key: 'created_at', label: 'Date' },
  { key: 'status', label: 'Status' },
]

const modalOpen = ref(false)
const deleteOpen = ref(false)
const saving = ref(false)
const deleting = ref(false)
const target = ref<Row | null>(null)

const openView = async (r: Row) => {
  target.value = r; modalOpen.value = true
  if (!r.is_read) {
    await supabase.from('inquiries').update({ is_read: true }).eq('id', r.id)
    await refresh()
  }
}
const openDelete = (r: Row) => { target.value = r; deleteOpen.value = true }

const remove = async () => {
  if (!canDelete.value) {
    toast.add({ title: 'Unauthorized', description: 'Your role does not have permission to delete inquiries.', color: 'error' })
    return
  }
  deleting.value = true
  try {
    const { error } = await supabase.from('inquiries').delete().eq('id', target.value!.id)
    if (error) throw error
    toast.add({ title: 'Deleted', color: 'success' }); deleteOpen.value = false; await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'error' }) }
  finally { deleting.value = false }
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Communications</span>
        <h1 class="ap-title">Inquiries</h1>
        <p class="ap-subtitle">Manage contact messages and partnership requests.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh()"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
      </div>
    </div>

    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search"><UIcon name="i-lucide-search" class="ap-search__icon" /><input v-model="search" class="ap-search__input" placeholder="Search inquiries..." /></div>
      </div>
    </div>

    <AdminTable
      :columns="columns"
      :rows="data?.rows || []"
      :loading="pending"
      :total-rows="data?.total || 0"
      :page-size="pageSize"
      v-model:current-page="currentPage"
      empty-title="No inquiries"
    >
      <template #cell-name="{ row }">
        <div class="font-semibold">{{ row.name }}</div>
        <div class="text-xs" style="color:var(--admin-text-muted)">{{ row.email }}</div>
      </template>
      <template #cell-type="{ row }"><span class="badge badge-blue text-capitalize">{{ row.type }}</span></template>
      <template #cell-created_at="{ row }">{{ fmtDate(row.created_at) }}</template>
      <template #cell-status="{ row }"><span class="badge" :class="row.is_read ? 'badge-gray' : 'badge-amber'">{{ row.is_read ? 'Read' : 'Unread' }}</span></template>
      <template #actions="{ row }">
        <button class="btn btn-ghost btn-icon" @click="openView(row)"><UIcon name="i-lucide-eye" /></button>
        <button class="btn btn-danger btn-icon" @click="openDelete(row)" v-if="canDelete"><UIcon name="i-lucide-trash-2" /></button>
      </template>
    </AdminTable>

    <AdminModal :open="modalOpen" title="View Inquiry" @close="modalOpen = false">
      <div v-if="target" class="inquiry-detail">
        <div>
          <div class="detail-label">Sender</div>
          <div class="detail-value detail-value--highlight">{{ target.name }} &lt;{{ target.email }}&gt;</div>
          <div v-if="target.phone" class="detail-sub-value">{{ target.phone }}</div>
        </div>
        <div class="detail-grid">
          <div>
            <div class="detail-label">Type</div>
            <span class="badge badge-blue text-capitalize">{{ target.type }}</span>
          </div>
          <div>
            <div class="detail-label">Date</div>
            <div class="detail-value">{{ fmtDate(target.created_at) }}</div>
          </div>
        </div>
        <div v-if="target.subject">
          <div class="detail-label">Subject</div>
          <div class="detail-value detail-value--highlight">{{ target.subject }}</div>
        </div>
        <div>
          <div class="detail-label">Message</div>
          <div class="detail-message">{{ target.message }}</div>
        </div>
      </div>
    </AdminModal>

    <AdminModal :open="deleteOpen" title="Delete Inquiry" submit-label="Delete" submit-danger :loading="deleting" @close="deleteOpen = false" @submit="remove">
      <p class="delete-confirm-text">Permanently delete inquiry from <strong>{{ target?.name }}</strong>?</p>
    </AdminModal>
  </section>
</template>

<style scoped>
.text-capitalize {
  text-transform: capitalize;
}

.inquiry-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-label {
  font-size: 12px;
  color: var(--admin-text-muted);
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.detail-value {
  color: var(--admin-text-secondary);
  font-size: 14px;
}

.detail-value--highlight {
  color: var(--admin-text-primary);
  font-weight: 600;
}

.detail-sub-value {
  font-size: 13px;
  color: var(--admin-text-secondary);
  margin-top: 2px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-message {
  background: var(--admin-bg);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  padding: 16px;
  color: var(--admin-text-secondary);
  font-size: 14px;
  white-space: pre-wrap;
  line-height: 1.6;
}

.delete-confirm-text {
  color: var(--admin-text-secondary);
}
</style>
