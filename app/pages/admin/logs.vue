<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'System Logs | Admin | N-CEDI' })

const supabase = useSupabaseClient() as any
const currentUser = useSupabaseUser()
const toast = useToast()
const router = useRouter()
const search = ref('')
const filterResource = ref('all')
const filterStatus = ref('all')

interface AuditRow {
  id: string
  action: string
  user_email: string | null
  resource: string | null
  details: string | null
  created_at: string
}

interface ParsedDetails {
  user_id?: string
  email?: string
  action?: string
  resource?: string
  method?: string
  status?: number
  ip_address?: string
  timestamp?: string
  details?: { duration_ms?: number; status_code?: number }
}

const currentUserId = computed(() => currentUser.value?.id || (currentUser.value as any)?.sub)

// Fetch current user's profile to enforce client-side UI gating
const { data: currentUserProfile } = useAsyncData('current-user-profile', async () => {
  if (!currentUserId.value) return null
  const { data, error } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', currentUserId.value)
    .maybeSingle()
  if (error) console.error('[LogsPage] Error fetching user role:', error)
  return data
}, { watch: [currentUser] })

// Gating: only super_admin can view audit logs
watch(currentUserProfile, (profile) => {
  if (profile && profile.role !== 'super_admin') {
    toast.add({
      title: 'Access Denied',
      description: 'You do not have permission to access the system audit logs.',
      color: 'error'
    })
    router.push('/admin')
  }
}, { immediate: true })

const expandedRow = ref<string | null>(null)
const toggleExpand = (id: string) => {
  expandedRow.value = expandedRow.value === id ? null : id
}

// Human-readable action mapping
const humanizeAction = (action: string): string => {
  if (!action) return 'Unknown Action'
  const method = action.split(' ')[0]
  const path = action.split(' ').slice(1).join(' ')

  let resource = 'resource'
  if (path?.includes('/users')) resource = 'Admin User'
  else if (path?.includes('/init')) resource = 'System'
  else if (path?.includes('/programs')) resource = 'Program'
  else if (path?.includes('/events')) resource = 'Event'
  else if (path?.includes('/gallery')) resource = 'Gallery'
  else if (path?.includes('/partners')) resource = 'Partner'
  else if (path?.includes('/team')) resource = 'Team Member'
  else if (path?.includes('/testimonials')) resource = 'Testimonial'
  else if (path?.includes('/categories')) resource = 'Category'
  else if (path?.includes('/site-stats')) resource = 'Site Stats'
  else if (path?.includes('/inquiries')) resource = 'Inquiry'

  switch (method) {
    case 'POST': return `Created ${resource}`
    case 'PATCH': return `Updated ${resource}`
    case 'PUT': return `Replaced ${resource}`
    case 'DELETE': return `Deleted ${resource}`
    case 'GET': return `Accessed ${resource}`
    default: return action
  }
}

const getActionIcon = (action: string): string => {
  const method = action?.split(' ')[0]
  switch (method) {
    case 'POST': return 'i-lucide-plus-circle'
    case 'PATCH': return 'i-lucide-edit-3'
    case 'PUT': return 'i-lucide-replace'
    case 'DELETE': return 'i-lucide-trash-2'
    case 'GET': return 'i-lucide-eye'
    default: return 'i-lucide-activity'
  }
}

const getActionColor = (action: string): string => {
  const method = action?.split(' ')[0]
  switch (method) {
    case 'POST': return 'var(--admin-brand-green, #10b981)'
    case 'PATCH': return 'var(--admin-brand-accent, #d4a853)'
    case 'PUT': return '#f59e0b'
    case 'DELETE': return 'var(--admin-brand-red, #ef4444)'
    case 'GET': return '#38bdf8'
    default: return 'var(--admin-text-muted)'
  }
}

const getStatusBadge = (status?: number): { label: string; cls: string } => {
  if (!status) return { label: 'Unknown', cls: 'badge-gray' }
  if (status >= 200 && status < 300) return { label: 'Success', cls: 'badge-green' }
  if (status >= 300 && status < 400) return { label: 'Redirect', cls: 'badge-blue' }
  if (status >= 400 && status < 500) return { label: 'Denied', cls: 'badge-amber' }
  return { label: 'Error', cls: 'badge-red' }
}

const parseDetails = (raw?: string | null): ParsedDetails | null => {
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

const extractResource = (action: string): string => {
  const path = action?.split(' ').slice(1).join(' ') || ''
  const segments = path.replace(/^\/api\/admin\//, '').split('/')
  return segments[0] || 'unknown'
}

const resourceOptions = computed(() => {
  const resources = new Set<string>()
  ;(data.value || []).forEach(row => {
    resources.add(extractResource(row.action))
  })
  return ['all', ...Array.from(resources).sort()]
})

const { data, pending, refresh } = useAsyncData('admin-logs', async () => {
  if (currentUserProfile.value?.role !== 'super_admin') return []

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    if (error.code === '42P01') return []
    throw error
  }
  return (data || []) as AuditRow[]
}, { watch: [currentUserProfile] })

const filteredRows = computed(() => {
  let rows = data.value || []

  // Text search
  const q = search.value.trim().toLowerCase()
  if (q) {
    rows = rows.filter(row => {
      return (
        row.action?.toLowerCase().includes(q) ||
        row.user_email?.toLowerCase().includes(q) ||
        row.resource?.toLowerCase().includes(q) ||
        humanizeAction(row.action).toLowerCase().includes(q)
      )
    })
  }

  // Resource filter
  if (filterResource.value !== 'all') {
    rows = rows.filter(row => extractResource(row.action) === filterResource.value)
  }

  // Status filter
  if (filterStatus.value !== 'all') {
    rows = rows.filter(row => {
      const d = parseDetails(row.details)
      const status = d?.status || d?.details?.status_code
      if (filterStatus.value === 'success') return status && status >= 200 && status < 300
      if (filterStatus.value === 'error') return status && status >= 400
      return true
    })
  }

  return rows
})

const totalLogs = computed(() => data.value?.length || 0)
const successLogs = computed(() => {
  return (data.value || []).filter(row => {
    const d = parseDetails(row.details)
    const s = d?.status || d?.details?.status_code || 0
    return s >= 200 && s < 300
  }).length
})
const errorLogs = computed(() => {
  return (data.value || []).filter(row => {
    const d = parseDetails(row.details)
    const s = d?.status || d?.details?.status_code || 0
    return s >= 400
  }).length
})

const fmtDate = (d: string) => {
  const date = new Date(d)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const fmtTime = (d: string) => {
  const date = new Date(d)
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const fmtRelative = (d: string): string => {
  const now = Date.now()
  const then = new Date(d).getTime()
  const diff = now - then
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return fmtDate(d)
}
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">Security & Compliance</span>
        <h1 class="ap-title">Audit Log</h1>
        <p class="ap-subtitle">Comprehensive record of all administrative actions, access events, and system changes.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh()"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="log-stats">
      <div class="log-stat glass-card">
        <div class="log-stat__icon" style="background: rgba(56, 189, 248, 0.1); color: #38bdf8;">
          <UIcon name="i-lucide-scroll-text" />
        </div>
        <div class="log-stat__content">
          <div class="log-stat__value">{{ totalLogs }}</div>
          <div class="log-stat__label">Total Events</div>
        </div>
      </div>
      <div class="log-stat glass-card">
        <div class="log-stat__icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
          <UIcon name="i-lucide-check-circle" />
        </div>
        <div class="log-stat__content">
          <div class="log-stat__value">{{ successLogs }}</div>
          <div class="log-stat__label">Successful</div>
        </div>
      </div>
      <div class="log-stat glass-card">
        <div class="log-stat__icon" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">
          <UIcon name="i-lucide-alert-triangle" />
        </div>
        <div class="log-stat__content">
          <div class="log-stat__value">{{ errorLogs }}</div>
          <div class="log-stat__label">Denied / Errors</div>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="ap-toolbar">
      <div class="ap-toolbar__left">
        <div class="ap-search"><UIcon name="i-lucide-search" class="ap-search__icon" /><input v-model="search" class="ap-search__input" placeholder="Search actions, users, resources..." /></div>
      </div>
      <div class="ap-toolbar__right" style="display: flex; gap: 8px;">
        <select v-model="filterResource" class="log-filter-select">
          <option value="all">All Resources</option>
          <option v-for="r in resourceOptions.filter(o => o !== 'all')" :key="r" :value="r">{{ r }}</option>
        </select>
        <select v-model="filterStatus" class="log-filter-select">
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="error">Denied/Error</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="log-loading">
      <svg class="spin" style="width: 24px; height: 24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      <span>Loading audit events...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="!filteredRows.length" class="log-empty glass-card">
      <UIcon name="i-lucide-file-search" class="log-empty__icon" />
      <h3 class="log-empty__title">No audit events found</h3>
      <p class="log-empty__desc">{{ search || filterResource !== 'all' || filterStatus !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Administrative actions will appear here once they occur.' }}</p>
    </div>

    <!-- Timeline Log List -->
    <div v-else class="log-timeline">
      <div
        v-for="row in filteredRows"
        :key="row.id"
        class="log-entry glass-card"
        :class="{ 'is-expanded': expandedRow === row.id }"
        @click="toggleExpand(row.id)"
      >
        <div class="log-entry__main">
          <!-- Action indicator -->
          <div class="log-entry__indicator" :style="{ '--indicator-color': getActionColor(row.action) }">
            <UIcon :name="getActionIcon(row.action)" class="log-entry__action-icon" />
          </div>

          <!-- Content -->
          <div class="log-entry__content">
            <div class="log-entry__top">
              <span class="log-entry__action">{{ humanizeAction(row.action) }}</span>
              <span
                v-if="parseDetails(row.details)?.status"
                class="badge"
                :class="getStatusBadge(parseDetails(row.details)?.status).cls"
                style="font-size: 9px; padding: 1px 6px;"
              >{{ getStatusBadge(parseDetails(row.details)?.status).label }}</span>
            </div>
            <div class="log-entry__meta">
              <span class="log-entry__user">
                <UIcon name="i-lucide-user" style="width: 12px; height: 12px;" />
                {{ row.user_email || 'System' }}
              </span>
              <span class="log-entry__sep">·</span>
              <span class="log-entry__time" :title="fmtDate(row.created_at) + ' ' + fmtTime(row.created_at)">
                {{ fmtRelative(row.created_at) }}
              </span>
            </div>
          </div>

          <!-- Expand toggle -->
          <div class="log-entry__chevron">
            <UIcon :name="expandedRow === row.id ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" />
          </div>
        </div>

        <!-- Expanded Details Panel -->
        <Transition name="expand">
          <div v-if="expandedRow === row.id" class="log-entry__details" @click.stop>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Raw Action</span>
                <code class="detail-value">{{ row.action }}</code>
              </div>
              <div class="detail-item">
                <span class="detail-label">Resource Path</span>
                <code class="detail-value">{{ row.resource || '—' }}</code>
              </div>
              <div class="detail-item">
                <span class="detail-label">Performed By</span>
                <span class="detail-value">{{ row.user_email || 'System' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Timestamp</span>
                <span class="detail-value">{{ fmtDate(row.created_at) }} at {{ fmtTime(row.created_at) }}</span>
              </div>
              <div v-if="parseDetails(row.details)?.ip_address" class="detail-item">
                <span class="detail-label">IP Address</span>
                <code class="detail-value">{{ parseDetails(row.details)?.ip_address }}</code>
              </div>
              <div v-if="parseDetails(row.details)?.details?.duration_ms" class="detail-item">
                <span class="detail-label">Duration</span>
                <span class="detail-value">{{ parseDetails(row.details)?.details?.duration_ms }}ms</span>
              </div>
              <div v-if="parseDetails(row.details)?.status" class="detail-item">
                <span class="detail-label">HTTP Status</span>
                <span class="detail-value">
                  <span class="badge" :class="getStatusBadge(parseDetails(row.details)?.status).cls">
                    {{ parseDetails(row.details)?.status }} {{ getStatusBadge(parseDetails(row.details)?.status).label }}
                  </span>
                </span>
              </div>
              <div v-if="parseDetails(row.details)?.user_id" class="detail-item detail-item--full">
                <span class="detail-label">Actor UUID</span>
                <code class="detail-value" style="font-size: 11px;">{{ parseDetails(row.details)?.user_id }}</code>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Footer count -->
    <div v-if="filteredRows.length" class="log-footer">
      <span>Showing {{ filteredRows.length }} of {{ totalLogs }} events</span>
    </div>
  </section>
</template>

<style scoped>
/* Stats Cards */
.log-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.log-stat {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.log-stat__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.log-stat__icon svg {
  width: 22px;
  height: 22px;
}

.log-stat__value {
  font-size: 1.75rem;
  font-weight: 700;
  font-family: 'Space Grotesk', sans-serif;
  color: var(--admin-text-primary);
  line-height: 1;
}

.log-stat__label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--admin-text-muted);
  margin-top: 2px;
}

@media (max-width: 768px) {
  .log-stats { grid-template-columns: 1fr; }
}

/* Filter Select */
.log-filter-select {
  appearance: none;
  -webkit-appearance: none;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  border-radius: var(--radius-lg);
  padding: 8px 32px 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--admin-text-secondary);
  cursor: pointer;
  transition: border-color 0.2s;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

.log-filter-select:hover {
  border-color: var(--admin-brand-accent);
}

.log-filter-select:focus {
  outline: none;
  border-color: var(--admin-brand-accent);
  box-shadow: 0 0 0 3px rgba(212, 168, 83, 0.15);
}

/* Loading */
.log-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px 0;
  color: var(--admin-text-muted);
  font-weight: 500;
}

/* Empty State */
.log-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.log-empty__icon {
  width: 48px;
  height: 48px;
  color: var(--admin-text-muted);
  opacity: 0.4;
  margin-bottom: 16px;
}

.log-empty__title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: var(--admin-text-primary);
  margin: 0 0 8px;
}

.log-empty__desc {
  color: var(--admin-text-muted);
  font-size: 14px;
  margin: 0;
  max-width: 400px;
}

/* Timeline */
.log-timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-entry {
  padding: 0;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.2s ease;
  overflow: hidden;
}

.log-entry:hover {
  border-color: rgba(212, 168, 83, 0.2);
  transform: translateX(2px);
}

.log-entry.is-expanded {
  border-color: rgba(212, 168, 83, 0.25);
}

.log-entry__main {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
}

.log-entry__indicator {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--indicator-color) 12%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.log-entry__action-icon {
  width: 18px;
  height: 18px;
  color: var(--indicator-color);
}

.log-entry__content {
  flex: 1;
  min-width: 0;
}

.log-entry__top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.log-entry__action {
  font-weight: 600;
  font-size: 14px;
  color: var(--admin-text-primary);
}

.log-entry__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--admin-text-muted);
}

.log-entry__user {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.log-entry__sep {
  opacity: 0.4;
}

.log-entry__time {
  font-family: 'Space Grotesk', monospace;
  font-size: 11px;
}

.log-entry__chevron {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--admin-text-muted);
  opacity: 0.5;
  transition: opacity 0.2s, transform 0.2s;
  flex-shrink: 0;
}

.log-entry:hover .log-entry__chevron {
  opacity: 1;
}

.log-entry__chevron svg {
  width: 16px;
  height: 16px;
}

/* Expanded Details Panel */
.log-entry__details {
  padding: 0 20px 20px;
  border-top: 1px solid var(--admin-border);
  margin-top: 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding-top: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item--full {
  grid-column: span 2;
}

.detail-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--admin-text-muted);
}

.detail-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--admin-text-primary);
  word-break: break-all;
}

.detail-value code {
  background: rgba(148, 163, 184, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

code.detail-value {
  background: rgba(148, 163, 184, 0.08);
  padding: 4px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
}

@media (max-width: 768px) {
  .detail-grid { grid-template-columns: 1fr; }
  .detail-item--full { grid-column: span 1; }
}

/* Expand transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 400px;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-bottom: 0;
}

/* Footer */
.log-footer {
  text-align: center;
  padding: 20px 0 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--admin-text-muted);
}

/* Spin animation */
.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
