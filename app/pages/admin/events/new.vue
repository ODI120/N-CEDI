<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'New Event | Admin | N-CEDI' })

const router = useRouter()

const onSaved = ({ id, slug }: { id: string; slug: string }) => {
  router.push(`/admin/events/${id}?created=${slug}`)
}

const onCancel = () => {
  router.push('/admin/events')
}
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <NuxtLink to="/admin/events" class="back-link">
          <UIcon name="i-lucide-arrow-left" />All events
        </NuxtLink>
        <span class="ap-eyebrow">Create</span>
        <h1 class="ap-title">New Event</h1>
        <p class="ap-subtitle">Create a student yearly event section by section. Save drafts and publish when complete.</p>
      </div>
    </div>

    <EventEditorForm @saved="onSaved" @cancel="onCancel" />
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
