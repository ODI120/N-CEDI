<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Projects | Admin | N-CEDI' })

const supabase = useSupabaseClient() as any
const toast = useToast()
const search = ref('')

const { data: adminProfile } = useNuxtData<{ role?: string } | null>('sidebar-admin-role')
const canEdit = computed(() => adminProfile.value?.role !== 'viewer')
const canDelete = computed(() => adminProfile.value?.role === 'admin' || adminProfile.value?.role === 'super_admin')

type Row = { id: string; title: string; slug: string; description: string | null; status: string | null; client: string | null; completion_date: string | null; is_published: boolean; created_at: string }

const currentPage = ref(1)
const pageSize = ref(10)

watch([search], () => {
  currentPage.value = 1
})

const { data, pending, refresh } = useAsyncData('admin-projects', async () => {
  let q = supabase.from('projects').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (search.value.trim()) q = q.ilike('title', `%${search.value.trim()}%`)
  
  const from = (currentPage.value - 1) * pageSize.value
  const to = from + pageSize.value - 1
  q = q.range(from, to)

  const { data, count, error } = await q
  if (error) throw error
  return {
    rows: (data || []) as Row[],
    total: count || 0
  }
}, { watch: [currentPage, search] })

const columns = [
  { key: 'title', label: 'Project Name' },
  { key: 'status_field', label: 'Project Status' },
  { key: 'client', label: 'Client' },
  { key: 'status', label: 'Visibility' },
]

const modalOpen = ref(false)
const deleteOpen = ref(false)
const mode = ref<'add'|'edit'>('add')
const saving = ref(false)
const deleting = ref(false)
const form = ref({ title: '', slug: '', description: '', status: 'ongoing', client: '', completion_date: '', is_published: false })
const target = ref<Row | null>(null)

const openAdd = () => { mode.value = 'add'; form.value = { title: '', slug: '', description: '', status: 'ongoing', client: '', completion_date: '', is_published: false }; modalOpen.value = true }
const openEdit = (r: Row) => { mode.value = 'edit'; target.value = r; form.value = { title: r.title, slug: r.slug, description: r.description || '', status: r.status || 'ongoing', client: r.client || '', completion_date: r.completion_date || '', is_published: r.is_published }; modalOpen.value = true }
const openDelete = (r: Row) => { target.value = r; deleteOpen.value = true }

const save = async () => {
  if (!canEdit.value) {
    toast.add({ title: 'Unauthorized', description: 'Your role does not have permission to edit projects.', color: 'error' })
    return
  }
  saving.value = true
  try {
    const payload = { ...form.value, completion_date: form.value.completion_date || null }
    if (mode.value === 'add') {
      const { error } = await supabase.from('projects').insert([payload])
      if (error) throw error
      toast.add({ title: 'Project created', color: 'success' })
    } else {
      const { error } = await supabase.from('projects').update(payload).eq('id', target.value!.id)
      if (error) throw error
      toast.add({ title: 'Project updated', color: 'success' })
    }
    modalOpen.value = false; await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'error' }) }
  finally { saving.value = false }
}

const remove = async () => {
  if (!canDelete.value) {
    toast.add({ title: 'Unauthorized', description: 'Your role does not have permission to delete projects.', color: 'error' })
    return
  }
  deleting.value = true
  try {
    const { error } = await supabase.from('projects').delete().eq('id', target.value!.id)
    if (error) throw error
    toast.add({ title: 'Deleted', color: 'success' }); deleteOpen.value = false; await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'error' }) }
  finally { deleting.value = false }
}
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Portfolio</span>
        <h1 class="ap-title">Projects</h1>
        <p class="ap-subtitle">Manage institutional projects and initiatives.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh()"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
        <button class="btn btn-primary" @click="openAdd" v-if="canEdit"><UIcon name="i-lucide-plus" />Add Project</button>
      </div>
    </div>

    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search"><UIcon name="i-lucide-search" class="ap-search__icon" /><input v-model="search" class="ap-search__input" placeholder="Search projects..." /></div>
      </div>
    </div>

    <AdminTable
      :columns="columns"
      :rows="data?.rows || []"
      :loading="pending"
      :total-rows="data?.total || 0"
      :page-size="pageSize"
      v-model:current-page="currentPage"
      empty-title="No projects"
    >
      <template #cell-title="{ row }"><span>{{ row.title }}</span></template>
      <template #cell-status_field="{ row }"><span class="badge badge-blue">{{ row.status || 'ongoing' }}</span></template>
      <template #cell-client="{ row }">{{ row.client || '—' }}</template>
      <template #cell-status="{ row }"><span class="badge" :class="row.is_published ? 'badge-green' : 'badge-gray'">{{ row.is_published ? 'Published' : 'Draft' }}</span></template>
      <template #actions="{ row }">
        <button class="btn btn-ghost btn-icon" @click="openEdit(row)" v-if="canEdit"><UIcon name="i-lucide-edit-3" /></button>
        <button class="btn btn-danger btn-icon" @click="openDelete(row)" v-if="canDelete"><UIcon name="i-lucide-trash-2" /></button>
      </template>
    </AdminTable>

    <AdminModal :open="modalOpen" :title="mode === 'add' ? 'New Project' : 'Edit Project'" :submit-label="mode === 'add' ? 'Create' : 'Save'" :loading="saving" @close="modalOpen = false" @submit="save">
      <div class="am-field"><label class="am-label">Title</label><input v-model="form.title" class="am-input" /></div>
      <div class="am-field"><label class="am-label">Slug</label><input v-model="form.slug" class="am-input" /></div>
      <div class="am-row-2">
        <div class="am-field"><label class="am-label">Status</label>
          <select v-model="form.status" class="am-select"><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="planned">Planned</option></select>
        </div>
        <div class="am-field"><label class="am-label">Client / Sponsor</label><input v-model="form.client" class="am-input" /></div>
      </div>
      <div class="am-field"><label class="am-label">Description</label><textarea v-model="form.description" class="am-textarea" /></div>
      <div class="am-field"><label class="am-label">Completion Date</label><input v-model="form.completion_date" type="date" class="am-input" /></div>
      <label class="am-checkbox-row"><input type="checkbox" v-model="form.is_published" /> Published</label>
    </AdminModal>

    <AdminModal :open="deleteOpen" title="Delete Project" submit-label="Delete" submit-danger :loading="deleting" @close="deleteOpen = false" @submit="remove">
      <p style="color:var(--admin-text-secondary)">Permanently delete <strong>{{ target?.title }}</strong>?</p>
    </AdminModal>
  </section>
</template>
