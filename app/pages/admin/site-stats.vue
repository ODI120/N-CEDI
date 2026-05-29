<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Stats | Admin | N-CEDI' })

const supabase = useSupabaseClient() as any
const toast = useToast()
const search = ref('')

type Row = { id: string; label: string; value: string; icon: string | null; sort_order: number; created_at: string }

const { data, pending, refresh } = useAsyncData('admin-stats', async () => {
  let q = supabase.from('stats').select('*').order('sort_order')
  if (search.value.trim()) q = q.ilike('label', `%${search.value.trim()}%`)
  const { data, error } = await q
  if (error) throw error
  return (data || []) as Row[]
}, { watch: [search] })

const columns = [
  { key: 'icon', label: 'Icon', align: 'center' as const },
  { key: 'label', label: 'Label' },
  { key: 'value', label: 'Value' },
  { key: 'sort_order', label: 'Order', align: 'center' as const },
]

const modalOpen = ref(false)
const deleteOpen = ref(false)
const mode = ref<'add'|'edit'>('add')
const saving = ref(false)
const deleting = ref(false)
const form = ref({ label: '', value: '', icon: '', sort_order: 0 })
const target = ref<Row | null>(null)

const openAdd = () => { mode.value = 'add'; form.value = { label: '', value: '', icon: '', sort_order: 0 }; modalOpen.value = true }
const openEdit = (r: Row) => { mode.value = 'edit'; target.value = r; form.value = { label: r.label, value: r.value, icon: r.icon || '', sort_order: r.sort_order }; modalOpen.value = true }
const openDelete = (r: Row) => { target.value = r; deleteOpen.value = true }

const save = async () => {
  saving.value = true
  try {
    if (mode.value === 'add') {
      const { error } = await supabase.from('stats').insert([form.value])
      if (error) throw error
      toast.add({ title: 'Stat created', color: 'green' })
    } else {
      const { error } = await supabase.from('stats').update(form.value).eq('id', target.value!.id)
      if (error) throw error
      toast.add({ title: 'Stat updated', color: 'green' })
    }
    modalOpen.value = false; await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'red' }) }
  finally { saving.value = false }
}

const remove = async () => {
  deleting.value = true
  try {
    const { error } = await supabase.from('stats').delete().eq('id', target.value!.id)
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
        <span class="ap-eyebrow">Settings</span>
        <h1 class="ap-title">Stats</h1>
        <p class="ap-subtitle">Manage institutional statistics for the landing page.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh()"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
        <button class="btn btn-primary" @click="openAdd"><UIcon name="i-lucide-plus" />Add Stat</button>
      </div>
    </div>

    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search"><UIcon name="i-lucide-search" class="ap-search__icon" /><input v-model="search" class="ap-search__input" placeholder="Search stats..." /></div>
      </div>
    </div>

    <AdminTable :columns="columns" :rows="data || []" :loading="pending" empty-title="No stats defined">
      <template #cell-icon="{ row }"><UIcon v-if="row.icon" :name="row.icon" class="text-xl text-gray-500" /><span v-else>—</span></template>
      <template #cell-label="{ row }"><span class="font-semibold">{{ row.label }}</span></template>
      <template #cell-value="{ row }"><span class="badge badge-amber">{{ row.value }}</span></template>
      <template #cell-sort_order="{ row }">{{ row.sort_order }}</template>
      <template #actions="{ row }">
        <button class="btn btn-ghost btn-icon" @click="openEdit(row)"><UIcon name="i-lucide-edit-3" /></button>
        <button class="btn btn-danger btn-icon" @click="openDelete(row)"><UIcon name="i-lucide-trash-2" /></button>
      </template>
    </AdminTable>

    <AdminModal :open="modalOpen" :title="mode === 'add' ? 'New Stat' : 'Edit Stat'" :submit-label="mode === 'add' ? 'Create' : 'Save'" :loading="saving" @close="modalOpen = false" @submit="save">
      <div class="am-field"><label class="am-label">Label</label><input v-model="form.label" class="am-input" placeholder="e.g. Students Trained" /></div>
      <div class="am-field"><label class="am-label">Value</label><input v-model="form.value" class="am-input" placeholder="e.g. 5,000+" /></div>
      <div class="am-row-2">
        <div class="am-field"><label class="am-label">Icon Name (UIcon)</label><input v-model="form.icon" class="am-input" placeholder="i-lucide-users" /></div>
        <div class="am-field"><label class="am-label">Sort Order</label><input v-model.number="form.sort_order" type="number" class="am-input" /></div>
      </div>
    </AdminModal>

    <AdminModal :open="deleteOpen" title="Delete Stat" submit-label="Delete" submit-danger :loading="deleting" @close="deleteOpen = false" @submit="remove">
      <p style="color:var(--admin-text-secondary)">Permanently delete <strong>{{ target?.label }}</strong>?</p>
    </AdminModal>
  </section>
</template>
