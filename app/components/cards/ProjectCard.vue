<script setup lang="ts">
interface Project {
  title: string
  slug: string
  description: string
  studentName: string
  mediaUrls: string[]
  tags: string[]
  year: number
  programName?: string
}

defineProps<{
  project: Project
}>()
</script>

<template>
  <article class="project-card">
    <div class="project-card__image-container">
      <NuxtImg
        :src="project.mediaUrls?.[0] || '/og/default.jpg'"
        :alt="project.title"
        class="project-card__image"
        loading="lazy"
        width="400"
        height="400"
        format="webp"
      />
      <div class="project-card__overlay">
        <div class="project-card__overlay-content">
          <span class="project-card__student">By {{ project.studentName }}</span>
          <h3 class="project-card__title">{{ project.title }}</h3>
          <p class="project-card__desc">{{ project.description }}</p>
          <NuxtLink :to="`/projects/${project.slug}`" class="project-card__link">
            <span>View Project</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
    
    <div class="project-card__footer">
      <span class="project-card__program">{{ project.programName || 'Incubator Project' }}</span>
      <span class="project-card__year">{{ project.year }}</span>
    </div>
  </article>
</template>

<style scoped>
.project-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.3s;
}

.project-card:hover {
  border-color: var(--color-brand-accent);
}

.project-card__image-container {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  overflow: hidden;
  background-color: var(--color-surface-inset);
}

.project-card__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.project-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10, 37, 64, 0.95) 0%, rgba(10, 37, 64, 0.4) 100%);
  opacity: 0;
  display: flex;
  align-items: flex-end;
  padding: var(--space-6);
  transition: opacity 0.3s ease;
  z-index: 2;
}

.project-card:hover .project-card__overlay {
  opacity: 1;
}

.project-card:hover .project-card__image {
  transform: scale(1.05);
}

.project-card__overlay-content {
  color: var(--color-text-inverse);
  transform: translateY(20px);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;
}

.project-card:hover .project-card__overlay-content {
  transform: translateY(0);
}

.project-card__student {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--color-brand-accent);
  display: block;
  margin-bottom: var(--space-1);
}

.project-card__title {
  font-family: var(--font-display);
  font-size: var(--text-md);
  font-weight: 700;
  margin: 0 0 var(--space-2) 0;
  line-height: var(--leading-snug);
}

.project-card__desc {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: rgba(245, 245, 240, 0.8);
  line-height: var(--leading-normal);
  margin: 0 0 var(--space-4) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-card__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: var(--text-xs);
  color: var(--color-brand-accent);
  text-decoration: none;
}

.project-card__footer {
  padding: var(--space-4) var(--space-5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-surface-muted);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.project-card__program {
  max-width: 70%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-card__year {
  color: var(--color-text-muted);
}
</style>
