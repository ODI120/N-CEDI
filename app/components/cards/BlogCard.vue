<script setup lang="ts">
import { formatDate } from '~/utils/formatDate'

interface Author {
  name: string
  avatarUrl?: string
  role?: string
}

interface Category {
  name: string
  slug: string
}

interface Post {
  title: string
  slug: string
  excerpt: string
  coverImageUrl: string
  publishedAt: string
  readTimeMinutes: number
  author?: Author
  category?: Category
}

defineProps<{
  post: Post
}>()
</script>

<template>
  <article class="blog-card">
    <div class="blog-card__image-container">
      <NuxtImg
        :src="post.coverImageUrl || '/og/default.jpg'"
        :alt="post.title"
        class="blog-card__image"
        loading="lazy"
        width="450"
        height="300"
        format="webp"
      />
      <div v-if="post.category" class="blog-card__category">
        {{ post.category.name }}
      </div>
    </div>

    <div class="blog-card__content">
      <div class="blog-card__meta">
        <span>{{ formatDate(post.publishedAt) }}</span>
        <span class="blog-card__bullet">•</span>
        <span>{{ post.readTimeMinutes }} min read</span>
      </div>

      <h3 class="blog-card__title">
        <NuxtLink :to="`/blog/${post.slug}`" class="blog-card__title-link">
          {{ post.title }}
        </NuxtLink>
      </h3>

      <p class="blog-card__excerpt">
        {{ post.excerpt }}
      </p>

      <div v-if="post.author" class="blog-card__author">
        <NuxtImg
          v-if="post.author.avatarUrl"
          :src="post.author.avatarUrl"
          :alt="post.author.name"
          class="blog-card__author-avatar"
          width="32"
          height="32"
        />
        <div v-else class="blog-card__author-avatar-fallback">
          {{ post.author.name.charAt(0) }}
        </div>
        <div class="blog-card__author-info">
          <span class="blog-card__author-name">{{ post.author.name }}</span>
          <span v-if="post.author.role" class="blog-card__author-role">{{ post.author.role }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.blog-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform, box-shadow;
}

.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xs);
}

.blog-card__image-container {
  position: relative;
  width: 100%;
  padding-top: 66.67%; /* 3:2 Aspect Ratio */
  overflow: hidden;
  background-color: var(--color-surface-inset);
}

.blog-card__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.blog-card:hover .blog-card__image {
  transform: scale(1.04);
}

.blog-card__category {
  position: absolute;
  bottom: var(--space-3);
  left: var(--space-3);
  background-color: var(--color-brand-primary);
  color: var(--color-text-light);
  padding: var(--space-1) var(--space-3);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: var(--tracking-wide);
  border-radius: var(--radius-sm);
  z-index: 2;
}

.blog-card__content {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.blog-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

.blog-card__bullet {
  color: var(--color-border);
}

.blog-card__title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-brand-primary);
  margin: 0 0 var(--space-2) 0;
  line-height: var(--leading-snug);
}

.blog-card__title-link {
  color: inherit;
  text-decoration: none;
}

.blog-card__title-link:hover {
  color: var(--color-brand-accent);
}

.blog-card__excerpt {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-normal);
  margin: 0 0 var(--space-5) 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-card__author {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-4);
  margin-top: auto;
}

.blog-card__author-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  object-fit: cover;
  background-color: var(--color-surface-inset);
}

.blog-card__author-avatar-fallback {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background-color: var(--color-surface-inset);
  color: var(--color-brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: var(--text-sm);
}

.blog-card__author-info {
  display: flex;
  flex-direction: column;
}

.blog-card__author-name {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-text-dark);
}

.blog-card__author-role {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
