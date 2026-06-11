<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import { nextTick } from 'vue'
import {
  createEmptyProgramForm,
  formToDbPayload,
  hasFormErrors,
  resolveProgramMediaUrl,
  rowToProgramForm,
  slugifyTitle,
  validateProgramForm,
  type ProgramDbRow,
  type ProgramFormErrors,
  type ProgramFormState
} from '~/utils/programAdmin'
import {
  STORAGE_BUCKETS,
  collectProgramStorageRefs,
  deleteStorageRefs,
  programMediaObjectPath,
  uploadStorageObject
} from '~/utils/storage'

const props = defineProps<{
  programId?: string
}>()

const emit = defineEmits<{
  saved: [payload: { id: string, slug: string }]
  cancel: []
  deleted: []
}>()

const supabase = useSupabaseClient() as any
const toast = useToast()

const { data: adminProfile } = useNuxtData<{ role?: string } | null>('sidebar-admin-role')
const canEdit = computed(() => adminProfile.value?.role !== 'viewer')
const canDelete = computed(() => adminProfile.value?.role === 'admin' || adminProfile.value?.role === 'super_admin')

const isCreate = computed(() => !props.programId)
const activeSection = ref('basics')
const saving = ref(false)
const deleting = ref(false)
const deleteOpen = ref(false)
const slugTouched = ref(false)
const coverImageFile = ref<File | null>(null)
const coverPreviewUrl = ref('')
const galleryFiles = ref<File[]>([])
const form = ref<ProgramFormState>(createEmptyProgramForm())
const errors = ref<ProgramFormErrors>({})
const isDirty = ref(false)

// Watch form deeply to track user modifications
watch(form, () => {
  if (props.programId && programPending.value) return
  isDirty.value = true
}, { deep: true })

// BeforeUnload handler for native browser reloads or tab closures
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (isDirty.value) {
    e.preventDefault()
    e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
    return e.returnValue
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// Vue Router guard for internal transitions
onBeforeRouteLeave((to, from, next) => {
  if (isDirty.value) {
    const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?')
    if (confirmLeave) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})

const sections = [
  { id: 'basics', label: 'Basics', icon: 'i-lucide-file-text' },
  { id: 'hero', label: 'Hero & Media', icon: 'i-lucide-image' },
  { id: 'content', label: 'Page Content', icon: 'i-lucide-layout-template' },
  { id: 'outcomes', label: 'Outcomes', icon: 'i-lucide-target' },
  { id: 'gallery', label: 'Gallery', icon: 'i-lucide-images' },
  { id: 'seo', label: 'SEO & Settings', icon: 'i-lucide-settings-2' }
]

const { data: categories } = useAsyncData('admin-program-categories', async () => {
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .eq('category_type', 'program')
    .order('name')
  return data ?? []
}, { default: () => [] })

const { data: row, pending: programPending, error } = useAsyncData(`admin-program-${props.programId}`, async () => {
  if (!props.programId) return null
  const { data, error: fetchError } = await supabase
    .from('programs')
    .select('*')
    .eq('id', props.programId!)
    .maybeSingle()
  if (fetchError) throw fetchError
  return data as ProgramDbRow | null
}, { immediate: Boolean(props.programId) })

watch(row, (newRow) => {
  if (newRow) {
    form.value = rowToProgramForm(newRow)
    slugTouched.value = true
    nextTick(() => {
      isDirty.value = false
    })
  }
}, { immediate: true })

watch(error, (newErr) => {
  if (newErr) {
    toast.add({ title: 'Error loading program details', description: newErr.message, color: 'error' })
  }
})

watch(
  () => form.value.title,
  (title) => {
    if (!slugTouched.value) {
      form.value.slug = slugifyTitle(title)
    }
    if (!form.value.metaTitle.trim()) {
      form.value.metaTitle = title.trim()
    }
  }
)

watch(
  () => form.value.description,
  (description) => {
    if (!form.value.metaDescription.trim()) {
      form.value.metaDescription = description.trim()
    }
  }
)

const getSlugForStorage = () => {
  const raw = form.value.slug || 'program'
  return String(raw).trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-')
}

const uploadProgramImage = async (file: File, prefix: 'cover' | 'gallery') => {
  const objectPath = programMediaObjectPath(getSlugForStorage(), prefix, file.name)
  return uploadStorageObject(supabase, STORAGE_BUCKETS.program_media, objectPath, file)
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

const addOutcome = () => {
  form.value.outcomes.push('')
}

const removeOutcome = (index: number) => {
  if (form.value.outcomes.length === 1) {
    form.value.outcomes[0] = ''
    return
  }
  form.value.outcomes.splice(index, 1)
}

const moveOutcome = (index: number, direction: -1 | 1) => {
  const target = index + direction
  if (target < 0 || target >= form.value.outcomes.length) return
  const items = [...form.value.outcomes]
  const [item] = items.splice(index, 1)
  items.splice(target, 0, item!)
  form.value.outcomes = items
}

const heroPreviewUrl = computed(() => {
  if (coverPreviewUrl.value) return coverPreviewUrl.value
  return resolveProgramMediaUrl(form.value.coverImageUrl)
})

const previewPath = computed(() =>
  form.value.slug ? `/programs/${form.value.slug}` : null
)

const completionChecks = computed(() => [
  { label: 'Title & slug', done: Boolean(form.value.title.trim() && form.value.slug.trim()) },
  { label: 'Card description', done: Boolean(form.value.description.trim()) },
  { label: 'Hero image', done: Boolean(form.value.coverImageUrl || coverImageFile.value) },
  { label: 'Overview copy', done: Boolean(form.value.overview.trim()) },
  { label: 'Learning outcomes', done: form.value.outcomes.some(item => item.trim()) }
])

const save = async () => {
  if (!canEdit.value) {
    toast.add({ title: 'Unauthorized', description: 'Your role does not have permission to edit programs.', color: 'error' })
    return
  }
  errors.value = validateProgramForm(form.value, {
    isCreate: isCreate.value,
    hasPendingCover: Boolean(coverImageFile.value)
  })
  if (hasFormErrors(errors.value)) {
    const reasons = Object.values(errors.value).filter(Boolean).join(' ')
    toast.add({
      title: errors.value.publish ? 'Cannot publish yet' : 'Please fix the highlighted fields',
      description: reasons,
      color: 'error'
    })
    if (errors.value.title || errors.value.slug || errors.value.description) activeSection.value = 'basics'
    else if (errors.value.coverImageUrl) activeSection.value = 'hero'
    else if (errors.value.publish) activeSection.value = 'seo'
    return
  }

  saving.value = true
  const previousCoverRef = form.value.coverImageUrl

  try {
    const payload = formToDbPayload(form.value)

    if (coverImageFile.value) {
      payload.cover_image_url = await uploadProgramImage(coverImageFile.value, 'cover')
    } else if (isCreate.value && !payload.cover_image_url) {
      throw new Error('Cover image is required for new programs.')
    }

    if (galleryFiles.value.length > 0) {
      const uploadedUrls: string[] = []
      for (const file of galleryFiles.value) {
        uploadedUrls.push(await uploadProgramImage(file, 'gallery'))
      }
      payload.gallery_urls = [...form.value.galleryUrls, ...uploadedUrls]
    }

    if (isCreate.value) {
      const { data, error } = await supabase
        .from('programs')
        .insert([payload])
        .select('id, slug')
        .single()

      if (error) throw error
      if (!data?.id) throw new Error('Program was created but no row was returned.')

      isDirty.value = false
      emit('saved', { id: data.id, slug: data.slug })
    } else {
      const { data, error } = await supabase
        .from('programs')
        .update(payload)
        .eq('id', props.programId!)
        .select('id, slug')
        .single()

      if (error) throw error
      if (!data?.id) throw new Error('Program was updated but no row was returned.')

      toast.add({ title: 'Skill track updated', color: 'success' })
      isDirty.value = false
      emit('saved', { id: data.id, slug: data.slug })
    }

    if (coverImageFile.value && previousCoverRef) {
      await deleteStorageRefs(supabase, [previousCoverRef])
    }
  } catch (error: any) {
    const message = error?.message || 'Unknown error'
    toast.add({ title: 'Could not save program', description: message, color: 'error' })
  } finally {
    saving.value = false
  }
}

const removeProgram = async () => {
  if (!canDelete.value) {
    toast.add({ title: 'Unauthorized', description: 'Your role does not have permission to delete programs.', color: 'error' })
    return
  }
  if (!props.programId) return
  deleting.value = true
  try {
    const refs = collectProgramStorageRefs(form.value.coverImageUrl, form.value.galleryUrls)
    const { error } = await supabase.from('programs').delete().eq('id', props.programId)
    if (error) throw error
    if (refs.length) {
      await deleteStorageRefs(supabase, refs)
    }
    toast.add({ title: 'Program deleted', color: 'success' })
    deleteOpen.value = false
    isDirty.value = false
    emit('deleted')
  } catch (error: any) {
    const message = error?.message || 'Unknown error'
    toast.add({ title: 'Could not delete program', description: message, color: 'error' })
  } finally {
    deleting.value = false
  }
}

onBeforeUnmount(() => {
  if (coverPreviewUrl.value) URL.revokeObjectURL(coverPreviewUrl.value)
})
</script>

<template>
  <div class="program-editor">
    <aside class="program-editor__sidebar">
      <nav
        class="program-editor__nav"
        aria-label="Program editor sections"
      >
        <button
          v-for="section in sections"
          :key="section.id"
          type="button"
          class="program-editor__nav-btn"
          :class="{ 'is-active': activeSection === section.id }"
          @click="activeSection = section.id"
        >
          <UIcon :name="section.icon" />
          <span>{{ section.label }}</span>
        </button>
      </nav>

      <div class="program-editor__checklist">
        <p class="program-editor__checklist-title">
          Publish checklist
        </p>
        <ul>
          <li
            v-for="item in completionChecks"
            :key="item.label"
            :class="{ done: item.done }"
          >
            <UIcon :name="item.done ? 'i-lucide-check-circle-2' : 'i-lucide-circle'" />
            {{ item.label }}
          </li>
        </ul>
      </div>
    </aside>

    <div class="program-editor__main">
      <div
        v-if="programPending"
        style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--sp-12) 0; color: var(--admin-text-muted);"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="spin"
          style="font-size: 2rem; margin-bottom: var(--sp-4);"
        />
        <p>Loading program data...</p>
      </div>

      <template v-else>
        <!-- Basics -->
        <section
          v-show="activeSection === 'basics'"
          class="editor-section"
        >
          <div class="editor-section__header">
            <h2>Basic information</h2>
            <p>Core details shown on program cards, navigation, and the hero section.</p>
          </div>

          <div
            class="am-field"
            :class="{ 'has-error': errors.title }"
          >
            <label class="am-label">Program title *</label>
            <input
              v-model="form.title"
              class="am-input"
              placeholder="e.g. Woodwork & Modern Furniture Design"
            >
            <p
              v-if="errors.title"
              class="field-error"
            >
              {{ errors.title }}
            </p>
          </div>

          <div
            class="am-field"
            :class="{ 'has-error': errors.slug }"
          >
            <label class="am-label">URL slug *</label>
            <div class="slug-row">
              <span class="slug-prefix">/programs/</span>
              <input
                v-model="form.slug"
                class="am-input"
                placeholder="woodwork-furniture-design"
                @input="slugTouched = true"
              >
            </div>
            <p
              v-if="errors.slug"
              class="field-error"
            >
              {{ errors.slug }}
            </p>
          </div>

          <div class="am-field">
            <label class="am-label">Hero subtitle</label>
            <input
              v-model="form.subtitle"
              class="am-input"
              placeholder="One-line value proposition shown under the title on the detail page"
            >
          </div>

          <div
            class="am-field"
            :class="{ 'has-error': errors.description }"
          >
            <label class="am-label">Short description *</label>
            <textarea
              v-model="form.description"
              class="am-textarea"
              rows="3"
              placeholder="Used on program cards and listings. Keep it concise and outcome-focused."
            />
            <p
              v-if="errors.description"
              class="field-error"
            >
              {{ errors.description }}
            </p>
            <p class="field-hint">
              {{ form.description.length }}/160 characters recommended
            </p>
          </div>

          <div class="am-field">
            <label class="am-label">Category</label>
            <select
              v-model="form.categoryId"
              class="am-select"
            >
              <option value="">
                No category
              </option>
              <option
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>
        </section>

        <!-- Hero -->
        <section
          v-show="activeSection === 'hero'"
          class="editor-section"
        >
          <div class="editor-section__header">
            <h2>Hero & cover image</h2>
            <p>This image appears behind the program title on the public detail page.</p>
          </div>

          <div
            class="hero-preview"
            :class="{ 'hero-preview--empty': !heroPreviewUrl }"
          >
            <img
              v-if="heroPreviewUrl"
              :src="heroPreviewUrl"
              alt="Cover preview"
            >
            <div
              v-else
              class="hero-preview__placeholder"
            >
              <UIcon name="i-lucide-image" />
              <span>Upload a cover image to preview the hero</span>
            </div>
            <div
              v-if="heroPreviewUrl"
              class="hero-preview__overlay"
            >
              <p>{{ form.title || 'Program title' }}</p>
              <span>{{ form.subtitle || 'Hero subtitle preview' }}</span>
            </div>
          </div>

          <div
            class="am-field"
            :class="{ 'has-error': errors.coverImageUrl }"
          >
            <label class="am-label">Cover image *</label>
            <label class="upload-dropzone">
              <input
                type="file"
                accept="image/*"
                hidden
                @change="onCoverChange"
              >
              <UIcon name="i-lucide-upload-cloud" />
              <span>{{ coverImageFile ? coverImageFile.name : 'Choose image or drag to upload' }}</span>
            </label>
            <p
              v-if="errors.coverImageUrl"
              class="field-error"
            >
              {{ errors.coverImageUrl }}
            </p>
            <p
              v-else-if="form.coverImageUrl && !coverImageFile"
              class="field-hint"
            >
              Current cover is saved. Upload a new file to replace it.
            </p>
          </div>
        </section>

        <!-- Content -->
        <section
          v-show="activeSection === 'content'"
          class="editor-section"
        >
          <div class="editor-section__header">
            <h2>Page content</h2>
            <p>Structured copy for the Overview and Lab Experience sections on the public page.</p>
          </div>

          <div class="am-field">
            <label class="am-label">Program overview</label>
            <textarea
              v-model="form.overview"
              class="am-textarea"
              rows="5"
              placeholder="Describe the track focus, methodology, and who it is for."
            />
            <p class="field-hint">
              Rendered under the “Program Overview” heading.
            </p>
          </div>

          <div class="editor-subsection">
            <h3>Optional student quote</h3>
            <p class="field-hint">
              Adds a testimonial block below the overview, like on the woodwork program page.
            </p>
            <div class="am-field">
              <label class="am-label">Quote text</label>
              <textarea
                v-model="form.testimonialQuote"
                class="am-textarea"
                rows="3"
                placeholder="Student or alumni quote"
              />
            </div>
            <div class="am-field">
              <label class="am-label">Quote attribution</label>
              <input
                v-model="form.testimonialCaption"
                class="am-input"
                placeholder="Name, role, cohort"
              >
            </div>
          </div>

          <div class="am-field">
            <label class="am-label">Practical lab experience</label>
            <textarea
              v-model="form.labExperience"
              class="am-textarea"
              rows="4"
              placeholder="Describe hands-on workshop time, tools used, and project flow."
            />
            <p class="field-hint">
              Shown in its own section when filled in.
            </p>
          </div>

          <div class="am-field">
            <label class="am-label">Prerequisites</label>
            <textarea
              v-model="form.requirements"
              class="am-textarea"
              rows="3"
              placeholder="Who can participate and any preparation needed."
            />
          </div>
        </section>

        <!-- Outcomes -->
        <section
          v-show="activeSection === 'outcomes'"
          class="editor-section"
        >
          <div class="editor-section__header">
            <h2>Key learning outcomes</h2>
            <p>Each outcome becomes a card in the “Skills Acquired” grid on the public page.</p>
          </div>

          <div class="outcomes-list">
            <div
              v-for="(outcome, index) in form.outcomes"
              :key="index"
              class="outcome-row"
            >
              <span class="outcome-row__index">{{ index + 1 }}</span>
              <textarea
                v-model="form.outcomes[index]"
                class="am-textarea"
                rows="2"
                :placeholder="`Outcome ${index + 1}`"
              />
              <div class="outcome-row__actions">
                <button
                  type="button"
                  class="btn btn-ghost btn-icon"
                  :disabled="index === 0"
                  @click="moveOutcome(index, -1)"
                >
                  <UIcon name="i-lucide-arrow-up" />
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-icon"
                  :disabled="index === form.outcomes.length - 1"
                  @click="moveOutcome(index, 1)"
                >
                  <UIcon name="i-lucide-arrow-down" />
                </button>
                <button
                  type="button"
                  class="btn btn-danger btn-icon"
                  @click="removeOutcome(index)"
                >
                  <UIcon name="i-lucide-trash-2" />
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="btn btn-ghost"
            @click="addOutcome"
          >
            <UIcon name="i-lucide-plus" />Add outcome
          </button>
        </section>

        <!-- Gallery -->
        <section
          v-show="activeSection === 'gallery'"
          class="editor-section"
        >
          <div class="editor-section__header">
            <h2>Facilities & student work</h2>
            <p>Gallery images for the “Visual Tour” section on the program detail page.</p>
          </div>

          <div
            v-if="form.galleryUrls.length"
            class="gallery-grid"
          >
            <figure
              v-for="(url, index) in form.galleryUrls"
              :key="`saved-${index}`"
              class="gallery-item"
            >
              <img
                :src="resolveProgramMediaUrl(url)"
                alt="Gallery image"
              >
              <button
                type="button"
                class="gallery-item__remove"
                @click="removeGalleryUrl(index)"
              >
                <UIcon name="i-lucide-x" />
              </button>
            </figure>
          </div>

          <div
            v-if="galleryFiles.length"
            class="gallery-pending"
          >
            <p class="field-hint">
              {{ galleryFiles.length }} new file(s) will upload on save
            </p>
            <ul>
              <li
                v-for="(file, index) in galleryFiles"
                :key="`${file.name}-${index}`"
              >
                {{ file.name }}
                <button
                  type="button"
                  class="link-btn"
                  @click="removePendingGalleryFile(index)"
                >
                  Remove
                </button>
              </li>
            </ul>
          </div>

          <label class="upload-dropzone">
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              @change="onGalleryChange"
            >
            <UIcon name="i-lucide-images" />
            <span>Add gallery images</span>
          </label>
        </section>

        <!-- SEO -->
        <section
          v-show="activeSection === 'seo'"
          class="editor-section"
        >
          <div class="editor-section__header">
            <h2>SEO & visibility</h2>
            <p>Control search previews and whether this track appears on the public site.</p>
          </div>

          <div class="am-field">
            <label class="am-label">Meta title</label>
            <input
              v-model="form.metaTitle"
              class="am-input"
              placeholder="Defaults to program title"
            >
          </div>

          <div class="am-field">
            <label class="am-label">Meta description</label>
            <textarea
              v-model="form.metaDescription"
              class="am-textarea"
              rows="3"
              placeholder="Search engine description"
            />
          </div>

          <div class="toggle-grid">
            <p
              v-if="errors.publish"
              class="field-error publish-error"
            >
              {{ errors.publish }}
            </p>

            <label
              class="toggle-card"
              :class="{ 'is-on': form.isPublished }"
            >
              <input
                v-model="form.isPublished"
                type="checkbox"
              >
              <div>
                <strong>Published</strong>
                <p>Visible on the public website and program listings.</p>
              </div>
            </label>

            <label
              class="toggle-card"
              :class="{ 'is-on': form.isFeatured }"
            >
              <input
                v-model="form.isFeatured"
                type="checkbox"
              >
              <div>
                <strong>Featured</strong>
                <p>Highlighted on the homepage and with a featured badge on cards.</p>
              </div>
            </label>
          </div>
        </section>
      </template>
    </div>

    <footer class="program-editor__footer">
      <div class="program-editor__footer-left">
        <button
          type="button"
          class="btn btn-ghost"
          @click="isDirty = false; emit('cancel')"
        >
          Cancel
        </button>
        <button
          v-if="!isCreate && canDelete"
          type="button"
          class="btn btn-danger btn-ghost"
          @click="deleteOpen = true"
        >
          <UIcon name="i-lucide-trash-2" />Delete
        </button>
        <NuxtLink
          v-if="previewPath"
          :to="form.isPublished ? previewPath : `/admin/programs/preview/${form.slug}`"
          target="_blank"
          class="btn btn-ghost"
        >
          <UIcon name="i-lucide-external-link" />Preview live
        </NuxtLink>
      </div>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="saving"
        @click="save"
      >
        <UIcon
          v-if="saving"
          name="i-lucide-loader-2"
          class="spin"
        />
        {{ isCreate ? 'Create program' : 'Save changes' }}
      </button>
    </footer>

    <AdminModal
      :open="deleteOpen"
      title="Delete program"
      subtitle="This permanently removes the program, its public page, and uploaded media files."
      submit-label="Delete permanently"
      submit-danger
      :loading="deleting"
      @close="deleteOpen = false"
      @submit="removeProgram"
    >
      <p style="color:var(--admin-text-secondary);font-weight:700">
        {{ form.title || 'Untitled program' }}
      </p>
    </AdminModal>
  </div>
</template>

<style scoped>
.program-editor {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: var(--sp-6);
  align-items: start;
}

.program-editor__sidebar {
  position: sticky;
  top: var(--sp-6);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.program-editor__nav {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  padding: var(--sp-2);
  background: var(--admin-surface-opaque);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-lg);
}

.program-editor__nav-btn {
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

.program-editor__nav-btn.is-active {
  background: rgba(212, 168, 83, 0.12);
  color: var(--admin-brand-accent-text);
}

.program-editor__checklist {
  padding: var(--sp-4);
  background: var(--admin-surface-opaque);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-lg);
}

.program-editor__checklist-title {
  margin: 0 0 var(--sp-3);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--admin-text-muted);
}

.program-editor__checklist ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.program-editor__checklist li {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: 0.8125rem;
  color: var(--admin-text-muted);
}

.program-editor__checklist li.done {
  color: var(--admin-brand-green);
}

.program-editor__main {
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

.editor-subsection {
  padding: var(--sp-4);
  border: 1px dashed var(--admin-border-strong);
  border-radius: var(--admin-radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.editor-subsection h3 {
  margin: 0;
  font-size: 0.9375rem;
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
  margin: 0;
  font-size: 0.75rem;
  color: var(--admin-text-muted);
}

.field-error {
  margin: 0;
  font-size: 0.75rem;
  color: var(--admin-brand-red);
}

.has-error .am-input,
.has-error .am-textarea {
  border-color: var(--admin-brand-red);
}

.hero-preview {
  position: relative;
  aspect-ratio: 21 / 9;
  border-radius: var(--admin-radius-lg);
  overflow: hidden;
  background: var(--admin-bg-deep);
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
  font-size: 1.5rem;
  font-weight: 700;
}

.hero-preview__overlay span {
  margin-top: var(--sp-1);
  opacity: 0.85;
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
}

.upload-dropzone:hover {
  border-color: var(--admin-brand-accent);
  background: rgba(212, 168, 83, 0.05);
}

.outcomes-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.outcome-row {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  gap: var(--sp-3);
  align-items: start;
}

.outcome-row__index {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--admin-bg);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--admin-text-muted);
}

.outcome-row__actions {
  display: flex;
  gap: var(--sp-1);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--sp-3);
}

.gallery-item {
  position: relative;
  margin: 0;
  aspect-ratio: 4 / 3;
  border-radius: var(--admin-radius-md);
  overflow: hidden;
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
}

.gallery-pending ul {
  margin: var(--sp-2) 0 0;
  padding-left: 1rem;
}

.link-btn {
  border: none;
  background: none;
  color: var(--admin-brand-red);
  cursor: pointer;
  margin-left: var(--sp-2);
}

.toggle-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--sp-4);
}

.publish-error {
  grid-column: 1 / -1;
}

.toggle-card {
  display: flex;
  gap: var(--sp-3);
  padding: var(--sp-4);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-lg);
  cursor: pointer;
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

.program-editor__footer {
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
}

.program-editor__footer-left {
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
  .program-editor {
    grid-template-columns: 1fr;
  }

  .program-editor__sidebar {
    position: static;
  }

  .program-editor__nav {
    flex-direction: row;
    overflow-x: auto;
  }

  .toggle-grid {
    grid-template-columns: 1fr;
  }
}
</style>
