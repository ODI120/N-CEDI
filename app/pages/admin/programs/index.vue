<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Programs | Admin | N-CEDI' })

type ProgramRow = {
  id: string
  title: string
  slug: string
  subtitle?: string | null
  is_published: boolean
  is_featured: boolean
  updated_at: string
}

const supabase = useSupabaseClient() as any
const toast = useToast()
const route = useRoute()

const search = ref('')
const statusFilter = ref<'all' | 'published' | 'draft'>('all')

const { data, pending, refresh } = useAsyncData('admin-programs', async () => {
  let query = supabase
    .from('programs')
    .select('id, title, slug, subtitle, is_published, is_featured, updated_at')
    .order('updated_at', { ascending: false })

  if (search.value.trim()) {
    query = query.ilike('title', `%${search.value.trim()}%`)
  }

  if (statusFilter.value === 'published') query = query.eq('is_published', true)
  if (statusFilter.value === 'draft') query = query.eq('is_published', false)

  const { data, error } = await query
  if (error) throw error
  return (data || []) as ProgramRow[]
}, { watch: [search, statusFilter] })

const columns = [
  { key: 'title', label: 'Skill Track' },
  { key: 'slug', label: 'Slug' },
  { key: 'flags', label: 'Flags' },
  { key: 'status', label: 'Status' },
  { key: 'updated_at', label: 'Updated' },
]

const deleteOpen = ref(false)
const deleting = ref(false)
const target = ref<ProgramRow | null>(null)

const fmtDate = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const openDelete = (row: ProgramRow) => {
  target.value = row
  deleteOpen.value = true
}

const remove = async () => {
  if (!target.value) return
  deleting.value = true
  try {
    const { error } = await supabase.from('programs').delete().eq('id', target.value.id)
    if (error) throw error
    toast.add({ title: 'Program deleted', color: 'green' })
    deleteOpen.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Error deleting', description: error.message, color: 'red' })
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  const created = route.query.created
  if (typeof created === 'string' && created) {
    toast.add({
      title: 'Program created',
      description: `Live at /programs/${created}`,
      color: 'green',
    })
  }
})
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Content</span>
        <h1 class="ap-title">Skill Tracks</h1>
        <p class="ap-subtitle">Create and manage N-CEDI program pages — hero, outcomes, gallery, and SEO.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh()"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
        <NuxtLink to="/admin/programs/new" class="btn btn-primary">
          <UIcon name="i-lucide-plus" />New Program
        </NuxtLink>
      </div>
    </div>

    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search">
          <UIcon name="i-lucide-search" class="ap-search__icon" />
          <input v-model="search" class="ap-search__input" placeholder="Search programs..." />
        </div>
        <select v-model="statusFilter" class="am-select" style="max-width: 180px">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
    </div>

    <AdminTable :columns="columns" :rows="data || []" :loading="pending" empty-title="No programs yet">
      <template #cell-title="{ row }">
        <div>
          <span class="font-bold">{{ row.title }}</span>
          <p v-if="row.subtitle" class="table-subtitle">{{ row.subtitle }}</p>
        </div>
      </template>
      <template #cell-slug="{ row }">
        <code class="slug-chip">/programs/{{ row.slug }}</code>
      </template>
      <template #cell-flags="{ row }">
        <span v-if="row.is_featured" class="badge badge-amber">Featured</span>
        <span v-else class="badge badge-gray">Standard</span>
      </template>
      <template #cell-status="{ row }">
        <span class="badge" :class="row.is_published ? 'badge-green' : 'badge-gray'">
          {{ row.is_published ? 'Live' : 'Draft' }}
        </span>
      </template>
      <template #cell-updated_at="{ row }">{{ fmtDate(row.updated_at) }}</template>
      <template #actions="{ row }">
        <NuxtLink :to="`/programs/${row.slug}`" target="_blank" class="btn btn-ghost btn-icon" title="Preview">
          <UIcon name="i-lucide-external-link" />
        </NuxtLink>
        <NuxtLink :to="`/admin/programs/${row.id}`" class="btn btn-ghost btn-icon" title="Edit">
          <UIcon name="i-lucide-edit-3" />
        </NuxtLink>
        <button class="btn btn-danger btn-icon" title="Delete" @click="openDelete(row)">
          <UIcon name="i-lucide-trash-2" />
        </button>
      </template>
    </AdminTable>

    <AdminModal
      :open="deleteOpen"
      title="Delete program"
      subtitle="This permanently removes the program and its public page."
      submit-label="Delete permanently"
      submit-danger
      :loading="deleting"
      @close="deleteOpen = false"
      @submit="remove"
    >
      <p style="color:var(--admin-text-secondary);font-weight:700">{{ target?.title }}</p>
    </AdminModal>
  </section>
</template>

<style scoped>
.table-subtitle {
  margin: 2px 0 0;
  font-size: 0.75rem;
  color: var(--admin-text-muted);
}

.slug-chip {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: var(--admin-radius-full);
  background: var(--admin-bg);
  color: var(--admin-text-secondary);
}
</style>
