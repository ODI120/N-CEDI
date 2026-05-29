<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title: string
  subtitle?: string
  wide?: boolean
  submitLabel?: string
  submitDanger?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: []
}>()

const onBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) emit('close')
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="am">
      <div v-if="open" class="am-backdrop" @mousedown="onBackdropClick">
        <div class="am-panel" :class="{ 'am-panel--wide': wide }" role="dialog" aria-modal="true">
          <div class="am-header">
            <div>
              <h3 class="am-header__title">{{ title }}</h3>
              <p v-if="subtitle" class="am-header__subtitle">{{ subtitle }}</p>
            </div>
            <button class="am-close" @click="emit('close')" aria-label="Close">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
            </button>
          </div>

          <div class="am-body">
            <slot />
          </div>

          <div class="am-footer">
            <button class="btn btn-ghost" type="button" @click="emit('close')">Cancel</button>
            <button
              v-if="submitLabel"
              class="btn"
              :class="submitDanger ? 'btn-danger' : 'btn-primary'"
              :disabled="loading"
              type="button"
              @click="emit('submit')"
            >
              <svg v-if="loading" class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              {{ submitLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.am-enter-active { animation: am-in 0.2s ease; }
.am-leave-active { animation: am-in 0.15s ease reverse; }
.am-enter-active .am-panel { animation: am-slide 0.22s cubic-bezier(0.34,1.56,0.64,1); }
.am-leave-active .am-panel { animation: am-slide 0.15s ease reverse; }

@keyframes am-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes am-slide { from { transform: translateY(20px) scale(0.97); opacity: 0 } to { transform: none; opacity: 1 } }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg) } }
</style>
