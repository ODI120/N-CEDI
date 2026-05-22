<script setup lang="ts">
interface TeamMember {
  name: string
  role: string
  bio?: string
  avatarUrl?: string
  linkedinUrl?: string
}

defineProps<{
  member: TeamMember
}>()
</script>

<template>
  <div class="team-card">
    <div class="team-card__avatar-container">
      <NuxtImg
        v-if="member.avatarUrl"
        :src="member.avatarUrl"
        :alt="member.name"
        class="team-card__avatar"
        loading="lazy"
        width="150"
        height="150"
        format="webp"
      />
      <div v-else class="team-card__avatar-fallback">
        {{ member.name.charAt(0) }}
      </div>
    </div>

    <h3 class="team-card__name">{{ member.name }}</h3>
    <p class="team-card__role">{{ member.role }}</p>
    <p v-if="member.bio" class="team-card__bio">{{ member.bio }}</p>

    <div v-if="member.linkedinUrl" class="team-card__social">
      <a :href="member.linkedinUrl" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" class="team-card__social-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      </a>
    </div>
  </div>
</template>

<style scoped>
.team-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8) var(--space-6);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.team-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.team-card__avatar-container {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-6);
  border: 2px solid var(--color-brand-accent);
  background-color: var(--color-surface-inset);
  flex-shrink: 0;
}

.team-card__avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-card__avatar-fallback {
  width: 100%;
  height: 100%;
  background-color: var(--color-primary-100);
  color: var(--color-brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-2xl);
}

.team-card__name {
  font-family: var(--font-display);
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-brand-primary);
  margin: 0 0 var(--space-1) 0;
}

.team-card__role {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-brand-secondary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  margin: 0 0 var(--space-4) 0;
}

.team-card__bio {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--space-6) 0;
  flex: 1;
}

.team-card__social {
  margin-top: auto;
}

.team-card__social-link {
  color: var(--color-text-muted);
  transition: color 0.2s;
  padding: var(--space-1);
  display: inline-flex;
}

.team-card__social-link:hover {
  color: var(--color-brand-primary);
}
</style>
