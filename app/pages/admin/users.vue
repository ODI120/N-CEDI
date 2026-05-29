<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Admins | Admin | N-CEDI' })

type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer'

type AdminUserRow = {
  user_id: string
  email: string
  role: AdminRole
  is_active: boolean
  created_at: string
}

const supabase = useSupabaseClient() as any
const toast = useToast()
const search = ref('')

const { data, pending, refresh } = useAsyncData('admin-users-list', async () => {
  const response = await $fetch<{ success: boolean; data: AdminUserRow[] }>('/api/admin/users')
  return response.data || []
})

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return (data.value || []).filter(r => !q || r.email.toLowerCase().includes(q))
})

const columns = [
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
]

const modalOpen = ref(false)
const saving = ref(false)
const form = ref({ email: '', role: 'viewer' as AdminRole, temporaryPassword: '' })
const newPass = ref('')

const openAdd = () => { form.value = { email: '', role: 'viewer', temporaryPassword: '' }; newPass.value = ''; modalOpen.value = true }

const save = async () => {
  saving.value = true
  try {
    const response = await $fetch<{ success: boolean; user: any }>('/api/admin/users', {
      method: 'POST',
      body: { email: form.value.email.trim(), role: form.value.role, temporaryPassword: form.value.temporaryPassword || undefined }
    })
    newPass.value = response.user.temporary_password
    toast.add({ title: 'Admin enrolled', color: 'green' })
    await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'red' }) }
  finally { saving.value = false }
}

const toggleStatus = async (row: AdminUserRow) => {
  try {
    await $fetch(`/api/admin/users/${row.user_id}`, { method: 'PATCH', body: { is_active: !row.is_active } })
    toast.add({ title: 'Status updated', color: 'green' })
    await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'red' }) }
}
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Security</span>
        <h1 class="ap-title">Admins</h1>
        <p class="ap-subtitle">Manage administrative access and roles.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh()"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
        <button class="btn btn-primary" @click="openAdd"><UIcon name="i-lucide-user-plus" />Enroll Admin</button>
      </div>
    </div>

    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search"><UIcon name="i-lucide-search" class="ap-search__icon" /><input v-model="search" class="ap-search__input" placeholder="Search admins..." /></div>
      </div>
    </div>

    <AdminTable :columns="columns" :rows="filteredRows" :loading="pending" empty-title="No admins found">
      <template #cell-email="{ row }">
        <div class="font-semibold">{{ row.email }}</div>
        <div class="text-xs" style="color:var(--admin-text-muted)">{{ row.user_id }}</div>
      </template>
      <template #cell-role="{ row }"><span class="badge badge-amber" style="text-transform:capitalize">{{ row.role.replace('_', ' ') }}</span></template>
      <template #cell-status="{ row }"><span class="badge" :class="row.is_active ? 'badge-green' : 'badge-gray'">{{ row.is_active ? 'Active' : 'Suspended' }}</span></template>
      <template #actions="{ row }">
        <button class="btn btn-ghost" style="font-size:12px;padding:4px 8px" @click="toggleStatus(row)">Toggle Status</button>
      </template>
    </AdminTable>

    <AdminModal :open="modalOpen" title="Enroll Admin" submit-label="Create" :loading="saving" @close="modalOpen = false" @submit="save">
      <div class="am-field"><label class="am-label">Email</label><input v-model="form.email" type="email" class="am-input" /></div>
      <div class="am-field"><label class="am-label">Role</label>
        <select v-model="form.role" class="am-select">
          <option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option><option value="super_admin">Super Admin</option>
        </select>
      </div>
      <div class="am-field"><label class="am-label">Custom Password (optional)</label><input v-model="form.temporaryPassword" type="password" class="am-input" /></div>
      <div v-if="newPass" style="margin-top:16px;padding:12px;background:rgba(16,185,129,0.1);border-radius:8px;border:1px solid rgba(16,185,129,0.2)">
        <p style="font-size:12px;color:#10b981;font-weight:700;margin-bottom:4px">Temporary password generated:</p>
        <code style="color:#fff;font-weight:bold">{{ newPass }}</code>
      </div>
    </AdminModal>
  </section>
</template>
