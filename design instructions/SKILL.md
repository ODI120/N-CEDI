---
name: n-cedi-elite
description: >
  Master skill for building the N-CEDI Elite website — a world-class, cinematic institutional
  platform for the NCAT Centre for Entrepreneurship Development and Innovation in Nigeria.
  Use this skill whenever the user mentions N-CEDI, asks to build/scaffold/continue the
  institutional website, references the tech stack (Nuxt 4, Supabase, GSAP, Lenis, Tailwind
  CSS v4), or asks to implement any feature, module, page, component, animation, or database
  schema belonging to this project. Also trigger when the user says things like "start the
  project", "generate the backend", "build the hero section", "add the programs page", "set up
  Supabase schema", "add GSAP animations", or any task related to this Awwwards-level
  Nigerian innovation centre website — even if they don't say "N-CEDI" explicitly.
---

# N-CEDI Elite — Master Skill

A cinematic, Awwwards-competitive institutional website for the *NCAT Centre for
Entrepreneurship Development and Innovation* (N-CEDI), Nigeria. This skill encodes the full
architecture: design system, motion system, Supabase schema, component library, SEO, and
deployment config. Every file produced must be complete and production-ready — no TODOs, no
placeholders, no pseudocode.

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Client** | N-CEDI — NCAT Centre for Entrepreneurship Development and Innovation |
| **Location** | Nigeria (government-linked innovation centre) |
| **Domain** | `https://ncedi.edu.ng` |
| **Twitter** | `@ncedi_ng` |
| **Programs** | Fashion Design · Woodwork · Web Design & Development · Computer Hardware · Solar Installation · Bakery & Bead Making |

### Business Goals (priority order)
1. Government credibility & institutional trust
2. Partnership and sponsorship attraction
3. Public awareness & student enrollment
4. Event and workshop promotion
5. Showcasing student projects and innovation

### Aesthetic Brief
- **Cinematic** — story-driven, immersive, motion-forward
- **Institutional** — trustworthy, structured, authoritative
- **Premium** — Awwwards-competitive, pixel-perfect, detail-obsessed
- **Culturally rooted** — modern African innovation aesthetic, not generic Western corporate

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Nuxt 4 (Nuxt 3 compatible) | `compatibilityVersion: 4` |
| UI Language | Vue 3 + TypeScript  | Composition API only |
| Styling | Tailwind CSS v4 | JIT, custom tokens via CSS variables |
| Animation | GSAP 3 + ScrollTrigger | Complex timelines and scroll scenes |
| Motion Directives | `@vueuse/motion` | Component-level declarative motion |
| Smooth Scroll | Lenis | Integrated with GSAP ticker |
| Backend | Supabase | Auth, Postgres, Storage, Realtime, Edge Functions |
| Deployment | Vercel Edge | ISR + Edge Middleware |
| Image CDN | Nuxt Image + Supabase Storage | AVIF/WebP, responsive `srcset` |
| CMS Layer | Supabase as headless CMS | Custom admin dashboard |

---

## 3. Project Structure

```
/
├── app/
│   ├── assets/
│   │   ├── css/           # global.css, tokens.css, typography.css
│   │   └── fonts/         # self-hosted variable fonts
│   ├── components/
│   │   ├── ui/            # Button, Badge, Tag, Icon, Divider
│   │   ├── layout/        # AppNavbar, AppFooter, AppMegaMenu, AppSidebar
│   │   ├── motion/        # MotionWrapper, RevealBlock, ParallaxLayer, MagneticEl
│   │   ├── sections/      # Hero, About, Programs, Events, Partners, CTA, Stats
│   │   ├── cards/         # ProgramCard, EventCard, BlogCard, ProjectCard, TeamCard
│   │   └── cms/           # RichTextRenderer, MediaBlock, EmbedBlock
│   ├── composables/       # useMotion, useLenis, useSupabase, useSeo, useMediaQuery
│   ├── layouts/           # default.vue, minimal.vue, dashboard.vue
│   ├── middleware/        # auth.ts, redirect.ts
│   ├── pages/
│   │   ├── index.vue
│   │   ├── about.vue
│   │   ├── programs/index.vue + [slug].vue
│   │   ├── events/index.vue + [slug].vue
│   │   ├── blog/index.vue + [slug].vue
│   │   ├── gallery.vue
│   │   ├── partners.vue
│   │   ├── contact.vue
│   │   └── admin/         # protected CMS pages (SPA, ssr: false)
│   ├── plugins/           # gsap.client.ts, lenis.client.ts, supabase.ts
│   ├── server/
│   │   ├── api/           # sitemap.ts, contact.ts, rss.ts
│   │   └── middleware/    # rate-limit, CORS
│   └── utils/             # formatDate, slugify, imageUrl, seoDefaults
├── public/fonts/ icons/ og/
├── nuxt.config.ts
├── tailwind.config.ts
├── supabase/migrations/ + seed.sql
└── .env.example
```

---

## 4. Design System

### 4.1 Color Tokens (`assets/css/tokens.css`)

```css
:root {
  --color-brand-primary:   #0A2540;   /* Deep navy — authority */
  --color-brand-accent:    #D4A853;   /* Gold — excellence, African richness */
  --color-brand-secondary: #1A6B4A;   /* Forest green — growth, innovation */

  --color-surface:         #FAFAF8;
  --color-surface-muted:   #F2F0EB;
  --color-border:          #E2DDD6;
  --color-text-primary:    #0D0D0D;
  --color-text-secondary:  #4A4A4A;
  --color-text-muted:      #888880;

  --color-error:   #C0392B;
  --color-success: #1A6B4A;

  @media (prefers-color-scheme: dark) {
    --color-surface:      #0A0A0A;
    --color-text-primary: #F5F5F0;
  }
}
```

### 4.2 Fluid Typography Scale

```css
--text-xs:   clamp(0.75rem,  1.5vw, 0.875rem);
--text-sm:   clamp(0.875rem, 1.8vw, 1rem);
--text-base: clamp(1rem,     2vw,   1.125rem);
--text-lg:   clamp(1.125rem, 2.5vw, 1.25rem);
--text-xl:   clamp(1.25rem,  3vw,   1.5rem);
--text-2xl:  clamp(1.5rem,   4vw,   2rem);
--text-3xl:  clamp(2rem,     5vw,   3rem);
--text-4xl:  clamp(2.5rem,   6vw,   4rem);
--text-hero: clamp(3.5rem,   9vw,   7rem);
```

Fonts: **Syne** (headings, self-hosted variable), **Inter** (body, self-hosted variable).
Both preloaded in `<head>` with `font-display: swap`.

### 4.3 Spacing & Grid
- 8pt system (multiples of 0.5rem)
- 12-column grid, `max-w-[1440px]` container
- Gutters: `px-6 md:px-12 lg:px-24`
- Section rhythm: `py-24 md:py-32 lg:py-40`

### 4.4 Motion Tokens (`constants/motion.ts`)

```ts
export const EASING = {
  smooth:    [0.25, 0.1, 0.25, 1],
  snappy:    [0.77, 0, 0.175, 1],
  bouncy:    [0.34, 1.56, 0.64, 1],
  cinematic: [0.76, 0, 0.24, 1],
}
export const DURATION = { fast: 0.3, base: 0.6, slow: 1.0, cinematic: 1.6 }
export const STAGGER  = { tight: 0.05, base: 0.1, loose: 0.18 }
```

---

## 5. Motion System

**Rule:** All motion must degrade gracefully under `prefers-reduced-motion: reduce`.
Use `useMotionSafe()` composable to gate all GSAP/Lenis code.

### 5.1 Lenis + GSAP Plugin (`plugins/lenis.client.ts`)

```ts
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin(() => {
  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
  gsap.registerPlugin(ScrollTrigger)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop: () => lenis.scroll,
    getBoundingClientRect: () => ({ top: 0, left: 0, width: window.innerWidth, height: window.innerHeight })
  })
  lenis.on('scroll', ScrollTrigger.update)
  return { provide: { lenis } }
})
```

### 5.2 Required Motion Patterns

| Pattern | Implementation |
|---|---|
| Hero text reveal | GSAP SplitText — lines stagger up with clip-path |
| Scroll-triggered fade-up | `MotionWrapper` + ScrollTrigger `toggleActions` |
| Parallax layers | ScrollTrigger `scrub: 1.5` on background layers |
| Magnetic buttons | Mouse proximity + GSAP `quickTo` |
| Horizontal scroll section | GSAP pin + horizontal translation (programs) |
| Page transitions | `definePageMeta` + `<Transition>` with GSAP hooks |
| Counter animation | GSAP `to({val})` on stat numbers on scroll enter |
| Cursor follower | Custom SVG cursor with GSAP `quickTo` lag |
| Image hover zoom | CSS `scale` + GSAP smooth easing override |
| Ambient background | CSS `radial-gradient` animated with GSAP `to` |

### 5.3 `MotionWrapper` Component Props

```ts
interface Props {
  variant?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale'
  delay?: number      // default 0
  duration?: number   // default 0.8
  threshold?: number  // default 0.15
}
```

---

## 6. Supabase Schema

### 6.1 Core Tables (all use UUID PKs, `created_at`/`updated_at` timestamps)

- **programs** — slug, title, subtitle, description, body (jsonb), duration_weeks, level (beginner/intermediate/advanced), is_featured, is_published, cover_image_url, gallery_urls[], meta fields
- **events** — slug, title, description, body (jsonb), event_type (workshop/seminar/exhibition/competition/open_day), starts_at, ends_at, location, is_virtual, meeting_url, cover_image_url, capacity, registration_url, meta fields
- **posts** — slug, title, excerpt, body (jsonb), author_id → team_members, category_id → categories, cover_image_url, read_time_minutes, is_featured, published_at, meta fields
- **testimonials** — name, role, organization, quote, avatar_url, program_id → programs, rating (1–5), is_featured
- **projects** — slug, title, description, student_name, program_id → programs, media_urls[], tags[], year, is_featured
- **partners** — name, website_url, logo_url, tier (platinum/gold/silver/community), is_active, display_order
- **gallery** — title, media_url, media_type (image/video), alt_text, category_id, event_id, program_id, display_order
- **categories** — slug, name, type (blog/gallery/event/program)
- **team_members** — name, role, bio, avatar_url, email, linkedin_url, display_order
- **inquiries** — name, email, phone, subject, message, type (general/partnership/enrollment/media), is_read

### 6.2 RLS Policy Pattern

```sql
-- Public read published content
create policy "public_read_published" on <table>
  for select using (is_published = true);

-- Authenticated admin full access
create policy "admin_full_access" on <table>
  for all using (auth.role() = 'authenticated');
```

Enable RLS on ALL tables.

### 6.3 Storage Buckets (`ncedi-media/`)

Folders: `programs/`, `events/`, `posts/`, `projects/`, `gallery/`, `team/`, `partners/`

Config: public read, authenticated write, 10MB limit, allowed MIME: `image/jpeg, image/png, image/webp, image/avif, video/mp4`

---

## 7. SEO Architecture

### 7.1 Nuxt Modules Required
`@nuxtjs/seo`, `@nuxtjs/sitemap`, `@nuxtjs/robots`, `nuxt-schema-org`, `@nuxt/image`

### 7.2 Route Rules

```ts
routeRules: {
  '/':          { prerender: true },
  '/about':     { prerender: true },
  '/programs/**': { isr: 3600 },
  '/events/**':   { isr: 1800 },
  '/blog/**':     { isr: 3600 },
  '/gallery':     { isr: 7200 },
  '/admin/**':    { ssr: false },   // SPA
}
```

### 7.3 JSON-LD Schemas
Implement on each relevant page: `Organization` (sitewide), `EducationalOrganization` (about), `Course` (program pages), `Event` (event pages), `Article` (blog posts), `BreadcrumbList` (all inner pages), `FAQPage`, `ImageGallery`

### 7.4 `usePageSeo()` Composable Pattern

```ts
useSeoMeta({
  title: `${title} | N-CEDI`,
  ogTitle: `${title} | N-CEDI`,
  description,
  ogImage: image ?? '/og/default.jpg',
  ogType: type ?? 'website',
  twitterCard: 'summary_large_image',
  twitterSite: '@ncedi_ng',
})
```

---

## 8. Component Reference

### Layout
- `AppNavbar` — sticky, blur-on-scroll, mega menu for Programs, transparent on hero
- `AppMegaMenu` — full-width dropdown with program cards + featured event; keyboard navigable (Escape/arrow keys)
- `AppFooter` — 4-column, newsletter signup, social links, sitemap
- `AppCookieBanner` — GDPR-compliant, animates from bottom

### Hero Variants
- `HeroHome` — full-viewport, split layout, video/image BG, GSAP SplitText reveal
- `HeroInner` — 60vh, breadcrumb, parallax subtitle
- `HeroProgram` — cinematic full-bleed, enrollment CTA, animated stats

### Section Blocks
- `SectionStats` — animated counters, icon accents
- `SectionPrograms` — horizontal scroll (desktop) / vertical stack (mobile)
- `SectionTestimonials` — infinite marquee or paginated slider
- `SectionPartners` — logo cloud, hover states, tier grouping
- `SectionCTA` — full-bleed, gradient/image BG, dual CTAs
- `SectionTimeline` — scroll-driven vertical timeline

### Cards
`ProgramCard`, `EventCard`, `BlogCard`, `ProjectCard`, `TeamCard`

### Motion Components
`MotionWrapper`, `ParallaxLayer`, `MagneticEl`, `TextReveal`, `CounterAnimate`

### CMS
`RichTextRenderer` — renders Supabase `jsonb` body blocks: paragraph, heading, image, video, quote, list, embed

---

## 9. TypeScript Interfaces (`types/index.ts`)

Key interfaces: `Program`, `Event`, `Post`, `Testimonial`, `Project`, `Partner`, `GalleryItem`, `Category`, `TeamMember`, `Inquiry`.

Fields map 1:1 with Supabase columns (camelCase in TS, snake_case in DB). Always use these interfaces in component props and composable return types.

---

## 10. Performance Targets & Techniques

**Targets:** Lighthouse Performance 90+ · SEO 95+ · Accessibility 95+ · Best Practices 100

| Technique | Rule |
|---|---|
| Image optimization | `<NuxtImg format="avif,webp" loading="lazy">` with explicit width/height |
| Font optimization | Self-hosted variable fonts, `font-display: swap`, preloaded |
| Code splitting | GSAP + Lenis in `client-only` plugins |
| Lazy components | `<LazyComponentName>` for all below-fold sections |
| Third-party deferral | Analytics deferred until after `load` event |
| Bundle target | < 200KB initial JS |

---

## 11. Accessibility Requirements

- Visible focus rings (`outline-offset-2`, brand accent color) on all interactive elements
- `useMotionSafe()` disables all animations when `prefers-reduced-motion: reduce`
- All images: descriptive `alt`; decorative images: `alt=""`
- Contrast minimum: AA (4.5:1 body, 3:1 UI components)
- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`
- Skip-to-content as first focusable element
- All form fields have associated `<label>` elements
- ARIA live regions for toasts and loading states
- Keyboard-navigable mega menu: Escape to close, arrow key traversal

---

## 12. Environment Variables (`.env.example`)

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-side only
NUXT_PUBLIC_SITE_URL=https://ncedi.edu.ng
NUXT_PUBLIC_POSTHOG_KEY=
RESEND_API_KEY=
```

---

## 13. Output Checklist

When scaffolding or continuing the project, produce files in this order:

1. `nuxt.config.ts` — full config with modules, routeRules, image, site metadata
2. `tailwind.config.ts` + `assets/css/tokens.css` + `assets/css/typography.css`
3. `supabase/migrations/001_initial_schema.sql` — all tables, RLS, indexes, storage buckets
4. `plugins/lenis.client.ts` + `plugins/gsap.client.ts` + `plugins/supabase.ts`
5. `composables/useSeo.ts` + `composables/useMotionSafe.ts` + `composables/useSupabase.ts`
6. `constants/motion.ts` + `types/index.ts`
7. Layout components: `AppNavbar`, `AppMegaMenu`, `AppFooter`, `AppCookieBanner`
8. Motion components: `MotionWrapper`, `ParallaxLayer`, `MagneticEl`, `TextReveal`, `CounterAnimate`
9. Section components (all listed in §8)
10. Card components (all listed in §8)
11. `RichTextRenderer` CMS component
12. Pages: `index.vue`, `about.vue`, `programs/[slug].vue`, `events/[slug].vue`, `blog/[slug].vue`, `gallery.vue`, `partners.vue`, `contact.vue`
13. `server/api/sitemap.ts` + `server/api/contact.ts`
14. `vercel.json` — security headers config
15. `.env.example`

