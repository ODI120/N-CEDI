<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { mapProgramDetail } from '~/composables/usePrograms'
import { rowToProgramForm, type ProgramDbRow } from '~/utils/programAdmin'
import HeroProgram from '~/components/sections/HeroProgram.vue'
import RichTextRenderer from '~/components/cms/RichTextRenderer.vue'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const slug = route.params.slug as string
const supabase = useSupabaseClient() as any

const { data: row, error } = await useAsyncData(`admin-program-preview-${slug}`, async () => {
  const { data, error: fetchError } = await supabase
    .from('programs')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (fetchError) throw fetchError
  return data as ProgramDbRow | null
})

if (error.value || !row.value) {
  throw createError({
    statusCode: error.value ? 503 : 404,
    statusMessage: error.value ? 'Unable to load preview' : `Program "${slug}" not found`
  })
}

const program = computed(() => mapProgramDetail(row.value as ProgramDbRow))
const formSnapshot = computed(() => rowToProgramForm(row.value as ProgramDbRow))

useSeoMeta({ title: `Preview: ${program.value.title} | Admin | N-CEDI` })
</script>

<template>
  <section class="admin-preview">
    <header class="admin-preview__bar">
      <div>
        <span class="ap-eyebrow">Draft preview</span>
        <h1>{{ program.title }}</h1>
        <p class="admin-preview__meta">
          <span
            class="badge"
            :class="formSnapshot.isPublished ? 'badge-green' : 'badge-gray'"
          >
            {{ formSnapshot.isPublished ? 'Published' : 'Draft' }}
          </span>
          <code>/programs/{{ program.slug }}</code>
        </p>
      </div>
      <div class="admin-preview__actions">
        <NuxtLink
          :to="`/admin/programs/${row?.id}`"
          class="btn btn-ghost"
        >
          <UIcon name="i-lucide-edit-3" />Edit
        </NuxtLink>
        <NuxtLink
          v-if="formSnapshot.isPublished"
          :to="`/programs/${program.slug}`"
          target="_blank"
          class="btn btn-primary"
        >
          <UIcon name="i-lucide-external-link" />Live page
        </NuxtLink>
      </div>
    </header>

    <div class="admin-preview__canvas">
      <HeroProgram :program="program" />

      <div class="admin-preview__content container">
        <RichTextRenderer
          v-if="program.body?.length"
          :body="program.body"
        />

        <section
          v-if="program.outcomes?.length"
          class="admin-preview__section"
        >
          <h2>Key learning outcomes</h2>
          <ul>
            <li
              v-for="(outcome, index) in program.outcomes"
              :key="index"
            >
              {{ outcome }}
            </li>
          </ul>
        </section>

        <section
          v-if="program.labExperience"
          class="admin-preview__section"
        >
          <h2>Practical lab experience</h2>
          <RichTextRenderer
            v-if="Array.isArray(program.labExperience)"
            :body="program.labExperience"
          />
          <p v-else>
            {{ program.labExperience }}
          </p>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin-preview {
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}

.admin-preview__bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--sp-4);
  padding: var(--sp-6);
  background: var(--admin-surface-opaque);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-xl);
}

.admin-preview__bar h1 {
  margin: var(--sp-1) 0;
  font-size: 1.5rem;
}

.admin-preview__meta {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin: 0;
  color: var(--admin-text-muted);
  font-size: 0.875rem;
}

.admin-preview__actions {
  display: flex;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.admin-preview__canvas {
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-xl);
  overflow: hidden;
  background: #fff;
}

.admin-preview__content {
  padding: var(--sp-8) var(--sp-6);
}

.admin-preview__section {
  margin-top: var(--sp-8);
}

.admin-preview__section h2 {
  margin: 0 0 var(--sp-3);
  font-size: 1.125rem;
}

.admin-preview__section ul {
  margin: 0;
  padding-left: 1.25rem;
}
</style>
