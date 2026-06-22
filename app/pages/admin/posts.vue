<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Posts | Admin | N-CEDI' })
import { triggerRevalidation } from '~/utils/revalidate'


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = useSupabaseClient() as any
const toast = useToast()
const search = ref('')

const { data: adminProfile } = useNuxtData<{ role?: string } | null>('sidebar-admin-role')
const canEdit = computed(() => adminProfile.value?.role !== 'viewer')
const canDelete = computed(() => adminProfile.value?.role === 'admin' || adminProfile.value?.role === 'super_admin')

type Row = { id: string, title: string, slug: string, excerpt: string | null, is_published: boolean, published_at: string | null, category_id: string | null, created_at: string }

const currentPage = ref(1)
const pageSize = ref(10)

watch([search], () => {
  currentPage.value = 1
})

const { data, pending, refresh } = useAsyncData('admin-posts', async () => {
  let q = supabase.from('posts').select('*, categories(name)', { count: 'exact' }).order('created_at', { ascending: false })
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

const { data: categories } = useAsyncData('posts-cats', async () => {
  const { data, error } = await supabase.from('categories').select('id, name')
  if (error) {
    console.error('[admin/posts] Failed to fetch categories:', error.message)
    throw error
  }
  return data || []
})

const columns = [
  { key: 'title', label: 'Post Title' },
  { key: 'category', label: 'Category' },
  { key: 'published_at', label: 'Published' },
  { key: 'status', label: 'Status' }
]

const modalOpen = ref(false)
const deleteOpen = ref(false)
const mode = ref<'add' | 'edit'>('add')
const saving = ref(false)
const deleting = ref(false)
const form = ref({ title: '', slug: '', excerpt: '', category_id: '', is_published: false })
const target = ref<Row | null>(null)
const slugTouched = ref(false)

// Auto-generate slug from title in 'add' mode unless manually edited
watch(() => form.value.title, (newTitle) => {
  if (mode.value === 'add' && !slugTouched.value) {
    form.value.slug = newTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }
})

const openAdd = () => {
  mode.value = 'add'
  form.value = { title: '', slug: '', excerpt: '', category_id: '', is_published: false }
  slugTouched.value = false
  modalOpen.value = true
}
const openEdit = (r: Row) => {
  mode.value = 'edit'
  target.value = r
  form.value = { title: r.title, slug: r.slug, excerpt: r.excerpt || '', category_id: r.category_id || '', is_published: r.is_published }
  slugTouched.value = true
  modalOpen.value = true
}
const openDelete = (r: Row) => {
  target.value = r
  deleteOpen.value = true
}

const save = async () => {
  if (!canEdit.value) {
    toast.add({ title: 'Unauthorized', description: 'Your role does not have permission to edit posts.', color: 'error' })
    return
  }
  saving.value = true
  try {
    const payload = { ...form.value, category_id: form.value.category_id || null }
    if (mode.value === 'add') {
      const { error } = await supabase.from('posts').insert([payload])
      if (error) throw error
      toast.add({ title: 'Post created', color: 'success' })
    } else {
      const { error } = await supabase.from('posts').update(payload).eq('id', target.value!.id)
      if (error) throw error
      toast.add({ title: 'Post updated', color: 'success' })
    }
    modalOpen.value = false
    await refresh()
    triggerRevalidation(['/', '/blog', `/blog/${form.value.slug}`])
  } catch (e) {
    toast.add({ title: 'Error', description: (e as Error).message, color: 'error' })
  } finally {
    saving.value = false
  }
}

const remove = async () => {
  if (!canDelete.value) {
    toast.add({ title: 'Unauthorized', description: 'Your role does not have permission to delete posts.', color: 'error' })
    return
  }
  deleting.value = true
  try {
    const { error } = await supabase.from('posts').delete().eq('id', target.value!.id)
    if (error) throw error
    toast.add({ title: 'Deleted', color: 'success' })
    deleteOpen.value = false
    await refresh()
    triggerRevalidation(['/', '/blog', `/blog/${target.value!.slug}`])
  } catch (e) {
    toast.add({ title: 'Error', description: (e as Error).message, color: 'error' })
  } finally {
    deleting.value = false
  }
}

const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const previewHref = (row: Row) =>
  row.is_published ? `/blog/${row.slug}` : `/admin/posts/preview/${row.slug}`
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Content</span>
        <h1 class="ap-title">
          News & Posts
        </h1>
        <p class="ap-subtitle">
          Manage articles, updates, and news items.
        </p>
      </div>
      <div class="ap-header__actions">
        <button
          class="btn btn-ghost"
          @click="refresh()"
        >
          <UIcon name="i-lucide-refresh-cw" />Refresh
        </button>
        <button
          v-if="canEdit"
          class="btn btn-primary"
          @click="openAdd"
        >
          <UIcon name="i-lucide-plus" />Write Post
        </button>
      </div>
    </div>

    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search">
          <UIcon
            name="i-lucide-search"
            class="ap-search__icon"
          /><input
            v-model="search"
            class="ap-search__input"
            placeholder="Search posts..."
          >
        </div>
      </div>
    </div>

    <AdminTable
      v-model:current-page="currentPage"
      :columns="columns"
      :rows="data?.rows || []"
      :loading="pending"
      :total-rows="data?.total || 0"
      :page-size="pageSize"
      empty-title="No posts found"
    >
      <template #cell-title="{ row }">
        <span>{{ row.title }}</span>
      </template>
      <template #cell-category="{ row }">
        {{ row.categories?.name || 'Uncategorized' }}
      </template>
      <template #cell-published_at="{ row }">
        {{ fmtDate(row.published_at) }}
      </template>
      <template #cell-status="{ row }">
        <span
          class="badge"
          :class="row.is_published ? 'badge-green' : 'badge-gray'"
        >{{ row.is_published ? 'Published' : 'Draft' }}</span>
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
        <button
          v-if="canEdit"
          class="btn btn-ghost btn-icon"
          @click="openEdit(row)"
        >
          <UIcon name="i-lucide-edit-3" />
        </button>
        <button
          v-if="canDelete"
          class="btn btn-danger btn-icon"
          @click="openDelete(row)"
        >
          <UIcon name="i-lucide-trash-2" />
        </button>
      </template>
    </AdminTable>

    <AdminModal
      :open="modalOpen"
      :title="mode === 'add' ? 'New Post' : 'Edit Post'"
      :submit-label="mode === 'add' ? 'Create' : 'Save'"
      :loading="saving"
      @close="modalOpen = false"
      @submit="save"
    >
      <div class="am-field">
        <label class="am-label">Title</label><input
          v-model="form.title"
          class="am-input"
        >
      </div>
      <div class="am-field">
        <label class="am-label">Slug</label><input
          v-model="form.slug"
          class="am-input"
          @input="slugTouched = true"
        >
      </div>
      <div class="am-field">
        <label class="am-label">Category</label>
        <select
          v-model="form.category_id"
          class="am-select"
        >
          <option value="">
            -- No Category --
          </option>
          <option
            v-for="c in categories"
            :key="c.id"
            :value="c.id"
          >
            {{ c.name }}
          </option>
        </select>
      </div>
      <div class="am-field">
        <label class="am-label">Excerpt</label><textarea
          v-model="form.excerpt"
          class="am-textarea"
        />
      </div>
      <label class="am-checkbox-row"><input
        v-model="form.is_published"
        type="checkbox"
      > Published</label>
    </AdminModal>

    <AdminModal
      :open="deleteOpen"
      title="Delete Post"
      submit-label="Delete"
      submit-danger
      :loading="deleting"
      @close="deleteOpen = false"
      @submit="remove"
    >
      <p style="color:var(--admin-text-secondary)">
        Permanently delete <strong>{{ target?.title }}</strong>?
      </p>
    </AdminModal>
  </section>
</template>
