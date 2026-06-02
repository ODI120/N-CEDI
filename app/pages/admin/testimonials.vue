<script setup lang="ts">
import {
  createEmptyTestimonialForm,
  formToTestimonialPayload,
  hasTestimonialFormErrors,
  resolveTestimonialAvatarUrl,
  rowToTestimonialForm,
  testimonialStorageRefForRow,
  validateTestimonialForm,
  type TestimonialFormErrors,
  type TestimonialFormState,
  type TestimonialDbRow,
} from '~/utils/testimonialAdmin'
import {
  deleteStorageRefs,
  testimonialAvatarObjectPath,
  STORAGE_BUCKETS,
  uploadStorageObject,
} from '~/utils/storage'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Testimonials | Admin | N-CEDI' })

const supabase = useSupabaseClient() as any
const toast = useToast()
const search = ref('')

const { data, pending, refresh } = useAsyncData('admin-testimonials', async () => {
  let q = supabase.from('testimonials').select('*').order('sort_order', { ascending: true })
  if (search.value.trim()) q = q.ilike('name', `%${search.value.trim()}%`)
  const { data, error } = await q
  if (error) {
    if (error.code === '42P01') return [] // Table does not exist
    throw error
  }
  return (data || []) as TestimonialDbRow[]
}, { watch: [search] })

const columns = [
  { key: 'avatar', label: '' },
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role/Title' },
  { key: 'status', label: 'Status' },
  { key: 'sort_order', label: 'Order', align: 'center' as const },
]

const modalOpen = ref(false)
const deleteOpen = ref(false)
const mode = ref<'add' | 'edit'>('add')
const saving = ref(false)
const deleting = ref(false)
const avatarFile = ref<File | null>(null)
const form = ref<TestimonialFormState>(createEmptyTestimonialForm())
const errors = ref<TestimonialFormErrors>({})
const target = ref<TestimonialDbRow | null>(null)

const previewUrl = computed(() => {
  if (avatarFile.value) {
    return URL.createObjectURL(avatarFile.value)
  }
  if (form.value.avatarUrl) {
    return resolveTestimonialAvatarUrl(form.value.avatarUrl)
  }
  return ''
})

const nextSortOrder = computed(() => {
  const rows = data.value ?? []
  if (!rows.length) return 0
  return Math.max(...rows.map((row) => row.sort_order ?? 0)) + 1
})

const handleAvatarFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  avatarFile.value = input.files?.[0] ?? null
}

const openAdd = () => {
  mode.value = 'add'
  target.value = null
  avatarFile.value = null
  form.value = {
    ...createEmptyTestimonialForm(),
    sortOrder: nextSortOrder.value,
  }
  errors.value = {}
  modalOpen.value = true
}

const openEdit = (row: TestimonialDbRow) => {
  mode.value = 'edit'
  target.value = row
  avatarFile.value = null
  form.value = rowToTestimonialForm(row)
  errors.value = {}
  modalOpen.value = true
}

const openDelete = (row: TestimonialDbRow) => {
  target.value = row
  deleteOpen.value = true
}

const save = async () => {
  errors.value = validateTestimonialForm(form.value, {
    hasAvatarUpload: Boolean(avatarFile.value),
  })
  if (hasTestimonialFormErrors(errors.value)) {
    toast.add({ title: 'Please fix the highlighted fields', color: 'red' })
    return
  }

  saving.value = true
  try {
    if (avatarFile.value) {
      const path = testimonialAvatarObjectPath(avatarFile.value.name)
      form.value.avatarUrl = await uploadStorageObject(
        supabase,
        STORAGE_BUCKETS.testimonial_avatars,
        path,
        avatarFile.value,
      )
    }

    const payload = formToTestimonialPayload(form.value)

    if (mode.value === 'add') {
      const { error } = await supabase.from('testimonials').insert([payload])
      if (error) throw error
      toast.add({ title: 'Testimonial created', color: 'green' })
    } else {
      const previousRef =
        target.value && avatarFile.value
          ? testimonialStorageRefForRow(target.value)
          : null
      const newRef = avatarFile.value ? form.value.avatarUrl : null

      const { error } = await supabase
        .from('testimonials')
        .update(payload)
        .eq('id', target.value!.id)
      if (error) throw error

      if (previousRef && newRef && previousRef !== newRef) {
        await deleteStorageRefs(supabase, [previousRef])
      }

      toast.add({ title: 'Testimonial updated', color: 'green' })
    }

    avatarFile.value = null
    modalOpen.value = false
    await refresh()
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Save failed'
    toast.add({ title: 'Error saving testimonial', description: message, color: 'red' })
  } finally {
    saving.value = false
  }
}

const remove = async () => {
  if (!target.value) return
  deleting.value = true
  try {
    const storageRef = testimonialStorageRefForRow(target.value)
    const { error } = await supabase.from('testimonials').delete().eq('id', target.value.id)
    if (error) throw error
    if (storageRef) await deleteStorageRefs(supabase, [storageRef])
    toast.add({ title: 'Testimonial deleted', color: 'green' })
    deleteOpen.value = false
    await refresh()
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Delete failed'
    toast.add({ title: 'Error deleting testimonial', description: message, color: 'red' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Content</span>
        <h1 class="ap-title">Testimonials</h1>
        <p class="ap-subtitle">Manage student and partner success stories with avatars and ratings.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" type="button" @click="refresh()"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
        <button class="btn btn-primary" type="button" @click="openAdd"><UIcon name="i-lucide-plus" />Add Testimonial</button>
      </div>
    </div>

    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search"><UIcon name="i-lucide-search" class="ap-search__icon" /><input v-model="search" class="ap-search__input" placeholder="Search testimonials..." /></div>
      </div>
    </div>

    <AdminTable :columns="columns" :rows="data || []" :loading="pending" empty-title="No testimonials" empty-subtitle="Add a testimonial for the homepage section.">
      <template #cell-avatar="{ row }">
        <div style="width:40px;height:40px;border-radius:50%;background:#e2e8f0;overflow:hidden;flex-shrink:0;">
          <img v-if="row.avatar_url" :src="resolveTestimonialAvatarUrl(row.avatar_url)" style="width:100%;height:100%;object-fit:cover" :alt="row.name" />
          <UIcon v-else name="i-lucide-user" style="margin:8px;width:24px;height:24px;color:#94a3b8" />
        </div>
      </template>
      <template #cell-name="{ row }">
        <span class="font-semibold">{{ row.name }}</span>
      </template>
      <template #cell-role="{ row }"><span style="color:var(--admin-text-secondary)">{{ row.role || '—' }}</span></template>
      <template #cell-status="{ row }"><span class="badge" :class="row.is_published ? 'badge-green' : 'badge-gray'">{{ row.is_published ? 'Published' : 'Draft' }}</span></template>
      <template #cell-sort_order="{ row }">{{ row.sort_order ?? 0 }}</template>
      <template #actions="{ row }">
        <button class="btn btn-ghost btn-icon" title="Edit" type="button" @click="openEdit(row)"><UIcon name="i-lucide-edit-3" /></button>
        <button class="btn btn-danger btn-icon" title="Delete" type="button" @click="openDelete(row)"><UIcon name="i-lucide-trash-2" /></button>
      </template>
    </AdminTable>

    <AdminModal :open="modalOpen" :title="mode === 'add' ? 'New Testimonial' : 'Edit Testimonial'" :submit-label="mode === 'add' ? 'Create' : 'Save changes'" :loading="saving" @close="modalOpen = false" @submit="save">
      <div class="am-field" :class="{ 'has-error': errors.name }">
        <label class="am-label">Name *</label>
        <input v-model="form.name" class="am-input" placeholder="e.g. Amina Ibrahim" />
        <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
      </div>

      <div class="am-row-2">
        <div class="am-field">
          <label class="am-label">Role/Title</label>
          <input v-model="form.role" class="am-input" placeholder="e.g. Fashion Design Graduate" />
        </div>
        <div class="am-field">
          <label class="am-label">Organization</label>
          <input v-model="form.organization" class="am-input" placeholder="e.g. Fashion Hub Lagos" />
        </div>
      </div>

      <div class="am-field" :class="{ 'has-error': errors.quote }">
        <label class="am-label">Quote *</label>
        <textarea v-model="form.quote" class="am-textarea" rows="3" placeholder="Student or alumni testimonial..." />
        <p v-if="errors.quote" class="field-error">{{ errors.quote }}</p>
      </div>

      <div class="am-row-2">
        <div class="am-field" :class="{ 'has-error': errors.rating }">
          <label class="am-label">Rating</label>
          <select v-model.number="form.rating" class="am-select">
            <option :value="1">⭐ 1 star</option>
            <option :value="2">⭐⭐ 2 stars</option>
            <option :value="3">⭐⭐⭐ 3 stars</option>
            <option :value="4">⭐⭐⭐⭐ 4 stars</option>
            <option :value="5">⭐⭐⭐⭐⭐ 5 stars</option>
          </select>
          <p v-if="errors.rating" class="field-error">{{ errors.rating }}</p>
        </div>
        <div class="am-field">
          <label class="am-label" style="display:flex;gap:8px;align-items:center">
            <input type="checkbox" v-model="form.isFeatured" />
            Featured
          </label>
        </div>
      </div>

      <div class="am-field">
        <label class="am-label">Avatar Upload</label>
        <input type="file" accept="image/*" class="am-input" @change="handleAvatarFileChange" />
        <p class="field-hint">PNG, JPG, or WebP. Max 5MB.</p>
      </div>

      <div v-if="previewUrl" class="avatar-preview" style="margin:16px 0">
        <img :src="previewUrl" alt="Avatar preview" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid #e2e8f0" />
      </div>

      <div class="am-row-2">
        <div class="am-field" :class="{ 'has-error': errors.sortOrder }">
          <label class="am-label">Sort Order</label>
          <input v-model.number="form.sortOrder" type="number" class="am-input" />
          <p v-if="errors.sortOrder" class="field-error">{{ errors.sortOrder }}</p>
        </div>
        <div class="am-field" style="justify-content:flex-end">
          <label class="am-checkbox-row">
            <input type="checkbox" v-model="form.isPublished" />
            Published
          </label>
        </div>
      </div>
    </AdminModal>

    <AdminModal :open="deleteOpen" title="Delete Testimonial" submit-label="Delete" submit-danger :loading="deleting" @close="deleteOpen = false" @submit="remove">
      <p style="color:var(--admin-text-secondary)">Permanently delete <strong>{{ target?.name }}</strong>?</p>
    </AdminModal>
  </section>
</template>

