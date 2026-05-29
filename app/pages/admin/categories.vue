<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Categories | Admin | N-CEDI' })

const supabase = useSupabaseClient() as any
const toast = useToast()
const search = ref('')

type Row = { id: string; name: string; slug: string; description: string | null; created_at: string }

const { data, pending, refresh } = useAsyncData('admin-categories', async () => {
  let q = supabase.from('categories').select('*').order('name')
  if (search.value.trim()) q = q.ilike('name', `%${search.value.trim()}%`)
  const { data, error } = await q
  if (error) throw error
  return (data || []) as Row[]
}, { watch: [search] })

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
  { key: 'description', label: 'Description' },
]

// CRUD
const modalOpen = ref(false)
const deleteOpen = ref(false)
const mode = ref<'add'|'edit'>('add')
const saving = ref(false)
const deleting = ref(false)
const form = ref({ name: '', slug: '', description: '' })
const target = ref<Row | null>(null)

const openAdd = () => { mode.value = 'add'; form.value = { name: '', slug: '', description: '' }; modalOpen.value = true }
const openEdit = (r: Row) => { mode.value = 'edit'; target.value = r; form.value = { name: r.name, slug: r.slug, description: r.description || '' }; modalOpen.value = true }
const openDelete = (r: Row) => { target.value = r; deleteOpen.value = true }

const save = async () => {
  saving.value = true
  try {
    if (mode.value === 'add') {
      const { error } = await supabase.from('categories').insert([form.value])
      if (error) throw error
      toast.add({ title: 'Category created', color: 'green' })
    } else {
      const { error } = await supabase.from('categories').update(form.value).eq('id', target.value!.id)
      if (error) throw error
      toast.add({ title: 'Category updated', color: 'green' })
    }
    modalOpen.value = false; await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'red' }) }
  finally { saving.value = false }
}

const remove = async () => {
  deleting.value = true
  try {
    const { error } = await supabase.from('categories').delete().eq('id', target.value!.id)
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
        <span class="ap-eyebrow">Content</span>
        <h1 class="ap-title">Categories</h1>
        <p class="ap-subtitle">Manage shared taxonomy for programs, posts, and gallery items.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh()">
          <UIcon name="i-lucide-refresh-cw" />Refresh
        </button>
        <button class="btn btn-primary" @click="openAdd">
          <UIcon name="i-lucide-plus" />Add Category
        </button>
      </div>
    </div>

    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search">
          <UIcon name="i-lucide-search" class="ap-search__icon" />
          <input v-model="search" class="ap-search__input" placeholder="Search categories..." />
        </div>
      </div>
    </div>

    <AdminTable :columns="columns" :rows="data || []" :loading="pending" empty-title="No categories yet" empty-text="Create your first content category.">
      <template #cell-name="{ row }"><span class="font-semibold">{{ row.name }}</span></template>
      <template #cell-slug="{ row }"><code class="text-xs" style="color:var(--admin-text-muted)">{{ row.slug }}</code></template>
      <template #cell-description="{ row }"><span class="text-sm" style="color:var(--admin-text-secondary)">{{ row.description || '—' }}</span></template>
      <template #actions="{ row }">
        <button class="btn btn-ghost btn-icon" @click="openEdit(row)" title="Edit"><UIcon name="i-lucide-edit-3" /></button>
        <button class="btn btn-danger btn-icon" @click="openDelete(row)" title="Delete"><UIcon name="i-lucide-trash-2" /></button>
      </template>
    </AdminTable>

    <AdminModal :open="modalOpen" :title="mode === 'add' ? 'New Category' : 'Edit Category'" :submit-label="mode === 'add' ? 'Create' : 'Save'" :loading="saving" @close="modalOpen = false" @submit="save">
      <div class="am-field"><label class="am-label">Name</label><input v-model="form.name" class="am-input" placeholder="e.g. Technology" /></div>
      <div class="am-field"><label class="am-label">Slug</label><input v-model="form.slug" class="am-input" placeholder="e.g. technology" /></div>
      <div class="am-field"><label class="am-label">Description</label><textarea v-model="form.description" class="am-textarea" placeholder="Optional description..." /></div>
    </AdminModal>

    <AdminModal :open="deleteOpen" title="Delete Category" subtitle="This action cannot be undone." submit-label="Delete" submit-danger :loading="deleting" @close="deleteOpen = false" @submit="remove">
      <p style="color:var(--admin-text-secondary)">Are you sure you want to permanently delete <strong>{{ target?.name }}</strong>?</p>
    </AdminModal>
  </section>
</template>
