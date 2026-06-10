<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Admin Overview | N-CEDI' })

type DashboardTab = 'overview' | 'content' | 'engagement' | 'system'

type CountTable = 'programs' | 'events' | 'posts' | 'gallery_items' | 'inquiries' | 'site_stats' | 'partners' | 'team_members' | 'projects' | 'testimonials' | 'categories'

type ProgramSignal = { id: string; title: string; slug: string; is_published: boolean; is_featured: boolean; updated_at: string }
type InquirySignal = { id: string; name: string; email: string; subject: string | null; type: 'general' | 'partnership' | 'enrollment' | 'media'; is_read: boolean; created_at: string }
type AdminProfile = { role: 'super_admin' | 'admin' | 'editor' | 'viewer'; is_active: boolean }

const supabase = useSupabaseClient() as any
const user = useSupabaseUser()
const toast = useToast()
const router = useRouter()

const activeTab = ref<DashboardTab>('overview')
const markingInquiry = ref<string | null>(null)

const tabs: Array<{ id: DashboardTab, label: string, icon: string }> = [
  { id: 'overview', label: 'Overview', icon: 'i-lucide-layout-dashboard' },
  { id: 'content', label: 'Content', icon: 'i-lucide-library' },
  { id: 'engagement', label: 'Engagement', icon: 'i-lucide-inbox' },
  { id: 'system', label: 'System', icon: 'i-lucide-shield-check' }
]

const contentModules: Array<{ key: CountTable, label: string, description: string, icon: string, to?: string }> = [
  { key: 'programs', label: 'Programs', description: 'Training programs and curriculum pages.', icon: 'i-lucide-graduation-cap', to: '/admin/programs' },
  { key: 'events', label: 'Events', description: 'Workshops, exhibitions, seminars, and open days.', icon: 'i-lucide-calendar-days', to: '/admin/events' },
  { key: 'posts', label: 'Blog Posts', description: 'Editorial updates and public knowledge content.', icon: 'i-lucide-newspaper', to: '/admin/posts' },
  { key: 'gallery_items', label: 'Gallery', description: 'Images and videos for institutional storytelling.', icon: 'i-lucide-images', to: '/admin/gallery' },
  { key: 'partners', label: 'Partners', description: 'Institutional and community partner records.', icon: 'i-lucide-handshake', to: '/admin/partners' },
  { key: 'team_members', label: 'Team', description: 'Published staff, leadership, and contributor profiles.', icon: 'i-lucide-users', to: '/admin/team-members' },
  { key: 'projects', label: 'Projects', description: 'Student and program outcome showcases.', icon: 'i-lucide-folder-kanban', to: '/admin/projects' },
  { key: 'testimonials', label: 'Testimonials', description: 'Published social proof and program feedback.', icon: 'i-lucide-message-square-quote', to: '/admin/testimonials' },
  { key: 'categories', label: 'Categories', description: 'Shared taxonomy for public content.', icon: 'i-lucide-tags', to: '/admin/categories' },
  { key: 'site_stats', label: 'Site Stats', description: 'Homepage KPI values and public metrics.', icon: 'i-lucide-bar-chart-3', to: '/admin/site-stats' }
]

const { data: dashboard, pending, refresh } = useAsyncData('admin-dashboard-tabs', async () => {
  const countTables: CountTable[] = ['programs', 'events', 'posts', 'gallery_items', 'inquiries', 'site_stats', 'partners', 'team_members', 'projects', 'testimonials', 'categories']
  
  const countResults = await Promise.all(
    countTables.map(async (table) => {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
      if (error && error.code !== '42P01') throw error
      return [table, count ?? 0] as const
    })
  )

  const [unreadInquiries, publishedPrograms, unpublishedPrograms, featuredPrograms, recentPrograms, recentInquiries, currentAdmin] = await Promise.all([
    countRows('inquiries', q => q.eq('is_read', false)),
    countRows('programs', q => q.eq('is_published', true)),
    countRows('programs', q => q.eq('is_published', false)),
    countRows('programs', q => q.eq('is_featured', true)),
    fetchRecentPrograms(),
    fetchRecentInquiries(),
    fetchCurrentAdmin()
  ])

  return { counts: Object.fromEntries(countResults) as Record<CountTable, number>, unreadInquiries, publishedPrograms, unpublishedPrograms, featuredPrograms, recentPrograms, recentInquiries, currentAdmin }
}, { watch: [user] })

const totalContent = computed(() => {
  const c = dashboard.value?.counts
  if (!c) return 0
  return c.programs + c.events + c.posts + c.gallery_items + c.projects + c.testimonials
})

const contentHealth = computed(() => {
  const p = dashboard.value?.publishedPrograms ?? 0
  const u = dashboard.value?.unpublishedPrograms ?? 0
  if (p + u === 0) return 0
  return Math.round((p / (p + u)) * 100)
})

const markInquiryRead = async (row: InquirySignal) => {
  markingInquiry.value = row.id
  try {
    const { error } = await supabase.from('inquiries').update({ is_read: true }).eq('id', row.id)
    if (error) throw error
    toast.add({ title: 'Marked as read', color: 'success' })
    await refresh()
  } catch (e: any) { toast.add({ title: 'Error', description: e.message, color: 'error' }) }
  finally { markingInquiry.value = null }
}

async function countRows(table: CountTable, apply?: (query: any) => any) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true })
  if (apply) query = apply(query)
  const { count, error } = await query
  if (error && error.code !== '42P01') throw error
  return count ?? 0
}

async function fetchRecentPrograms() {
  const { data, error } = await supabase.from('programs').select('id, title, slug, is_published, is_featured, updated_at').order('updated_at', { ascending: false }).limit(5)
  if (error && error.code !== '42P01') throw error
  return (data || []) as ProgramSignal[]
}

async function fetchRecentInquiries() {
  const { data, error } = await supabase.from('inquiries').select('id, name, email, subject, type, is_read, created_at').order('created_at', { ascending: false }).limit(6)
  if (error && error.code !== '42P01') throw error
  return (data || []) as InquirySignal[]
}

async function fetchCurrentAdmin() {
  if (!user.value?.id) return null
  const { data, error } = await supabase.from('admin_users').select('role, is_active').eq('user_id', user.value.id).maybeSingle()
  if (error) throw error
  return data as AdminProfile | null
}

const navigateAdminModule = async (module: { label: string; to?: string }, event: MouseEvent) => {
  event.preventDefault()
  if (!module.to) return

  try {
    await router.push(module.to)
  } catch (err: any) {
    console.error('[AdminDashboard] navigation failed:', module.to, err)
    toast.add({
      title: 'Navigation error',
      description: `Could not open ${module.label}. ${err?.message ?? 'Check console for details.'}`,
      color: 'error'
    })
  }
}
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <span class="ap-eyebrow">COMMAND SYSTEM</span>
        <h1 class="ap-title">Operations Control Room</h1>
        <p class="ap-subtitle">Monitor platform telemetry, review publishing integrity, and triage incoming inquiries.</p>
      </div>
      <div class="ap-header__actions">
        <button class="btn btn-ghost" @click="refresh()"><UIcon name="i-lucide-refresh-cw" />Refresh</button>
        <NuxtLink to="/admin/inquiries" class="btn btn-primary"><UIcon name="i-lucide-inbox" />Review Inbox</NuxtLink>
      </div>
    </div>

    <!-- Segmented Tab Controls -->
    <div class="admin-tab-group dashboard-tabs">
      <button v-for="t in tabs" :key="t.id" class="admin-tab-btn" :class="{ 'is-active': activeTab === t.id }" @click="activeTab = t.id">
        <UIcon :name="t.icon" class="tab-icon" />
        <span>{{ t.label }}</span>
      </button>
    </div>

    <div v-if="pending" class="skeleton-grid">
      <div class="glass-panel skel-card" v-for="i in 4" :key="i"></div>
    </div>

    <template v-else>
      <div v-show="activeTab === 'overview'" class="tab-panel">
        <!-- Bento KPI Grid -->
        <div class="kpi-grid">
          <!-- Card 1 -->
          <div class="glass-card bento-card glass-card-accent-blue">
            <div class="bento-header">
              <span class="bento-label">Content Records</span>
              <UIcon name="i-lucide-database" class="bento-icon icon-blue" />
            </div>
            <div class="bento-body">
              <div class="bento-value">{{ totalContent }}</div>
              <svg class="sparkline" viewBox="0 0 100 30" width="80" height="24"><path d="M 0,25 Q 20,5 40,20 T 80,10 T 100,18" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" /></svg>
            </div>
            <p class="bento-desc">Consolidated training modules, news, and events.</p>
          </div>

          <!-- Card 2 -->
          <div class="glass-card bento-card glass-card-accent-gold">
            <div class="bento-header">
              <span class="bento-label">Unread Inquiries</span>
              <span class="bento-icon-wrapper">
                <span v-if="dashboard?.unreadInquiries" class="pulse-dot pulse-dot-alert" />
                <UIcon name="i-lucide-mail" class="bento-icon icon-gold" />
              </span>
            </div>
            <div class="bento-body">
              <div class="bento-value">{{ dashboard?.unreadInquiries ?? 0 }}</div>
            </div>
            <p class="bento-desc">Direct communications awaiting response.</p>
          </div>

          <!-- Card 3 -->
          <div class="glass-card bento-card glass-card-accent-green">
            <div class="bento-header">
              <span class="bento-label">Program Integrity</span>
              <UIcon name="i-lucide-activity" class="bento-icon icon-green" />
            </div>
            <div class="bento-body">
              <div class="bento-value">{{ contentHealth }}%</div>
            </div>
            <p class="bento-desc">Proportion of curriculum published live.</p>
          </div>

          <!-- Card 4 -->
          <div class="glass-card bento-card">
            <div class="bento-header">
              <span class="bento-label">Homepage KPIs</span>
              <UIcon name="i-lucide-bar-chart-3" class="bento-icon icon-gray" />
            </div>
            <div class="bento-body">
              <div class="bento-value">{{ dashboard?.counts.site_stats ?? 0 }}</div>
              <span class="badge badge-gray">Active</span>
            </div>
            <p class="bento-desc">Public metrics displaying on front page.</p>
          </div>
        </div>

        <div class="dash-grid-2">
          <div class="glass-card dash-card">
            <div class="dash-card__header">
              <span class="dash-card__title">Operations Priority Queue</span>
              <NuxtLink to="/admin/inquiries" class="btn btn-ghost btn-sm">Triage</NuxtLink>
            </div>
            <div class="dash-list">
              <div class="dash-list__item glass-panel">
                <div class="dash-list__icon"><span class="pulse-dot" :class="dashboard?.unreadInquiries ? 'pulse-dot-alert' : 'pulse-dot-active'" /></div>
                <div class="dash-list__content">
                  <div class="dash-list__title">{{ dashboard?.unreadInquiries ?? 0 }} inbox alerts active</div>
                  <div class="dash-list__desc">Needs immediate classification and review.</div>
                </div>
              </div>
              <div class="dash-list__item glass-panel">
                <div class="dash-list__icon"><span class="pulse-dot" :class="dashboard?.unpublishedPrograms ? 'pulse-dot-alert' : 'pulse-dot-active'" /></div>
                <div class="dash-list__content">
                  <div class="dash-list__title">{{ dashboard?.unpublishedPrograms ?? 0 }} programs in draft mode</div>
                  <div class="dash-list__desc">Requires authorization to publish.</div>
                </div>
              </div>
              <div class="dash-list__item glass-panel">
                <div class="dash-list__icon"><span class="pulse-dot pulse-dot-active" /></div>
                <div class="dash-list__content">
                  <div class="dash-list__title">{{ dashboard?.featuredPrograms ?? 0 }} featured programs selected</div>
                  <div class="dash-list__desc">Prominently highlighted on public curriculum homepage.</div>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-card dash-card">
            <div class="dash-card__header">
              <span class="dash-card__title">Recent Curriculum Changes</span>
              <NuxtLink to="/admin/programs" class="btn btn-ghost btn-sm">Manage</NuxtLink>
            </div>
            <div v-if="!dashboard?.recentPrograms.length" class="ap-empty" style="padding:40px 20px">
              <UIcon name="i-lucide-graduation-cap" class="ap-empty__icon" />
              <div class="ap-empty__title">No programs found</div>
            </div>
            <div v-else class="dash-rows">
              <div v-for="p in dashboard.recentPrograms" :key="p.id" class="dash-row">
                <div class="dash-row__left">
                  <div class="dash-row__title">{{ p.title }}</div>
                  <div class="dash-row__meta">
                    {{ p.is_featured ? 'Featured track' : 'Standard track' }} · Updated {{ new Date(p.updated_at).toLocaleDateString() }}
                  </div>
                </div>
                <span class="badge" :class="p.is_published ? 'badge-green' : 'badge-gray'">{{ p.is_published ? 'Published' : 'Draft' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'content'" class="tab-panel">
        <div class="dash-grid-3">
          <button
            v-for="m in contentModules"
            :key="m.key"
            class="glass-card module-card module-card--link"
            :aria-label="`Open ${m.label}`"
            @click="navigateAdminModule(m, $event)"
          >
            <div class="module-card__label"><UIcon :name="m.icon" />{{ m.label }}</div>
            <div class="module-card__value">{{ dashboard?.counts[m.key] ?? 0 }}</div>
            <p class="module-card__desc">{{ m.description }}</p>
            <div class="module-card__footer">
              <span class="btn btn-ghost module-card__btn">Access manager</span>
            </div>
          </button>
        </div>
      </div>

      <div v-show="activeTab === 'engagement'" class="tab-panel">
        <div class="glass-card dash-card">
          <div class="dash-card__header">
            <span class="dash-card__title">Recent Inquiries</span>
            <NuxtLink to="/admin/inquiries" class="btn btn-ghost btn-sm">View Full Inbox</NuxtLink>
          </div>
          <div v-if="!dashboard?.recentInquiries.length" class="ap-empty">
            <UIcon name="i-lucide-inbox" class="ap-empty__icon" />
            <div class="ap-empty__title">Inbox clean</div>
          </div>
          <div v-else class="admin-table-container">
            <table class="admin-modern-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th style="text-align:right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in dashboard.recentInquiries" :key="r.id">
                  <td>
                    <div style="font-weight:700;font-size:14px">{{ r.name }}</div>
                    <div style="font-size:12px;color:var(--admin-text-muted)">{{ r.email }}</div>
                  </td>
                  <td><span class="badge badge-blue" style="text-transform:capitalize">{{ r.type }}</span></td>
                  <td>{{ r.subject || '—' }}</td>
                  <td style="font-family:monospace">{{ new Date(r.created_at).toLocaleDateString() }}</td>
                  <td style="text-align:right">
                    <button v-if="!r.is_read" class="btn btn-ghost btn-sm" @click="markInquiryRead(r)">Mark read</button>
                    <span v-else class="status-resolved"><UIcon name="i-lucide-check-circle" /> Resolved</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'system'" class="tab-panel">
        <div class="dash-grid-2">
          <div class="glass-card dash-card">
            <div class="dash-card__header">
              <span class="dash-card__title">Security Credentials</span>
              <UIcon name="i-lucide-shield-check" class="icon-green" style="width:20px;height:20px" />
            </div>
            <div class="sys-info-group">
              <div class="sys-info-box">
                <div class="sys-info-label">Security Identity</div>
                <div class="sys-info-value">{{ user?.email || 'System user' }}</div>
              </div>
              <div class="sys-info-box">
                <div class="sys-info-label">Assigned RBAC Role</div>
                <div class="sys-info-value role-val">{{ dashboard?.currentAdmin?.role?.replace('_', ' ') || 'Editor' }}</div>
              </div>
              <div class="sys-info-box">
                <div class="sys-info-label">Account Authority</div>
                <span class="badge" :class="dashboard?.currentAdmin?.is_active ? 'badge-green' : 'badge-amber'">{{ dashboard?.currentAdmin?.is_active ? 'Active' : 'Suspended' }}</span>
              </div>
            </div>
            <div class="sys-actions">
              <NuxtLink to="/admin/users" class="btn btn-primary"><UIcon name="i-lucide-users" />Control RBAC</NuxtLink>
            </div>
          </div>

          <div class="glass-card dash-card">
            <div class="dash-card__header">
              <span class="dash-card__title">Operations Deck</span>
            </div>
            <div class="sys-links">
              <NuxtLink to="/admin/site-stats" class="sys-link glass-panel">
                <UIcon name="i-lucide-bar-chart-3" class="sys-link__icon" />
                <div class="sys-link__text">
                  <div class="sys-link__title">Site Stats Bento</div>
                  <div class="sys-link__desc">Edit frontpage KPI counters.</div>
                </div>
              </NuxtLink>
              <NuxtLink to="/admin/programs" class="sys-link glass-panel">
                <UIcon name="i-lucide-graduation-cap" class="sys-link__icon" />
                <div class="sys-link__text">
                  <div class="sys-link__title">Curriculum Publisher</div>
                  <div class="sys-link__desc">Toggle program visibility.</div>
                </div>
              </NuxtLink>
              <NuxtLink to="/admin/inquiries" class="sys-link glass-panel">
                <UIcon name="i-lucide-inbox" class="sys-link__icon" />
                <div class="sys-link__text">
                  <div class="sys-link__title">Triage Station</div>
                  <div class="sys-link__desc">Monitor direct enquiries inbox.</div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.dashboard-tabs { margin-bottom: var(--space-8); }
.tab-icon { margin-right: 6px; }

.skeleton-grid, .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 24px; }
.skel-card { height: 128px; }
@media(max-width:1024px) { .skeleton-grid, .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media(max-width:640px) { .skeleton-grid, .kpi-grid { grid-template-columns: 1fr; } }

.bento-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.bento-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--admin-text-muted); }
.bento-icon-wrapper { display: flex; align-items: center; gap: 6px; }
.bento-icon { width: 20px; height: 20px; }
.bento-body { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px; }
.bento-value { font-size: 2.25rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; color: var(--admin-text-primary); line-height: 1; }
.bento-desc { font-size: 12px; color: var(--admin-text-muted); margin: 0; line-height: 1.4; }

.icon-blue { color: #38bdf8; }
.icon-gold { color: #f59e0b; }
.icon-green { color: #10b981; }
.icon-gray { color: #94a3b8; }

.dash-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
@media(max-width: 1024px) { .dash-grid-2 { grid-template-columns: 1fr; } }

.dash-card { padding: 24px; }
.dash-card__header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--admin-border); padding-bottom: 16px; margin-bottom: 16px; }
.dash-card__title { font-weight: 700; color: var(--admin-text-primary); font-size: 1rem; }

.btn-sm { padding: 6px 12px; font-size: 12px; }

.dash-list { display: flex; flex-direction: column; gap: 12px; }
.dash-list__item { padding: 16px; display: flex; gap: 12px; align-items: flex-start; }
.dash-list__icon { padding-top: 4px; }
.dash-list__title { font-weight: 700; font-size: 14px; color: var(--admin-text-primary); }
.dash-list__desc { font-size: 12px; color: var(--admin-text-muted); margin-top: 4px; }

.dash-rows { display: flex; flex-direction: column; gap: 16px; }
.dash-row { display: flex; align-items: center; justify-content: space-between; }
.dash-row__title { font-weight: 700; font-size: 14px; color: var(--admin-text-primary); }
.dash-row__meta { font-size: 12px; color: var(--admin-text-muted); margin-top: 2px; }

.dash-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
@media(max-width: 1024px) { .dash-grid-3 { grid-template-columns: repeat(2, 1fr); } }
@media(max-width: 640px) { .dash-grid-3 { grid-template-columns: 1fr; } }

.module-card { padding: 24px; display: flex; flex-direction: column; height: 100%; }
.module-card--link { cursor: pointer; text-decoration: none; color: inherit; transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
.module-card--link:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2); border-color: rgba(212, 168, 83, 0.3); }
.module-card__label { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: var(--admin-text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; }
.module-card__label svg { width: 16px; height: 16px; }
.module-card__value { font-size: 2.25rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; margin-bottom: 8px; }
.module-card__desc { font-size: 14px; color: var(--admin-text-muted); margin-bottom: 24px; flex: 1; }
.module-card__btn { width: 100%; justify-content: center; }

.status-resolved { font-size: 12px; color: #10b981; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; justify-content: flex-end; }
.status-resolved svg { width: 14px; height: 14px; }

.sys-info-group { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.sys-info-box { background: rgba(148, 163, 184, 0.05); padding: 16px; border-radius: var(--admin-radius-md); }
.sys-info-label { font-size: 10px; font-weight: 700; color: var(--admin-text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
.sys-info-value { font-weight: 700; font-size: 14px; color: var(--admin-text-primary); }
.role-val { color: var(--admin-brand-accent); text-transform: capitalize; }
.sys-actions { display: flex; gap: 12px; }

.sys-links { display: flex; flex-direction: column; gap: 12px; }
.sys-link { display: flex; align-items: center; gap: 16px; padding: 16px; text-decoration: none; transition: transform 0.2s, border-color 0.2s; }
.sys-link:hover { transform: translateY(-2px); border-color: rgba(212, 168, 83, 0.3); }
.sys-link__icon { width: 20px; height: 20px; color: var(--admin-brand-accent); flex-shrink: 0; }
.sys-link__title { font-weight: 700; font-size: 14px; color: var(--admin-text-primary); }
.sys-link__desc { font-size: 12px; color: var(--admin-text-muted); margin-top: 2px; }
</style>
