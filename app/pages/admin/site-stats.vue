<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

useSeoMeta({
  title: 'Site Stats | Admin | N-CEDI'
})

type SiteStatRow = {
  id: string
  value: number
  prefix: string | null
  suffix: string | null
  label: string
  icon: string | null
  display_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

const supabase = useSupabaseClient()
const toast = useToast()

const editing = ref<SiteStatRow | null>(null)
const saving = ref(false)

const { data, pending, error, refresh } = useAsyncData('admin-site-stats', async () => {
  const { data, error } = await supabase
    .from('site_stats')
    .select('id, value, prefix, suffix, label, icon, display_order, is_published, created_at, updated_at')
    .order('display_order', { ascending: true })

  if (error) throw error
  return (data || []) as SiteStatRow[]
})

const openEdit = (row: SiteStatRow) => {
  editing.value = { ...row }
}

const closeEdit = () => {
  editing.value = null
}

const isEditOpen = computed({
  get: () => editing.value !== null,
  set: (v) => {
    if (!v) editing.value = null
  }
})

const save = async () => {
  if (!editing.value) return
  saving.value = true
  try {
    const payload = {
      value: editing.value.value,
      prefix: editing.value.prefix,
      suffix: editing.value.suffix,
      label: editing.value.label,
      icon: editing.value.icon,
      display_order: editing.value.display_order,
      is_published: editing.value.is_published
    }

    const { error } = await supabase
      .from('site_stats')
      .update(payload)
      .eq('id', editing.value.id)

    if (error) throw error
    toast.add({ title: 'Saved', description: editing.value.label, color: 'primary' })
    closeEdit()
    await refresh()
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Could not save.'
    toast.add({ title: 'Save failed', description: message, color: 'red' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <!-- eslint-disable vue/singleline-html-element-content-newline -->
  <section class="page">
    <div class="header">
      <div>
        <span class="eyebrow">Homepage KPI</span>
        <h2 class="h2">
          Site statistics
        </h2>
        <p class="lead">
          These values power the KPI “bento” stats shown on the homepage.
        </p>
      </div>
      <div class="actions">
        <UButton
          color="primary"
          variant="soft"
          icon="i-lucide-refresh-cw"
          @click="refresh"
        >
          Refresh
        </UButton>
      </div>
    </div>

    <UAlert v-if="error" color="red" variant="soft" title="Failed to load" :description="String(error)" />

    <UCard v-else class="card">
      <div v-if="pending" class="p-4 space-y-3">
        <USkeleton class="h-12 w-full" />
        <USkeleton class="h-12 w-full" />
        <USkeleton class="h-12 w-full" />
      </div>

      <UTable
        v-else
        :rows="data || []"
        :columns="[
          { key: 'display_order', label: 'Order' },
          { key: 'label', label: 'Label' },
          { key: 'value', label: 'Value' },
          { key: 'suffix', label: 'Suffix' },
          { key: 'is_published', label: 'Published' },
          { key: 'actions', label: '' }
        ]"
      >
        <template #value-data="{ row }">
          <span class="font-extrabold">
            {{ row.prefix || '' }}{{ row.value }}{{ row.suffix || '' }}
          </span>
        </template>

        <template #is_published-data="{ row }">
          <UBadge :color="row.is_published ? 'primary' : 'gray'" variant="soft">
            {{ row.is_published ? 'Yes' : 'No' }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <UButton size="xs" color="primary" variant="soft" icon="i-lucide-pencil" @click="openEdit(row)">
            Edit
          </UButton>
        </template>
      </UTable>
    </UCard>

    <UModal v-model="isEditOpen">
      <UCard class="modal-card">
        <template #header>
          <div class="modal-header">
            <div>
              <span class="eyebrow">Edit KPI</span>
              <div class="modal-title">
                {{ editing?.label }}
              </div>
            </div>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" @click="closeEdit" />
          </div>
        </template>

        <div v-if="editing" class="grid">
          <UFormField label="Label" required>
            <UInput v-model="editing.label" />
          </UFormField>

          <UFormField label="Value" required>
            <UInput v-model.number="editing.value" type="number" />
          </UFormField>

          <UFormField label="Prefix">
            <UInput v-model="editing.prefix" placeholder="e.g. ~" />
          </UFormField>

          <UFormField label="Suffix">
            <UInput v-model="editing.suffix" placeholder="e.g. +" />
          </UFormField>

          <UFormField label="Icon (Bootstrap class)">
            <UInput v-model="editing.icon" placeholder="e.g. bi-people-fill" />
          </UFormField>

          <UFormField label="Display order">
            <UInput v-model.number="editing.display_order" type="number" />
          </UFormField>

          <UFormField label="Published">
            <UToggle v-model="editing.is_published" />
          </UFormField>
        </div>

        <template #footer>
          <div class="modal-footer">
            <UButton color="gray" variant="soft" @click="closeEdit">Cancel</UButton>
            <UButton color="primary" variant="solid" :loading="saving" icon="i-lucide-save" @click="save">
              Save
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </section>
</template>

<style scoped>
.page {
  max-width: 1400px;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.eyebrow {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-brand-accent);
}

.h2 {
  margin: var(--space-2) 0 var(--space-2);
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 900;
  color: var(--color-brand-primary);
  letter-spacing: var(--tracking-tight);
}

.lead {
  margin: 0;
  color: var(--color-text-muted);
  font-weight: 700;
  max-width: 70ch;
}

.card {
  border-radius: var(--radius-2xl);
}

.modal-card {
  border-radius: var(--radius-2xl);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.modal-title {
  font-family: var(--font-display);
  font-weight: 900;
  color: var(--color-brand-primary);
  margin-top: 4px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
</style>
