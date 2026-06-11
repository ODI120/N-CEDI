<script setup lang="ts">
import {
  STAT_ICON_OPTIONS,
  createEmptySiteStatForm,
  formToSiteStatPayload,
  formatStatDisplay,
  hasSiteStatFormErrors,
  rowToSiteStatForm,
  validateSiteStatForm,
  type SiteStatDbRow,
  type SiteStatFormErrors,
  type SiteStatFormState
} from '~/utils/siteStatAdmin'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Site Stats | Admin | N-CEDI' })

const supabase = useSupabaseClient() as any
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

const { data, pending, refresh } = useAsyncData('admin-site-stats', async () => {
  let query = supabase
    .from('site_stats')
    .select('id, value, prefix, suffix, label, icon, display_order, is_published, created_at, updated_at', { count: 'exact' })
    .order('display_order', { ascending: true })

  if (search.value.trim()) {
    query = query.ilike('label', `%${search.value.trim()}%`)
  }
  if (statusFilter.value === 'published') query = query.eq('is_published', true)
  if (statusFilter.value === 'draft') query = query.eq('is_published', false)

  const from = (currentPage.value - 1) * pageSize.value
  const to = from + pageSize.value - 1
  query = query.range(from, to)

  const { data: rows, count, error } = await query
  if (error) throw error
  return {
    rows: (rows || []) as SiteStatDbRow[],
    total: count || 0
  }
}, { watch: [currentPage, search, statusFilter] })

const columns = [
  { key: 'display', label: 'Display Value' },
  { key: 'label', label: 'Label' },
  { key: 'icon', label: 'Icon' },
  { key: 'display_order', label: 'Order', align: 'center' as const },
  { key: 'status', label: 'Status' }
]

const modalOpen = ref(false)
const deleteOpen = ref(false)
const mode = ref<'add' | 'edit'>('add')
const saving = ref(false)
const deleting = ref(false)
const form = ref<SiteStatFormState>(createEmptySiteStatForm())
const errors = ref<SiteStatFormErrors>({})
const target = ref<SiteStatDbRow | null>(null)

const previewValue = computed(() =>
  formatStatDisplay({
    value: form.value.value,
    prefix: form.value.prefix || undefined,
    suffix: form.value.suffix || undefined
  })
)

const nextDisplayOrder = computed(() => {
  const rows = data.value?.rows ?? []
  if (!rows.length) return 0
  return Math.max(...rows.map(row => row.display_order)) + 1
})

const openAdd = () => {
  mode.value = 'add'
  target.value = null
  form.value = {
    ...createEmptySiteStatForm(),
    displayOrder: nextDisplayOrder.value
  }
  errors.value = {}
  modalOpen.value = true
}

const openEdit = (row: SiteStatDbRow) => {
  mode.value = 'edit'
  target.value = row
  form.value = rowToSiteStatForm(row)
  errors.value = {}
  modalOpen.value = true
}

const openDelete = (row: SiteStatDbRow) => {
  target.value = row
  deleteOpen.value = true
}

const save = async () => {
  if (!canEdit.value) {
    toast.add({ title: 'Unauthorized', description: 'Your role does not have permission to edit site stats.', color: 'error' })
    return
  }
  errors.value = validateSiteStatForm(form.value)
  if (hasSiteStatFormErrors(errors.value)) {
    const reasons = Object.values(errors.value).join(' ')
    toast.add({ title: 'Validation Error', description: reasons, color: 'error' })
    return
  }

  saving.value = true
  try {
    const payload = formToSiteStatPayload(form.value)

    if (mode.value === 'add') {
      const { error } = await supabase.from('site_stats').insert([payload])
      if (error) throw error
      toast.add({ title: 'Stat created', color: 'success' })
    } else {
      const { error } = await supabase
        .from('site_stats')
        .update(payload)
        .eq('id', target.value!.id)
      if (error) throw error
      toast.add({ title: 'Stat updated', color: 'success' })
    }

    modalOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.add({ title: 'Error saving stat', description: e.message, color: 'error' })
  } finally {
    saving.value = false
  }
}

const remove = async () => {
  if (!canDelete.value) {
    toast.add({ title: 'Unauthorized', description: 'Your role does not have permission to delete site stats.', color: 'error' })
    return
  }
  if (!target.value) return
  deleting.value = true
  try {
    const { error } = await supabase.from('site_stats').delete().eq('id', target.value.id)
    if (error) throw error
    toast.add({ title: 'Stat deleted', color: 'success' })
    deleteOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.add({ title: 'Error deleting stat', description: e.message, color: 'error' })
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
        <h1 class="ap-title">
          Site Stats
        </h1>
        <p class="ap-subtitle">
          Manage homepage impact numbers in the Life at N-CEDI bento section. Up to four published stats appear on the home page (by display order). The image slider uses published gallery items.
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
          <UIcon name="i-lucide-plus" />Add Stat
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
            placeholder="Search stats..."
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
      empty-title="No stats defined"
      empty-subtitle="Add KPI stats for the homepage impact section."
    >
      <template #cell-display="{ row }">
        <span class="stat-display-value">
          {{ formatStatDisplay({ value: Number(row.value), prefix: row.prefix, suffix: row.suffix }) }}
        </span>
      </template>
      <template #cell-label="{ row }">
        <span class="font-semibold">{{ row.label }}</span>
      </template>
      <template #cell-icon="{ row }">
        <span
          v-if="row.icon"
          class="icon-preview"
        >
          <i :class="['bi', row.icon]" />
          <code>{{ row.icon }}</code>
        </span>
        <span v-else>—</span>
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
          @click="openEdit(row)"
        >
          <UIcon name="i-lucide-edit-3" />
        </button>
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

    <AdminModal
      :open="modalOpen"
      :title="mode === 'add' ? 'New Site Stat' : 'Edit Site Stat'"
      :submit-label="mode === 'add' ? 'Create' : 'Save changes'"
      :loading="saving"
      @close="modalOpen = false"
      @submit="save"
    >
      <div
        class="am-field"
        :class="{ 'has-error': errors.label }"
      >
        <label class="am-label">Label *</label>
        <input
          v-model="form.label"
          class="am-input"
          placeholder="e.g. Trained Graduates"
        >
        <p
          v-if="errors.label"
          class="field-error"
        >
          {{ errors.label }}
        </p>
      </div>

      <div class="am-row-2">
        <div
          class="am-field"
          :class="{ 'has-error': errors.value }"
        >
          <label class="am-label">Numeric value *</label>
          <input
            v-model.number="form.value"
            type="number"
            min="0"
            step="any"
            class="am-input"
          >
          <p
            v-if="errors.value"
            class="field-error"
          >
            {{ errors.value }}
          </p>
        </div>
        <div class="am-field">
          <label class="am-label">Live preview</label>
          <div class="stat-preview-box">
            {{ previewValue }}
          </div>
        </div>
      </div>

      <div class="am-row-2">
        <div class="am-field">
          <label class="am-label">Prefix</label>
          <input
            v-model="form.prefix"
            class="am-input"
            placeholder="e.g. $"
          >
        </div>
        <div class="am-field">
          <label class="am-label">Suffix</label>
          <input
            v-model="form.suffix"
            class="am-input"
            placeholder="e.g. + or %"
          >
        </div>
      </div>

      <div class="am-row-2">
        <div class="am-field">
          <label class="am-label">Icon (Bootstrap Icons)</label>
          <select
            v-model="form.icon"
            class="am-select"
          >
            <option value="">
              No icon
            </option>
            <option
              v-for="opt in STAT_ICON_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }} ({{ opt.value }})
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

      <p
        v-if="mode === 'add' && (data?.length ?? 0) >= 4"
        class="field-hint field-hint--warn"
      >
        The homepage shows at most four stats. Extra published stats are kept in the database but not shown on the home grid.
      </p>

      <label class="am-checkbox-row">
        <input
          v-model="form.isPublished"
          type="checkbox"
        >
        Published on homepage
      </label>
    </AdminModal>

    <AdminModal
      :open="deleteOpen"
      title="Delete stat"
      subtitle="This removes the KPI from the public homepage section."
      submit-label="Delete permanently"
      submit-danger
      :loading="deleting"
      @close="deleteOpen = false"
      @submit="remove"
    >
      <p style="color:var(--admin-text-secondary);font-weight:700">
        {{ target?.label }}
      </p>
    </AdminModal>
  </section>
</template>

<style scoped>
.stat-display-value {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--admin-brand-accent-text);
}

.icon-preview {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.icon-preview code {
  font-size: 0.7rem;
  color: var(--admin-text-muted);
}

.stat-preview-box {
  min-height: 42px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: var(--admin-radius-md);
  background: var(--admin-bg);
  border: 1px solid var(--admin-border);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.25rem;
}

.field-error {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: var(--admin-brand-red);
}

.has-error .am-input {
  border-color: var(--admin-brand-red);
}

.field-hint {
  margin: 0 0 var(--sp-3);
  font-size: 0.8125rem;
  color: var(--admin-text-muted);
}

.field-hint--warn {
  color: #b45309;
  background: rgba(245, 158, 11, 0.08);
  padding: var(--sp-3);
  border-radius: var(--admin-radius-md);
  border: 1px solid rgba(245, 158, 11, 0.2);
}
</style>
