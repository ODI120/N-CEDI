# N-CEDI ELITE MASTER PROMPT
**Premium Awwwards-Level Nuxt 3/4 + Supabase Website Architecture**
**Audience:** AI Code Generators & Senior Developers
**Output Mode:** Full enterprise architecture — no placeholders, no pseudocode, production-ready only.

---

## 1. Project Context

You are building a **world-class, cinematic institutional website** for **N-CEDI** — the *NCAT Centre for Entrepreneurship Development and Innovation* — located in Nigeria. This platform serves as the digital face of a government-linked innovation centre and must project credibility, modernity, and African excellence at a global level.

The site must feel:
- **Cinematic** — story-driven, immersive, motion-forward
- **Institutional** — trustworthy, structured, authoritative
- **Premium** — Awwwards-competitive, pixel-perfect, detail-obsessed
- **Culturally rooted** — modern African innovation aesthetic, not generic Western corporate

### Programs Offered
Fashion Design · Woodwork · Web Design & Development · Computer Hardware · Solar Installation · Bakery & Bead Making

### Business Goals (ranked by priority)
1. Government credibility & institutional trust
2. Partnership and sponsorship attraction
3. Public awareness & student enrollment
4. Event and workshop promotion
5. Showcasing student projects and innovation

---

## 2. Technical Stack

| Layer | Technology | Notes |
|---|---|---|
| **Framework** | Nuxt 4 (Nuxt 3 compatible) | Use `compatibilityVersion: 4` |
| **UI Language** | Vue 3 + TypeScript (strict mode) | Composition API only, no Options API |
| **Styling** | Tailwind CSS v4 | JIT, custom design tokens via CSS variables |
| **Animation** | GSAP 3 + ScrollTrigger | For complex timelines and scroll-driven scenes |
| **Motion Directives** | VueUse Motion (`@vueuse/motion`) | For component-level declarative motion |
| **Smooth Scroll** | Lenis | Integrated with GSAP ticker |
| **Backend** | Supabase | Auth, Postgres DB, Storage, Realtime, Edge Functions |
| **Deployment** | Vercel Edge | ISR + Edge Middleware for hybrid rendering |
| **Image CDN** | Nuxt Image + Supabase Storage | AVIF/WebP, responsive `srcset` |
| **CMS Layer** | Supabase as headless CMS | Admin dashboard via Nuxt Studio or custom built |

---

## 3. Nuxt Project Structure

Generate the full folder structure. Key conventions:

```
/
├── app/
│   ├── assets/
│   │   ├── css/           # global.css, tokens.css, typography.css
│   │   └── fonts/         # self-hosted variable fonts
│   ├── components/
│   │   ├── ui/            # base: Button, Badge, Tag, Icon, Divider
│   │   ├── layout/        # Navbar, Footer, MegaMenu, Sidebar
│   │   ├── motion/        # MotionWrapper, RevealBlock, ParallaxLayer, MagneticEl
│   │   ├── sections/      # Hero, About, Programs, Events, Partners, CTA, Stats
│   │   ├── cards/         # ProgramCard, EventCard, BlogCard, ProjectCard, TeamCard
│   │   └── cms/           # RichTextRenderer, MediaBlock, EmbedBlock
│   ├── composables/       # useMotion, useLenis, useSupabase, useSeo, useMediaQuery
│   ├── layouts/           # default.vue, minimal.vue, dashboard.vue
│   ├── middleware/         # auth.ts, redirect.ts
│   ├── pages/
│   │   ├── index.vue
│   │   ├── about.vue
│   │   ├── programs/
│   │   │   ├── index.vue
│   │   │   └── [slug].vue
│   │   ├── events/
│   │   │   ├── index.vue
│   │   │   └── [slug].vue
│   │   ├── blog/
│   │   │   ├── index.vue
│   │   │   └── [slug].vue
│   │   ├── gallery.vue
│   │   ├── partners.vue
│   │   ├── contact.vue
│   │   └── admin/         # protected CMS pages
│   ├── plugins/           # gsap.client.ts, lenis.client.ts, supabase.ts
│   ├── server/
│   │   ├── api/           # REST endpoints for forms, sitemap, RSS
│   │   └── middleware/    # rate-limiting, CORS
│   └── utils/             # formatDate, slugify, imageUrl, seoDefaults
├── public/
│   ├── fonts/
│   ├── icons/
│   └── og/                # static OG fallback images
├── nuxt.config.ts
├── tailwind.config.ts
├── supabase/
│   ├── migrations/
│   └── seed.sql
└── .env.example
```

---

## 4. Design System

### 4.1 Color Palette
Define all colors as CSS custom properties in `tokens.css`. Use semantic naming:

```css
:root {
  /* Brand */
  --color-brand-primary: #0A2540;      /* Deep navy — authority */
  --color-brand-accent: #D4A853;       /* Gold — excellence, African richness */
  --color-brand-secondary: #1A6B4A;    /* Forest green — growth, innovation */

  /* Neutrals */
  --color-surface: #FAFAF8;
  --color-surface-muted: #F2F0EB;
  --color-border: #E2DDD6;
  --color-text-primary: #0D0D0D;
  --color-text-secondary: #4A4A4A;
  --color-text-muted: #888880;

  /* Functional */
  --color-error: #C0392B;
  --color-success: #1A6B4A;

  /* Dark mode overrides */
  @media (prefers-color-scheme: dark) {
    --color-surface: #0A0A0A;
    --color-text-primary: #F5F5F0;
  }
}
```

### 4.2 Typography Scale
Use a self-hosted variable font (e.g. *Syne* for headings, *Inter* for body). Define a fluid type scale using `clamp()`:

```css
--text-xs:    clamp(0.75rem,  1.5vw, 0.875rem);
--text-sm:    clamp(0.875rem, 1.8vw, 1rem);
--text-base:  clamp(1rem,     2vw,   1.125rem);
--text-lg:    clamp(1.125rem, 2.5vw, 1.25rem);
--text-xl:    clamp(1.25rem,  3vw,   1.5rem);
--text-2xl:   clamp(1.5rem,   4vw,   2rem);
--text-3xl:   clamp(2rem,     5vw,   3rem);
--text-4xl:   clamp(2.5rem,   6vw,   4rem);
--text-hero:  clamp(3.5rem,   9vw,   7rem);
```

### 4.3 Spacing & Grid
- 8pt spacing system (multiples of 0.5rem)
- 12-column grid with `max-w-[1440px]` container
- Gutters: `px-6 md:px-12 lg:px-24`
- Section vertical rhythm: `py-24 md:py-32 lg:py-40`

### 4.4 Motion Design Tokens
```ts
// constants/motion.ts
export const EASING = {
  smooth: [0.25, 0.1, 0.25, 1],
  snappy: [0.77, 0, 0.175, 1],
  bouncy: [0.34, 1.56, 0.64, 1],
  cinematic: [0.76, 0, 0.24, 1],
}

export const DURATION = {
  fast: 0.3,
  base: 0.6,
  slow: 1.0,
  cinematic: 1.6,
}

export const STAGGER = {
  tight: 0.05,
  base: 0.1,
  loose: 0.18,
}
```

---

## 5. Motion System

All motion must degrade gracefully under `prefers-reduced-motion: reduce`.

### 5.1 Lenis + GSAP Integration
```ts
// plugins/lenis.client.ts
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

### 5.2 MotionWrapper Component
A reusable wrapper that applies scroll-triggered reveal to any slotted content:

```vue
<!-- components/motion/MotionWrapper.vue -->
<script setup lang="ts">
interface Props {
  variant?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale'
  delay?: number
  duration?: number
  threshold?: number
}
const props = withDefaults(defineProps<Props>(), {
  variant: 'fadeUp',
  delay: 0,
  duration: 0.8,
  threshold: 0.15,
})
</script>
```

### 5.3 Required Motion Patterns
Implement all of the following:

| Pattern | Implementation |
|---|---|
| **Hero text reveal** | GSAP SplitText — lines stagger up with clip-path |
| **Scroll-triggered fade-up** | `MotionWrapper` + ScrollTrigger `toggleActions` |
| **Parallax layers** | GSAP ScrollTrigger `scrub: 1.5` on background layers |
| **Magnetic buttons** | Mouse proximity tracking with GSAP `quickTo` |
| **Horizontal scroll section** | GSAP pin + horizontal translation for programs |
| **Page transitions** | `definePageMeta` + `<Transition>` with GSAP hooks |
| **Counter animation** | GSAP `to({val})` on stat numbers on scroll enter |
| **Cursor follower** | Custom SVG cursor with GSAP `quickTo` for lag |
| **Image hover zoom** | CSS `scale` + GSAP for smooth easing override |
| **Ambient background** | CSS `radial-gradient` animated with GSAP `to` |

---

## 6. SEO Architecture

### 6.1 nuxt.config.ts SEO Setup
```ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: { compatibilityVersion: 4 },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  },

  modules: [
    '@nuxtjs/seo',         // useSeoMeta, OG, Twitter cards
    '@nuxtjs/sitemap',     // auto sitemap from routes + Supabase data
    '@nuxtjs/robots',      // robots.txt
    'nuxt-schema-org',     // JSON-LD structured data
    '@nuxt/image',         // image optimization
  ],

  site: {
    url: 'https://ncedi.edu.ng',
    name: 'N-CEDI — NCAT Centre for Entrepreneurship Development and Innovation',
    description: 'Empowering the next generation of African innovators through hands-on vocational and tech training.',
    defaultLocale: 'en',
  },

  routeRules: {
    '/': { prerender: true },
    '/about': { prerender: true },
    '/programs/**': { isr: 3600 },     // revalidate hourly
    '/events/**': { isr: 1800 },       // revalidate every 30 min
    '/blog/**': { isr: 3600 },
    '/gallery': { isr: 7200 },
    '/admin/**': { ssr: false },       // SPA for admin
  },
})
```

### 6.2 Dynamic Page SEO (composable)
```ts
// composables/useSeo.ts
export function usePageSeo(options: {
  title: string
  description: string
  image?: string
  type?: 'website' | 'article'
  publishedAt?: string
}) {
  useSeoMeta({
    title: `${options.title} | N-CEDI`,
    ogTitle: `${options.title} | N-CEDI`,
    description: options.description,
    ogDescription: options.description,
    ogImage: options.image ?? '/og/default.jpg',
    ogType: options.type ?? 'website',
    twitterCard: 'summary_large_image',
    twitterSite: '@ncedi_ng',
    articlePublishedTime: options.publishedAt,
  })

  useSchemaOrg([
    defineOrganization({
      name: 'N-CEDI',
      url: 'https://ncedi.edu.ng',
      logo: 'https://ncedi.edu.ng/logo.png',
      sameAs: ['https://twitter.com/ncedi_ng'],
    }),
    ...(options.type === 'article' ? [defineArticle({
      headline: options.title,
      description: options.description,
      datePublished: options.publishedAt,
    })] : []),
  ])
}
```

### 6.3 JSON-LD Schemas to Implement
- `Organization` — sitewide
- `EducationalOrganization` — about page
- `Course` — each program page
- `Event` — each event page
- `Article` — each blog post
- `BreadcrumbList` — all inner pages
- `FAQPage` — FAQ sections
- `ImageGallery` — gallery page

---

## 7. Supabase Schema

Generate complete SQL migrations. All tables include `created_at`, `updated_at` timestamps and use UUIDs as primary keys.

### 7.1 Core Tables

```sql
-- Programs
create table programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  body jsonb,                        -- rich text as JSON blocks
  duration_weeks int,
  level text check (level in ('beginner','intermediate','advanced')),
  is_featured boolean default false,
  is_published boolean default false,
  cover_image_url text,
  gallery_urls text[],
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Events
create table events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  body jsonb,
  event_type text check (event_type in ('workshop','seminar','exhibition','competition','open_day')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  is_virtual boolean default false,
  meeting_url text,
  cover_image_url text,
  capacity int,
  registration_url text,
  is_published boolean default false,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Blog Posts
create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body jsonb,
  author_id uuid references team_members(id),
  category_id uuid references categories(id),
  cover_image_url text,
  read_time_minutes int,
  is_featured boolean default false,
  is_published boolean default false,
  published_at timestamptz,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Testimonials
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  organization text,
  quote text not null,
  avatar_url text,
  program_id uuid references programs(id),
  rating int check (rating between 1 and 5),
  is_featured boolean default false,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- Student Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  student_name text not null,
  program_id uuid references programs(id),
  media_urls text[],
  tags text[],
  year int,
  is_featured boolean default false,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- Partners
create table partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website_url text,
  logo_url text not null,
  tier text check (tier in ('platinum','gold','silver','community')),
  is_active boolean default true,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Gallery Media
create table gallery (
  id uuid primary key default gen_random_uuid(),
  title text,
  media_url text not null,
  media_type text check (media_type in ('image','video')),
  alt_text text,
  category_id uuid references categories(id),
  event_id uuid references events(id),
  program_id uuid references programs(id),
  is_published boolean default false,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Categories (shared across posts, gallery, events)
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  type text check (type in ('blog','gallery','event','program')),
  created_at timestamptz default now()
);

-- Team Members
create table team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  bio text,
  avatar_url text,
  email text,
  linkedin_url text,
  display_order int default 0,
  is_published boolean default true,
  created_at timestamptz default now()
);

-- Contact / Inquiry Submissions
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  type text check (type in ('general','partnership','enrollment','media')),
  is_read boolean default false,
  created_at timestamptz default now()
);
```

### 7.2 Row Level Security (RLS)
```sql
-- Enable RLS on all tables
alter table programs enable row level security;
alter table posts enable row level security;
-- ... repeat for all tables

-- Public can read published content
create policy "public_read_published" on programs
  for select using (is_published = true);

-- Authenticated admin can do everything
create policy "admin_full_access" on programs
  for all using (auth.role() = 'authenticated');
```

### 7.3 Supabase Storage Buckets
```
ncedi-media/
├── programs/        # program covers and gallery
├── events/          # event banners
├── posts/           # blog post covers
├── projects/        # student project media
├── gallery/         # general gallery
├── team/            # team avatars
└── partners/        # partner logos
```

All buckets: public read, authenticated write, 10MB file size limit, allowed MIME types: `image/jpeg, image/png, image/webp, image/avif, video/mp4`.

---

## 8. Component Architecture

### 8.1 Component Contracts (TypeScript interfaces)

```ts
// types/index.ts

export interface Program {
  id: string
  slug: string
  title: string
  subtitle?: string
  description: string
  durationWeeks: number
  level: 'beginner' | 'intermediate' | 'advanced'
  coverImageUrl: string
  isFeatured: boolean
}

export interface Event {
  id: string
  slug: string
  title: string
  description: string
  eventType: 'workshop' | 'seminar' | 'exhibition' | 'competition' | 'open_day'
  startsAt: string
  endsAt?: string
  location?: string
  isVirtual: boolean
  coverImageUrl: string
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImageUrl: string
  publishedAt: string
  readTimeMinutes: number
  author: Pick<TeamMember, 'name' | 'avatarUrl' | 'role'>
  category: Pick<Category, 'name' | 'slug'>
}
```

### 8.2 Key Components to Build

**Layout**
- `AppNavbar` — sticky, blur-on-scroll, mega menu for Programs, transparent on hero
- `AppMegaMenu` — full-width dropdown with program cards + featured event
- `AppFooter` — 4-column, newsletter signup, social links, sitemap links
- `AppCookieBanner` — GDPR-compliant, animates from bottom

**Hero Variants**
- `HeroHome` — full-viewport, split layout, video/image background, GSAP text split reveal
- `HeroInner` — 60vh, breadcrumb, page title with parallax subtitle
- `HeroProgram` — cinematic full-bleed, enrollment CTA, animated stats

**Section Blocks**
- `SectionStats` — animated counter numbers, icon accents
- `SectionPrograms` — horizontal scroll carousel (desktop), vertical stack (mobile)
- `SectionTestimonials` — infinite marquee or paginated slider
- `SectionPartners` — logo cloud with hover states, tier grouping
- `SectionCTA` — full-bleed, gradient or image background, dual action buttons
- `SectionTimeline` — scroll-driven vertical timeline for milestones/history

**Cards**
- `ProgramCard` — image, title, duration badge, level badge, CTA
- `EventCard` — date pill, type badge, title, location, CTA
- `BlogCard` — cover, category, title, author avatar, read time
- `ProjectCard` — media, student name, program tag, year
- `TeamCard` — avatar, name, role, social links

**Motion**
- `MotionWrapper` — scroll-triggered reveal (all variants)
- `ParallaxLayer` — depth scrolling for images/backgrounds
- `MagneticEl` — magnetic hover for buttons and links
- `TextReveal` — GSAP SplitText word/char reveal
- `CounterAnimate` — animates numbers on scroll enter

**CMS**
- `RichTextRenderer` — renders Supabase `jsonb` body blocks (paragraph, heading, image, video, quote, list, embed)

---

## 9. Performance Strategy

| Technique | Implementation |
|---|---|
| **Hybrid rendering** | `routeRules` with `prerender`, `isr`, `ssr` per route |
| **Image optimization** | `<NuxtImg>` with `format="avif,webp"`, `loading="lazy"`, explicit `width/height` |
| **Font optimization** | Self-hosted variable fonts, `font-display: swap`, preloaded in `<head>` |
| **Code splitting** | Automatic via Nuxt; heavy libs (GSAP, Lenis) in `client-only` plugins |
| **Component lazy load** | `defineAsyncComponent` + `<LazyComponentName>` for below-fold sections |
| **Third-party deferral** | Analytics, chat widgets deferred until after `load` event |
| **Bundle analysis** | `nuxt-bundle-analyzer` in dev; target < 200KB initial JS |
| **Critical CSS** | Inlined via Nuxt automatically; no render-blocking stylesheets |

> **Targets:** Performance 90+ · SEO 95+ · Accessibility 95+ · Best Practices 100

---

## 10. Accessibility

- All interactive elements have visible focus rings (`outline-offset-2`, brand color)
- `prefers-reduced-motion: reduce` disables all GSAP/Lenis animations via a global `useMotionSafe()` composable
- All images have descriptive `alt` text; decorative images use `alt=""`
- Color contrast minimum AA (4.5:1 for body text, 3:1 for UI components)
- Semantic HTML5 landmarks: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`
- Skip-to-content link as first focusable element
- All form fields have associated `<label>` elements
- ARIA live regions for dynamic content (toast notifications, loading states)
- Keyboard-navigable mega menu with `Escape` to close, arrow key traversal

---

## 11. Deployment & DevOps

### Environment Variables
```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # server-side only

# Site
NUXT_PUBLIC_SITE_URL=https://ncedi.edu.ng

# Analytics (defer loading)
NUXT_PUBLIC_POSTHOG_KEY=

# Email (for contact form)
RESEND_API_KEY=
```

### Vercel Configuration
```json
{
  "framework": "nuxtjs",
  "buildCommand": "nuxt build",
  "outputDirectory": ".output/public",
  "regions": ["lhr1", "iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/fonts/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

---

## 12. Output Checklist

When generating this project, produce the following in order:

- [ ] `nuxt.config.ts` — full configuration
- [ ] `tailwind.config.ts` + `assets/css/tokens.css` — complete design system
- [ ] `supabase/migrations/001_initial_schema.sql` — all tables, RLS, indexes
- [ ] `plugins/lenis.client.ts` + `plugins/gsap.client.ts`
- [ ] `composables/useSeo.ts` + `composables/useMotionSafe.ts` + `composables/useSupabase.ts`
- [ ] `types/index.ts` — all TypeScript interfaces
- [ ] All layout components: `AppNavbar`, `AppMegaMenu`, `AppFooter`
- [ ] All motion components: `MotionWrapper`, `ParallaxLayer`, `MagneticEl`, `TextReveal`
- [ ] All section components (as listed in §8.2)
- [ ] All card components
- [ ] `RichTextRenderer` CMS component
- [ ] All pages with full SEO, Schema.org, and Supabase data fetching
- [ ] `server/api/sitemap.ts` — dynamic sitemap from Supabase
- [ ] `server/api/contact.ts` — contact form with email via Resend
- [ ] `vercel.json` — deployment config with security headers
- [ ] `.env.example` — all required variables documented

**Constraint:** Do not use placeholder comments like `// TODO` or `// implement this`. Every file must be complete and production-ready.
