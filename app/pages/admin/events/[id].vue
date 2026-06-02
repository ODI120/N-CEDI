<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const eventId = route.params.id as string

useSeoMeta({ title: 'Edit Event | Admin | N-CEDI' })

const onSaved = () => {
  if (route.query.created) {
    router.replace(`/admin/events/${eventId}`)
  }
}

const onCancel = () => {
  router.push('/admin/events')
}

const onDeleted = () => {
  router.push('/admin/events')
}

onMounted(() => {
  const created = route.query.created
  if (typeof created === 'string' && created) {
    toast.add({
      title: 'Event created',
      description: `Saved successfully. Publish when ready to go live at /events/${created}.`,
      color: 'green',
    })
  }
})
</script>

<template>
  <section class="admin-page">
    <div class="ap-header">
      <div class="ap-header__left">
        <NuxtLink to="/admin/events" class="back-link">
          <UIcon name="i-lucide-arrow-left" />All events
        </NuxtLink>
        <span class="ap-eyebrow">Edit</span>
        <h1 class="ap-title">Edit Event</h1>
        <p class="ap-subtitle">Update content, media slider, and visibility settings for this event.</p>
      </div>
    </div>

    <EventEditorForm
      :event-id="eventId"
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
