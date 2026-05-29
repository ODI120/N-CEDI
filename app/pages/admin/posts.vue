<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Posts | Admin | N-CEDI' })

const supabase = useSupabaseClient() as any
const toast = useToast()
const search = ref('')

type Row = { id: string; title: string; slug: string; excerpt: string | null; is_published: boolean; published_at: string | null; category_id: string | null; created_at: string }

const { data, pending, refresh } = useAsyncData('admin-posts', async () => {
  let q = supabase.from('posts').select('*, categories(name)').order('created_at', { ascending: false })
  if (search.value.trim()) q = q.ilike('title', `%${search.value.trim()}%`)
  const { data, error } = await q
  if (error) throw error
  return (data || []) as Row[]
}, { watch: [search] })

const { data: categories } = useAsyncData('posts-cats', async () => {
  const { data } = await supabase.from('categories').select('id, name')
  return data || []
})

const columns = [
  { key: 'title', label: 'Post Title' },
  { key: 'category', label: 'Category' },
  { key: 'published_at', label: 'Published' },
  { key: 'status', label: 'Status' },
]

const modalOpen = ref(false)
const deleteOpen = ref(false)
const mode = ref<'add'|'edit'>('add')
const saving = ref(false)
const deleting = ref(false)
const form = ref({ title: '', slug: '', excerpt: '', category_id: '', is_published: false })
const target = ref<Row | null>(null)

const openAdd = () => { mode.value = 'add'; form.value = { title: '', slug: '', excerpt: '', category_id: '', is_published: false }; modalOpen.value = true }
const openEdit = (r: Row) => { mode.value = 'edit'; target.value = r; form.value = { title: r.title, slug: r.slug, excerpt: r.excerpt || '', category_id: r.category_id || '', is_published: r.is_published }; modalOpen.value = true }
const openDelete = (r: Row) => { target.value = r; deleteOpen.value = true }

const save = async () => {
  saving.value = true
  try {
    const payload = { ...form.value, category_id: form.value.category_id || null }
    if (mode.value === 'add') {
      const { error } = await supabase.from('posts').insert([payload])
      if (error) throw error
      toast.add({ title: 'Post created', color: 'green' })
    } else {
      const { error } = await supabase.from('posts').update(payload).eq('id', target.value!.id)
      if (error) throw error
      toast.add({ title: 'Post updated', color: 'green' })
    }
    modalOpen.value = false; await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'red' }) }
  finally { saving.value = false }
}

const remove = async () => {
  deleting.value = true
  try {
    const { error } = await supabase.from('posts').delete().eq('id', target.value!.id)
    if (error) throw error
    toast.add({ title: 'Deleted', color: 'green' }); deleteOpen.value = false; await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'red' }) }
  finally { deleting.value = false }
}

const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Content</span>
        <h1 class="ap-title">News & Posts</h1>
        <p class="ap-subtitle">Manage articles, updates, and news items.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh()"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
        <button class="btn btn-primary" @click="openAdd"><UIcon name="i-lucide-plus" />Write Post</button>
      </div>
    </div>

    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search"><UIcon name="i-lucide-search" class="ap-search__icon" /><input v-model="search" class="ap-search__input" placeholder="Search posts..." /></div>
      </div>
    </div>

    <AdminTable :columns="columns" :rows="data || []" :loading="pending" empty-title="No posts found">
      <template #cell-title="{ row }"><span class="font-semibold">{{ row.title }}</span></template>
      <template #cell-category="{ row }">{{ row.categories?.name || 'Uncategorized' }}</template>
      <template #cell-published_at="{ row }">{{ fmtDate(row.published_at) }}</template>
      <template #cell-status="{ row }"><span class="badge" :class="row.is_published ? 'badge-green' : 'badge-gray'">{{ row.is_published ? 'Published' : 'Draft' }}</span></template>
      <template #actions="{ row }">
        <button class="btn btn-ghost btn-icon" @click="openEdit(row)"><UIcon name="i-lucide-edit-3" /></button>
        <button class="btn btn-danger btn-icon" @click="openDelete(row)"><UIcon name="i-lucide-trash-2" /></button>
      </template>
    </AdminTable>

    <AdminModal :open="modalOpen" :title="mode === 'add' ? 'New Post' : 'Edit Post'" :submit-label="mode === 'add' ? 'Create' : 'Save'" :loading="saving" @close="modalOpen = false" @submit="save">
      <div class="am-field"><label class="am-label">Title</label><input v-model="form.title" class="am-input" /></div>
      <div class="am-field"><label class="am-label">Slug</label><input v-model="form.slug" class="am-input" /></div>
      <div class="am-field"><label class="am-label">Category</label>
        <select v-model="form.category_id" class="am-select">
          <option value="">-- No Category --</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div class="am-field"><label class="am-label">Excerpt</label><textarea v-model="form.excerpt" class="am-textarea" /></div>
      <label class="am-checkbox-row"><input type="checkbox" v-model="form.is_published" /> Published</label>
    </AdminModal>

    <AdminModal :open="deleteOpen" title="Delete Post" submit-label="Delete" submit-danger :loading="deleting" @close="deleteOpen = false" @submit="remove">
      <p style="color:var(--admin-text-secondary)">Permanently delete <strong>{{ target?.title }}</strong>?</p>
    </AdminModal>
  </section>
</template>
