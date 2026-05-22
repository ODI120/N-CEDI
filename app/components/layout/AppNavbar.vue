<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLogo from '~/components/AppLogo.vue'
import AppMegaMenu from '~/components/layout/AppMegaMenu.vue'

// 1. Scroll tracking state
const isScrolled = ref(false)
const route = useRoute()

// Check if current route has a transparent header (e.g. Home with dark hero, or Program details with dark cover)
const isHeroPage = computed(() => {
  return route.path === '/' || route.path.startsWith('/programs/') || route.path.startsWith('/events/')
})

const navbarClass = computed(() => {
  return {
    'app-navbar--scrolled': isScrolled.value || !isHeroPage.value,
    'app-navbar--transparent': !isScrolled.value && isHeroPage.value,
    'app-navbar--menu-open': isMobileMenuOpen.value
  }
})

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 2. Mobile Menu State
const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    isMegaMenuOpen.value = false
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 3. Mega Menu State
const isMegaMenuOpen = ref(false)
const toggleMegaMenu = () => {
  isMegaMenuOpen.value = !isMegaMenuOpen.value
}
const closeMegaMenu = () => {
  isMegaMenuOpen.value = false
}

// Fetch programs for MegaMenu
const supabase = useSupabaseClient()
const { data: rawPrograms } = await useAsyncData('navbar-programs', async () => {
  try {
    const { data } = await supabase
      .from('programs')
      .select('id, title, slug, subtitle, level, duration_weeks')
      .eq('is_published', true)
      .limit(9)
    return data || []
  } catch (err) {
    return []
  }
})

// Mock programs for fallback if Supabase returns nothing or fails
const defaultPrograms = [
  { id: '1', title: 'Fashion Design', slug: 'fashion-design', level: 'beginner', durationWeeks: 12 },
  { id: '2', title: 'Web Design & Development', slug: 'web-design-development', level: 'intermediate', durationWeeks: 12 },
  { id: '3', title: 'Solar Installation & Energy Systems', slug: 'solar-installation-energy-systems', level: 'beginner', durationWeeks: 8 },
  { id: '4', title: 'Computer Hardware Engineering', slug: 'computer-hardware-engineering', level: 'beginner', durationWeeks: 12 },
  { id: '5', title: 'Woodwork & Furniture Design', slug: 'woodwork-furniture-design', level: 'intermediate', durationWeeks: 16 },
  { id: '6', title: 'Bakery & Bead Making', slug: 'bakery-bead-making', level: 'beginner', durationWeeks: 8 }
]

const programs = computed(() => {
  if (rawPrograms.value && rawPrograms.value.length > 0) {
    return rawPrograms.value.map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      subtitle: p.subtitle || '',
      level: p.level,
      durationWeeks: p.duration_weeks
    }))
  }
  return defaultPrograms
})

// Reset menu states on navigation
watch(() => route.path, () => {
  isMobileMenuOpen.value = false
  isMegaMenuOpen.value = false
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="app-navbar" :class="navbarClass">
    <div class="app-navbar__container container">
      <!-- Logo -->
      <NuxtLink to="/" class="app-navbar__logo-link" aria-label="N-CEDI Home">
        <AppLogo class="app-navbar__logo" />
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="app-navbar__nav" aria-label="Main Navigation">
        <ul class="app-navbar__nav-list">
          <li>
            <NuxtLink to="/" class="app-navbar__nav-link" active-class="active">Home</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/about" class="app-navbar__nav-link" active-class="active">About</NuxtLink>
          </li>
          <li class="has-mega-menu">
            <button
              class="app-navbar__nav-link mega-menu-trigger"
              :class="{ 'mega-active': isMegaMenuOpen }"
              aria-haspopup="dialog"
              :aria-expanded="isMegaMenuOpen"
              @click.stop="toggleMegaMenu"
            >
              Programs
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="arrow-icon">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </li>
          <li>
            <NuxtLink to="/events" class="app-navbar__nav-link" active-class="active">Events</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/blog" class="app-navbar__nav-link" active-class="active">Blog</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/gallery" class="app-navbar__nav-link" active-class="active">Gallery</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/contact" class="app-navbar__nav-link" active-class="active">Contact</NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Action Button -->
      <div class="app-navbar__actions">
        <BaseButton variant="accent" size="sm" to="/contact">
          Enroll Now
        </BaseButton>
      </div>

      <!-- Hamburger Menu (Mobile) -->
      <button
        class="app-navbar__hamburger"
        :aria-expanded="isMobileMenuOpen"
        aria-label="Toggle navigation menu"
        @click="toggleMobileMenu"
      >
        <span class="hamburger-box">
          <span class="hamburger-inner" />
        </span>
      </button>
    </div>

    <!-- Mega Menu -->
    <AppMegaMenu
      :is-open="isMegaMenuOpen"
      :programs="programs"
      @close="closeMegaMenu"
    />

    <!-- Mobile Menu Modal Overlay -->
    <Transition name="fade">
      <div v-if="isMobileMenuOpen" class="mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
        <div class="mobile-menu__content container">
          <ul class="mobile-menu__list">
            <li>
              <NuxtLink to="/" class="mobile-menu__link" active-class="active">Home</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/about" class="mobile-menu__link" active-class="active">About</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/programs" class="mobile-menu__link" active-class="active">Programs</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/events" class="mobile-menu__link" active-class="active">Events</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/blog" class="mobile-menu__link" active-class="active">Blog</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/gallery" class="mobile-menu__link" active-class="active">Gallery</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="mobile-menu__link" active-class="active">Contact</NuxtLink>
            </li>
          </ul>
          <div class="mobile-menu__actions">
            <BaseButton variant="accent" size="lg" to="/contact" class="w-full">
              Enroll Now
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.app-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  z-index: 100;
  display: flex;
  align-items: center;
  transition: background-color 0.3s, border-color 0.3s, backdrop-filter 0.3s;
  border-bottom: 1px solid transparent;
}

@media (max-width: 768px) {
  .app-navbar {
    height: 60px;
  }
}

/* Scrolled & Hero State Modifier Classes */
.app-navbar--scrolled {
  background-color: rgba(250, 250, 248, 0.92);
  border-bottom-color: var(--color-border);
  backdrop-filter: blur(12px);
}
@media (prefers-color-scheme: dark) {
  .app-navbar--scrolled {
    background-color: rgba(10, 10, 10, 0.92);
  }
}

.app-navbar--transparent {
  background-color: transparent;
  border-bottom-color: transparent;
  backdrop-filter: none;
}

.app-navbar__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.app-navbar__logo-link {
  display: flex;
  align-items: center;
}

.app-navbar__logo {
  height: 36px;
  width: auto;
  color: var(--color-brand-primary);
  transition: color 0.3s;
}

@media (max-width: 768px) {
  .app-navbar__logo {
    height: 28px;
  }
}

/* Link color updates relative to header state */
.app-navbar--transparent .app-navbar__logo {
  color: #ffffff;
}

.app-navbar__nav {
  display: block;
}

@media (max-width: 1024px) {
  .app-navbar__nav,
  .app-navbar__actions {
    display: none;
  }
}

.app-navbar__nav-list {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  list-style: none;
}

.app-navbar__nav-link {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  background: none;
  border: none;
  padding: var(--space-1) var(--space-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  transition: color 0.2s;
}

.app-navbar--transparent .app-navbar__nav-link {
  color: rgba(255, 255, 255, 0.85);
}

.app-navbar__nav-link:hover,
.app-navbar__nav-link.active,
.app-navbar--transparent .app-navbar__nav-link:hover,
.app-navbar--transparent .app-navbar__nav-link.active {
  color: var(--color-brand-accent);
}

.mega-menu-trigger .arrow-icon {
  transition: transform 0.2s;
}

.mega-menu-trigger.mega-active .arrow-icon {
  transform: rotate(180deg);
}

/* Mobile Hamburger Menu */
.app-navbar__hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  z-index: 101;
}

@media (max-width: 1024px) {
  .app-navbar__hamburger {
    display: block;
  }
}

.hamburger-box {
  width: 24px;
  height: 18px;
  display: inline-block;
  position: relative;
}

.hamburger-inner,
.hamburger-inner::before,
.hamburger-inner::after {
  width: 24px;
  height: 2px;
  background-color: var(--color-brand-primary);
  position: absolute;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.app-navbar--transparent .hamburger-inner,
.app-navbar--transparent .hamburger-inner::before,
.app-navbar--transparent .hamburger-inner::after {
  background-color: #ffffff;
}

.hamburger-inner {
  top: 50%;
  transform: translateY(-50%);
}

.hamburger-inner::before,
.hamburger-inner::after {
  content: "";
  display: block;
}

.hamburger-inner::before {
  top: -8px;
}

.hamburger-inner::after {
  bottom: -8px;
}

/* Hamburger open state */
.app-navbar--menu-open .hamburger-inner {
  transform: rotate(45deg);
  background-color: var(--color-brand-primary) !important;
}

.app-navbar--menu-open .hamburger-inner::before {
  top: 0;
  opacity: 0;
}

.app-navbar--menu-open .hamburger-inner::after {
  bottom: 0;
  transform: rotate(-90deg);
  background-color: var(--color-brand-primary) !important;
}

/* Mobile Menu Panel */
.mobile-menu {
  position: fixed;
  inset: 0;
  background-color: var(--color-surface);
  z-index: 100;
  padding-top: 80px;
  display: flex;
  flex-direction: column;
}

.mobile-menu__content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: var(--space-10);
  justify-content: space-between;
}

.mobile-menu__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.mobile-menu__link {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-brand-primary);
  text-decoration: none;
  padding: var(--space-2) 0;
  display: block;
  border-bottom: 1px solid var(--color-border);
  transition: color 0.2s;
}

.mobile-menu__link:hover,
.mobile-menu__link.active {
  color: var(--color-brand-accent);
}

.mobile-menu__actions {
  margin-top: var(--space-6);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
