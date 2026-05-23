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
const emit = defineEmits(['close'])

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

// Group programs by level for structured display
const groupedPrograms = computed(() => {
  const groups: Record<string, ProgramItem[]> = {
    beginner: [],
    intermediate: [],
    advanced: []
  }
  props.programs.forEach(prog => {
    if (prog.level in groups) {
      groups[prog.level].push(prog)
    } else {
      groups.beginner.push(prog)
    }
  })
  return groups
})
</script>

<template>
  <Transition name="slide-fade">
    <div
      v-if="isOpen"
      class="mega-menu"
      role="dialog"
      aria-label="Programs Menu"
      @keydown="handleKeydown"
    >
      <div class="mega-menu__backdrop" @click="emit('close')" />
      
      <div class="mega-menu__content container">
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="mega-menu__grid">
          <!-- Beginner level -->
          <div class="mega-menu__col">
            <div class="mega-menu__col-header">
              <span class="mega-menu__level-dot level-dot--beginner" />
              <h4>Beginner</h4>
            </div>
            <p class="mega-menu__col-desc">Foundation courses. No prior tech experience needed.</p>
            <ul class="mega-menu__list">
              <li v-for="prog in groupedPrograms.beginner" :key="prog.id">
                <NuxtLink :to="`/programs/${prog.slug}`" class="mega-menu__link" @click="emit('close')">
                  <span class="mega-menu__link-title">{{ prog.title }}</span>
                  <span class="mega-menu__link-meta">{{ prog.durationWeeks }} weeks</span>
                </NuxtLink>
              </li>
              <li v-if="groupedPrograms.beginner.length === 0" class="mega-menu__empty">
                No beginner courses scheduled.
              </li>
            </ul>
          </div>

          <!-- Intermediate level -->
          <div class="mega-menu__col">
            <div class="mega-menu__col-header">
              <span class="mega-menu__level-dot level-dot--intermediate" />
              <h4>Intermediate</h4>
            </div>
            <p class="mega-menu__col-desc">Intermediate skill development. Builds on foundation topics.</p>
            <ul class="mega-menu__list">
              <li v-for="prog in groupedPrograms.intermediate" :key="prog.id">
                <NuxtLink :to="`/programs/${prog.slug}`" class="mega-menu__link" @click="emit('close')">
                  <span class="mega-menu__link-title">{{ prog.title }}</span>
                  <span class="mega-menu__link-meta">{{ prog.durationWeeks }} weeks</span>
                </NuxtLink>
              </li>
              <li v-if="groupedPrograms.intermediate.length === 0" class="mega-menu__empty">
                No intermediate courses scheduled.
              </li>
            </ul>
          </div>

          <!-- Advanced level -->
          <div class="mega-menu__col">
            <div class="mega-menu__col-header">
              <span class="mega-menu__level-dot level-dot--advanced" />
              <h4>Advanced</h4>
            </div>
            <p class="mega-menu__col-desc">Professional specializations and intensive incubation.</p>
            <ul class="mega-menu__list">
              <li v-for="prog in groupedPrograms.advanced" :key="prog.id">
                <NuxtLink :to="`/programs/${prog.slug}`" class="mega-menu__link" @click="emit('close')">
                  <span class="mega-menu__link-title">{{ prog.title }}</span>
                  <span class="mega-menu__link-meta">{{ prog.durationWeeks }} weeks</span>
                </NuxtLink>
              </li>
              <li v-if="groupedPrograms.advanced.length === 0" class="mega-menu__empty">
                No advanced courses scheduled.
              </li>
            </ul>
          </div>

          <!-- Spotlight / CTA Column -->
          <div class="mega-menu__spotlight">
            <div class="spotlight-card">
              <h5>Admissions Open</h5>
              <p>Ready to launch your journey in tech and business innovation? Applications are active for the next cohort.</p>
              <BaseButton variant="accent" size="sm" to="/contact" @click="emit('close')">
                Apply Now
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
  top: 72px; /* AppNavbar height on desktop */
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .mega-menu {
    top: 60px;
  }
}

.mega-menu__backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(23, 23, 23, 0.18);
  backdrop-filter: blur(4px);
}

.mega-menu__content {
  position: relative;
  background: var(--color-surface-muted);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
  padding-top: var(--space-8);
  padding-bottom: var(--space-12);
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  z-index: 100;
}

.mega-menu__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-8);
}

.mega-menu__title {
  margin-top: var(--space-1);
  color: var(--color-brand-primary);
}

.mega-menu__close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: background-color 0.2s, color 0.2s;
}

.mega-menu__close-btn:hover {
  background-color: var(--color-surface-muted);
  color: var(--color-brand-primary);
}

.mega-menu__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8);
}

@media (max-width: 1024px) {
  .mega-menu__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
}

@media (max-width: 640px) {
  .mega-menu__grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}

.mega-menu__col {
  display: flex;
  flex-direction: column;
}

.mega-menu__col-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.mega-menu__col-header h4 {
  color: var(--color-brand-primary);
  margin: 0;
  font-family: var(--font-display);
}

.mega-menu__col-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
  line-height: var(--leading-snug);
}

.mega-menu__level-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.level-dot--beginner {
  background-color: var(--color-brand-secondary);
}

.level-dot--intermediate {
  background-color: var(--color-brand-accent);
}

.level-dot--advanced {
  background-color: var(--color-brand-primary);
}

.mega-menu__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.mega-menu__link {
  display: flex;
  flex-direction: column;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: background-color 0.2s;
}

.mega-menu__link:hover {
  background-color: var(--color-surface-muted);
}

.mega-menu__link-title {
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-text-dark);
}

.mega-menu__link-meta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.mega-menu__empty {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-style: italic;
  padding: var(--space-2);
}

.mega-menu__spotlight {
  grid-column: span 1;
}

@media (max-width: 1024px) {
  .mega-menu__spotlight {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .mega-menu__spotlight {
    grid-column: span 1;
  }
}

.spotlight-card {
  background-color: var(--color-surface-muted);
  border: 1px dashed var(--color-brand-accent);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: var(--space-4);
}

.spotlight-card h5 {
  color: var(--color-brand-primary);
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-lg);
}

.spotlight-card p {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-snug);
  margin: 0;
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
