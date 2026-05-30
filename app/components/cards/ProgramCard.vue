<script setup lang="ts">
import BaseBadge from '~/components/ui/BaseBadge.vue'
import { onMounted, onUnmounted, ref } from 'vue'

interface Program {
  title: string
  slug: string
  description: string
  coverImageUrl: string
  isFeatured?: boolean
  subtitle?: string
}

const props = defineProps<{
  program: Program
}>()

const coverSrc = useProgramCoverSrc(() => props.program.coverImageUrl)

const cardRef = ref<HTMLElement | null>(null)

const handleMouseMove = (e: MouseEvent) => {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  cardRef.value.style.setProperty('--mouse-x', `${x}px`)
  cardRef.value.style.setProperty('--mouse-y', `${y}px`)
}

onMounted(() => {
  if (cardRef.value) {
    cardRef.value.addEventListener('mousemove', handleMouseMove as EventListener)
  }
})

onUnmounted(() => {
  if (cardRef.value) {
    cardRef.value.removeEventListener('mousemove', handleMouseMove as EventListener)
  }
})
</script>

<template>
  <article 
    ref="cardRef"
    class="program-card-pro" 
    :class="{ 'program-card-pro--featured': program.isFeatured }"
  >
    <div class="program-card-pro__glow"></div>
    
    <div class="program-card-pro__image-container">
      <img
        :src="coverSrc"
        :alt="program.title"
        class="program-card-pro__image"
        loading="lazy"
        width="400"
        height="300"
      >
      <div class="program-card-pro__image-overlay"></div>
      <div v-if="program.isFeatured" class="program-card-pro__featured-badge">
        <BaseBadge type="featured" label="Featured" />
      </div>
    </div>

    <div class="program-card-pro__content">
      <div class="program-card-pro__meta">
        <span class="program-card-pro__duration">
          <i class="bi bi-mortarboard"></i>
          ND1 – HND2 Path
        </span>
      </div>

      <h3 class="program-card-pro__title">
        {{ program.title }}
      </h3>

      <!-- <p v-if="program.subtitle" class="program-card-pro__subtitle">
        {{ program.subtitle }}
      </p> -->

      <p class="program-card-pro__description">
        {{ program.description }}
      </p>

      <div class="program-card-pro__footer">
        <NuxtLink :to="`/programs/${program.slug}`" class="program-card-pro__link">
          <span>View Track Details</span>
          <div class="arrow-circle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════
   PREMIUM LIGHT-MODE CARD (PRO)
   ═══════════════════════════════════════════════════ */
.program-card-pro {
  position: relative;
  background: #ffffff;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), 
              box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Mouse-tracking spotlight border */
.program-card-pro::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: radial-gradient(
    600px circle at var(--mouse-x, 0) var(--mouse-y, 0),
    rgba(107, 89, 255, 0.15),
    transparent 40%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: 10;
}

.program-card-pro:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 
              0 1px 3px rgba(0, 0, 0, 0.05);
}

.program-card-pro:hover::before {
  opacity: 1;
}

.program-card-pro--featured {
  border: 1px solid rgba(107, 89, 255, 0.2);
}

/* ─── Image Section ─── */
.program-card-pro__image-container {
  position: relative;
  width: 100%;
  padding-top: 65%; /* Sleeker widescreen ratio */
  overflow: hidden;
  background-color: var(--color-surface-inset);
}

.program-card-pro__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.program-card-pro__image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%);
  pointer-events: none;
}

.program-card-pro:hover .program-card-pro__image {
  transform: scale(1.08) rotate(1deg);
}

.program-card-pro__featured-badge {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
  z-index: 2;
  backdrop-filter: blur(8px);
  border-radius: var(--radius-full);
}

/* ─── Content Section ─── */
.program-card-pro__content {
  padding: clamp(1.25rem, 5vw, 2rem);
  display: flex;
  flex-direction: column;
  flex: 1;
  background: linear-gradient(to bottom, #ffffff 0%, #fafafa 100%);
  position: relative;
  z-index: 2;
}

.program-card-pro__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.program-card-pro__duration {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.program-card-pro__title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-brand-primary);
  margin-top: 0;
  margin-bottom: var(--space-2);
  line-height: var(--leading-tight);
}

.program-card-pro__subtitle {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-brand-accent);
  margin: 0 0 var(--space-2);
  line-height: var(--leading-snug);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.program-card-pro__description {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  margin-top: 0;
  margin-bottom: var(--space-8);
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ─── Footer Action ─── */
.program-card-pro__footer {
  margin-top: auto;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: var(--space-5);
}

.program-card-pro__link {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: var(--text-sm);
  color: var(--color-brand-primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.arrow-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-brand-primary);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.program-card-pro:hover .program-card-pro__link {
  color: #6B59FF;
}

.program-card-pro:hover .arrow-circle {
  background: #6B59FF;
  color: #fff;
  transform: translateX(4px) scale(1.1);
}
</style>
