<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Events | Admin | N-CEDI' })

const supabase = useSupabaseClient() as any
const toast = useToast()
const search = ref('')

type Row = { id: string; title: string; slug: string; description: string | null; location: string | null; event_date: string | null; is_published: boolean; created_at: string }

const { data, pending, refresh } = useAsyncData('admin-events', async () => {
  let q = supabase.from('events').select('*').order('event_date', { ascending: false })
  if (search.value.trim()) q = q.ilike('title', `%${search.value.trim()}%`)
  const { data, error } = await q
  if (error) throw error
  return (data || []) as Row[]
}, { watch: [search] })

const columns = [
  { key: 'title', label: 'Event Title' },
  { key: 'location', label: 'Location' },
  { key: 'event_date', label: 'Date' },
  { key: 'status', label: 'Status' },
]

const modalOpen = ref(false)
const deleteOpen = ref(false)
const mode = ref<'add'|'edit'>('add')
const saving = ref(false)
const deleting = ref(false)
const form = ref({ title: '', slug: '', description: '', location: '', event_date: '', is_published: false })
const target = ref<Row | null>(null)

const openAdd = () => { mode.value = 'add'; form.value = { title: '', slug: '', description: '', location: '', event_date: '', is_published: false }; modalOpen.value = true }
const openEdit = (r: Row) => { mode.value = 'edit'; target.value = r; form.value = { title: r.title, slug: r.slug, description: r.description || '', location: r.location || '', event_date: r.event_date || '', is_published: r.is_published }; modalOpen.value = true }
const openDelete = (r: Row) => { target.value = r; deleteOpen.value = true }

const save = async () => {
  saving.value = true
  try {
    const payload = { ...form.value, event_date: form.value.event_date || null }
    if (mode.value === 'add') {
      const { error } = await supabase.from('events').insert([payload])
      if (error) throw error
      toast.add({ title: 'Event created', color: 'green' })
    } else {
      const { error } = await supabase.from('events').update(payload).eq('id', target.value!.id)
      if (error) throw error
      toast.add({ title: 'Event updated', color: 'green' })
    }
    modalOpen.value = false; await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'red' }) }
  finally { saving.value = false }
}

const remove = async () => {
  deleting.value = true
  try {
    const { error } = await supabase.from('events').delete().eq('id', target.value!.id)
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
        <h1 class="ap-title">Events</h1>
        <p class="ap-subtitle">Manage workshops, seminars, exhibitions, and open days.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh()"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
        <button class="btn btn-primary" @click="openAdd"><UIcon name="i-lucide-plus" />Add Event</button>
      </div>
    </div>

    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search">
          <UIcon name="i-lucide-search" class="ap-search__icon" />
          <input v-model="search" class="ap-search__input" placeholder="Search events..." />
        </div>
      </div>
    </div>

    <AdminTable :columns="columns" :rows="data || []" :loading="pending" empty-title="No events yet">
      <template #cell-title="{ row }"><span class="font-semibold">{{ row.title }}</span></template>
      <template #cell-location="{ row }">{{ row.location || '—' }}</template>
      <template #cell-event_date="{ row }">{{ fmtDate(row.event_date) }}</template>
      <template #cell-status="{ row }">
        <span class="badge" :class="row.is_published ? 'badge-green' : 'badge-gray'">{{ row.is_published ? 'Published' : 'Draft' }}</span>
      </template>
      <template #actions="{ row }">
        <button class="btn btn-ghost btn-icon" @click="openEdit(row)"><UIcon name="i-lucide-edit-3" /></button>
        <button class="btn btn-danger btn-icon" @click="openDelete(row)"><UIcon name="i-lucide-trash-2" /></button>
      </template>
    </AdminTable>

    <AdminModal :open="modalOpen" :title="mode === 'add' ? 'New Event' : 'Edit Event'" :submit-label="mode === 'add' ? 'Create' : 'Save'" :loading="saving" @close="modalOpen = false" @submit="save">
      <div class="am-field"><label class="am-label">Title</label><input v-model="form.title" class="am-input" /></div>
      <div class="am-field"><label class="am-label">Slug</label><input v-model="form.slug" class="am-input" /></div>
      <div class="am-row-2">
        <div class="am-field"><label class="am-label">Location</label><input v-model="form.location" class="am-input" /></div>
        <div class="am-field"><label class="am-label">Date</label><input v-model="form.event_date" type="date" class="am-input" /></div>
      </div>
      <div class="am-field"><label class="am-label">Description</label><textarea v-model="form.description" class="am-textarea" /></div>
      <label class="am-checkbox-row"><input type="checkbox" v-model="form.is_published" /> Published</label>
    </AdminModal>

    <AdminModal :open="deleteOpen" title="Delete Event" submit-label="Delete" submit-danger :loading="deleting" @close="deleteOpen = false" @submit="remove">
      <p style="color:var(--admin-text-secondary)">Permanently delete <strong>{{ target?.title }}</strong>?</p>
    </AdminModal>
  </section>
</template>
