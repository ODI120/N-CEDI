<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'isomorphic-dompurify'

interface Block {
  type: 'paragraph' | 'heading' | 'image' | 'video' | 'quote' | 'list' | 'embed'
  data: {
    text?: string
    level?: number // for headings
    url?: string // for image, video, embed
    caption?: string // for image, video
    items?: string[] // for lists
    style?: 'unordered' | 'ordered' // for lists
    embedCode?: string // for embeds
  }
}

interface RichTextRendererProps {
  body?: Record<string, any>[] | any
}

const props = withDefaults(defineProps<RichTextRendererProps>(), {
  body: () => []
})

// Normalizes body if it's passed as a JSON string
const blocks = computed<Block[]>(() => {
  if (!props.body) return []
  if (typeof props.body === 'string') {
    try {
      const parsed = JSON.parse(props.body)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return Array.isArray(props.body) ? props.body : []
})

/** Sanitize HTML to prevent XSS from CMS-stored content. */
function sanitize(html: string | undefined): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span', 'sub', 'sup', 'mark', 'code'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  })
}

/** Sanitize embed code — allows iframes for known video providers only. */
function sanitizeEmbed(html: string | undefined): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['iframe'],
    ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow', 'title'],
    ALLOW_DATA_ATTR: false
  })
}
</script>

<template>
  <div class="rich-text-content">
    <template v-for="(block, index) in blocks" :key="index">
      <!-- Paragraph Block -->
      <p
        v-if="block.type === 'paragraph' && block.data?.text"
        class="rich-text-content__paragraph"
        v-html="sanitize(block.data.text)"
      ></p>

      <!-- Heading Block -->
      <component
        :is="`h${block.data?.level || 2}`"
        v-else-if="block.type === 'heading' && block.data?.text"
        class="rich-text-content__heading"
        :class="`rich-text-content__heading--h${block.data?.level || 2}`"
        v-html="sanitize(block.data.text)"
      ></component>

      <!-- Quote Block -->
      <blockquote
        v-else-if="block.type === 'quote' && block.data?.text"
        class="rich-text-content__quote"
      >
        <p class="rich-text-content__quote-text" v-html="sanitize(block.data.text)"></p>
        <cite v-if="block.data.caption" class="rich-text-content__quote-caption">
          {{ block.data.caption }}
        </cite>
      </blockquote>

      <!-- List Block -->
      <component
        :is="block.data?.style === 'ordered' ? 'ol' : 'ul'"
        v-else-if="block.type === 'list' && block.data?.items?.length"
        class="rich-text-content__list"
        :class="[
          block.data?.style === 'ordered'
            ? 'rich-text-content__list--ordered'
            : 'rich-text-content__list--unordered'
        ]"
      >
        <li
          v-for="(item, itemIndex) in block.data.items"
          :key="itemIndex"
          class="rich-text-content__list-item"
          v-html="sanitize(item)"
        ></li>
      </component>

      <!-- Image Block -->
      <figure
        v-else-if="block.type === 'image' && block.data?.url"
        class="rich-text-content__image-wrapper"
      >
        <NuxtImg
          :src="block.data.url"
          :alt="block.data.caption || 'CMS Image'"
          sizes="sm:100vw md:80vw lg:60vw xl:800px"
          format="webp,avif"
          class="rich-text-content__image"
          loading="lazy"
        />
        <figcaption v-if="block.data.caption" class="rich-text-content__image-caption">
          {{ block.data.caption }}
        </figcaption>
      </figure>

      <!-- Video Block -->
      <figure
        v-else-if="block.type === 'video' && block.data?.url"
        class="rich-text-content__video-wrapper"
      >
        <video
          :src="block.data.url"
          controls
          preload="metadata"
          class="rich-text-content__video"
        ></video>
        <figcaption v-if="block.data.caption" class="rich-text-content__video-caption">
          {{ block.data.caption }}
        </figcaption>
      </figure>

      <!-- Embed Block -->
      <div
        v-else-if="block.type === 'embed' && (block.data?.embedCode || block.data?.url)"
        class="rich-text-content__embed-wrapper"
      >
        <div v-if="block.data.embedCode" v-html="sanitizeEmbed(block.data.embedCode)"></div>
        <iframe
          v-else-if="block.data.url"
          :src="block.data.url"
          frameborder="0"
          allowfullscreen
          class="rich-text-content__iframe"
        ></iframe>
      </div>
    </template>
  </div>
</template>

<style scoped>
.rich-text-content {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  max-width: 800px;
  margin: 0 auto;
}

.rich-text-content__paragraph {
  margin-top: 0;
  margin-bottom: var(--space-6);
}

.rich-text-content__heading {
  font-family: var(--font-display);
  color: var(--color-brand-primary);
  font-weight: 700;
  line-height: var(--leading-tight);
  margin-top: var(--space-10);
  margin-bottom: var(--space-4);
}

.rich-text-content__heading--h1 {
  font-size: var(--text-3xl);
  font-weight: 800;
}

.rich-text-content__heading--h2 {
  font-size: var(--text-2xl);
}

.rich-text-content__heading--h3 {
  font-size: var(--text-xl);
}

.rich-text-content__heading--h4 {
  font-size: var(--text-lg);
}

.rich-text-content__heading--h5,
.rich-text-content__heading--h6 {
  font-size: var(--text-base);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.rich-text-content__quote {
  border-left: 4px solid var(--color-brand-accent);
  padding-left: var(--space-6);
  margin: var(--space-8) 0;
  font-style: italic;
  background-color: var(--color-surface-muted);
  padding-top: var(--space-4);
  padding-bottom: var(--space-4);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
}

.rich-text-content__quote-text {
  font-size: var(--text-lg);
  color: var(--color-brand-primary);
  line-height: var(--leading-snug);
  margin: 0 0 var(--space-2) 0;
}

.rich-text-content__quote-caption {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  font-style: normal;
  color: var(--color-text-muted);
}

.rich-text-content__list {
  margin-top: 0;
  margin-bottom: var(--space-6);
  padding-left: var(--space-6);
}

.rich-text-content__list--unordered {
  list-style-type: square;
}

.rich-text-content__list--ordered {
  list-style-type: decimal;
}

.rich-text-content__list-item {
  margin-bottom: var(--space-2);
}

.rich-text-content__image-wrapper,
.rich-text-content__video-wrapper {
  margin: var(--space-8) 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rich-text-content__image,
.rich-text-content__video {
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
}

.rich-text-content__image-caption,
.rich-text-content__video-caption {
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: center;
}

.rich-text-content__embed-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  margin: var(--space-8) 0;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
  border: 1px solid var(--color-border);
}

.rich-text-content__iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
