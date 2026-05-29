<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Gallery | Admin | N-CEDI' })

const supabase = useSupabaseClient() as any
const toast = useToast()
const search = ref('')

type Row = { id: string; title: string; image_url: string | null; media_type: string | null; caption: string | null; is_featured: boolean; sort_order: number; created_at: string }

const { data, pending, refresh } = useAsyncData('admin-gallery', async () => {
  let q = supabase.from('gallery_items').select('*').order('sort_order')
  if (search.value.trim()) q = q.ilike('title', `%${search.value.trim()}%`)
  const { data, error } = await q
  if (error) throw error
  return (data || []) as Row[]
}, { watch: [search] })

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'media_type', label: 'Type' },
  { key: 'is_featured', label: 'Featured' },
  { key: 'sort_order', label: 'Order', align: 'center' as const },
]

const modalOpen = ref(false)
const deleteOpen = ref(false)
const mode = ref<'add'|'edit'>('add')
const saving = ref(false)
const deleting = ref(false)
const form = ref({ title: '', image_url: '', media_type: 'image', caption: '', is_featured: false, sort_order: 0 })
const target = ref<Row | null>(null)

const openAdd = () => { mode.value = 'add'; form.value = { title: '', image_url: '', media_type: 'image', caption: '', is_featured: false, sort_order: 0 }; modalOpen.value = true }
const openEdit = (r: Row) => { mode.value = 'edit'; target.value = r; form.value = { title: r.title, image_url: r.image_url || '', media_type: r.media_type || 'image', caption: r.caption || '', is_featured: r.is_featured, sort_order: r.sort_order }; modalOpen.value = true }
const openDelete = (r: Row) => { target.value = r; deleteOpen.value = true }

const save = async () => {
  saving.value = true
  try {
    if (mode.value === 'add') {
      const { error } = await supabase.from('gallery_items').insert([form.value])
      if (error) throw error
      toast.add({ title: 'Gallery item created', color: 'green' })
    } else {
      const { error } = await supabase.from('gallery_items').update(form.value).eq('id', target.value!.id)
      if (error) throw error
      toast.add({ title: 'Gallery item updated', color: 'green' })
    }
    modalOpen.value = false; await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'red' }) }
  finally { saving.value = false }
}

const remove = async () => {
  deleting.value = true
  try {
    const { error } = await supabase.from('gallery_items').delete().eq('id', target.value!.id)
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
        <span class="ap-eyebrow">Media</span>
        <h1 class="ap-title">Gallery</h1>
        <p class="ap-subtitle">Manage images and videos for institutional storytelling.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh()"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
        <button class="btn btn-primary" @click="openAdd"><UIcon name="i-lucide-plus" />Add Item</button>
      </div>
    </div>

    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search">
          <UIcon name="i-lucide-search" class="ap-search__icon" />
          <input v-model="search" class="ap-search__input" placeholder="Search gallery..." />
        </div>
      </div>
    </div>

    <AdminTable :columns="columns" :rows="data || []" :loading="pending" empty-title="Gallery is empty">
      <template #cell-title="{ row }"><span class="font-semibold">{{ row.title }}</span></template>
      <template #cell-media_type="{ row }"><span class="badge badge-blue">{{ row.media_type || 'image' }}</span></template>
      <template #cell-is_featured="{ row }"><span class="badge" :class="row.is_featured ? 'badge-amber' : 'badge-gray'">{{ row.is_featured ? 'Featured' : 'Standard' }}</span></template>
      <template #cell-sort_order="{ row }">{{ row.sort_order }}</template>
      <template #actions="{ row }">
        <button class="btn btn-ghost btn-icon" @click="openEdit(row)"><UIcon name="i-lucide-edit-3" /></button>
        <button class="btn btn-danger btn-icon" @click="openDelete(row)"><UIcon name="i-lucide-trash-2" /></button>
      </template>
    </AdminTable>

    <AdminModal :open="modalOpen" :title="mode === 'add' ? 'Add Gallery Item' : 'Edit Gallery Item'" :submit-label="mode === 'add' ? 'Create' : 'Save'" :loading="saving" @close="modalOpen = false" @submit="save">
      <div class="am-field"><label class="am-label">Title</label><input v-model="form.title" class="am-input" /></div>
      <div class="am-field"><label class="am-label">Image URL</label><input v-model="form.image_url" class="am-input" placeholder="https://..." /></div>
      <div class="am-row-2">
        <div class="am-field"><label class="am-label">Media Type</label>
          <select v-model="form.media_type" class="am-select"><option value="image">Image</option><option value="video">Video</option></select>
        </div>
        <div class="am-field"><label class="am-label">Sort Order</label><input v-model.number="form.sort_order" type="number" class="am-input" /></div>
      </div>
      <div class="am-field"><label class="am-label">Caption</label><textarea v-model="form.caption" class="am-textarea" /></div>
      <label class="am-checkbox-row"><input type="checkbox" v-model="form.is_featured" /> Featured</label>
    </AdminModal>

    <AdminModal :open="deleteOpen" title="Delete Gallery Item" submit-label="Delete" submit-danger :loading="deleting" @close="deleteOpen = false" @submit="remove">
      <p style="color:var(--admin-text-secondary)">Permanently delete <strong>{{ target?.title }}</strong>?</p>
    </AdminModal>
  </section>
</template>
