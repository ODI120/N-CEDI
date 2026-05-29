<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Inquiries | Admin | N-CEDI' })

const supabase = useSupabaseClient() as any
const toast = useToast()
const search = ref('')

type Row = { id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; type: string; is_read: boolean; created_at: string }

const { data, pending, refresh } = useAsyncData('admin-inquiries', async () => {
  let q = supabase.from('inquiries').select('*').order('created_at', { ascending: false })
  if (search.value.trim()) q = q.ilike('name', `%${search.value.trim()}%`)
  const { data, error } = await q
  if (error) {
    if (error.code === '42P01') return [] // table does not exist
    throw error
  }
  return (data || []) as Row[]
}, { watch: [search] })

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
  deleting.value = true
  try {
    const { error } = await supabase.from('inquiries').delete().eq('id', target.value!.id)
    if (error) throw error
    toast.add({ title: 'Deleted', color: 'green' }); deleteOpen.value = false; await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'red' }) }
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

    <AdminTable :columns="columns" :rows="data || []" :loading="pending" empty-title="No inquiries">
      <template #cell-name="{ row }">
        <div class="font-semibold">{{ row.name }}</div>
        <div class="text-xs" style="color:var(--admin-text-muted)">{{ row.email }}</div>
      </template>
      <template #cell-type="{ row }"><span class="badge badge-blue" style="text-transform:capitalize">{{ row.type }}</span></template>
      <template #cell-created_at="{ row }">{{ fmtDate(row.created_at) }}</template>
      <template #cell-status="{ row }"><span class="badge" :class="row.is_read ? 'badge-gray' : 'badge-amber'">{{ row.is_read ? 'Read' : 'Unread' }}</span></template>
      <template #actions="{ row }">
        <button class="btn btn-ghost btn-icon" @click="openView(row)"><UIcon name="i-lucide-eye" /></button>
        <button class="btn btn-danger btn-icon" @click="openDelete(row)"><UIcon name="i-lucide-trash-2" /></button>
      </template>
    </AdminTable>

    <AdminModal :open="modalOpen" title="View Inquiry" :submit-label="null" @close="modalOpen = false">
      <div v-if="target" style="display:flex;flex-direction:column;gap:16px">
        <div>
          <div style="font-size:12px;color:var(--admin-text-muted);font-weight:700;text-transform:uppercase;margin-bottom:4px">Sender</div>
          <div style="color:#fff;font-weight:600">{{ target.name }} &lt;{{ target.email }}&gt;</div>
          <div v-if="target.phone" style="font-size:13px;color:var(--admin-text-secondary);margin-top:2px">{{ target.phone }}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div><div style="font-size:12px;color:var(--admin-text-muted);font-weight:700;text-transform:uppercase;margin-bottom:4px">Type</div><span class="badge badge-blue" style="text-transform:capitalize">{{ target.type }}</span></div>
          <div><div style="font-size:12px;color:var(--admin-text-muted);font-weight:700;text-transform:uppercase;margin-bottom:4px">Date</div><div style="color:var(--admin-text-secondary);font-size:14px">{{ fmtDate(target.created_at) }}</div></div>
        </div>
        <div v-if="target.subject">
          <div style="font-size:12px;color:var(--admin-text-muted);font-weight:700;text-transform:uppercase;margin-bottom:4px">Subject</div>
          <div style="color:#fff;font-weight:600">{{ target.subject }}</div>
        </div>
        <div>
          <div style="font-size:12px;color:var(--admin-text-muted);font-weight:700;text-transform:uppercase;margin-bottom:8px">Message</div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:16px;color:var(--admin-text-secondary);font-size:14px;white-space:pre-wrap;line-height:1.6">{{ target.message }}</div>
        </div>
      </div>
    </AdminModal>

    <AdminModal :open="deleteOpen" title="Delete Inquiry" submit-label="Delete" submit-danger :loading="deleting" @close="deleteOpen = false" @submit="remove">
      <p style="color:var(--admin-text-secondary)">Permanently delete inquiry from <strong>{{ target?.name }}</strong>?</p>
    </AdminModal>
  </section>
</template>
