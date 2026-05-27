<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

useSeoMeta({
  title: 'Inquiries | Admin | N-CEDI'
})

type InquiryRow = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  type: 'general' | 'partnership' | 'enrollment' | 'media'
  is_read: boolean
  created_at: string
}

const supabase = useSupabaseClient()
const toast = useToast()

const search = ref('')
const showUnreadOnly = ref(true)
const pendingUpdate = ref<string | null>(null)

const { data, pending, error, refresh } = useAsyncData('admin-inquiries', async () => {
  let query = supabase
    .from('inquiries')
    .select('id, name, email, phone, subject, message, type, is_read, created_at')
    .order('created_at', { ascending: false })

  if (showUnreadOnly.value) query = query.eq('is_read', false)
  if (search.value.trim()) {
    // Basic filtering: name/email/subject (Supabase OR requires full-text-like syntax)
    const q = search.value.trim().replaceAll(',', ' ')
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,subject.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []) as InquiryRow[]
}, { watch: [search, showUnreadOnly] })

const selected = ref<InquiryRow | null>(null)

const markRead = async (row: InquiryRow, isRead: boolean) => {
  pendingUpdate.value = row.id
  try {
    const { error } = await supabase
      .from('inquiries')
      .update({ is_read: isRead })
      .eq('id', row.id)

    if (error) throw error

    if (selected.value?.id === row.id) selected.value = { ...selected.value, is_read: isRead }
    await refresh()
    toast.add({
      title: isRead ? 'Marked as read' : 'Marked as unread',
      description: `${row.name} — ${row.email}`,
      color: 'primary'
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Could not update inquiry.'
    toast.add({
      title: 'Update failed',
      description: message,
      color: 'red'
    })
  } finally {
    pendingUpdate.value = null
  }
}
</script>

<template>
  <!-- eslint-disable vue/singleline-html-element-content-newline -->
  <section class="page">
    <div class="toolbar">
      <div class="toolbar__left">
        <UInput
          v-model="search"
          placeholder="Search name, email, subject…"
          icon="i-lucide-search"
          class="w-full md:w-96"
        />
      </div>
      <div class="toolbar__right">
        <UCheckbox v-model="showUnreadOnly" label="Unread only" />
        <UButton color="primary" variant="soft" icon="i-lucide-refresh-cw" @click="refresh">
          Refresh
        </UButton>
      </div>
    </div>

    <div class="content">
      <UCard class="list">
        <template #header>
          <div class="list__header">
            <span class="list__title">Inbox</span>
            <span class="list__meta">
              <USkeleton v-if="pending" class="h-4 w-12" />
              <span v-else>{{ data?.length ?? 0 }}</span>
            </span>
          </div>
        </template>

        <div v-if="error" class="p-4">
          <UAlert color="red" variant="soft" title="Failed to load inquiries" :description="String(error)" />
        </div>

        <div v-else-if="pending" class="p-4 space-y-3">
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-10 w-full" />
        </div>

        <div v-else-if="!data || data.length === 0" class="p-6">
          <div class="empty">
            <UIcon name="i-lucide-inbox" class="empty__icon" />
            <div class="empty__title">No inquiries</div>
            <div class="empty__desc">Nothing matches your current filters.</div>
          </div>
        </div>

        <ul v-else class="rows">
          <li v-for="row in data" :key="row.id">
            <button class="row" :class="{ 'is-unread': !row.is_read, 'is-active': selected?.id === row.id }" @click="selected = row">
              <div class="row__main">
                <div class="row__top">
                  <span class="row__name">{{ row.name }}</span>
                  <span class="row__type">{{ row.type }}</span>
                </div>
                <div class="row__sub">
                  <span class="row__email">{{ row.email }}</span>
                  <span class="row__subject">{{ row.subject || '—' }}</span>
                </div>
              </div>
              <div class="row__right">
                <span class="row__date">{{ new Date(row.created_at).toLocaleString() }}</span>
                <UButton
                  size="xs"
                  color="primary"
                  variant="soft"
                  :loading="pendingUpdate === row.id"
                  :icon="row.is_read ? 'i-lucide-mail' : 'i-lucide-mail-open'"
                  @click.stop="markRead(row, !row.is_read)"
                />
              </div>
            </button>
          </li>
        </ul>
      </UCard>

      <UCard class="detail">
        <template #header>
          <div class="detail__header">
            <span class="detail__title">Details</span>
            <div v-if="selected" class="detail__actions">
              <UBadge :color="selected.is_read ? 'gray' : 'primary'" variant="soft">
                {{ selected.is_read ? 'Read' : 'Unread' }}
              </UBadge>
              <UButton
                size="sm"
                color="primary"
                variant="soft"
                :loading="pendingUpdate === selected.id"
                :icon="selected.is_read ? 'i-lucide-mail' : 'i-lucide-mail-open'"
                @click="markRead(selected, !selected.is_read)"
              >
                Toggle read
              </UButton>
            </div>
          </div>
        </template>

        <div v-if="!selected" class="p-6">
          <div class="empty">
            <UIcon name="i-lucide-mouse-pointer-click" class="empty__icon" />
            <div class="empty__title">Select an inquiry</div>
            <div class="empty__desc">Pick a message from the inbox to review it here.</div>
          </div>
        </div>

        <div v-else class="p-6 space-y-4">
          <div class="kv">
            <div class="kv__k">From</div>
            <div class="kv__v">
              <div class="font-extrabold text-(--color-brand-primary)">{{ selected.name }}</div>
              <div class="text-sm text-(--color-text-muted)">{{ selected.email }}</div>
            </div>
          </div>

          <div class="kv">
            <div class="kv__k">Type</div>
            <div class="kv__v">
              <UBadge color="primary" variant="soft">{{ selected.type }}</UBadge>
            </div>
          </div>

          <div class="kv">
            <div class="kv__k">Subject</div>
            <div class="kv__v font-semibold">{{ selected.subject || '—' }}</div>
          </div>

          <div class="kv">
            <div class="kv__k">Received</div>
            <div class="kv__v">{{ new Date(selected.created_at).toLocaleString() }}</div>
          </div>

          <div class="message">
            <div class="message__k">Message</div>
            <div class="message__v">{{ selected.message }}</div>
          </div>
        </div>
      </UCard>
    </div>
  </section>
</template>

<style scoped>
.page {
  max-width: 1400px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.toolbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.content {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: var(--space-6);
}

@media (max-width: 1024px) {
  .content {
    grid-template-columns: 1fr;
  }
}

.list,
.detail {
  border-radius: var(--radius-2xl);
}

.list__header,
.detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.list__title,
.detail__title {
  font-family: var(--font-display);
  font-weight: 900;
  color: var(--color-brand-primary);
}

.list__meta {
  font-size: var(--text-sm);
  font-weight: 900;
  color: var(--color-text-muted);
}

.rows {
  list-style: none;
  padding: 0;
  margin: 0;
}

.row {
  width: 100%;
  text-align: left;
  padding: var(--space-4);
  display: flex;
  gap: var(--space-4);
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--color-border);
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.row:hover {
  background: rgba(107, 89, 255, 0.04);
}

.row.is-active {
  background: rgba(107, 89, 255, 0.08);
}

.row.is-unread .row__name {
  color: var(--color-brand-accent);
}

.row__main {
  min-width: 0;
}

.row__top {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.row__name {
  font-weight: 900;
  color: var(--color-brand-primary);
  font-size: var(--text-sm);
}

.row__type {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.row__sub {
  display: flex;
  gap: var(--space-3);
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.row__email {
  font-weight: 800;
}

.row__subject {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 420px;
}

.row__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.row__date {
  display: none;
  font-size: 11px;
  color: var(--color-text-muted);
  font-weight: 800;
  letter-spacing: var(--tracking-wide);
}

@media (min-width: 768px) {
  .row__date {
    display: inline;
  }
}

.empty {
  padding: var(--space-8) var(--space-4);
  text-align: center;
}

.empty__icon {
  width: 26px;
  height: 26px;
  color: var(--color-brand-accent);
  margin: 0 auto var(--space-3);
}

.empty__title {
  font-family: var(--font-display);
  font-weight: 900;
  color: var(--color-brand-primary);
  margin-bottom: 4px;
}

.empty__desc {
  color: var(--color-text-muted);
  font-weight: 700;
  font-size: var(--text-sm);
}

.kv {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid rgba(229, 231, 235, 0.8);
}

.kv__k {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.kv__v {
  color: var(--color-brand-primary);
}

.message {
  margin-top: var(--space-4);
  border: 1px solid rgba(107, 89, 255, 0.16);
  background: rgba(107, 89, 255, 0.04);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
}

.message__k {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

.message__v {
  color: var(--color-brand-primary);
  font-weight: 700;
  line-height: var(--leading-relaxed);
  white-space: pre-wrap;
}
</style>
