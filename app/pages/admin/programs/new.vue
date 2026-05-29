<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'New Program | Admin | N-CEDI' })

const router = useRouter()

const onSaved = ({ id, slug }: { id: string; slug: string }) => {
  router.push(`/admin/programs/${id}?created=${slug}`)
}

const onCancel = () => {
  router.push('/admin/programs')
}
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <NuxtLink to="/admin/programs" class="back-link">
          <UIcon name="i-lucide-arrow-left" />All programs
        </NuxtLink>
        <span class="ap-eyebrow">Create</span>
        <h1 class="ap-title">New Skill Track</h1>
        <p class="ap-subtitle">Build a program page section by section. You can save as draft and publish when ready.</p>
      </div>
    </div>

    <ProgramEditorForm @saved="onSaved" @cancel="onCancel" />
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
