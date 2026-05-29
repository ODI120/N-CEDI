<script setup lang="ts">
import { computed } from 'vue'

interface ProgramItem {
  id: string
  title: string
  slug: string
  subtitle?: string
  level: string
  durationWeeks: number
}

interface AppMegaMenuProps {
  isOpen: boolean
  programs: ProgramItem[]
}

const props = defineProps<AppMegaMenuProps>()
const emit = defineEmits<{
  close: []
  pointerenter: []
  pointerleave: []
}>()

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

</script>

<template>
  <Transition name="dropdown-fade">
    <div
      v-if="isOpen"
      id="mega-menu"
      class="mega-menu"
      role="dialog"
      aria-label="Programs Menu"
      aria-modal="true"
      @keydown="handleKeydown"
      @mouseenter="emit('pointerenter')"
      @mouseleave="emit('pointerleave')"
    >
      <!-- Invisible hit area between navbar and panel so hover does not close the menu -->
      <div class="mega-menu__hover-bridge" aria-hidden="true" />
      <div class="mega-menu__backdrop" @click="emit('close')" />
      
      <div class="mega-menu__card container">
        <div class="mega-menu__header">
          <div>
            <span class="eyebrow">Our Curriculum</span>
            <h3 class="mega-menu__title">Explore Programs by Level</h3>
          </div>
          <button
            class="mega-menu__close-btn"
            aria-label="Close menu"
            @click="emit('close')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="mega-menu__grid">
          <!-- Programs Area -->
          <div class="mega-menu__programs-area">
            <div v-for="prog in programs" :key="prog.id" class="mega-menu__col">
              <NuxtLink :to="`/programs/${prog.slug}`" class="mega-menu__link" @click="emit('close')">
                <span class="mega-menu__link-title">{{ prog.title }}</span>
                <span class="mega-menu__link-meta">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
                  ND1 – HND2 Track
                </span>
              </NuxtLink>
            </div>
            <div v-if="programs.length === 0" class="mega-menu__empty">
              No programs found.
            </div>
          </div>

          <!-- Spotlight / CTA Column (NCAT Advert Spot) -->
          <div class="mega-menu__spotlight">
            <div class="spotlight-card ad-card">
              <div class="ad-badge">Sponsored</div>
              <div class="spotlight-content">
                <h5>Fly High with NCAT</h5>
                <p>Ready to take to the skies? Apply now for NCAT's world-class aircraft piloting, maintenance, and aviation management courses.</p>
              </div>
              <BaseButton variant="accent" size="sm" to="https://ncat.gov.ng" target="_blank" class="w-full justify-center mt-auto" @click="emit('close')">
                Apply to NCAT
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ml-2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.mega-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 110;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: calc(var(--space-4) + 64px + var(--space-2));
  pointer-events: auto;
}

.mega-menu__hover-bridge {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: calc(var(--space-4) + 64px + var(--space-6));
  z-index: 1;
  pointer-events: auto;
}

.mega-menu__backdrop {
  position: fixed;
  inset: 0;
  background-color: transparent;
  z-index: 2;
  pointer-events: auto;
}

.mega-menu__card {
  position: relative;
  background-color: rgba(255, 255, 255, 0.98);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04);
  width: calc(100% - var(--space-8));
  max-width: 1100px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding: var(--space-8);
  z-index: 3;
}

@media (max-width: 768px) {
  .mega-menu {
    padding-top: calc(var(--space-2) + 60px + var(--space-2));
  }
  .mega-menu__card {
    padding: var(--space-6);
    border-radius: var(--radius-xl);
  }
}

.mega-menu__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.eyebrow {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--color-brand-accent);
  font-weight: 700;
  display: block;
  margin-bottom: var(--space-1);
}

.mega-menu__title {
  margin: 0;
  color: var(--color-brand-primary);
  font-size: var(--text-2xl);
  font-weight: 800;
}

.mega-menu__close-btn {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  cursor: pointer;
  color: var(--color-text-muted);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.mega-menu__close-btn:hover {
  background-color: var(--color-brand-primary);
  color: var(--color-text-light);
  border-color: var(--color-brand-primary);
  transform: rotate(90deg);
}

.mega-menu__grid {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: var(--space-8);
}

@media (max-width: 1024px) {
  .mega-menu__grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}

.mega-menu__programs-area {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

@media (max-width: 640px) {
  .mega-menu__programs-area {
    grid-template-columns: 1fr;
  }
}

.mega-menu__col {
  display: flex;
  flex-direction: column;
}

.mega-menu__col-header {
  margin-bottom: var(--space-4);
}

.level-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.level-badge--beginner {
  background-color: rgba(107, 89, 255, 0.1);
  color: var(--color-brand-accent);
}

.level-badge--intermediate {
  background-color: rgba(20, 20, 20, 0.05);
  color: var(--color-text-dark);
}

.level-badge--advanced {
  background-color: var(--color-brand-primary);
  color: var(--color-text-light);
}

.mega-menu__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.mega-menu__link {
  display: flex;
  flex-direction: column;
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  text-decoration: none;
  background-color: transparent;
  border: 1px solid transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.mega-menu__link:hover {
  background-color: var(--color-surface);
  border-color: var(--color-border);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.mega-menu__link-title {
  font-weight: 700;
  font-size: var(--text-sm);
  color: var(--color-brand-primary);
  margin-bottom: var(--space-1);
}

.mega-menu__link-meta {
  font-size: 11px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-weight: 500;
}

.mega-menu__empty {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-style: italic;
  padding: var(--space-2);
}

.mega-menu__spotlight {
  display: flex;
}

.spotlight-card {
  background: linear-gradient(145deg, var(--color-brand-primary), #2a2a2a);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  color: var(--color-text-light);
  width: 100%;
}

.spotlight-content h5 {
  color: var(--color-text-light);
  margin-top: 0;
  margin-bottom: var(--space-2);
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 800;
}

.spotlight-content p {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.8);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-6);
}

/* NCAT Ad Card Styling */
.ad-card {
  background: linear-gradient(145deg, #004d73 0%, #001f33 100%) !important;
  border: 1px solid rgba(0, 141, 209, 0.3) !important;
  position: relative;
}

.ad-badge {
  align-self: flex-start;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: rgba(255, 255, 255, 0.15);
  padding: 3px 6px;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-3);
  color: rgba(255, 255, 255, 0.9);
}

/* Transitions */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
</style>
