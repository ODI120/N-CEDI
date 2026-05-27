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
      <div
        v-else
        class="team-card__avatar-fallback"
      >
        {{ member.name.charAt(0) }}
      </div>
    </div>

    <h3 class="team-card__name">
      {{ member.name }}
    </h3>
    <p class="team-card__role">
      {{ member.role }}
    </p>
    <p
      v-if="member.bio"
      class="team-card__bio"
    >
      {{ member.bio }}
    </p>

    <div
      v-if="member.linkedinUrl"
      class="team-card__social"
    >
      <a
        :href="member.linkedinUrl"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn profile"
        class="team-card__social-link"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect
            x="2"
            y="9"
            width="4"
            height="12"
          />
          <circle
            cx="4"
            cy="4"
            r="2"
          />
        </svg>
      </a>
    </div>
  </div>
</template>

<style scoped>
.team-card {
  background-color: #0d121f;
  background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1.2px, transparent 1.2px);
  background-size: 16px 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--space-8) var(--space-6);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.team-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  border-color: var(--color-brand-accent);
}

.team-card__avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: var(--radius-full);
  margin-bottom: var(--space-6);
  border: 2px solid rgba(255, 255, 255, 0.15);
  padding: 4px;
  background-color: #161c2a;
  flex-shrink: 0;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.team-card__avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-full);
  transition: transform 0.5s ease;
}

.team-card:hover .team-card__avatar-container {
  transform: scale(1.03);
  border-color: var(--color-brand-accent);
}

.team-card:hover .team-card__avatar {
  transform: scale(1.05);
}

.team-card__avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-full);
  background-color: #161c2a;
  color: var(--color-text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-2xl);
}

.team-card__name {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 800;
  color: var(--color-text-light);
  margin: 0 0 var(--space-1) 0;
}

.team-card__role {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-brand-accent);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  margin: 0 0 var(--space-4) 0;
}

.team-card__bio {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.7);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--space-6) 0;
  flex: 1;
}

.team-card__social {
  margin-top: auto;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.team-card:hover .team-card__social {
  opacity: 1;
}

.team-card__social-link {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.team-card__social-link:hover {
  color: #000;
  background-color: var(--color-text-light);
  border-color: var(--color-text-light);
  transform: scale(1.08);
}
</style>
