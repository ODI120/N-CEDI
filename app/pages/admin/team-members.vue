<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Team | Admin | N-CEDI' })

const supabase = useSupabaseClient() as any
const toast = useToast()
const search = ref('')

type Row = { id: string; name: string; role: string; bio: string | null; image_url: string | null; is_active: boolean; sort_order: number; created_at: string }

const { data, pending, refresh } = useAsyncData('admin-team', async () => {
  let q = supabase.from('team_members').select('*').order('sort_order')
  if (search.value.trim()) q = q.ilike('name', `%${search.value.trim()}%`)
  const { data, error } = await q
  if (error) throw error
  return (data || []) as Row[]
}, { watch: [search] })

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role/Position' },
  { key: 'status', label: 'Status' },
  { key: 'sort_order', label: 'Order', align: 'center' as const },
]

const modalOpen = ref(false)
const deleteOpen = ref(false)
const mode = ref<'add'|'edit'>('add')
const saving = ref(false)
const deleting = ref(false)
const form = ref({ name: '', role: '', bio: '', image_url: '', is_active: true, sort_order: 0 })
const target = ref<Row | null>(null)

const openAdd = () => { mode.value = 'add'; form.value = { name: '', role: '', bio: '', image_url: '', is_active: true, sort_order: 0 }; modalOpen.value = true }
const openEdit = (r: Row) => { mode.value = 'edit'; target.value = r; form.value = { name: r.name, role: r.role, bio: r.bio || '', image_url: r.image_url || '', is_active: r.is_active, sort_order: r.sort_order }; modalOpen.value = true }
const openDelete = (r: Row) => { target.value = r; deleteOpen.value = true }

const save = async () => {
  saving.value = true
  try {
    if (mode.value === 'add') {
      const { error } = await supabase.from('team_members').insert([form.value])
      if (error) throw error
      toast.add({ title: 'Member added', color: 'green' })
    } else {
      const { error } = await supabase.from('team_members').update(form.value).eq('id', target.value!.id)
      if (error) throw error
      toast.add({ title: 'Member updated', color: 'green' })
    }
    modalOpen.value = false; await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'red' }) }
  finally { saving.value = false }
}

const remove = async () => {
  deleting.value = true
  try {
    const { error } = await supabase.from('team_members').delete().eq('id', target.value!.id)
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
        <span class="ap-eyebrow">Organization</span>
        <h1 class="ap-title">Team Members</h1>
        <p class="ap-subtitle">Manage directory of staff and leadership.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh()"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
        <button class="btn btn-primary" @click="openAdd"><UIcon name="i-lucide-plus" />Add Member</button>
      </div>
    </div>

    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search"><UIcon name="i-lucide-search" class="ap-search__icon" /><input v-model="search" class="ap-search__input" placeholder="Search team..." /></div>
      </div>
    </div>

    <AdminTable :columns="columns" :rows="data || []" :loading="pending" empty-title="No team members">
      <template #cell-name="{ row }">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:32px;height:32px;border-radius:50%;background:#e2e8f0;overflow:hidden;flex-shrink:0;">
            <img v-if="row.image_url" :src="row.image_url" style="width:100%;height:100%;object-fit:cover" />
            <UIcon v-else name="i-lucide-user" style="margin:6px;width:20px;height:20px;color:#94a3b8" />
          </div>
          <span class="font-semibold">{{ row.name }}</span>
        </div>
      </template>
      <template #cell-role="{ row }"><span style="color:var(--admin-text-secondary)">{{ row.role }}</span></template>
      <template #cell-status="{ row }"><span class="badge" :class="row.is_active ? 'badge-green' : 'badge-gray'">{{ row.is_active ? 'Active' : 'Inactive' }}</span></template>
      <template #cell-sort_order="{ row }">{{ row.sort_order }}</template>
      <template #actions="{ row }">
        <button class="btn btn-ghost btn-icon" @click="openEdit(row)"><UIcon name="i-lucide-edit-3" /></button>
        <button class="btn btn-danger btn-icon" @click="openDelete(row)"><UIcon name="i-lucide-trash-2" /></button>
      </template>
    </AdminTable>

    <AdminModal :open="modalOpen" :title="mode === 'add' ? 'New Member' : 'Edit Member'" :submit-label="mode === 'add' ? 'Create' : 'Save'" :loading="saving" @close="modalOpen = false" @submit="save">
      <div class="am-field"><label class="am-label">Name</label><input v-model="form.name" class="am-input" /></div>
      <div class="am-field"><label class="am-label">Role / Position</label><input v-model="form.role" class="am-input" /></div>
      <div class="am-field"><label class="am-label">Image URL</label><input v-model="form.image_url" class="am-input" placeholder="https://..." /></div>
      <div class="am-field"><label class="am-label">Bio</label><textarea v-model="form.bio" class="am-textarea" /></div>
      <div class="am-row-2">
        <div class="am-field"><label class="am-label">Sort Order</label><input v-model.number="form.sort_order" type="number" class="am-input" /></div>
        <div class="am-field" style="justify-content:flex-end"><label class="am-checkbox-row"><input type="checkbox" v-model="form.is_active" /> Active</label></div>
      </div>
    </AdminModal>

    <AdminModal :open="deleteOpen" title="Delete Team Member" submit-label="Delete" submit-danger :loading="deleting" @close="deleteOpen = false" @submit="remove">
      <p style="color:var(--admin-text-secondary)">Permanently delete <strong>{{ target?.name }}</strong>?</p>
    </AdminModal>
  </section>
</template>
