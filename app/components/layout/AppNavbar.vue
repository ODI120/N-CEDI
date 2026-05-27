<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import AppLogo from '~/components/AppLogo.vue'
  import AppMegaMenu from '~/components/layout/AppMegaMenu.vue'

  const route = useRoute()

  const navbarClass = computed(() => {
    return {
      'app-navbar--menu-open': isMobileMenuOpen.value
    }
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
          <li class="has-mega-menu" @mouseenter="handleMegaHover(true)" @mouseleave="handleMegaHover(false)">
            <button
              class="app-navbar__nav-link mega-menu-trigger"
              :class="{ 'mega-active': isMegaMenuOpen }"
              aria-haspopup="dialog"
              :aria-expanded="isMegaMenuOpen"
              :aria-controls="'mega-menu'"
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

      <!-- Action Button Removed per instructions -->

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

    <!-- Full Screen Mobile Menu -->
    <Transition name="fade-scale">
      <div v-if="isMobileMenuOpen" class="mobile-menu-fullscreen" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
        
        <div class="mobile-menu-fullscreen__header">
          <NuxtLink to="/" class="mobile-menu-fullscreen__logo-link" @click="toggleMobileMenu">
            <AppLogo class="app-navbar__logo" />
          </NuxtLink>
          <button class="mobile-menu-fullscreen__close" @click="toggleMobileMenu" aria-label="Close navigation menu">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="mobile-menu-fullscreen__body">
          <ul class="mobile-menu__list">
            <li :style="{ animationDelay: '0.1s' }" class="nav-item-animate">
              <NuxtLink to="/" class="mobile-menu__link" active-class="active" @click="toggleMobileMenu">Home</NuxtLink>
            </li>
            <li :style="{ animationDelay: '0.15s' }" class="nav-item-animate">
              <NuxtLink to="/about" class="mobile-menu__link" active-class="active" @click="toggleMobileMenu">About</NuxtLink>
            </li>
            <li :style="{ animationDelay: '0.2s' }" class="nav-item-animate">
              <NuxtLink to="/programs" class="mobile-menu__link" active-class="active" @click="toggleMobileMenu">Programs</NuxtLink>
            </li>
            <li :style="{ animationDelay: '0.25s' }" class="nav-item-animate">
              <NuxtLink to="/events" class="mobile-menu__link" active-class="active" @click="toggleMobileMenu">Events</NuxtLink>
            </li>
            <li :style="{ animationDelay: '0.3s' }" class="nav-item-animate">
              <NuxtLink to="/blog" class="mobile-menu__link" active-class="active" @click="toggleMobileMenu">Blog</NuxtLink>
            </li>
            <li :style="{ animationDelay: '0.35s' }" class="nav-item-animate">
              <NuxtLink to="/gallery" class="mobile-menu__link" active-class="active" @click="toggleMobileMenu">Gallery</NuxtLink>
            </li>
            <li :style="{ animationDelay: '0.4s' }" class="nav-item-animate">
              <NuxtLink to="/contact" class="mobile-menu__link" active-class="active" @click="toggleMobileMenu">Contact</NuxtLink>
            </li>
          </ul>
        </div>
        
        <div class="mobile-menu-fullscreen__footer">
          <p>&copy; {{ new Date().getFullYear() }} N-CEDI.</p>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.app-navbar {
  position: fixed;
  top: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - var(--space-8));
  max-width: 1200px;
  height: 64px;
  z-index: 100;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(14px);
  background-color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-full);
  /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); */
}

@media (max-width: 768px) {
  .app-navbar {
    height: 60px;
    top: var(--space-2);
    width: calc(100% - var(--space-4));
  }
}



.app-navbar__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 var(--space-6);
}

@media (max-width: 768px) {
  .app-navbar__container {
    padding: 0 var(--space-4);
  }
}

.app-navbar__logo-link {
  display: flex;
  align-items: center;
}

.app-navbar__logo {
  height: 32px;
  width: auto;
  color: var(--color-brand-primary);
  transition: color 0.3s;
}

@media (max-width: 768px) {
  .app-navbar__logo {
    height: 24px;
  }
}

.app-navbar__nav {
  display: flex;
  flex: 1;
  justify-content: center;
}

@media (max-width: 1024px) {
  .app-navbar__nav {
    display: none;
  }
}

.app-navbar__nav-list {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  list-style: none;
}

.app-navbar__nav-link {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-decoration: none;
  background: transparent;
  border: none;
  padding: 4px 12px ;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.app-navbar__nav-link:hover {
  color: var(--color-brand-primary);
  background-color: #6B59FF10;
}
.app-navbar__nav-list{
  background-color: #6B59FF08;
  border-radius: 50px;
  padding: 4px;
  border: 1px solid #6B59FF18;
}

.app-navbar__nav-link.active {
  color: var(--color-brand-accent);
  background-color: #6B59FF25;
  font-weight: 500;
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

/* ═══════════════════════════════════════════════════
   FULL-SCREEN MOBILE MENU
   ═══════════════════════════════════════════════════ */

.mobile-menu-fullscreen {
  position: fixed;
  inset: 0;
  background: #ffffff; /* Solid and accessible background */
  z-index: 200; /* Above everything */
  display: flex;
  flex-direction: column;
  height: 100vh; /* Fill entire screen */
  height: 100dvh; /* For mobile browsers with dynamic UI */
  overflow: hidden;
}

.mobile-menu-fullscreen__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  height: 72px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.mobile-menu-fullscreen__logo-link {
  display: flex;
  align-items: center;
}

.mobile-menu-fullscreen__close {
  background: none;
  border: none;
  color: var(--color-text-dark);
  cursor: pointer;
  padding: 8px;
  margin-right: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s, color 0.2s;
}

.mobile-menu-fullscreen__close:hover {
  background-color: var(--color-surface-muted);
  color: var(--color-brand-accent);
}

.mobile-menu-fullscreen__body {
  /* flex: 1; */
  display: flex;
  align-items: center; /* Center vertically */
  justify-content: center; /* Center horizontally */
  overflow-y: auto;
  padding: 24px;
}

.mobile-menu__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 24px; /* Generous spacing for touch accessibility */
  align-items: center;
  width: 100%;
}

.mobile-menu__link {
  font-family: var(--font-display);
  font-size: 1rem; /* Accessible, readable font size (24px) */
  font-weight: 700;
  color: var(--color-text-dark);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  text-align: center;
}

.mobile-menu__link:hover,
.mobile-menu__link.active {
  color: var(--color-brand-accent);
  background-color: rgba(107, 89, 255, 0.08); /* Soft highlight */
  transform: scale(1.05); /* Gentle pop instead of slide */
}

.mobile-menu-fullscreen__footer {
  padding: 24px;
  text-align: center;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

/* Transitions and Animations */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98); /* Slight zoom effect for modern feel */
}

.nav-item-animate {
  animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
