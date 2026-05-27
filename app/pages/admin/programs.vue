<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

useSeoMeta({
  title: 'Programs | Admin | N-CEDI'
})

type ProgramRow = {
  id: string
  title: string
  slug: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration_weeks: number
  is_published: boolean
  is_featured: boolean
  updated_at: string
}

const supabase = useSupabaseClient()
const toast = useToast()

const search = ref('')
const level = ref<'all' | ProgramRow['level']>('all')

const { data, pending, error, refresh } = useAsyncData('admin-programs', async () => {
  let query = supabase
    .from('programs')
    .select('id, title, slug, level, duration_weeks, is_published, is_featured, updated_at')
    .order('updated_at', { ascending: false })

  if (level.value !== 'all') query = query.eq('level', level.value)
  if (search.value.trim()) query = query.ilike('title', `%${search.value.trim()}%`)

  const { data, error } = await query
  if (error) throw error
  return (data || []) as ProgramRow[]
}, { watch: [search, level] })

const toggling = ref<string | null>(null)
const togglePublished = async (row: ProgramRow) => {
  toggling.value = row.id
  try {
    const { error } = await supabase
      .from('programs')
      .update({ is_published: !row.is_published })
      .eq('id', row.id)
    if (error) throw error
    toast.add({ title: 'Updated', description: row.title, color: 'primary' })
    await refresh()
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Could not update.'
    toast.add({ title: 'Update failed', description: message, color: 'red' })
  } finally {
    toggling.value = null
  }
}
</script>

<template>
  <!-- eslint-disable vue/singleline-html-element-content-newline -->
  <section class="page">
    <div class="toolbar">
      <UInput
        v-model="search"
        placeholder="Search programs…"
        icon="i-lucide-search"
        class="w-full md:w-96"
      />

      <div class="toolbar__right">
        <USelect
          v-model="level"
          :options="[
            { label: 'All levels', value: 'all' },
            { label: 'Beginner', value: 'beginner' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' }
          ]"
        />
        <UButton color="primary" variant="soft" icon="i-lucide-refresh-cw" @click="refresh">
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
          { key: 'title', label: 'Title' },
          { key: 'level', label: 'Level' },
          { key: 'duration_weeks', label: 'Weeks' },
          { key: 'is_featured', label: 'Featured' },
          { key: 'is_published', label: 'Published' },
          { key: 'actions', label: '' }
        ]"
      >
        <template #level-data="{ row }">
          <UBadge color="primary" variant="soft">{{ row.level }}</UBadge>
        </template>

        <template #is_featured-data="{ row }">
          <UBadge :color="row.is_featured ? 'primary' : 'gray'" variant="soft">
            {{ row.is_featured ? 'Yes' : 'No' }}
          </UBadge>
        </template>

        <template #is_published-data="{ row }">
          <UBadge :color="row.is_published ? 'primary' : 'gray'" variant="soft">
            {{ row.is_published ? 'Yes' : 'No' }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2 justify-end">
            <UButton
              size="xs"
              color="primary"
              variant="soft"
              :loading="toggling === row.id"
              :icon="row.is_published ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              @click="togglePublished(row)"
            >
              {{ row.is_published ? 'Unpublish' : 'Publish' }}
            </UButton>

            <UButton
              size="xs"
              color="gray"
              variant="soft"
              icon="i-lucide-external-link"
              :to="`/programs/${row.slug}`"
              target="_blank"
            >
              View
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>
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
  gap: var(--space-3);
}

.card {
  border-radius: var(--radius-2xl);
}
</style>
