<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Administrator Details | Admin | N-CEDI' })

type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer'

interface AdminUser {
  user_id: string
  email: string
  role: AdminRole
  is_active: boolean
  created_at: string
  updated_at: string
}

const route = useRoute()
const router = useRouter()
const toast = useToast()
const supabase = useSupabaseClient() as any
const currentUser = useSupabaseUser()
const userId = route.params.id as string

const currentUserId = computed(() => currentUser.value?.id || (currentUser.value as any)?.sub)

// Fetch current user's profile to enforce client-side UI gating
const { data: currentUserProfile } = useAsyncData('current-user-profile', async () => {
  if (!currentUserId.value) return null
  const { data, error } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', currentUserId.value)
    .maybeSingle()
  if (error) console.error('[UserDetailsPage] Error fetching user role:', error)
  return data
}, { watch: [currentUser] })

// Gating: only super_admin or the user themselves can view details
watch(currentUserProfile, (profile) => {
  if (profile) {
    if (profile.role !== 'super_admin' && currentUserId.value !== userId) {
      toast.add({
        title: 'Access Denied',
        description: 'You do not have permission to view other administrators\' details.',
        color: 'red'
      })
      router.push('/admin')
    }
  }
}, { immediate: true })

// Fetch the targeted admin user's details
const { data: userResponse, pending, error, refresh } = useAsyncData(`admin-user-${userId}`, async () => {
  const response = await $fetch<{ success: boolean; data: AdminUser }>(`/api/admin/users/${userId}`)
  return response.data
})

const isSelf = computed(() => userId === currentUserId.value)

// Edit Role States
const editRoleOpen = ref(false)
const updatingRole = ref(false)
const editRoleForm = ref({ role: 'viewer' as AdminRole })

const openEditRoleModal = () => {
  if (isSelf.value) {
    toast.add({ title: 'Operation Prevented', description: 'You cannot change your own role.', color: 'yellow' })
    return
  }
  if (userResponse.value) {
    editRoleForm.value.role = userResponse.value.role
    editRoleOpen.value = true
  }
}

const handleUpdateRole = async () => {
  updatingRole.value = true
  try {
    await $fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: { role: editRoleForm.value.role }
    })
    toast.add({ title: 'Role Updated Successfully', color: 'green' })
    editRoleOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.add({
      title: 'Update Failed',
      description: e.data?.statusMessage || e.message || 'An error occurred.',
      color: 'red'
    })
  } finally {
    updatingRole.value = false
  }
}

// Toggle status
const togglingStatus = ref(false)
const handleToggleStatus = async () => {
  if (isSelf.value) {
    toast.add({ title: 'Operation Prevented', description: 'You cannot deactivate your own account.', color: 'yellow' })
    return
  }

  togglingStatus.value = true
  try {
    const nextStatus = !userResponse.value?.is_active
    await $fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: { is_active: nextStatus }
    })
    toast.add({ title: `Admin ${nextStatus ? 'Activated' : 'Suspended'}`, color: 'green' })
    await refresh()
  } catch (e: any) {
    toast.add({
      title: 'Status Update Failed',
      description: e.data?.statusMessage || e.message || 'An error occurred.',
      color: 'red'
    })
  } finally {
    togglingStatus.value = false
  }
}

// Delete Confirm States
const deleteOpen = ref(false)
const deleting = ref(false)

const openDeleteModal = () => {
  if (isSelf.value) {
    toast.add({ title: 'Operation Prevented', description: 'You cannot delete your own account.', color: 'yellow' })
    return
  }
  deleteOpen.value = true
}

const handleDeleteAdmin = async () => {
  deleting.value = true
  try {
    await $fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Admin Account Deleted', color: 'green' })
    deleteOpen.value = false
    router.push('/admin/users')
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
// Reset Password States
const resetPasswordOpen = ref(false)
const resettingPassword = ref(false)
const resetForm = ref({ password: '', confirmPassword: '' })

const openResetPasswordModal = () => {
  resetForm.value = { password: '', confirmPassword: '' }
  resetPasswordOpen.value = true
}

const handleResetPassword = async () => {
  if (!resetForm.value.password) {
    toast.add({ title: 'Validation Error', description: 'Password is required.', color: 'red' })
    return
  }
  if (resetForm.value.password.length < 8) {
    toast.add({ title: 'Validation Error', description: 'Password must be at least 8 characters.', color: 'red' })
    return
  }
  if (resetForm.value.password !== resetForm.value.confirmPassword) {
    toast.add({ title: 'Validation Error', description: 'Passwords do not match.', color: 'red' })
    return
  }

  resettingPassword.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: resetForm.value.password })
    if (error) throw error
    toast.add({ title: 'Password Reset Successfully', color: 'green' })
    resetPasswordOpen.value = false
  } catch (e: any) {
    toast.add({
      title: 'Reset Failed',
      description: e.message || 'An error occurred.',
      color: 'red'
    })
  } finally {
    resettingPassword.value = false
  }
}

// Utility formatting
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

const getRoleBadgeClass = (role?: AdminRole) => {
  switch (role) {
    case 'super_admin': return 'badge-amber'
    case 'admin': return 'badge-orange'
    case 'editor': return 'badge-blue'
    case 'viewer': return 'badge-gray'
    default: return 'badge-gray'
  }
}

// RBAC permissions matrix structure
const permissions = [
  { name: 'View Dashboards', desc: 'Allows basic system dashboard viewing and profile overview.', roles: ['viewer', 'editor', 'admin', 'super_admin'] },
  { name: 'Edit Site Content', desc: 'Allows creation, modification, and updating of events, categories, and programs.', roles: ['editor', 'admin', 'super_admin'] },
  { name: 'Delete Site Content', desc: 'Allows removal and pruning of events, category details, or general content.', roles: ['admin', 'super_admin'] },
  { name: 'Manage Administrator Users', desc: 'Allows enrolling new admins, changing access roles, deactivating, and deleting accounts.', roles: ['super_admin'] },
  { name: 'Access System Security Audit Logs', desc: 'Allows viewing and searching historical admin actions and audit records.', roles: ['super_admin'] }
]
</script>

<template>
  <section class="admin-page">
    <!-- Back Navigation -->
    <div style="margin-bottom: var(--sp-4);">
      <NuxtLink v-if="currentUserProfile?.role === 'super_admin'" to="/admin/users" class="btn btn-ghost" style="padding: 6px 12px; font-size: 13px;">
        <UIcon name="i-lucide-arrow-left" style="width: 14px; height: 14px;" /> Back to Admin Users
      </NuxtLink>
      <NuxtLink v-else to="/admin" class="btn btn-ghost" style="padding: 6px 12px; font-size: 13px;">
        <UIcon name="i-lucide-arrow-left" style="width: 14px; height: 14px;" /> Back to Dashboard
      </NuxtLink>
    </div>

    <!-- Header -->
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Security & Governing</span>
        <h1 class="ap-title">Administrator Details</h1>
        <p class="ap-subtitle">Examine system permissions, metadata, and update administrative configuration.</p>
      </div>
      <div v-if="userResponse && !isSelf" class="ap-header__actions">
        <button class="btn btn-ghost" :disabled="togglingStatus" @click="handleToggleStatus">
          {{ userResponse.is_active ? 'Suspend Account' : 'Activate Account' }}
        </button>
        <button class="btn btn-ghost" @click="openEditRoleModal">
          <UIcon name="i-lucide-edit-3" />Change Role
        </button>
        <button class="btn btn-danger" @click="openDeleteModal">
          <UIcon name="i-lucide-trash-2" />Delete Account
        </button>
      </div>
      <div v-else-if="userResponse && isSelf" class="ap-header__actions">
        <button class="btn btn-primary" @click="openResetPasswordModal">
          <UIcon name="i-lucide-key-round" />Reset Password
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" style="display: flex; align-items: center; justify-content: center; padding: 48px 0; color: var(--admin-text-muted);">
      <svg class="spin" style="width: 32px; height: 32px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
      <span style="margin-left: 12px; font-weight: 500;">Loading administrator info...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !userResponse" class="error-alert" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); padding: var(--sp-4); border-radius: var(--admin-radius-lg); color: #ef4444; display: flex; gap: var(--sp-2); align-items: center;">
      <UIcon name="i-lucide-alert-circle" style="width: 20px; height: 20px;" />
      <div>
        <p class="font-semibold" style="margin: 0; font-size: 14px;">Failed to load administrator</p>
        <p style="margin: 2px 0 0 0; font-size: 12px; opacity: 0.85;">{{ error?.message || 'Admin user not found.' }}</p>
      </div>
    </div>

    <!-- Profile & Metadata Cards -->
    <div v-else class="details-grid">
      <!-- Profile Card -->
      <div class="glass-card glass-panel profile-card">
        <div class="profile-card__avatar">
          {{ userResponse.email[0].toUpperCase() }}
        </div>
        <div class="profile-card__content">
          <div class="profile-card__title-row">
            <h2 class="profile-card__email">{{ userResponse.email }}</h2>
            <div style="display: flex; gap: var(--sp-2); align-items: center;">
              <span class="badge" :class="getRoleBadgeClass(userResponse.role)">
                {{ userResponse.role.replace('_', ' ') }}
              </span>
              <span class="badge" :class="userResponse.is_active ? 'badge-green' : 'badge-red'">
                {{ userResponse.is_active ? 'Active' : 'Suspended' }}
              </span>
            </div>
          </div>
          <p class="profile-card__id">User UUID: <code>{{ userResponse.user_id }}</code></p>
        </div>
      </div>

      <!-- Info Details Card -->
      <div class="glass-card info-card">
        <h3 class="card-section-title">Timeline Info</h3>
        <div class="info-row">
          <span class="info-label">Created At:</span>
          <span class="info-value">{{ formatDate(userResponse.created_at) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Last Updated At:</span>
          <span class="info-value">{{ formatDate(userResponse.updated_at) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Account Status:</span>
          <span class="info-value" style="display: inline-flex; align-items: center; gap: 6px;">
            <span class="pulse-dot" :class="userResponse.is_active ? 'pulse-dot-active' : 'pulse-dot-inactive'"></span>
            {{ userResponse.is_active ? 'Active & Authorized' : 'Access Revoked' }}
          </span>
        </div>
      </div>

      <!-- Permissions Map Matrix Card -->
      <div class="glass-card matrix-card">
        <div class="matrix-card__header">
          <h3 class="card-section-title">System Role Permissions Map</h3>
          <p class="matrix-card__subtitle">
            Comprehensive breakdown of security actions. The column corresponding to the administrator's active role is visually highlighted.
          </p>
        </div>

        <div class="admin-table-container">
          <table class="admin-modern-table matrix-table">
            <thead>
              <tr>
                <th style="width: 35%;">Action / Resource</th>
                <th :class="{ 'highlighted-col': userResponse.role === 'viewer' }">
                  Viewer
                  <span v-if="userResponse.role === 'viewer'" class="badge badge-amber current-badge">Active</span>
                </th>
                <th :class="{ 'highlighted-col': userResponse.role === 'editor' }">
                  Editor
                  <span v-if="userResponse.role === 'editor'" class="badge badge-amber current-badge">Active</span>
                </th>
                <th :class="{ 'highlighted-col': userResponse.role === 'admin' }">
                  Admin
                  <span v-if="userResponse.role === 'admin'" class="badge badge-amber current-badge">Active</span>
                </th>
                <th :class="{ 'highlighted-col': userResponse.role === 'super_admin' }">
                  Super Admin
                  <span v-if="userResponse.role === 'super_admin'" class="badge badge-amber current-badge">Active</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="perm in permissions" :key="perm.name">
                <td class="perm-desc-cell">
                  <div class="perm-name">{{ perm.name }}</div>
                  <div class="perm-desc">{{ perm.desc }}</div>
                </td>
                <td :class="{ 'highlighted-col': userResponse.role === 'viewer' }" class="check-cell">
                  <UIcon :name="perm.roles.includes('viewer') ? 'i-lucide-check' : 'i-lucide-x'" :class="perm.roles.includes('viewer') ? 'text-green' : 'text-red'" />
                </td>
                <td :class="{ 'highlighted-col': userResponse.role === 'editor' }" class="check-cell">
                  <UIcon :name="perm.roles.includes('editor') ? 'i-lucide-check' : 'i-lucide-x'" :class="perm.roles.includes('editor') ? 'text-green' : 'text-red'" />
                </td>
                <td :class="{ 'highlighted-col': userResponse.role === 'admin' }" class="check-cell">
                  <UIcon :name="perm.roles.includes('admin') ? 'i-lucide-check' : 'i-lucide-x'" :class="perm.roles.includes('admin') ? 'text-green' : 'text-red'" />
                </td>
                <td :class="{ 'highlighted-col': userResponse.role === 'super_admin' }" class="check-cell">
                  <UIcon :name="perm.roles.includes('super_admin') ? 'i-lucide-check' : 'i-lucide-x'" :class="perm.roles.includes('super_admin') ? 'text-green' : 'text-red'" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit Role Modal -->
    <AdminModal
      :open="editRoleOpen"
      title="Edit Administrator Role"
      submit-label="Update Role"
      :loading="updatingRole"
      @close="editRoleOpen = false"
      @submit="handleUpdateRole"
    >
      <div class="modal-form" v-if="userResponse">
        <p style="color:var(--admin-text-secondary); margin-bottom: 12px">
          Modify administrative access permissions for <strong>{{ userResponse.email }}</strong>.
        </p>
        <div class="am-field">
          <label class="am-label">Access Role</label>
          <select v-model="editRoleForm.role" class="am-select">
            <option value="viewer">Viewer (Read-only access)</option>
            <option value="editor">Editor (Create/Edit content)</option>
            <option value="admin">Admin (Full content CRUD, no security access)</option>
            <option value="super_admin">Super Admin (Full security & system control)</option>
          </select>
        </div>
      </div>
    </AdminModal>

    <!-- Delete Confirm Modal -->
    <AdminModal
      :open="deleteOpen"
      title="Delete Admin Account"
      subtitle="This operation is permanent and cannot be undone."
      submit-label="Permanently Delete"
      submit-danger
      :loading="deleting"
      @close="deleteOpen = false"
      @submit="handleDeleteAdmin"
    >
      <div v-if="userResponse">
        <p style="color:var(--admin-text-secondary); margin-bottom: 8px">
          Are you sure you want to permanently delete the administrator account for <strong>{{ userResponse.email }}</strong>?
        </p>
        <p style="color:var(--admin-text-muted); font-size:12px">
          Deleting this account will remove their Supabase authentication credentials and cascading records.
        </p>
      </div>
    </AdminModal>

    <!-- Reset Password Modal -->
    <AdminModal
      :open="resetPasswordOpen"
      title="Reset Password"
      submit-label="Save Password"
      :loading="resettingPassword"
      @close="resetPasswordOpen = false"
      @submit="handleResetPassword"
    >
      <div class="modal-form">
        <p style="color:var(--admin-text-secondary); margin-bottom: 12px">
          Enter your new administrative password. It must be at least 8 characters long.
        </p>
        <div class="am-field">
          <label class="am-label">New Password</label>
          <input v-model="resetForm.password" type="password" class="am-input" placeholder="Min. 8 characters" autocomplete="new-password" />
        </div>
        <div class="am-field">
          <label class="am-label">Confirm New Password</label>
          <input v-model="resetForm.confirmPassword" type="password" class="am-input" placeholder="Repeat password" autocomplete="new-password" />
        </div>
      </div>
    </AdminModal>
  </section>
</template>

<style scoped>
.details-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: var(--sp-6);
}

.profile-card {
  grid-column: span 1;
  display: flex;
  gap: var(--sp-5);
  padding: var(--sp-6);
  align-items: center;
}

.profile-card__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--admin-brand-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 32px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(10, 37, 64, 0.15);
  flex-shrink: 0;
}

.profile-card__content {
  flex: 1;
  min-width: 0;
}

.profile-card__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-3);
  margin-bottom: var(--sp-2);
}

.profile-card__email {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--admin-text-primary);
  word-break: break-all;
}

.profile-card__id {
  margin: 0;
  font-size: 12px;
  color: var(--admin-text-muted);
}

.profile-card__id code {
  background: rgba(148, 163, 184, 0.1);
  padding: 2px 6px;
  border-radius: var(--admin-radius-sm);
  font-family: monospace;
}

.info-card {
  grid-column: span 1;
  padding: var(--sp-6);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  justify-content: center;
}

.card-section-title {
  margin-top: 0;
  margin-bottom: var(--sp-2);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--admin-text-primary);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--sp-4);
  font-size: 13.5px;
}

.info-label {
  color: var(--admin-text-muted);
  font-weight: 500;
}

.info-value {
  color: var(--admin-text-primary);
  font-weight: 600;
}

.matrix-card {
  grid-column: span 2;
  padding: var(--sp-6);
}

.matrix-card__header {
  margin-bottom: var(--sp-4);
}

.matrix-card__subtitle {
  margin: var(--sp-1) 0 0;
  font-size: 13px;
  color: var(--admin-text-muted);
  line-height: 1.5;
}

.matrix-table {
  width: 100%;
}

.matrix-table th {
  text-align: center;
}

.matrix-table th:first-child {
  text-align: left;
}

.matrix-table td {
  text-align: center;
}

.matrix-table td:first-child {
  text-align: left;
}

.perm-desc-cell {
  padding: 12px 20px !important;
}

.perm-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--admin-text-primary);
}

.perm-desc {
  font-size: 11.5px;
  color: var(--admin-text-muted);
  margin-top: 2px;
}

.check-cell {
  font-size: 18px;
}

.highlighted-col {
  background: rgba(212, 168, 83, 0.045) !important;
  border-left: 1px dashed rgba(212, 168, 83, 0.2);
  border-right: 1px dashed rgba(212, 168, 83, 0.2);
  position: relative;
}

.current-badge {
  display: block;
  width: fit-content;
  margin: 4px auto 0;
  font-size: 8.5px;
  padding: 1px 5px;
}

.text-green {
  color: var(--admin-brand-green);
  width: 20px;
  height: 20px;
}

.text-red {
  color: var(--admin-brand-red);
  opacity: 0.35;
  width: 16px;
  height: 16px;
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

@media (max-width: 1024px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
  .profile-card {
    grid-column: span 1;
  }
  .info-card {
    grid-column: span 1;
  }
  .matrix-card {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .profile-card {
    flex-direction: column;
    text-align: center;
  }
  .profile-card__title-row {
    flex-direction: column;
    align-items: center;
  }
}
</style>
