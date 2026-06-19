<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showBanner = ref(false)

onMounted(() => {
  const consent = localStorage.getItem('ncedi_cookie_consent')
  if (!consent) {
    // Show banner after a short delay for smooth enter animation
    setTimeout(() => {
      showBanner.value = true
    }, 1500)
  }
})

const acceptCookies = () => {
  localStorage.setItem('ncedi_cookie_consent', 'accepted')
  showBanner.value = false
}

const declineCookies = () => {
  localStorage.setItem('ncedi_cookie_consent', 'declined')
  showBanner.value = false
}
</script>

<template>
  <Transition name="slide-up">
    <div v-if="showBanner" class="cookie-banner" role="complementary" aria-label="Cookie Consent Banner">
      <div class="container cookie-banner__container">
        <div class="cookie-banner__content">
          <p class="cookie-banner__text">
            We use cookies to improve your browsing experience on our institutional site, analyze traffic, and support workflows. By clicking "Accept All", you agree to our use of cookies.
          </p>
        </div>
        <div class="cookie-banner__actions">
          <button @click="declineCookies" class="cookie-banner__btn cookie-banner__btn--decline">
            Decline
          </button>
          <BaseButton variant="accent" size="sm" @click="acceptCookies">
            Accept All
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: var(--space-4);
  left: var(--space-4);
  right: var(--space-4);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
  border-radius: var(--radius-lg);
  padding: var(--space-4) 0;
  z-index: 999;
}

@media (min-width: 768px) {
  .cookie-banner {
    bottom: var(--space-6);
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: 100%;
    max-width: 760px;
    padding: var(--space-4) var(--space-2);
  }
}

.cookie-banner__container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: center;
  justify-content: space-between;
}

@media (min-width: 640px) {
  .cookie-banner__container {
    flex-direction: row;
    gap: var(--space-6);
  }
}

.cookie-banner__content {
  flex: 1;
}

.cookie-banner__text {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  margin: 0;
}

.cookie-banner__actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  flex-shrink: 0;
}

.cookie-banner__btn {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  background: none;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  transition: background-color 0.2s, color 0.2s;
}

.cookie-banner__btn--decline {
  color: var(--color-text-muted);
}

.cookie-banner__btn--decline:hover {
  background-color: var(--color-surface-muted);
  color: var(--color-text-dark);
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 30px) !important;
}

@media (max-width: 767px) {
  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: translateY(30px) !important;
  }
}
</style>
