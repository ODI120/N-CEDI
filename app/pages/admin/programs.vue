<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Programs | Admin | N-CEDI' })

type ProgramRow = {
  id: string
  title: string
  slug: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration_weeks: number
  is_published: boolean
  is_featured: boolean
  updated_at: string
}

const supabase = useSupabaseClient() as any
const toast = useToast()

const search = ref('')
const level = ref<'all' | ProgramRow['level']>('all')

const { data, pending, refresh } = useAsyncData('admin-programs', async () => {
  let query = supabase
    .from('programs')
    .select('*')
    .order('updated_at', { ascending: false })

  if (level.value !== 'all') query = query.eq('level', level.value)
  if (search.value.trim()) query = query.ilike('title', `%${search.value.trim()}%`)

  const { data, error } = await query
  if (error) throw error
  return (data || []) as ProgramRow[]
}, { watch: [search, level] })

const columns = [
  { key: 'title', label: 'Program Title' },
  { key: 'level', label: 'Difficulty Level' },
  { key: 'duration_weeks', label: 'Duration' },
  { key: 'status', label: 'Status' }
]

const modalOpen = ref(false)
const deleteOpen = ref(false)
const saving = ref(false)
const deleting = ref(false)
const mode = ref<'add'|'edit'>('add')
const form = ref<Partial<ProgramRow>>({
  title: '', slug: '', level: 'beginner', duration_weeks: 4, is_published: false, is_featured: false
})
const target = ref<ProgramRow | null>(null)

const openAdd = () => { mode.value = 'add'; form.value = { title: '', slug: '', level: 'beginner', duration_weeks: 4, is_published: false, is_featured: false }; modalOpen.value = true }
const openEdit = (row: ProgramRow) => { mode.value = 'edit'; target.value = row; form.value = { ...row }; modalOpen.value = true }
const openDelete = (row: ProgramRow) => { target.value = row; deleteOpen.value = true }

const save = async () => {
  saving.value = true
  try {
    if (mode.value === 'add') {
      const { error } = await supabase.from('programs').insert([form.value])
      if (error) throw error
      toast.add({ title: 'Program Created', color: 'green' })
    } else {
      const { error } = await supabase.from('programs').update(form.value).eq('id', target.value!.id)
      if (error) throw error
      toast.add({ title: 'Program Updated', color: 'green' })
    }
    modalOpen.value = false; await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'red' }) }
  finally { saving.value = false }
}

const remove = async () => {
  if (!target.value) return
  deleting.value = true
  try {
    const { error } = await supabase.from('programs').delete().eq('id', target.value!.id)
    if (error) throw error
    toast.add({ title: 'Deleted', color: 'green' }); deleteOpen.value = false; await refresh()
  } catch (e: any) { toast.add({ title: 'Error deleting', description: e.message, color: 'red' }) }
  finally { deleting.value = false }
}
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Content</span>
        <h1 class="ap-title">Programs</h1>
        <p class="ap-subtitle">Manage curriculum, training programs, and workshops.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh()"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
        <button class="btn btn-primary" @click="openAdd"><UIcon name="i-lucide-plus" />Add Program</button>
      </div>
    </div>

    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search">
          <UIcon name="i-lucide-search" class="ap-search__icon" />
          <input v-model="search" class="ap-search__input" placeholder="Search programs..." />
        </div>
        <select v-model="level" class="am-select" style="max-width: 200px">
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
    </div>

    <AdminTable :columns="columns" :rows="data || []" :loading="pending" empty-title="No programs found">
      <template #cell-title="{ row }"><span class="font-bold">{{ row.title }}</span></template>
      <template #cell-level="{ row }">
        <span class="badge" :class="row.level === 'beginner' ? 'badge-green' : row.level === 'intermediate' ? 'badge-amber' : 'badge-blue'" style="text-transform:capitalize">
          {{ row.level }}
        </span>
      </template>
      <template #cell-duration_weeks="{ row }"><span style="font-family:monospace">{{ row.duration_weeks }} wks</span></template>
      <template #cell-status="{ row }">
        <span class="badge" :class="row.is_published ? 'badge-green' : 'badge-gray'">{{ row.is_published ? 'Live' : 'Draft' }}</span>
      </template>
      <template #actions="{ row }">
        <button class="btn btn-ghost btn-icon" @click="openEdit(row)"><UIcon name="i-lucide-edit-3" /></button>
        <button class="btn btn-danger btn-icon" @click="openDelete(row)"><UIcon name="i-lucide-trash-2" /></button>
      </template>
    </AdminTable>

    <!-- Create / Edit Modal -->
    <AdminModal :open="modalOpen" :title="mode === 'add' ? 'Create Program' : 'Edit Program'" :submit-label="mode === 'add' ? 'Create' : 'Save Changes'" :loading="saving" @close="modalOpen = false" @submit="save">
      <div class="am-field"><label class="am-label">Title</label><input v-model="form.title" class="am-input" /></div>
      <div class="am-field"><label class="am-label">Slug</label><input v-model="form.slug" class="am-input" /></div>
      <div class="am-row-2">
        <div class="am-field"><label class="am-label">Difficulty Level</label>
          <select v-model="form.level" class="am-select">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div class="am-field"><label class="am-label">Duration (Weeks)</label><input v-model.number="form.duration_weeks" type="number" class="am-input" /></div>
      </div>
      <div class="am-row-2" style="margin-top:16px">
        <label class="am-checkbox-row"><input type="checkbox" v-model="form.is_published" /> Published</label>
        <label class="am-checkbox-row"><input type="checkbox" v-model="form.is_featured" /> Featured</label>
      </div>
    </AdminModal>

    <!-- Delete Confirmation Modal -->
    <AdminModal :open="deleteOpen" title="Confirm Deletion" subtitle="Are you sure you want to delete this program? This action cannot be undone." submit-label="Delete Permanently" submit-danger :loading="deleting" @close="deleteOpen = false" @submit="remove">
      <p style="color:var(--admin-text-secondary);font-weight:700">{{ target?.title }}</p>
    </AdminModal>
  </section>
</template>
