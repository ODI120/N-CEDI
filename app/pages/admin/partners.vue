<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Partners | Admin | N-CEDI' })

const supabase = useSupabaseClient() as any
const toast = useToast()
const search = ref('')

type Row = { id: string; name: string; logo_url: string | null; website_url: string | null; description: string | null; sort_order: number; is_active: boolean; created_at: string }

const { data, pending, refresh } = useAsyncData('admin-partners', async () => {
  let q = supabase.from('partners').select('*').order('sort_order')
  if (search.value.trim()) q = q.ilike('name', `%${search.value.trim()}%`)
  const { data, error } = await q
  if (error) throw error
  return (data || []) as Row[]
}, { watch: [search] })

const columns = [
  { key: 'name', label: 'Partner Name' },
  { key: 'website_url', label: 'Website' },
  { key: 'status', label: 'Status' },
  { key: 'sort_order', label: 'Order', align: 'center' as const },
]

const modalOpen = ref(false)
const deleteOpen = ref(false)
const mode = ref<'add'|'edit'>('add')
const saving = ref(false)
const deleting = ref(false)
const form = ref({ name: '', logo_url: '', website_url: '', description: '', sort_order: 0, is_active: true })
const target = ref<Row | null>(null)

const openAdd = () => { mode.value = 'add'; form.value = { name: '', logo_url: '', website_url: '', description: '', sort_order: 0, is_active: true }; modalOpen.value = true }
const openEdit = (r: Row) => { mode.value = 'edit'; target.value = r; form.value = { name: r.name, logo_url: r.logo_url || '', website_url: r.website_url || '', description: r.description || '', sort_order: r.sort_order, is_active: r.is_active }; modalOpen.value = true }
const openDelete = (r: Row) => { target.value = r; deleteOpen.value = true }

const save = async () => {
  saving.value = true
  try {
    if (mode.value === 'add') {
      const { error } = await supabase.from('partners').insert([form.value])
      if (error) throw error
      toast.add({ title: 'Partner created', color: 'green' })
    } else {
      const { error } = await supabase.from('partners').update(form.value).eq('id', target.value!.id)
      if (error) throw error
      toast.add({ title: 'Partner updated', color: 'green' })
    }
    modalOpen.value = false; await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'red' }) }
  finally { saving.value = false }
}

const remove = async () => {
  deleting.value = true
  try {
    const { error } = await supabase.from('partners').delete().eq('id', target.value!.id)
    if (error) throw error
    toast.add({ title: 'Deleted', color: 'green' }); deleteOpen.value = false; await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'red' }) }
  finally { deleting.value = false }
}
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Partnerships</span>
        <h1 class="ap-title">Partners</h1>
        <p class="ap-subtitle">Manage institutional and community partner records.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh()"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
        <button class="btn btn-primary" @click="openAdd"><UIcon name="i-lucide-plus" />Add Partner</button>
      </div>
    </div>

    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search"><UIcon name="i-lucide-search" class="ap-search__icon" /><input v-model="search" class="ap-search__input" placeholder="Search partners..." /></div>
      </div>
    </div>

    <AdminTable :columns="columns" :rows="data || []" :loading="pending" empty-title="No partners yet">
      <template #cell-name="{ row }"><span class="font-semibold">{{ row.name }}</span></template>
      <template #cell-website_url="{ row }"><a v-if="row.website_url" :href="row.website_url" target="_blank" class="text-sm" style="color:var(--admin-brand-blue)">{{ row.website_url }}</a><span v-else>—</span></template>
      <template #cell-status="{ row }"><span class="badge" :class="row.is_active ? 'badge-green' : 'badge-gray'">{{ row.is_active ? 'Active' : 'Inactive' }}</span></template>
      <template #cell-sort_order="{ row }">{{ row.sort_order }}</template>
      <template #actions="{ row }">
        <button class="btn btn-ghost btn-icon" @click="openEdit(row)"><UIcon name="i-lucide-edit-3" /></button>
        <button class="btn btn-danger btn-icon" @click="openDelete(row)"><UIcon name="i-lucide-trash-2" /></button>
      </template>
    </AdminTable>

    <AdminModal :open="modalOpen" :title="mode === 'add' ? 'New Partner' : 'Edit Partner'" :submit-label="mode === 'add' ? 'Create' : 'Save'" :loading="saving" @close="modalOpen = false" @submit="save">
      <div class="am-field"><label class="am-label">Name</label><input v-model="form.name" class="am-input" /></div>
      <div class="am-row-2">
        <div class="am-field"><label class="am-label">Logo URL</label><input v-model="form.logo_url" class="am-input" placeholder="https://..." /></div>
        <div class="am-field"><label class="am-label">Website</label><input v-model="form.website_url" class="am-input" placeholder="https://..." /></div>
      </div>
      <div class="am-field"><label class="am-label">Description</label><textarea v-model="form.description" class="am-textarea" /></div>
      <div class="am-row-2">
        <div class="am-field"><label class="am-label">Sort Order</label><input v-model.number="form.sort_order" type="number" class="am-input" /></div>
        <div class="am-field" style="justify-content:flex-end"><label class="am-checkbox-row"><input type="checkbox" v-model="form.is_active" /> Active</label></div>
      </div>
    </AdminModal>

    <AdminModal :open="deleteOpen" title="Delete Partner" submit-label="Delete" submit-danger :loading="deleting" @close="deleteOpen = false" @submit="remove">
      <p style="color:var(--admin-text-secondary)">Permanently delete <strong>{{ target?.name }}</strong>?</p>
    </AdminModal>
  </section>
</template>
