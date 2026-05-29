<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Programs | Admin | N-CEDI' })

type ProgramRow = {
  id: string
  title: string
  slug: string
  subtitle?: string
  description?: string
  cover_image_url?: string
  duration_weeks: number
  level: 'beginner' | 'intermediate' | 'advanced'
  is_published: boolean
  is_featured: boolean
  requirements?: string
  outcomes?: string[]
  overview?: string
  lab_experience?: string
  gallery_urls?: string[]
  updated_at: string
}

import { getImageUrl } from '~/utils/imageUrl'

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
const coverImageFile = ref<File | null>(null)
const galleryFiles = ref<File[]>([])
const form = ref<Partial<ProgramRow> & { outcomesText?: string }>({
  title: '', slug: '', level: 'beginner', duration_weeks: 4, is_published: false, is_featured: false, outcomesText: '', gallery_urls: []
})
const target = ref<ProgramRow | null>(null)

const getSlugForStorage = () => {
  const raw = target.value?.slug || form.value.slug || 'program'
  return String(raw).trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-')
}

const getUploadKey = (file: File, prefix: string) => {
  const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const uuid = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `programs/${getSlugForStorage()}/${prefix}-${uuid}-${safeFilename}`
}

const uploadFile = async (file: File, path: string) => {
  const { error } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false
  })
  if (error) throw error
  return getImageUrl(path)
}

const handleCoverImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  coverImageFile.value = input.files?.[0] ?? null
}

const handleGalleryFilesChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  galleryFiles.value = input.files ? Array.from(input.files) : []
}

const openAdd = () => {
  mode.value = 'add'
  target.value = null
  coverImageFile.value = null
  galleryFiles.value = []
  form.value = {
    title: '',
    slug: '',
    level: 'beginner',
    duration_weeks: 4,
    is_published: false,
    is_featured: false,
    outcomesText: '',
    gallery_urls: []
  }
  modalOpen.value = true
}

const openEdit = (row: ProgramRow) => {
  mode.value = 'edit'
  target.value = row
  coverImageFile.value = null
  galleryFiles.value = []
  form.value = {
    ...row,
    outcomesText: row.outcomes?.join('\n') ?? '',
    gallery_urls: row.gallery_urls || []
  }
  modalOpen.value = true
}
const openDelete = (row: ProgramRow) => { target.value = row; deleteOpen.value = true }

const save = async () => {
  saving.value = true
  try {
    const { outcomesText, gallery_urls, ...base } = form.value
    const incoming: Record<string, unknown> = {
      ...base,
      outcomes: outcomesText?.split('\n').map(line => line.trim()).filter(Boolean) ?? [],
      gallery_urls: gallery_urls?.length ? [...gallery_urls] : []
    }

    if (coverImageFile.value) {
      const coverKey = getUploadKey(coverImageFile.value, 'cover')
      incoming.cover_image_url = await uploadFile(coverImageFile.value, coverKey)
    }

    if (galleryFiles.value.length > 0) {
      const existingGalleryUrls = Array.isArray(incoming.gallery_urls) ? [...(incoming.gallery_urls as string[])] : []
      for (const file of galleryFiles.value) {
        const galleryKey = getUploadKey(file, 'gallery')
        existingGalleryUrls.push(await uploadFile(file, galleryKey))
      }
      incoming.gallery_urls = existingGalleryUrls
    }

    if (mode.value === 'add') {
      const { error } = await supabase.from('programs').insert([incoming])
      if (error) throw error
      toast.add({ title: 'Program Created', color: 'green' })
    } else {
      const { error } = await supabase.from('programs').update(incoming).eq('id', target.value!.id)
      if (error) throw error
      toast.add({ title: 'Program Updated', color: 'green' })
    }
    coverImageFile.value = null
    galleryFiles.value = []
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
      <div class="am-field"><label class="am-label">Subtitle</label><input v-model="form.subtitle" class="am-input" /></div>
      <div class="am-field"><label class="am-label">Slug</label><input v-model="form.slug" class="am-input" /></div>
      <div class="am-field">
        <label class="am-label">Cover Image</label>
        <input type="file" accept="image/*" @change="handleCoverImageChange" class="am-input" />
        <p class="am-note" v-if="coverImageFile">Selected file: {{ coverImageFile.name }}</p>
        <p class="am-note" v-else-if="form.cover_image_url">Current image URL: {{ form.cover_image_url }}</p>
      </div>
      <div class="am-field"><label class="am-label">Description</label><textarea v-model="form.description" class="am-textarea" rows="3"></textarea></div>
      <div class="am-field"><label class="am-label">Program Overview</label><textarea v-model="form.overview" class="am-textarea" rows="3"></textarea></div>
      <div class="am-field"><label class="am-label">Practical Lab Experience</label><textarea v-model="form.lab_experience" class="am-textarea" rows="3"></textarea></div>
      <div class="am-field"><label class="am-label">Key Learning Outcomes (one per line)</label><textarea v-model="form.outcomesText" class="am-textarea" rows="4"></textarea></div>
      <div class="am-field">
        <label class="am-label">Gallery Images</label>
        <input type="file" accept="image/*" multiple @change="handleGalleryFilesChange" class="am-input" />
        <p class="am-note" v-if="galleryFiles.length">Selected {{ galleryFiles.length }} files</p>
        <p class="am-note" v-else-if="form.gallery_urls?.length">Existing {{ form.gallery_urls.length }} gallery images will remain unless new files are uploaded.</p>
      </div>
      <div class="am-row-2" style="margin-top:16px">
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
