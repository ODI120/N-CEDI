<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Admin Users | Admin | N-CEDI' })

type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer'

interface AdminUserRow {
  user_id: string
  email: string
  role: AdminRole
  is_active: boolean
  created_at: string
  updated_at: string
}

const supabase = useSupabaseClient() as any
const currentUser = useSupabaseUser()
const toast = useToast()
const search = ref('')

// Fetch current user's profile to enforce client-side UI gating
const { data: currentUserProfile } = useAsyncData('current-user-profile', async () => {
  if (!currentUser.value?.id) return null
  const { data, error } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', currentUser.value.id)
    .maybeSingle()
  if (error) console.error('[UsersPage] Error fetching user role:', error)
  return data
}, { watch: [currentUser] })

const isSuperAdmin = computed(() => currentUserProfile.value?.role === 'super_admin')

// Fetch the list of admin users
const { data: adminUsers, pending, error, refresh } = useAsyncData('admin-users-list', async () => {
  const response = await $fetch<{ success: boolean; data: AdminUserRow[] }>('/api/admin/users')
  return response.data || []
})

// Search filtering logic
const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return (adminUsers.value || []).filter(row => {
    return !q || row.email.toLowerCase().includes(q) || row.user_id.toLowerCase().includes(q)
  })
})

const columns = [
  { key: 'email', label: 'Email / User ID' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'updated_at', label: 'Last Updated' }
]

// Modal & Form States
const modalOpen = ref(false)
const deleteOpen = ref(false)
const saving = ref(false)
const deleting = ref(false)
const form = ref({ email: '', role: 'viewer' as AdminRole, temporaryPassword: '' })
const enrolledPassword = ref('')
const targetUser = ref<AdminUserRow | null>(null)

// Actions
const openAddModal = () => {
  form.value = { email: '', role: 'viewer', temporaryPassword: '' }
  enrolledPassword.value = ''
  modalOpen.value = true
}

const handleEnrollAdmin = async () => {
  if (!form.value.email.trim()) {
    toast.add({ title: 'Validation Error', description: 'Email address is required.', color: 'red' })
    return
  }

  saving.value = true
  try {
    const response = await $fetch<{ success: boolean; user: any }>('/api/admin/users', {
      method: 'POST',
      body: {
        email: form.value.email.trim(),
        role: form.value.role,
        temporaryPassword: form.value.temporaryPassword.trim() || undefined
      }
    })
    
    enrolledPassword.value = response.user.temporary_password
    toast.add({ title: 'Admin Enrolled Successfully', color: 'green' })
    await refresh()
  } catch (e: any) {
    toast.add({
      title: 'Enrollment Failed',
      description: e.data?.statusMessage || e.message || 'An error occurred.',
      color: 'red'
    })
  } finally {
    saving.value = false
  }
}

const handleToggleStatus = async (row: AdminUserRow) => {
  if (row.user_id === currentUser.value?.id) {
    toast.add({ title: 'Operation Prevented', description: 'You cannot deactivate your own account.', color: 'yellow' })
    return
  }

  try {
    await $fetch(`/api/admin/users/${row.user_id}`, {
      method: 'PATCH',
      body: { is_active: !row.is_active }
    })
    toast.add({ title: `Admin ${row.is_active ? 'Suspended' : 'Activated'}`, color: 'green' })
    await refresh()
  } catch (e: any) {
    toast.add({
      title: 'Status Update Failed',
      description: e.data?.statusMessage || e.message || 'An error occurred.',
      color: 'red'
    })
  }
}

const openDeleteModal = (row: AdminUserRow) => {
  if (row.user_id === currentUser.value?.id) {
    toast.add({ title: 'Operation Prevented', description: 'You cannot delete your own account.', color: 'yellow' })
    return
  }
  targetUser.value = row
  deleteOpen.value = true
}

const handleDeleteAdmin = async () => {
  if (!targetUser.value) return

  deleting.value = true
  try {
    await $fetch(`/api/admin/users/${targetUser.value.user_id}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Admin Account Deleted', color: 'green' })
    deleteOpen.value = false
    targetUser.value = null
    await refresh()
  } catch (e: any) {
    toast.add({
      title: 'Deletion Failed',
      description: e.data?.statusMessage || e.message || 'An error occurred.',
      color: 'red'
    })
  } finally {
    deleting.value = false
  }
}

// Utility formatting
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

const getRoleBadgeClass = (role: AdminRole) => {
  switch (role) {
    case 'super_admin': return 'badge-amber'
    case 'admin': return 'badge-orange'
    case 'editor': return 'badge-blue'
    case 'viewer': return 'badge-gray'
    default: return 'badge-gray'
  }
}
</script>

<template>
  <section class="admin-page">
    <!-- Header -->
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Security & Access</span>
        <h1 class="ap-title">Admin Users</h1>
        <p class="ap-subtitle">Enforce roles and govern administrative permissions for N-CEDI portal.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh()"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
        <button v-if="isSuperAdmin" class="btn btn-primary" @click="openAddModal">
          <UIcon name="i-lucide-user-plus" />Enroll Admin
        </button>
      </div>
    </div>

    <!-- Toolbar / Search -->
    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search">
          <UIcon name="i-lucide-search" class="ap-search__icon" />
          <input v-model="search" class="ap-search__input" placeholder="Search by email or user ID..." />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-alert" style="margin-bottom: var(--space-4); background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); padding: var(--space-4); border-radius: var(--radius-lg); color: #ef4444; display: flex; gap: var(--space-2); align-items: center;">
      <UIcon name="i-lucide-alert-circle" style="width: 20px; height: 20px;" />
      <div>
        <p class="font-semibold" style="margin: 0; font-size: 14px;">Failed to load admin users</p>
        <p style="margin: 2px 0 0 0; font-size: 12px; opacity: 0.85;">{{ error.message || error }}</p>
      </div>
    </div>

    <!-- Admin Users Table -->
    <AdminTable :columns="columns" :rows="filteredRows" :loading="pending" empty-title="No administrative users found" empty-text="Try adjusting your search criteria or register a new admin.">
      <template #cell-email="{ row }">
        <div class="font-semibold">{{ row.email }}</div>
        <div class="text-xs font-mono" style="color:var(--admin-text-muted)">{{ row.user_id }}</div>
      </template>
      <template #cell-role="{ row }">
        <span class="badge" :class="getRoleBadgeClass(row.role)">
          {{ row.role.replace('_', ' ') }}
        </span>
      </template>
      <template #cell-status="{ row }">
        <span class="badge" :class="row.is_active ? 'badge-green' : 'badge-red'">
          {{ row.is_active ? 'Active' : 'Suspended' }}
        </span>
      </template>
      <template #cell-updated_at="{ row }">
        <span class="text-xs" style="color:var(--admin-text-secondary)">{{ formatDate(row.updated_at) }}</span>
      </template>
      <template #actions="{ row }">
        <div v-if="isSuperAdmin && row.user_id !== currentUser?.id" class="flex gap-2 items-center">
          <button class="btn btn-ghost" style="font-size:12px;padding:4px 8px" @click="handleToggleStatus(row)">
            {{ row.is_active ? 'Suspend' : 'Activate' }}
          </button>
          <button class="btn btn-danger btn-icon" title="Delete Admin" type="button" @click="openDeleteModal(row)">
            <UIcon name="i-lucide-trash-2" />
          </button>
        </div>
        <span v-else class="text-xs italic" style="color:var(--admin-text-muted)">Locked</span>
      </template>
    </AdminTable>

    <!-- Enroll Admin Modal -->
    <AdminModal :open="modalOpen" title="Enroll Administrator" :submit-label="enrolledPassword ? 'Done' : 'Register'" :loading="saving" @close="modalOpen = false" @submit="enrolledPassword ? modalOpen = false : handleEnrollAdmin()">
      <!-- Success feedback -->
      <div v-if="enrolledPassword" class="success-alert">
        <div class="alert-icon-container">
          <UIcon name="i-lucide-badge-check" class="alert-icon" />
        </div>
        <div class="alert-body">
          <p class="alert-title">Administrator Account Enrolled!</p>
          <p class="alert-desc">Make sure to securely share the temporary login password below with the user. It will not be shown again.</p>
          <div class="password-box">
            <code class="password-text">{{ enrolledPassword }}</code>
          </div>
        </div>
      </div>

      <!-- Registration Form -->
      <div v-else class="modal-form">
        <div class="am-field">
          <label class="am-label">Email Address</label>
          <input v-model="form.email" type="email" class="am-input" placeholder="e.g. admin@ncedi.edu.ng" />
        </div>
        <div class="am-field">
          <label class="am-label">Access Role</label>
          <select v-model="form.role" class="am-select">
            <option value="viewer">Viewer (Read-only access)</option>
            <option value="editor">Editor (Create/Edit content)</option>
            <option value="admin">Admin (Full content CRUD, no security access)</option>
            <option value="super_admin">Super Admin (Full security & system control)</option>
          </select>
        </div>
        <div class="am-field">
          <label class="am-label">Temporary Password (optional)</label>
          <input v-model="form.temporaryPassword" type="password" class="am-input" placeholder="Leave empty to auto-generate" />
        </div>
      </div>
    </AdminModal>

    <!-- Delete Confirm Modal -->
    <AdminModal :open="deleteOpen" title="Delete Admin Account" subtitle="This operation is permanent and cannot be undone." submit-label="Permanently Delete" submit-danger :loading="deleting" @close="deleteOpen = false" @submit="handleDeleteAdmin">
      <p style="color:var(--admin-text-secondary); margin-bottom: 8px">
        Are you sure you want to permanently delete the administrator account for <strong>{{ targetUser?.email }}</strong>?
      </p>
      <p style="color:var(--admin-text-muted); font-size:12px">
        Deleting this account will remove their Supabase authentication credentials and cascading records.
      </p>
    </AdminModal>
  </section>
</template>

<style scoped>
.success-alert {
  display: flex;
  gap: var(--space-4);
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  margin-bottom: var(--space-4);
  align-items: flex-start;
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.alert-icon-container {
  background: rgba(16, 185, 129, 0.15);
  border-radius: 50%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
}

.alert-icon {
  width: 24px;
  height: 24px;
}

.alert-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: #10b981;
  font-size: var(--text-base);
  margin-bottom: 4px;
}

.alert-desc {
  color: var(--admin-text-secondary);
  font-size: var(--text-sm);
  line-height: 1.5;
  margin-bottom: 12px;
}

.password-box {
  background: #0f172a;
  border: 1px dashed rgba(16, 185, 129, 0.3);
  padding: 12px var(--space-4);
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: center;
  align-items: center;
}

.password-text {
  font-family: monospace;
  font-size: var(--text-lg);
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
