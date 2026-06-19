<script setup lang="ts">
import {
  PARTNER_TIER_OPTIONS,
  createEmptyPartnerForm,
  formToPartnerPayload,
  hasPartnerFormErrors,
  partnerLogoStorageRefForRow,
  resolvePartnerLogoUrl,
  rowToPartnerForm,
  validatePartnerForm,
  type PartnerDbRow,
  type PartnerFormErrors,
  type PartnerFormState
} from '~/utils/partnerAdmin'
import {
  deleteStorageRefs,
  partnerLogoObjectPath,
  STORAGE_BUCKETS,
  uploadStorageObject
} from '~/utils/storage'
import { triggerRevalidation } from '~/utils/revalidate'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Partners | Admin | N-CEDI' })

const supabase = useSupabaseClient()
const toast = useToast()
const search = ref('')

const { data: adminProfile } = useNuxtData<{ role?: string } | null>('sidebar-admin-role')
const canEdit = computed(() => adminProfile.value?.role !== 'viewer')
const canDelete = computed(() => adminProfile.value?.role === 'admin' || adminProfile.value?.role === 'super_admin')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const tierFilter = ref<'all' | PartnerFormState['tier']>('all')

const currentPage = ref(1)
const pageSize = ref(10)

watch([search, statusFilter, tierFilter], () => {
  currentPage.value = 1
})

const { data, pending, refresh } = useAsyncData('admin-partners', async () => {
  let query = supabase
    .from('partners')
    .select('id, name, website_url, logo_url, tier, is_active, display_order, created_at', { count: 'exact' })
    .order('display_order', { ascending: true })

  if (search.value.trim()) {
    query = query.ilike('name', `%${search.value.trim()}%`)
  }
  if (statusFilter.value === 'active') query = query.eq('is_active', true)
  if (statusFilter.value === 'inactive') query = query.eq('is_active', false)
  if (tierFilter.value !== 'all') query = query.eq('tier', tierFilter.value)

  const from = (currentPage.value - 1) * pageSize.value
  const to = from + pageSize.value - 1
  query = query.range(from, to)

  const { data: rows, count, error } = await query
  if (error) throw error
  return {
    rows: (rows || []) as PartnerDbRow[],
    total: count || 0
  }
}, { watch: [currentPage, search, statusFilter, tierFilter] })

const columns = [
  { key: 'logo', label: '' },
  { key: 'name', label: 'Partner' },
  { key: 'tier', label: 'Tier' },
  { key: 'display_order', label: 'Order', align: 'center' as const },
  { key: 'status', label: 'Status' }
]

const modalOpen = ref(false)
const deleteOpen = ref(false)
const mode = ref<'add' | 'edit'>('add')
const saving = ref(false)
const deleting = ref(false)
const logoFile = ref<File | null>(null)
const form = ref<PartnerFormState>(createEmptyPartnerForm())
const errors = ref<PartnerFormErrors>({})
const target = ref<PartnerDbRow | null>(null)

const previewLogo = computed(() => {
  if (logoFile.value) return URL.createObjectURL(logoFile.value)
  if (form.value.logoUrl) return resolvePartnerLogoUrl(form.value.logoUrl)
  return ''
})

const nextDisplayOrder = computed(() => {
  const rows = data.value?.rows ?? []
  if (!rows.length) return 0
  return Math.max(...rows.map(row => row.display_order)) + 1
})

const thumbUrl = (row: PartnerDbRow) => resolvePartnerLogoUrl(row.logo_url)

const handleLogoFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  logoFile.value = input.files?.[0] ?? null
}

const openAdd = () => {
  mode.value = 'add'
  target.value = null
  logoFile.value = null
  form.value = {
    ...createEmptyPartnerForm(),
    displayOrder: nextDisplayOrder.value
  }
  errors.value = {}
  modalOpen.value = true
}

const openEdit = (row: PartnerDbRow) => {
  mode.value = 'edit'
  target.value = row
  logoFile.value = null
  form.value = rowToPartnerForm(row)
  errors.value = {}
  modalOpen.value = true
}

const openDelete = (row: PartnerDbRow) => {
  target.value = row
  deleteOpen.value = true
}

const save = async () => {
  if (!canEdit.value) {
    toast.add({ title: 'Unauthorized', description: 'Your role does not have permission to edit partners.', color: 'error' })
    return
  }
  errors.value = validatePartnerForm(form.value, {
    hasLogoUpload: Boolean(logoFile.value)
  })
  if (hasPartnerFormErrors(errors.value)) {
    const reasons = Object.values(errors.value).join(' ')
    toast.add({ title: 'Validation Error', description: reasons, color: 'error' })
    return
  }

  saving.value = true
  try {
    if (logoFile.value) {
      const path = partnerLogoObjectPath(logoFile.value.name)
      form.value.logoUrl = await uploadStorageObject(
        supabase,
        STORAGE_BUCKETS.site_assets,
        path,
        logoFile.value
      )
    }

    const payload = formToPartnerPayload(form.value)

    if (mode.value === 'add') {
      const { error } = await (supabase.from('partners') as any).insert([payload])
      if (error) throw error
      toast.add({ title: 'Partner created', color: 'success' })
    } else {
      const previousRef = target.value ? partnerLogoStorageRefForRow(target.value) : null
      const { error } = await (supabase
        .from('partners') as any)
        .update(payload)
        .eq('id', target.value!.id)
      if (error) throw error

      const newRef = partnerLogoStorageRefForRow({
        logo_url: form.value.logoUrl
      } as PartnerDbRow)
      if (previousRef && newRef && previousRef !== newRef) {
        await deleteStorageRefs(supabase, [previousRef])
      }

      toast.add({ title: 'Partner updated', color: 'success' })
    }

    logoFile.value = null
    modalOpen.value = false
    await refresh()
    triggerRevalidation(['/', '/partners'])
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Save failed'
    toast.add({ title: 'Error saving partner', description: message, color: 'error' })
  } finally {
    saving.value = false
  }
}

const remove = async () => {
  if (!canDelete.value) {
    toast.add({ title: 'Unauthorized', description: 'Your role does not have permission to delete partners.', color: 'error' })
    return
  }
  if (!target.value) return
  deleting.value = true
  try {
    const storageRef = partnerLogoStorageRefForRow(target.value)
    const { error } = await supabase.from('partners').delete().eq('id', target.value.id)
    if (error) throw error
    if (storageRef) await deleteStorageRefs(supabase, [storageRef])
    toast.add({ title: 'Partner deleted', color: 'success' })
    deleteOpen.value = false
    await refresh()
    triggerRevalidation(['/', '/partners'])
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Delete failed'
    toast.add({ title: 'Error deleting partner', description: message, color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Partnerships</span>
        <h1 class="ap-title">
          Partners
        </h1>
        <p class="ap-subtitle">
          Manage institutional and corporate partners for the homepage section and the public partners page.
          Logos upload to the <code>site_assets</code> bucket.
        </p>
      </div>
      <div class="ap-header__actions">
        <button
          type="button"
          class="btn btn-ghost"
          @click="refresh()"
        >
          <UIcon name="i-lucide-refresh-cw" />Refresh
        </button>
        <button
          v-if="canEdit"
          type="button"
          class="btn btn-primary"
          @click="openAdd"
        >
          <UIcon name="i-lucide-plus" />Add Partner
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
            placeholder="Search partners..."
          >
        </div>
        <select
          v-model="statusFilter"
          class="am-select"
          style="max-width: 160px"
        >
          <option value="all">
            All statuses
          </option>
          <option value="active">
            Active
          </option>
          <option value="inactive">
            Inactive
          </option>
        </select>
        <select
          v-model="tierFilter"
          class="am-select"
          style="max-width: 160px"
        >
          <option value="all">
            All tiers
          </option>
          <option
            v-for="t in PARTNER_TIER_OPTIONS"
            :key="t.value"
            :value="t.value"
          >
            {{ t.label }}
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
      empty-title="No partners yet"
      empty-subtitle="Add sponsors and institutional partners for the homepage and partners page."
    >
      <template #cell-logo="{ row }">
        <div class="thumb-cell">
          <img
            v-if="thumbUrl(row)"
            :src="thumbUrl(row)"
            alt=""
            class="thumb-img"
          >
        </div>
      </template>
      <template #cell-name="{ row }">
        <span class="font-semibold">{{ row.name }}</span>
        <a
          v-if="row.website_url"
          :href="row.website_url"
          target="_blank"
          rel="noopener noreferrer"
          class="partner-link"
        >
          {{ row.website_url }}
        </a>
      </template>
      <template #cell-tier="{ row }">
        <span class="badge badge-blue">{{ row.tier }}</span>
      </template>
      <template #cell-display_order="{ row }">
        {{ row.display_order }}
      </template>
      <template #cell-status="{ row }">
        <span
          class="badge"
          :class="row.is_active ? 'badge-green' : 'badge-gray'"
        >
          {{ row.is_active ? 'Live' : 'Hidden' }}
        </span>
      </template>
      <template #actions="{ row }">
        <button
          v-if="canEdit"
          type="button"
          class="btn btn-ghost btn-icon"
          title="Edit"
          @click="openEdit(row)"
        >
          <UIcon name="i-lucide-edit-3" />
        </button>
        <button
          v-if="canDelete"
          type="button"
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
      :title="mode === 'add' ? 'New Partner' : 'Edit Partner'"
      :submit-label="mode === 'add' ? 'Create' : 'Save changes'"
      :loading="saving"
      @close="modalOpen = false"
      @submit="save"
    >
      <div
        class="am-field"
        :class="{ 'has-error': errors.name }"
      >
        <label class="am-label">Partner name *</label>
        <input
          v-model="form.name"
          class="am-input"
          placeholder="e.g. National Board for Technical Education"
        >
        <p
          v-if="errors.name"
          class="field-error"
        >
          {{ errors.name }}
        </p>
      </div>

      <div class="am-row-2">
        <div class="am-field">
          <label class="am-label">Tier</label>
          <select
            v-model="form.tier"
            class="am-select"
          >
            <option
              v-for="t in PARTNER_TIER_OPTIONS"
              :key="t.value"
              :value="t.value"
            >
              {{ t.label }}
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
        class="am-field"
        :class="{ 'has-error': errors.logoUrl }"
      >
        <label class="am-label">Logo *</label>
        <input
          type="file"
          accept="image/*"
          class="am-input"
          @change="handleLogoFileChange"
        >
        <p
          v-if="logoFile"
          class="am-note"
        >
          Selected: {{ logoFile.name }}
        </p>
        <p
          v-else-if="form.logoUrl && mode === 'edit'"
          class="am-note"
        >
          Current logo stored in site_assets
        </p>
        <p
          v-if="errors.logoUrl"
          class="field-error"
        >
          {{ errors.logoUrl }}
        </p>
        <img
          v-if="previewLogo"
          :src="previewLogo"
          alt="Logo preview"
          class="logo-preview"
        >
      </div>

      <div class="am-field">
        <label class="am-label">Website URL</label>
        <input
          v-model="form.websiteUrl"
          class="am-input"
          placeholder="https://example.gov.ng"
        >
      </div>

      <label class="am-checkbox-row">
        <input
          v-model="form.isActive"
          type="checkbox"
        >
        Active on public site
      </label>
      <p class="am-note">
        Homepage shows active platinum partners first (up to six by display order).
      </p>
    </AdminModal>

    <AdminModal
      :open="deleteOpen"
      title="Delete partner"
      submit-label="Delete permanently"
      submit-danger
      :loading="deleting"
      @close="deleteOpen = false"
      @submit="remove"
    >
      <p style="color: var(--admin-text-secondary); font-weight: 700">
        {{ target?.name }}
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
  object-fit: contain;
}

.partner-link {
  display: block;
  font-size: 0.75rem;
  color: var(--admin-brand-blue);
  margin-top: 2px;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logo-preview {
  margin-top: var(--sp-3);
  max-height: 80px;
  max-width: 100%;
  object-fit: contain;
}

.field-error {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: var(--admin-brand-red);
}

.has-error .am-input {
  border-color: var(--admin-brand-red);
}
</style>
