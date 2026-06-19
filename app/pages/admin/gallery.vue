<script setup lang="ts">
import {
  createEmptyGalleryForm,
  fetchGalleryFilterCategories,
  formToGalleryPayload,
  galleryStorageRefForRow,
  hasGalleryFormErrors,
  resolveGalleryMediaUrl,
  rowToGalleryForm,
  validateGalleryForm,
  type GalleryFormErrors,
  type GalleryFormState,
  type GalleryItemDbRow
} from '~/utils/galleryAdmin'
import {
  deleteStorageRefs,
  galleryMediaObjectPath,
  STORAGE_BUCKETS,
  uploadStorageObject
} from '~/utils/storage'
import { triggerRevalidation } from '~/utils/revalidate'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Gallery | Admin | N-CEDI' })

const supabase = useSupabaseClient()
const toast = useToast()
const search = ref('')

const { data: adminProfile } = useNuxtData<{ role?: string } | null>('sidebar-admin-role')
const canEdit = computed(() => adminProfile.value?.role !== 'viewer')
const canDelete = computed(() => adminProfile.value?.role === 'admin' || adminProfile.value?.role === 'super_admin')
const statusFilter = ref<'all' | 'published' | 'draft'>('all')

const currentPage = ref(1)
const pageSize = ref(10)

watch([search, statusFilter], () => {
  currentPage.value = 1
})

const { data, pending, refresh } = useAsyncData('admin-gallery', async () => {
  let query = supabase
    .from('gallery_items')
    .select(
      'id, title, media_url, media_type, alt_text, category_id, event_id, program_id, is_published, display_order, created_at',
      { count: 'exact' }
    )
    .order('display_order', { ascending: true })

  if (search.value.trim()) {
    query = query.ilike('title', `%${search.value.trim()}%`)
  }
  if (statusFilter.value === 'published') query = query.eq('is_published', true)
  if (statusFilter.value === 'draft') query = query.eq('is_published', false)

  const from = (currentPage.value - 1) * pageSize.value
  const to = from + pageSize.value - 1
  query = query.range(from, to)

  const { data: rows, count, error } = await query
  if (error) throw error
  return {
    rows: (rows || []) as GalleryItemDbRow[],
    total: count || 0
  }
}, { watch: [currentPage, search, statusFilter] })

const { data: galleryCategories } = useAsyncData('admin-gallery-categories', () =>
  fetchGalleryFilterCategories(),
{ default: () => [] }
)

const { data: programOptions } = useAsyncData<any[]>('admin-gallery-programs', async () => {
  const { data: rows, error } = await supabase
    .from('programs')
    .select('id, title')
    .order('title')
  if (error) throw error
  return rows ?? []
}, { default: () => [] })

const columns = [
  { key: 'thumb', label: '' },
  { key: 'title', label: 'Title' },
  { key: 'media_type', label: 'Type' },
  { key: 'display_order', label: 'Order', align: 'center' as const },
  { key: 'status', label: 'Status' }
]

const modalOpen = ref(false)
const deleteOpen = ref(false)
const mode = ref<'add' | 'edit'>('add')
const saving = ref(false)
const deleting = ref(false)
const imageFile = ref<File | null>(null)
const form = ref<GalleryFormState>(createEmptyGalleryForm())
const errors = ref<GalleryFormErrors>({})
const target = ref<GalleryItemDbRow | null>(null)

const previewUrl = computed(() => {
  if (imageFile.value) {
    return URL.createObjectURL(imageFile.value)
  }
  if (form.value.mediaUrl) {
    return resolveGalleryMediaUrl(form.value.mediaUrl)
  }
  return ''
})

const nextDisplayOrder = computed(() => {
  const rows = data.value?.rows ?? []
  if (!rows.length) return 0
  return Math.max(...rows.map(row => row.display_order)) + 1
})

const thumbUrl = (row: GalleryItemDbRow) => {
  if (row.media_type === 'video') return ''
  return resolveGalleryMediaUrl(row.media_url)
}

const handleImageFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  imageFile.value = input.files?.[0] ?? null
}

const openAdd = () => {
  mode.value = 'add'
  target.value = null
  imageFile.value = null
  form.value = {
    ...createEmptyGalleryForm(),
    displayOrder: nextDisplayOrder.value
  }
  errors.value = {}
  modalOpen.value = true
}

const openEdit = (row: GalleryItemDbRow) => {
  mode.value = 'edit'
  target.value = row
  imageFile.value = null
  form.value = rowToGalleryForm(row)
  errors.value = {}
  modalOpen.value = true
}

const openDelete = (row: GalleryItemDbRow) => {
  target.value = row
  deleteOpen.value = true
}

const save = async () => {
  if (!canEdit.value) {
    toast.add({ title: 'Unauthorized', description: 'Your role does not have permission to edit gallery items.', color: 'error' })
    return
  }
  errors.value = validateGalleryForm(form.value, {
    hasImageUpload: Boolean(imageFile.value)
  })
  if (hasGalleryFormErrors(errors.value)) {
    const reasons = Object.values(errors.value).join(' ')
    toast.add({ title: 'Validation Error', description: reasons, color: 'error' })
    return
  }

  saving.value = true
  try {
    if (form.value.mediaType === 'image' && imageFile.value) {
      const path = galleryMediaObjectPath(imageFile.value.name)
      form.value.mediaUrl = await uploadStorageObject(
        supabase,
        STORAGE_BUCKETS.gallery_media,
        path,
        imageFile.value
      )
    }

    const payload = formToGalleryPayload(form.value)

    if (mode.value === 'add') {
      const { error } = await (supabase.from('gallery_items') as any).insert([payload])
      if (error) throw error
      toast.add({ title: 'Gallery item created', color: 'success' })
    } else {
      const previousRef
        = target.value && form.value.mediaType === 'image'
          ? galleryStorageRefForRow(target.value)
          : null
      const newRef
        = form.value.mediaType === 'image' ? galleryStorageRefForRow({ media_url: form.value.mediaUrl, media_type: 'image' }) : null

      const { error } = await (supabase
        .from('gallery_items') as any)
        .update(payload)
        .eq('id', target.value!.id)
      if (error) throw error

      if (previousRef && newRef && previousRef !== newRef) {
        await deleteStorageRefs(supabase, [previousRef])
      }

      toast.add({ title: 'Gallery item updated', color: 'success' })
    }

    imageFile.value = null
    modalOpen.value = false
    await refresh()
    triggerRevalidation(['/', '/gallery'])
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Save failed'
    toast.add({ title: 'Error saving gallery item', description: message, color: 'error' })
  } finally {
    saving.value = false
  }
}

const remove = async () => {
  if (!canDelete.value) {
    toast.add({ title: 'Unauthorized', description: 'Your role does not have permission to delete gallery items.', color: 'error' })
    return
  }
  if (!target.value) return
  deleting.value = true
  try {
    const storageRef = galleryStorageRefForRow(target.value)
    const { error } = await supabase.from('gallery_items').delete().eq('id', target.value.id)
    if (error) throw error
    if (storageRef) await deleteStorageRefs(supabase, [storageRef])
    toast.add({ title: 'Gallery item deleted', color: 'success' })
    deleteOpen.value = false
    await refresh()
    triggerRevalidation(['/', '/gallery'])
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Delete failed'
    toast.add({ title: 'Error deleting item', description: message, color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Media</span>
        <h1 class="ap-title">
          Gallery
        </h1>
        <p class="ap-subtitle">
          Manage photos and videos for the public gallery page and the homepage Life at N-CEDI slider.
          Use gallery-type categories for filter tabs. Published images appear on the site (ordered by display order).
        </p>
      </div>
      <div class="ap-header__actions">
        <button
          class="btn btn-ghost"
          type="button"
          @click="refresh()"
        >
          <UIcon name="i-lucide-refresh-cw" />Refresh
        </button>
        <button
          v-if="canEdit"
          class="btn btn-primary"
          type="button"
          @click="openAdd"
        >
          <UIcon name="i-lucide-plus" />Add Item
        </button>
      </div>
    </div>

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
            placeholder="Search gallery..."
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

    <AdminTable
      v-model:current-page="currentPage"
      :columns="columns"
      :rows="data?.rows || []"
      :loading="pending"
      :total-rows="data?.total || 0"
      :page-size="pageSize"
      empty-title="Gallery is empty"
      empty-subtitle="Add images or videos for the public gallery and homepage slider."
    >
      <template #cell-thumb="{ row }">
        <div class="thumb-cell">
          <img
            v-if="row.media_type === 'image' && thumbUrl(row)"
            :src="thumbUrl(row)"
            alt=""
            class="thumb-img"
          >
          <span
            v-else
            class="thumb-video"
          ><UIcon name="i-lucide-video" /></span>
        </div>
      </template>
      <template #cell-title="{ row }">
        <span class="font-semibold">{{ row.title || 'Untitled' }}</span>
      </template>
      <template #cell-media_type="{ row }">
        <span class="badge badge-blue">{{ row.media_type }}</span>
      </template>
      <template #cell-display_order="{ row }">
        {{ row.display_order }}
      </template>
      <template #cell-status="{ row }">
        <span
          class="badge"
          :class="row.is_published ? 'badge-green' : 'badge-gray'"
        >
          {{ row.is_published ? 'Live' : 'Draft' }}
        </span>
      </template>
      <template #actions="{ row }">
        <button
          v-if="canEdit"
          class="btn btn-ghost btn-icon"
          title="Edit"
          type="button"
          @click="openEdit(row)"
        >
          <UIcon name="i-lucide-edit-3" />
        </button>
        <button
          v-if="canDelete"
          class="btn btn-danger btn-icon"
          title="Delete"
          type="button"
          @click="openDelete(row)"
        >
          <UIcon name="i-lucide-trash-2" />
        </button>
      </template>
    </AdminTable>

    <AdminModal
      :open="modalOpen"
      :title="mode === 'add' ? 'Add Gallery Item' : 'Edit Gallery Item'"
      :submit-label="mode === 'add' ? 'Create' : 'Save changes'"
      :loading="saving"
      @close="modalOpen = false"
      @submit="save"
    >
      <div
        class="am-field"
        :class="{ 'has-error': errors.title }"
      >
        <label class="am-label">Title *</label>
        <input
          v-model="form.title"
          class="am-input"
          placeholder="e.g. Robotics Lab Session"
        >
        <p
          v-if="errors.title"
          class="field-error"
        >
          {{ errors.title }}
        </p>
      </div>

      <div class="am-row-2">
        <div class="am-field">
          <label class="am-label">Media type</label>
          <select
            v-model="form.mediaType"
            class="am-select"
          >
            <option value="image">
              Image
            </option>
            <option value="video">
              Video
            </option>
          </select>
        </div>
        <div
          class="am-field"
          :class="{ 'has-error': errors.displayOrder }"
        >
          <label class="am-label">Display order</label>
          <input
            v-model.number="form.displayOrder"
            type="number"
            min="0"
            class="am-input"
          >
          <p
            v-if="errors.displayOrder"
            class="field-error"
          >
            {{ errors.displayOrder }}
          </p>
        </div>
      </div>

      <div
        v-if="form.mediaType === 'image'"
        class="am-field"
        :class="{ 'has-error': errors.mediaUrl }"
      >
        <label class="am-label">Image *</label>
        <input
          type="file"
          accept="image/*"
          class="am-input"
          @change="handleImageFileChange"
        >
        <p
          v-if="imageFile"
          class="am-note"
        >
          Selected: {{ imageFile.name }}
        </p>
        <p
          v-else-if="form.mediaUrl && mode === 'edit'"
          class="am-note"
        >
          Current file stored in gallery_media
        </p>
        <p
          v-if="errors.mediaUrl"
          class="field-error"
        >
          {{ errors.mediaUrl }}
        </p>
        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt="Preview"
          class="media-preview"
        >
      </div>

      <div
        v-else
        class="am-field"
        :class="{ 'has-error': errors.mediaUrl }"
      >
        <label class="am-label">Video URL *</label>
        <input
          v-model="form.mediaUrl"
          class="am-input"
          placeholder="https://… (hosted video URL)"
        >
        <p
          v-if="errors.mediaUrl"
          class="field-error"
        >
          {{ errors.mediaUrl }}
        </p>
      </div>

      <div class="am-field">
        <label class="am-label">Alt text / caption</label>
        <textarea
          v-model="form.altText"
          class="am-textarea"
          rows="2"
          placeholder="Accessibility description"
        />
      </div>

      <div class="am-field">
        <label class="am-label">Category (gallery filters)</label>
        <select
          v-model="form.categoryId"
          class="am-select"
        >
          <option value="">
            None
          </option>
          <option
            v-for="cat in galleryCategories"
            :key="cat.id"
            :value="cat.id"
          >
            {{ cat.name }}
          </option>
        </select>
        <p class="am-note">
          Create categories with type “gallery” under
          <NuxtLink
            to="/admin/categories"
            class="inline-link"
          >Categories</NuxtLink>.
        </p>
      </div>

      <div class="am-field">
        <label class="am-label">Link to program (optional)</label>
        <select
          v-model="form.programId"
          class="am-select"
        >
          <option value="">
            None
          </option>
          <option
            v-for="prog in programOptions"
            :key="prog.id"
            :value="prog.id"
          >
            {{ prog.title }}
          </option>
        </select>
      </div>

      <label class="am-checkbox-row">
        <input
          v-model="form.isPublished"
          type="checkbox"
        >
        Published on public site
      </label>
    </AdminModal>

    <AdminModal
      :open="deleteOpen"
      title="Delete gallery item"
      subtitle="Removes the row and the uploaded image from storage when applicable."
      submit-label="Delete permanently"
      submit-danger
      :loading="deleting"
      @close="deleteOpen = false"
      @submit="remove"
    >
      <p style="color: var(--admin-text-secondary); font-weight: 700">
        {{ target?.title || 'Untitled' }}
      </p>
    </AdminModal>
  </section>
</template>

<style scoped>
.thumb-cell {
  width: 48px;
  height: 48px;
  border-radius: var(--admin-radius-md);
  overflow: hidden;
  background: var(--admin-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-video {
  color: var(--admin-text-muted);
}

.media-preview {
  margin-top: var(--sp-3);
  max-width: 100%;
  max-height: 160px;
  border-radius: var(--admin-radius-md);
  object-fit: cover;
}

.field-error {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: var(--admin-brand-red);
}

.has-error .am-input {
  border-color: var(--admin-brand-red);
}

.inline-link {
  color: var(--admin-brand-accent-text);
  text-decoration: underline;
}
</style>
