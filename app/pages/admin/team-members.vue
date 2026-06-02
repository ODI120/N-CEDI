<script setup lang="ts">
import { STORAGE_BUCKETS, uploadStorageObject, teamMemberAvatarObjectPath } from '~/utils/storage'
import type { TeamMemberFormState } from '~/utils/teamAdmin'
import { validateTeamMemberForm, rowToTeamMemberForm, formToTeamMemberPayload, resolveTeamMemberAvatarUrl, parseTeamMemberAvatarLocation, teamMemberStorageRefForRow } from '~/utils/teamAdmin'
import type { TeamMember } from '~/types'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Team Members | Admin | N-CEDI' })

const supabase = useSupabaseClient() as any
const toast = useToast()
const search = ref('')

interface TeamMemberRow extends TeamMember {}

const { data, pending, refresh } = useAsyncData('admin-team-members', async () => {
  let q = supabase.from('team_members').select('*').order('display_order')
  if (search.value.trim()) q = q.ilike('name', `%${search.value.trim()}%`)
  const { data, error } = await q
  if (error) throw error
  // Convert snake_case to camelCase for consistency
  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    email: row.email,
    linkedinUrl: row.linkedin_url,
    displayOrder: row.display_order,
    isPublished: row.is_published,
    createdAt: row.created_at,
  })) as TeamMemberRow[]
}, { watch: [search] })

const columns = [
  { key: 'avatar', label: '', width: '40px' },
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'displayOrder', label: 'Order', align: 'center' as const },
]

const modalOpen = ref(false)
const deleteOpen = ref(false)
const mode = ref<'add' | 'edit'>('add')
const saving = ref(false)
const deleting = ref(false)
const avatarFile = ref<File | null>(null)

interface FormState extends TeamMemberFormState {}

const form = ref<FormState>({
  name: '',
  role: '',
  bio: '',
  email: '',
  linkedinUrl: '',
  avatarUrl: '',
  displayOrder: 0,
  isPublished: true,
})

const errors = ref<Record<string, string>>({})
const target = ref<TeamMemberRow | null>(null)

const previewUrl = computed(() => {
  if (avatarFile.value) {
    return URL.createObjectURL(avatarFile.value)
  }
  return form.value.avatarUrl ? resolveTeamMemberAvatarUrl(form.value.avatarUrl) : ''
})

const nextDisplayOrder = computed(() => {
  if (!data.value || data.value.length === 0) return 0
  const max = Math.max(...data.value.map(m => m.displayOrder ?? 0))
  return max + 1
})

const openAdd = () => {
  mode.value = 'add'
  form.value = {
    name: '',
    role: '',
    bio: '',
    email: '',
    linkedinUrl: '',
    avatarUrl: '',
    displayOrder: nextDisplayOrder.value,
    isPublished: true,
  }
  avatarFile.value = null
  errors.value = {}
  modalOpen.value = true
}

const openEdit = (member: TeamMemberRow) => {
  mode.value = 'edit'
  target.value = member
  form.value = rowToTeamMemberForm(member)
  avatarFile.value = null
  errors.value = {}
  modalOpen.value = true
}

const openDelete = (member: TeamMemberRow) => {
  target.value = member
  deleteOpen.value = true
}

const handleAvatarFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  avatarFile.value = input.files?.[0] || null
}

const save = async () => {
  errors.value = validateTeamMemberForm(form.value)
  if (Object.keys(errors.value).length > 0) return

  saving.value = true
  try {
    // Upload new avatar if selected
    if (avatarFile.value) {
      const path = teamMemberAvatarObjectPath(avatarFile.value.name)
      form.value.avatarUrl = await uploadStorageObject(
        supabase,
        STORAGE_BUCKETS.teams_avatars,
        path,
        avatarFile.value,
      )
    }

    const payload = formToTeamMemberPayload(form.value)

    if (mode.value === 'add') {
      const { error } = await supabase.from('team_members').insert([payload])
      if (error) throw error
      toast.add({ title: 'Team member added', color: 'green' })
    } else {
      // On update, delete old avatar if new one was uploaded
      if (avatarFile.value && target.value?.avatarUrl) {
        const oldRef = teamMemberStorageRefForRow(target.value)
        if (oldRef) {
          const { bucket, path } = parseTeamMemberAvatarLocation(oldRef) || {}
          if (bucket && path) {
            try {
              await supabase.storage.from(bucket).remove([path])
            } catch (e) {
              console.warn('Could not delete old avatar:', e)
            }
          }
        }
      }

      const { error } = await supabase.from('team_members').update(payload).eq('id', target.value!.id)
      if (error) throw error
      toast.add({ title: 'Team member updated', color: 'green' })
    }

    modalOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.add({ title: 'Error', description: e.message, color: 'red' })
  } finally {
    saving.value = false
  }
}

const remove = async () => {
  if (!target.value) return

  deleting.value = true
  try {
    // Delete avatar from storage
    const storageRef = teamMemberStorageRefForRow(target.value)
    if (storageRef) {
      const { bucket, path } = parseTeamMemberAvatarLocation(storageRef) || {}
      if (bucket && path) {
        try {
          await supabase.storage.from(bucket).remove([path])
        } catch (e) {
          console.warn('Could not delete avatar:', e)
        }
      }
    }

    const { error } = await supabase.from('team_members').delete().eq('id', target.value.id)
    if (error) throw error
    toast.add({ title: 'Team member deleted', color: 'green' })
    deleteOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.add({ title: 'Error', description: e.message, color: 'red' })
  } finally {
    deleting.value = false
  }
}
</script>


<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Organization</span>
        <h1 class="ap-title">Team Members</h1>
        <p class="ap-subtitle">Manage staff, leadership, and contributor profiles with avatar uploads.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
        <button class="btn btn-primary" @click="openAdd"><UIcon name="i-lucide-plus" />Add Member</button>
      </div>
    </div>

    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search"><UIcon name="i-lucide-search" class="ap-search__icon" /><input v-model="search" class="ap-search__input" placeholder="Search team..." /></div>
      </div>
    </div>

    <AdminTable :columns="columns" :rows="data || []" :loading="pending" empty-title="No team members">
      <template #cell-avatar="{ row }">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
          <img v-if="row.avatarUrl" :src="resolveTeamMemberAvatarUrl(row.avatarUrl)" :alt="row.name" style="width: 100%; height: 100%; object-fit: cover;" />
          <UIcon v-else name="i-lucide-user" style="width: 20px; height: 20px; color: #94a3b8;" />
        </div>
      </template>
      <template #cell-name="{ row }"><span class="font-semibold">{{ row.name }}</span></template>
      <template #cell-role="{ row }"><span style="color: var(--admin-text-secondary)">{{ row.role }}</span></template>
      <template #cell-status="{ row }"><span class="badge" :class="row.isPublished ? 'badge-green' : 'badge-gray'">{{ row.isPublished ? 'Published' : 'Draft' }}</span></template>
      <template #cell-displayOrder="{ row }"><span style="color: var(--admin-text-secondary); text-align: center; display: block;">{{ row.displayOrder }}</span></template>
      <template #actions="{ row }">
        <button class="btn btn-ghost btn-icon" @click="openEdit(row)"><UIcon name="i-lucide-edit-3" /></button>
        <button class="btn btn-danger btn-icon" @click="openDelete(row)"><UIcon name="i-lucide-trash-2" /></button>
      </template>
    </AdminTable>

    <AdminModal :open="modalOpen" :title="mode === 'add' ? 'New Team Member' : 'Edit Team Member'" :submit-label="mode === 'add' ? 'Create' : 'Save'" :loading="saving" @close="modalOpen = false" @submit="save">
      <!-- Avatar Upload -->
      <div class="am-field">
        <label class="am-label">Avatar Photo</label>
        <div style="position: relative; margin-bottom: 12px;">
          <div v-if="previewUrl" style="width: 80px; height: 80px; border-radius: 50%; background: #e2e8f0; overflow: hidden; margin-bottom: 12px; display: flex; align-items: center; justify-content: center;">
            <img :src="previewUrl" :alt="form.name" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <label style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; cursor: pointer; background: rgba(255,255,255,0.05); font-size: 14px;">
            <UIcon name="i-lucide-upload" style="width: 16px; height: 16px;" />
            Choose Image
            <input type="file" accept="image/*" style="display: none;" @change="handleAvatarFileChange" />
          </label>
        </div>
      </div>

      <!-- Name & Role Row -->
      <div class="am-row-2">
        <div class="am-field">
          <label class="am-label">Name <span style="color: var(--admin-error)">*</span></label>
          <input v-model="form.name" class="am-input" :class="{ 'am-input-error': errors.name }" placeholder="Full name" />
          <span v-if="errors.name" style="color: var(--admin-error); font-size: 12px; margin-top: 4px;">{{ errors.name }}</span>
        </div>
        <div class="am-field">
          <label class="am-label">Role <span style="color: var(--admin-error)">*</span></label>
          <input v-model="form.role" class="am-input" :class="{ 'am-input-error': errors.role }" placeholder="Job title or position" />
          <span v-if="errors.role" style="color: var(--admin-error); font-size: 12px; margin-top: 4px;">{{ errors.role }}</span>
        </div>
      </div>

      <!-- Bio -->
      <div class="am-field">
        <label class="am-label">Bio</label>
        <textarea v-model="form.bio" class="am-textarea" placeholder="Brief biography or description" rows="3" />
      </div>

      <!-- Email & LinkedIn Row -->
      <div class="am-row-2">
        <div class="am-field">
          <label class="am-label">Email</label>
          <input v-model="form.email" class="am-input" type="email" placeholder="member@ncedi.org" />
        </div>
        <div class="am-field">
          <label class="am-label">LinkedIn URL</label>
          <input v-model="form.linkedinUrl" class="am-input" placeholder="https://linkedin.com/in/..." />
        </div>
      </div>

      <!-- Display Order & Published -->
      <div class="am-row-2">
        <div class="am-field">
          <label class="am-label">Display Order</label>
          <input v-model.number="form.displayOrder" type="number" class="am-input" :class="{ 'am-input-error': errors.displayOrder }" min="0" />
          <span v-if="errors.displayOrder" style="color: var(--admin-error); font-size: 12px; margin-top: 4px;">{{ errors.displayOrder }}</span>
        </div>
        <div class="am-field" style="justify-content: flex-end;">
          <label class="am-checkbox-row">
            <input type="checkbox" v-model="form.isPublished" />
            Published
          </label>
        </div>
      </div>
    </AdminModal>

    <AdminModal :open="deleteOpen" title="Delete Team Member" submit-label="Delete" submit-danger :loading="deleting" @close="deleteOpen = false" @submit="remove">
      <p style="color: var(--admin-text-secondary)">Permanently delete <strong>{{ target?.name }}</strong>? Their avatar will also be removed from storage.</p>
    </AdminModal>
  </section>
</template>
