<script setup lang="ts">
import { ref, computed } from 'vue'
import { deleteStorageRefs } from '~/utils/storage'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Events | Admin | N-CEDI' })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = useSupabaseClient() as any
const toast = useToast()
const search = ref('')

const { data: adminProfile } = useNuxtData<{ role?: string } | null>('sidebar-admin-role')
const canEdit = computed(() => adminProfile.value?.role !== 'viewer')
const canDelete = computed(() => adminProfile.value?.role === 'admin' || adminProfile.value?.role === 'super_admin')
const statusFilter = ref<'all' | 'published' | 'draft'>('all')

type Row = {
  id: string
  title: string
  slug: string
  description: string
  cover_image_url: string
  gallery_urls: string[]
  is_published: boolean
  created_at: string
  updated_at: string
}

const currentPage = ref(1)
const pageSize = ref(10)

watch([search, statusFilter], () => {
  currentPage.value = 1
})

const { data, pending, refresh } = useAsyncData('admin-events', async () => {
  let q = supabase
    .from('events')
    .select('id, slug, title, description, cover_image_url, gallery_urls, is_published, created_at, updated_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search.value.trim()) q = q.ilike('title', `%${search.value.trim()}%`)
  if (statusFilter.value === 'published') q = q.eq('is_published', true)
  if (statusFilter.value === 'draft') q = q.eq('is_published', false)

  const from = (currentPage.value - 1) * pageSize.value
  const to = from + pageSize.value - 1
  q = q.range(from, to)

  const { data, count, error } = await q
  if (error) throw error
  return {
    rows: (data || []) as Row[],
    total: count || 0
  }
}, { watch: [currentPage, search, statusFilter] })

const columns = [
  { key: 'title', label: 'Event Title' },
  { key: 'slug', label: 'Slug' },
  { key: 'status', label: 'Status' },
  { key: 'updated_at', label: 'Last Updated' }
]

const deleteOpen = ref(false)
const deleting = ref(false)
const target = ref<Row | null>(null)

const openDelete = (r: Row) => {
  target.value = r
  deleteOpen.value = true
}

const remove = async () => {
  if (!canDelete.value) {
    toast.add({ title: 'Unauthorized', description: 'Your role does not have permission to delete events.', color: 'error' })
    return
  }
  if (!target.value) return
  deleting.value = true
  try {
    const refs = [target.value.cover_image_url, ...(target.value.gallery_urls || [])]
    const { error } = await supabase.from('events').delete().eq('id', target.value.id)
    if (error) throw error

    if (refs.length > 0) {
      await deleteStorageRefs(supabase, refs)
    }

    toast.add({ title: 'Event deleted successfully', color: 'success' })
    deleteOpen.value = false
    await refresh()
  } catch (e) {
    toast.add({ title: 'Error deleting event', description: (e as Error).message, color: 'error' })
  } finally {
    deleting.value = false
  }
}

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const previewHref = (row: Row) =>
  row.is_published ? `/events/${row.slug}` : `/admin/events/preview/${row.slug}`
</script>

<template>
  <section class="admin-page">
    <!-- Header -->
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Content</span>
        <h1 class="ap-title">
          Events
        </h1>
        <p class="ap-subtitle">
          Manage NCAT NBTE student yearly events and student week activities.
        </p>
      </div>
      <div class="ap-header__actions">
        <button
          class="btn btn-ghost"
          @click="refresh()"
        >
          <UIcon name="i-lucide-refresh-cw" />Refresh
        </button>
        <NuxtLink
          v-if="canEdit"
          to="/admin/events/new"
          class="btn btn-primary"
        >
          <UIcon name="i-lucide-plus" />Write Event
        </NuxtLink>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search">
          <UIcon
            name="i-lucide-search"
            class="ap-search__icon"
          />
          <input
            v-model="search"
            class="ap-search__input"
            placeholder="Search events..."
          >
        </div>
        <select
          v-model="statusFilter"
          class="am-select"
          style="max-width: 180px"
        >
          <option value="all">
            All statuses
          </option>
          <option value="published">
            Published
          </option>
          <option value="draft">
            Draft
          </option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <AdminTable
      v-model:current-page="currentPage"
      :columns="columns"
      :rows="data?.rows || []"
      :loading="pending"
      :total-rows="data?.total || 0"
      :page-size="pageSize"
      empty-title="No events found"
    >
      <template #cell-title="{ row }">
        <span class="font-semibold">{{ row.title }}</span>
      </template>
      <template #cell-slug="{ row }">
        <code class="slug-chip">/events/{{ row.slug }}</code>
      </template>
      <template #cell-status="{ row }">
        <span
          class="badge"
          :class="row.is_published ? 'badge-green' : 'badge-gray'"
        >
          {{ row.is_published ? 'Live' : 'Draft' }}
        </span>
      </template>
      <template #cell-updated_at="{ row }">
        {{ fmtDate(row.updated_at) }}
      </template>
      <template #actions="{ row }">
        <NuxtLink
          :to="previewHref(row)"
          target="_blank"
          class="btn btn-ghost btn-icon"
          title="Preview"
        >
          <UIcon name="i-lucide-external-link" />
        </NuxtLink>
        <NuxtLink
          v-if="canEdit"
          :to="`/admin/events/${row.id}`"
          class="btn btn-ghost btn-icon"
          title="Edit"
        >
          <UIcon name="i-lucide-edit-3" />
        </NuxtLink>
        <button
          v-if="canDelete"
          class="btn btn-danger btn-icon"
          title="Delete"
          @click="openDelete(row)"
        >
          <UIcon name="i-lucide-trash-2" />
        </button>
      </template>
    </AdminTable>

    <!-- Delete Confirmation Modal -->
    <AdminModal
      :open="deleteOpen"
      title="Delete Event"
      subtitle="Are you sure you want to permanently delete this event? This will also remove any uploaded images."
      submit-label="Delete permanently"
      submit-danger
      :loading="deleting"
      @close="deleteOpen = false"
      @submit="remove"
    >
      <p style="color:var(--admin-text-secondary);font-weight:700">
        {{ target?.title }}
      </p>
    </AdminModal>
  </section>
</template>

<style scoped>
.slug-chip {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: var(--admin-radius-full);
  background: var(--admin-bg);
  color: var(--admin-text-secondary);
}
</style>
