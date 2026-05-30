<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const programId = route.params.id as string

useSeoMeta({ title: 'Edit Program | Admin | N-CEDI' })

const onSaved = () => {
  if (route.query.created) {
    router.replace(`/admin/programs/${programId}`)
  }
}

const onCancel = () => {
  router.push('/admin/programs')
}

const onDeleted = () => {
  router.push('/admin/programs')
}

onMounted(() => {
  const created = route.query.created
  if (typeof created === 'string' && created) {
    toast.add({
      title: 'Program created',
      description: `Saved successfully. Publish when ready to go live at /programs/${created}.`,
      color: 'green',
    })
  }
})
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <NuxtLink to="/admin/programs" class="back-link">
          <UIcon name="i-lucide-arrow-left" />All programs
        </NuxtLink>
        <span class="ap-eyebrow">Edit</span>
        <h1 class="ap-title">Edit Skill Track</h1>
        <p class="ap-subtitle">Update content, media, and visibility for this program page.</p>
      </div>
    </div>

    <ProgramEditorForm
      :program-id="programId"
      @saved="onSaved"
      @cancel="onCancel"
      @deleted="onDeleted"
    />
  </section>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: var(--sp-3);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--admin-text-muted);
  text-decoration: none;
}

.back-link:hover {
  color: var(--admin-brand-accent-text);
}
</style>
