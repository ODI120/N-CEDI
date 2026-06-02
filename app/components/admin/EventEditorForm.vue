<script setup lang="ts">
import {
  createEmptyEventForm,
  formToDbPayload,
  hasFormErrors,
  resolveEventMediaUrl,
  rowToEventForm,
  slugifyTitle,
  validateEventForm,
  type EventDbRow,
  type EventFormErrors,
  type EventFormState,
} from '~/utils/eventAdmin'
import {
  STORAGE_BUCKETS,
  deleteStorageRefs,
  mediaObjectPath,
  uploadStorageObject,
} from '~/utils/storage'

const props = defineProps<{
  eventId?: string
}>()

const emit = defineEmits<{
  saved: [payload: { id: string; slug: string }]
  cancel: []
  deleted: []
}>()

const supabase = useSupabaseClient() as any
const toast = useToast()

const isCreate = computed(() => !props.eventId)
const activeSection = ref('basics')
const saving = ref(false)
const deleting = ref(false)
const deleteOpen = ref(false)
const slugTouched = ref(false)
const coverImageFile = ref<File | null>(null)
const coverPreviewUrl = ref('')
const galleryFiles = ref<File[]>([])
const form = ref<EventFormState>(createEmptyEventForm())
const errors = ref<EventFormErrors>({})

const sections = [
  { id: 'basics', label: 'Basics', icon: 'i-lucide-file-text' },
  { id: 'media', label: 'Media & Gallery', icon: 'i-lucide-image' },
  { id: 'content', label: 'Event Details', icon: 'i-lucide-layout-template' },
  { id: 'seo', label: 'SEO & Settings', icon: 'i-lucide-settings-2' },
]

const { data: categories } = await useAsyncData('admin-event-categories', async () => {
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .eq('category_type', 'event')
    .order('name')
  return data ?? []
})

if (props.eventId) {
  const { data: row, error } = await useAsyncData(`admin-event-${props.eventId}`, async () => {
    const { data, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', props.eventId!)
      .maybeSingle()
    if (fetchError) throw fetchError
    return data as EventDbRow | null
  })

  if (error.value || !row.value) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  form.value = rowToEventForm(row.value)
  slugTouched.value = true
}

watch(
  () => form.value.title,
  (title) => {
    if (!slugTouched.value) {
      form.value.slug = slugifyTitle(title)
    }
    if (!form.value.metaTitle.trim()) {
      form.value.metaTitle = title.trim()
    }
  },
)

watch(
  () => form.value.description,
  (description) => {
    if (!form.value.metaDescription.trim()) {
      form.value.metaDescription = description.trim()
    }
  },
)

const getSlugForStorage = () => {
  const raw = form.value.slug || 'event'
  return String(raw).trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-')
}

const uploadEventImage = async (file: File, prefix: 'cover' | 'gallery') => {
  const filename = `${getSlugForStorage()}-${prefix}-${file.name}`
  const objectPath = mediaObjectPath(`events/${filename}`)
  return uploadStorageObject(supabase, STORAGE_BUCKETS.media, objectPath, file)
}

const onCoverChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  coverImageFile.value = file
  coverPreviewUrl.value = URL.createObjectURL(file)
}

const onGalleryChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files?.length) return
  galleryFiles.value = [...galleryFiles.value, ...Array.from(files)]
}

const removeGalleryUrl = (index: number) => {
  form.value.galleryUrls.splice(index, 1)
}

const removePendingGalleryFile = (index: number) => {
  galleryFiles.value.splice(index, 1)
}

const mainPreviewUrl = computed(() => {
  if (coverPreviewUrl.value) return coverPreviewUrl.value
  return resolveEventMediaUrl(form.value.coverImageUrl)
})

const previewPath = computed(() =>
  form.value.slug ? `/events/${form.value.slug}` : null,
)

const completionChecks = computed(() => [
  { label: 'Title & slug', done: Boolean(form.value.title.trim() && form.value.slug.trim()) },
  { label: 'Card description', done: Boolean(form.value.description.trim()) },
  { label: 'Cover image', done: Boolean(form.value.coverImageUrl || coverImageFile.value) },
  { label: 'Rich text details', done: form.value.body.length > 0 },
])

// ─── Block Editor Helpers ─────────────────────────────────────
const addParagraphBlock = () => {
  form.value.body.push({ type: 'paragraph', data: { text: '' } })
}

const addHeadingBlock = () => {
  form.value.body.push({ type: 'heading', data: { text: '', level: 2 } })
}

const addQuoteBlock = () => {
  form.value.body.push({ type: 'quote', data: { text: '', caption: '' } })
}

const addListBlock = () => {
  form.value.body.push({ type: 'list', data: { items: [''], style: 'unordered' } })
}

const removeBlock = (index: number) => {
  form.value.body.splice(index, 1)
}

const moveBlock = (index: number, direction: -1 | 1) => {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= form.value.body.length) return
  const items = [...form.value.body]
  const [item] = items.splice(index, 1)
  items.splice(targetIndex, 0, item!)
  form.value.body = items
}

const addListItem = (blockIndex: number) => {
  form.value.body[blockIndex].data.items.push('')
}

const removeListItem = (blockIndex: number, itemIndex: number) => {
  if (form.value.body[blockIndex].data.items.length === 1) {
    form.value.body[blockIndex].data.items[0] = ''
    return
  }
  form.value.body[blockIndex].data.items.splice(itemIndex, 1)
}

const save = async () => {
  errors.value = validateEventForm(form.value, {
    isCreate: isCreate.value,
    hasPendingCover: Boolean(coverImageFile.value),
  })
  
  if (hasFormErrors(errors.value)) {
    toast.add({
      title: errors.value.publish ? 'Cannot publish yet' : 'Please fix the highlighted fields',
      description: errors.value.publish,
      color: 'red',
    })
    if (errors.value.title || errors.value.slug || errors.value.description) activeSection.value = 'basics'
    else if (errors.value.coverImageUrl) activeSection.value = 'media'
    else if (errors.value.publish) activeSection.value = 'seo'
    return
  }

  saving.value = true
  const previousCoverRef = form.value.coverImageUrl

  try {
    const payload = formToDbPayload(form.value)

    if (coverImageFile.value) {
      payload.cover_image_url = await uploadEventImage(coverImageFile.value, 'cover')
    } else if (isCreate.value && !payload.cover_image_url) {
      throw new Error('Cover image is required for new events.')
    }

    if (galleryFiles.value.length > 0) {
      const uploadedUrls: string[] = []
      for (const file of galleryFiles.value) {
        uploadedUrls.push(await uploadEventImage(file, 'gallery'))
      }
      payload.gallery_urls = [...form.value.galleryUrls, ...uploadedUrls]
    }

    if (isCreate.value) {
      const { data, error } = await supabase
        .from('events')
        .insert([payload])
        .select('id, slug')
        .single()

      if (error) throw error
      emit('saved', { id: data.id, slug: data.slug })
    } else {
      const { error } = await supabase
        .from('events')
        .update(payload)
        .eq('id', props.eventId!)

      if (error) throw error
      toast.add({ title: 'Event updated successfully', color: 'green' })
      emit('saved', { id: props.eventId!, slug: form.value.slug })
    }

    if (coverImageFile.value && previousCoverRef) {
      await deleteStorageRefs(supabase, [previousCoverRef])
    }
  } catch (error: any) {
    toast.add({ title: 'Could not save event', description: error.message, color: 'red' })
  } finally {
    saving.value = false
  }
}

const removeEvent = async () => {
  if (!props.eventId) return
  deleting.value = true
  try {
    const refs = [form.value.coverImageUrl, ...form.value.galleryUrls]
    const { error } = await supabase.from('events').delete().eq('id', props.eventId)
    if (error) throw error
    
    if (refs.length > 0) {
      await deleteStorageRefs(supabase, refs)
    }
    toast.add({ title: 'Event deleted successfully', color: 'green' })
    deleteOpen.value = false
    emit('deleted')
  } catch (error: any) {
    toast.add({ title: 'Could not delete event', description: error.message, color: 'red' })
  } finally {
    deleting.value = false
  }
}

onBeforeUnmount(() => {
  if (coverPreviewUrl.value) URL.revokeObjectURL(coverPreviewUrl.value)
})
</script>

<template>
  <div class="event-editor">
    <!-- Sidebar Navigation -->
    <aside class="event-editor__sidebar">
      <nav class="event-editor__nav" aria-label="Event editor sections">
        <button
          v-for="section in sections"
          :key="section.id"
          type="button"
          class="event-editor__nav-btn"
          :class="{ 'is-active': activeSection === section.id }"
          @click="activeSection = section.id"
        >
          <UIcon :name="section.icon" />
          <span>{{ section.label }}</span>
        </button>
      </nav>

      <div class="event-editor__checklist">
        <p class="event-editor__checklist-title">Publish checklist</p>
        <ul>
          <li v-for="item in completionChecks" :key="item.label" :class="{ done: item.done }">
            <UIcon :name="item.done ? 'i-lucide-check-circle-2' : 'i-lucide-circle'" />
            {{ item.label }}
          </li>
        </ul>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="event-editor__main">
      <!-- 1. Basics Section -->
      <section v-show="activeSection === 'basics'" class="editor-section">
        <div class="editor-section__header">
          <h2>Basic Information</h2>
          <p>Core details of the event shown on listing cards and headers.</p>
        </div>

        <div class="am-field" :class="{ 'has-error': errors.title }">
          <label class="am-label">Event Title *</label>
          <input v-model="form.title" class="am-input" placeholder="e.g. NCAT Entrepreneurship Day" />
          <p v-if="errors.title" class="field-error">{{ errors.title }}</p>
        </div>

        <div class="am-field" :class="{ 'has-error': errors.slug }">
          <label class="am-label">URL Slug *</label>
          <div class="slug-row">
            <span class="slug-prefix">/events/</span>
            <input
              v-model="form.slug"
              class="am-input"
              placeholder="ncat-entrepreneurship-day"
              @input="slugTouched = true"
            />
          </div>
          <p v-if="errors.slug" class="field-error">{{ errors.slug }}</p>
        </div>

        <div class="am-field" :class="{ 'has-error': errors.description }">
          <label class="am-label">Short Description *</label>
          <textarea
            v-model="form.description"
            class="am-textarea"
            rows="3"
            placeholder="A brief card summary of the yearly event."
          />
          <p v-if="errors.description" class="field-error">{{ errors.description }}</p>
        </div>

        <div class="am-field">
          <label class="am-label">Category</label>
          <select v-model="form.categoryId" class="am-select">
            <option value="">No category</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
      </section>

      <!-- 2. Media Section -->
      <section v-show="activeSection === 'media'" class="editor-section">
        <div class="editor-section__header">
          <h2>Media & Cover Gallery</h2>
          <p>Configure the cover image and the gallery slider for the details page.</p>
        </div>

        <!-- Cover Image -->
        <div class="am-field" :class="{ 'has-error': errors.coverImageUrl }">
          <label class="am-label">Primary Card Cover / Thumbnail *</label>
          <div class="hero-preview" :class="{ 'hero-preview--empty': !mainPreviewUrl }">
            <img v-if="mainPreviewUrl" :src="mainPreviewUrl" alt="Cover preview">
            <div v-else class="hero-preview__placeholder">
              <UIcon name="i-lucide-image" />
              <span>No cover image uploaded</span>
            </div>
            <div v-if="mainPreviewUrl" class="hero-preview__overlay">
              <p>{{ form.title || 'Event Title' }}</p>
            </div>
          </div>
          <label class="upload-dropzone">
            <input type="file" accept="image/*" hidden @change="onCoverChange">
            <UIcon name="i-lucide-upload-cloud" />
            <span>{{ coverImageFile ? coverImageFile.name : 'Choose cover image to upload' }}</span>
          </label>
          <p v-if="errors.coverImageUrl" class="field-error">{{ errors.coverImageUrl }}</p>
          <p class="field-hint">Stored in the "media" bucket. Recommended size: 1200x675 (16:9 ratio).</p>
        </div>

        <!-- Slider Gallery -->
        <div class="am-field">
          <label class="am-label">Details Page Gallery Slider Images</label>
          <div v-if="form.galleryUrls.length" class="gallery-grid">
            <figure v-for="(url, index) in form.galleryUrls" :key="`saved-${index}`" class="gallery-item">
              <img :src="resolveEventMediaUrl(url)" alt="Gallery image">
              <button type="button" class="gallery-item__remove" @click="removeGalleryUrl(index)">
                <UIcon name="i-lucide-x" />
              </button>
            </figure>
          </div>

          <div v-if="galleryFiles.length" class="gallery-pending">
            <p class="field-hint">{{ galleryFiles.length }} new file(s) will upload on save</p>
            <ul>
              <li v-for="(file, index) in galleryFiles" :key="`${file.name}-${index}`">
                {{ file.name }}
                <button type="button" class="link-btn" @click="removePendingGalleryFile(index)">Remove</button>
              </li>
            </ul>
          </div>

          <label class="upload-dropzone" style="margin-top:var(--sp-2)">
            <input type="file" accept="image/*" multiple hidden @change="onGalleryChange">
            <UIcon name="i-lucide-images" />
            <span>Add gallery images for the slider</span>
          </label>
        </div>
      </section>

      <!-- 3. Details Content (Block-level editor) -->
      <section v-show="activeSection === 'content'" class="editor-section">
        <div class="editor-section__header">
          <h2>Rich Text Details</h2>
          <p>Build the main page layout visually by adding paragraph, heading, list, or quote blocks.</p>
        </div>

        <div class="blocks-container">
          <div v-if="form.body.length === 0" class="blocks-empty">
            <UIcon name="i-lucide-scroll" class="blocks-empty__icon" />
            <p>Your details page is empty. Start adding blocks below.</p>
          </div>

          <div v-for="(block, idx) in form.body" :key="idx" class="block-card">
            <div class="block-card__header">
              <span class="block-card__title">
                <UIcon :name="block.type === 'paragraph' ? 'i-lucide-align-left' : block.type === 'heading' ? 'i-lucide-heading' : block.type === 'quote' ? 'i-lucide-quote' : 'i-lucide-list'" />
                {{ block.type.charAt(0).toUpperCase() + block.type.slice(1) }} Block
              </span>
              <div class="block-card__actions">
                <button type="button" class="btn btn-ghost btn-icon" :disabled="idx === 0" @click="moveBlock(idx, -1)" title="Move Up">
                  <UIcon name="i-lucide-arrow-up" />
                </button>
                <button type="button" class="btn btn-ghost btn-icon" :disabled="idx === form.body.length - 1" @click="moveBlock(idx, 1)" title="Move Down">
                  <UIcon name="i-lucide-arrow-down" />
                </button>
                <button type="button" class="btn btn-danger btn-icon" @click="removeBlock(idx)" title="Delete Block">
                  <UIcon name="i-lucide-trash-2" />
                </button>
              </div>
            </div>

            <div class="block-card__body">
              <!-- Paragraph Input -->
              <div v-if="block.type === 'paragraph'">
                <textarea v-model="block.data.text" class="am-textarea" rows="4" placeholder="Type paragraph content here (supports basic HTML tags)..." />
              </div>

              <!-- Heading Input -->
              <div v-else-if="block.type === 'heading'" class="heading-block-inputs">
                <select v-model="block.data.level" class="am-select select-level">
                  <option :value="2">Heading 2 (Large)</option>
                  <option :value="3">Heading 3 (Medium)</option>
                  <option :value="4">Heading 4 (Small)</option>
                </select>
                <input v-model="block.data.text" class="am-input" placeholder="Type heading text..." />
              </div>

              <!-- Quote Input -->
              <div v-else-if="block.type === 'quote'" class="quote-block-inputs">
                <textarea v-model="block.data.text" class="am-textarea" rows="2" placeholder="Enter quote text..." />
                <input v-model="block.data.caption" class="am-input" style="margin-top:var(--sp-2)" placeholder="Attribution (e.g. John Doe, Student Union Leader)..." />
              </div>

              <!-- List Input -->
              <div v-else-if="block.type === 'list'" class="list-block-inputs">
                <div class="list-style-selector">
                  <label class="radio-label">
                    <input type="radio" v-model="block.data.style" value="unordered" /> Bulleted List
                  </label>
                  <label class="radio-label" style="margin-left:var(--sp-4)">
                    <input type="radio" v-model="block.data.style" value="ordered" /> Numbered List
                  </label>
                </div>
                <div class="list-items">
                  <div v-for="(item, itemIdx) in block.data.items" :key="itemIdx" class="list-item-row">
                    <span class="list-item-bullet">{{ block.data.style === 'ordered' ? `${itemIdx + 1}.` : '•' }}</span>
                    <input v-model="block.data.items[itemIdx]" class="am-input list-item-input" placeholder="List item text..." />
                    <button type="button" class="btn btn-danger btn-icon" @click="removeListItem(idx, itemIdx)" title="Remove item">
                      <UIcon name="i-lucide-minus" />
                    </button>
                  </div>
                  <button type="button" class="btn btn-ghost btn-sm" @click="addListItem(idx)" style="margin-top:var(--sp-2)">
                    <UIcon name="i-lucide-plus" /> Add List Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Block Controls -->
        <div class="add-block-controls">
          <span class="add-block-label">Insert Block:</span>
          <div class="add-block-buttons">
            <button type="button" class="btn btn-secondary btn-sm" @click="addParagraphBlock">
              <UIcon name="i-lucide-align-left" /> Paragraph
            </button>
            <button type="button" class="btn btn-secondary btn-sm" @click="addHeadingBlock">
              <UIcon name="i-lucide-heading" /> Heading
            </button>
            <button type="button" class="btn btn-secondary btn-sm" @click="addQuoteBlock">
              <UIcon name="i-lucide-quote" /> Quote
            </button>
            <button type="button" class="btn btn-secondary btn-sm" @click="addListBlock">
              <UIcon name="i-lucide-list" /> List
            </button>
          </div>
        </div>
      </section>

      <!-- 4. SEO & Settings Section -->
      <section v-show="activeSection === 'seo'" class="editor-section">
        <div class="editor-section__header">
          <h2>SEO & Settings</h2>
          <p>Manage metadata and publication visibility on the public site.</p>
        </div>

        <div class="am-field">
          <label class="am-label">Meta Title</label>
          <input v-model="form.metaTitle" class="am-input" placeholder="Defaults to event title" />
        </div>

        <div class="am-field">
          <label class="am-label">Meta Description</label>
          <textarea v-model="form.metaDescription" class="am-textarea" rows="3" placeholder="Search engine description preview" />
        </div>

        <div class="toggle-grid">
          <p v-if="errors.publish" class="field-error publish-error">{{ errors.publish }}</p>

          <label class="toggle-card" :class="{ 'is-on': form.isPublished }">
            <input v-model="form.isPublished" type="checkbox">
            <div>
              <strong>Published</strong>
              <p>Visible to students on the public website event list.</p>
            </div>
          </label>
        </div>
      </section>
    </div>

    <!-- Sticky Actions Footer -->
    <footer class="event-editor__footer">
      <div class="event-editor__footer-left">
        <button type="button" class="btn btn-ghost" @click="emit('cancel')">Cancel</button>
        <button
          v-if="!isCreate"
          type="button"
          class="btn btn-danger btn-ghost"
          @click="deleteOpen = true"
        >
          <UIcon name="i-lucide-trash-2" />Delete
        </button>
        <NuxtLink
          v-if="previewPath"
          :to="form.isPublished ? previewPath : `/events/${form.slug}`"
          target="_blank"
          class="btn btn-ghost"
        >
          <UIcon name="i-lucide-external-link" />Preview live
        </NuxtLink>
      </div>
      <button type="button" class="btn btn-primary" :disabled="saving" @click="save">
        <UIcon v-if="saving" name="i-lucide-loader-2" class="spin" />
        {{ isCreate ? 'Create Event' : 'Save Changes' }}
      </button>
    </footer>

    <!-- Delete Confirmation Modal -->
    <AdminModal
      :open="deleteOpen"
      title="Delete event"
      subtitle="This permanently deletes the event and all associated gallery images in storage."
      submit-label="Delete permanently"
      submit-danger
      :loading="deleting"
      @close="deleteOpen = false"
      @submit="removeEvent"
    >
      <p style="color:var(--admin-text-secondary);font-weight:700">{{ form.title || 'Untitled event' }}</p>
    </AdminModal>
  </div>
</template>

<style scoped>
.event-editor {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: var(--sp-6);
  align-items: start;
}

.event-editor__sidebar {
  position: sticky;
  top: var(--sp-6);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.event-editor__nav {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  padding: var(--sp-2);
  background: var(--admin-surface-opaque);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-lg);
}

.event-editor__nav-btn {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 10px 12px;
  border: none;
  border-radius: var(--admin-radius-md);
  background: transparent;
  color: var(--admin-text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

.event-editor__nav-btn.is-active {
  background: rgba(212, 168, 83, 0.12);
  color: var(--admin-brand-accent-text);
}

.event-editor__checklist {
  padding: var(--sp-4);
  background: var(--admin-surface-opaque);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-lg);
}

.event-editor__checklist-title {
  margin: 0 0 var(--sp-3);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--admin-text-muted);
}

.event-editor__checklist ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.event-editor__checklist li {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.8125rem;
  color: var(--admin-text-muted);
}

.event-editor__checklist li.done {
  color: var(--admin-brand-green);
}

.event-editor__main {
  background: var(--admin-surface-opaque);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-xl);
  padding: var(--sp-8);
  min-height: 560px;
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.editor-section__header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.editor-section__header p {
  margin: var(--sp-1) 0 0;
  color: var(--admin-text-muted);
  font-size: 0.875rem;
}

.slug-row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.slug-prefix {
  font-size: 0.8125rem;
  color: var(--admin-text-muted);
  white-space: nowrap;
}

.field-hint {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: var(--admin-text-muted);
}

.field-error {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: var(--admin-brand-red);
}

.has-error .am-input,
.has-error .am-textarea {
  border-color: var(--admin-brand-red);
}

.hero-preview {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: var(--admin-radius-lg);
  overflow: hidden;
  background: var(--admin-bg-deep);
  margin-bottom: var(--sp-3);
  border: 1px solid var(--admin-border);
}

.hero-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-preview__placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  color: var(--admin-text-muted);
}

.hero-preview__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--sp-6);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent 55%);
  color: #fff;
}

.hero-preview__overlay p {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.upload-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-8);
  border: 2px dashed var(--admin-border-strong);
  border-radius: var(--admin-radius-lg);
  cursor: pointer;
  color: var(--admin-text-secondary);
  text-align: center;
  transition: all 0.3s;
}

.upload-dropzone:hover {
  border-color: var(--admin-brand-accent);
  background: rgba(212, 168, 83, 0.05);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--sp-3);
  margin-bottom: var(--sp-4);
}

.gallery-item {
  position: relative;
  margin: 0;
  aspect-ratio: 4 / 3;
  border-radius: var(--admin-radius-md);
  overflow: hidden;
  border: 1px solid var(--admin-border);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-item__remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-pending ul {
  margin: var(--sp-2) 0;
  padding-left: 1.2rem;
}

.link-btn {
  border: none;
  background: none;
  color: var(--admin-brand-red);
  cursor: pointer;
  margin-left: var(--sp-2);
  font-weight: 600;
}

/* Block Editor Styles */
.blocks-container {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  margin-bottom: var(--sp-6);
}

.blocks-empty {
  padding: var(--sp-12);
  border: 2px dashed var(--admin-border);
  border-radius: var(--admin-radius-lg);
  text-align: center;
  color: var(--admin-text-muted);
}

.blocks-empty__icon {
  font-size: 2.5rem;
  margin-bottom: var(--sp-3);
}

.blocks-empty p {
  margin: 0;
  font-size: 0.9375rem;
}

.block-card {
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-lg);
  background: var(--admin-bg-deep);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.block-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sp-3) var(--sp-4);
  background: var(--admin-surface-opaque);
  border-bottom: 1px solid var(--admin-border);
}

.block-card__title {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--admin-text-secondary);
}

.block-card__actions {
  display: flex;
  gap: var(--sp-1);
}

.block-card__body {
  padding: var(--sp-4);
  background: var(--admin-bg);
}

.heading-block-inputs {
  display: flex;
  gap: var(--sp-3);
}

.select-level {
  width: 180px;
}

.quote-block-inputs {
  display: flex;
  flex-direction: column;
}

.list-block-inputs {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.list-style-selector {
  display: flex;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--admin-text-secondary);
}

.radio-label {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  cursor: pointer;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.list-item-row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.list-item-bullet {
  width: 20px;
  font-weight: 600;
  color: var(--admin-text-muted);
  text-align: center;
}

.list-item-input {
  flex: 1;
}

.add-block-controls {
  padding: var(--sp-4);
  background: var(--admin-surface-opaque);
  border: 1px dashed var(--admin-border-strong);
  border-radius: var(--admin-radius-lg);
  display: flex;
  align-items: center;
  gap: var(--sp-4);
}

.add-block-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--admin-text-secondary);
}

.add-block-buttons {
  display: flex;
  gap: var(--sp-2);
  flex-wrap: wrap;
}

.toggle-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--sp-4);
}

.publish-error {
  color: var(--admin-brand-red);
}

.toggle-card {
  display: flex;
  gap: var(--sp-3);
  padding: var(--sp-4);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-lg);
  cursor: pointer;
  transition: all 0.3s;
}

.toggle-card.is-on {
  border-color: rgba(5, 150, 105, 0.35);
  background: rgba(5, 150, 105, 0.06);
}

.toggle-card strong {
  display: block;
  margin-bottom: 4px;
}

.toggle-card p {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--admin-text-muted);
}

.event-editor__footer {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-5);
  background: var(--admin-surface-opaque);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-lg);
  position: sticky;
  bottom: var(--sp-4);
  z-index: 100;
}

.event-editor__footer-left {
  display: flex;
  gap: var(--sp-2);
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 960px) {
  .event-editor {
    grid-template-columns: 1fr;
  }

  .event-editor__sidebar {
    position: static;
  }

  .event-editor__nav {
    flex-direction: row;
    overflow-x: auto;
  }
}
</style>
