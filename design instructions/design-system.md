# N-CEDI Design System
**NCAT Centre for Entrepreneurship Development and Innovation**
Version 1.0 — Production Reference

---

## 1. Principles

The N-CEDI design language communicates **African institutional excellence** — simultaneously projecting governmental authority, cultural richness, and forward-looking innovation. Every design decision must answer three questions:

1. **Does it project trust?** Government-linked institutions require visual gravitas. Nothing feels rushed, cheap, or disposable.
2. **Does it feel African?** Not through surface decoration, but through the warmth of gold, the depth of the green, the generosity of white space that echoes clay-plastered walls.
3. **Is it world-class?** Awwwards-competitive means every detail is considered — spacing, motion easing, typographic rhythm, colour contrast.

### Design Pillars

| Pillar | Expression |
|---|---|
| **Authority** | Deep navy as structural anchor; generous white space; measured, unhurried pacing |
| **Richness** | Gold accents; warm off-white surfaces; brass-toned hover states |
| **Growth** | Forest green; upward motion patterns; optimistic typography sizing |
| **Precision** | 8pt grid; fluid type scale; strict contrast ratios; pixel-perfect spacing |

---

## 2. Color System

All colors are defined as CSS custom properties in `assets/css/tokens.css`. **Never hard-code hex values in components.** Always reference the semantic token.

### 2.1 Brand Palette

```css
/* ─── Brand Core ─── */
--color-brand-primary:    #0A2540;   /* Deep Navy */
--color-brand-accent:     #D4A853;   /* Brushed Gold */
--color-brand-secondary:  #1A6B4A;   /* Forest Green */

/* ─── Brand Tints (for backgrounds, hover states) ─── */
--color-primary-50:   #E8EEF5;
--color-primary-100:  #C5D3E6;
--color-primary-200:  #8FA8CC;
--color-primary-800:  #071B30;
--color-primary-900:  #040F1C;

--color-accent-50:    #FBF4E3;
--color-accent-100:   #F5E4B5;
--color-accent-200:   #ECCB78;
--color-accent-600:   #B8892E;
--color-accent-700:   #9A6F1F;

--color-secondary-50:  #E3F2EB;
--color-secondary-100: #B8DEC9;
--color-secondary-700: #145939;
--color-secondary-900: #0C3824;
```

### 2.2 Neutral Scale

```css
/* ─── Surfaces ─── */
--color-surface:          #FAFAF8;   /* Warm white — main page background */
--color-surface-muted:    #F2F0EB;   /* Warm grey — card/section backgrounds */
--color-surface-inset:    #E8E6E0;   /* Inset panel backgrounds */
--color-surface-inverse:  #0A2540;   /* Dark surface (footer, dark sections) */

/* ─── Borders ─── */
--color-border:           #E2DDD6;
--color-border-strong:    #C8C3BB;
--color-border-inverse:   rgba(255,255,255,0.12);

/* ─── Text ─── */
--color-text-primary:     #0D0D0D;
--color-text-secondary:   #4A4A4A;
--color-text-muted:       #888880;
--color-text-placeholder: #AEAAA4;
--color-text-inverse:     #F5F5F0;
--color-text-inverse-muted: rgba(245,245,240,0.6);
--color-text-accent:      #D4A853;
```

### 2.3 Functional Colors

```css
--color-error:           #C0392B;
--color-error-surface:   #FDECEA;
--color-warning:         #D97706;
--color-warning-surface: #FEF3C7;
--color-success:         #1A6B4A;
--color-success-surface: #ECFDF5;
--color-info:            #0A2540;
--color-info-surface:    #E8EEF5;
```

### 2.4 Dark Mode Overrides

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface:        #0A0A0A;
    --color-surface-muted:  #141414;
    --color-surface-inset:  #1C1C1C;
    --color-border:         #2A2A2A;
    --color-border-strong:  #3A3A3A;
    --color-text-primary:   #F5F5F0;
    --color-text-secondary: #AAAAAA;
    --color-text-muted:     #666660;
  }
}
```

### 2.5 Color Usage Rules

| Token | Use For | Never Use For |
|---|---|---|
| `--color-brand-primary` | Primary buttons, headings on light BG, nav bar | Body text, decorative borders |
| `--color-brand-accent` | Highlights, active states, icon accents, CTA underlines | Large background fills |
| `--color-brand-secondary` | Success states, secondary CTAs, progress indicators | Danger states |
| `--color-surface` | Page backgrounds | Cards that need visual lift |
| `--color-surface-muted` | Card backgrounds, alternate section fills | Main page background |

### 2.6 Contrast Requirements

| Foreground | Background | Ratio | WCAG Level |
|---|---|---|---|
| `--color-text-primary` on `--color-surface` | 16.1:1 | AAA |
| `--color-brand-primary` on `--color-surface` | 13.4:1 | AAA |
| `--color-text-secondary` on `--color-surface` | 7.5:1 | AA |
| `--color-brand-accent` on `--color-brand-primary` | 5.2:1 | AA |
| `--color-text-inverse` on `--color-surface-inverse` | 13.4:1 | AAA |

---

## 3. Typography

### 3.1 Font Families

```css
--font-display: 'Syne Variable', 'Syne', sans-serif;   /* Headings, labels, nav */
--font-body:    'Inter Variable', 'Inter', sans-serif;  /* Body copy, UI text */
--font-mono:    'JetBrains Mono', monospace;            /* Code, technical labels */
```

Both Syne and Inter are **self-hosted variable fonts** loaded from `/public/fonts/`. Never use CDN links in production.

```html
<!-- In <head>, before any CSS -->
<link rel="preload" href="/fonts/Syne-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/Inter-Variable.woff2" as="font" type="font/woff2" crossorigin>
```

```css
@font-face {
  font-family: 'Syne Variable';
  src: url('/fonts/Syne-Variable.woff2') format('woff2');
  font-weight: 400 800;
  font-display: swap;
}

@font-face {
  font-family: 'Inter Variable';
  src: url('/fonts/Inter-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}
```

### 3.2 Fluid Type Scale

All sizes use `clamp()` for smooth scaling between mobile and desktop viewports.

```css
--text-xs:    clamp(0.75rem,  1.5vw, 0.875rem);   /*  12–14px */
--text-sm:    clamp(0.875rem, 1.8vw, 1rem);        /*  14–16px */
--text-base:  clamp(1rem,     2vw,   1.125rem);    /*  16–18px */
--text-lg:    clamp(1.125rem, 2.5vw, 1.25rem);     /*  18–20px */
--text-xl:    clamp(1.25rem,  3vw,   1.5rem);      /*  20–24px */
--text-2xl:   clamp(1.5rem,   4vw,   2rem);        /*  24–32px */
--text-3xl:   clamp(2rem,     5vw,   3rem);        /*  32–48px */
--text-4xl:   clamp(2.5rem,   6vw,   4rem);        /*  40–64px */
--text-hero:  clamp(3.5rem,   9vw,   7rem);        /*  56–112px */
```

### 3.3 Font Weight Reference

| Weight | Tailwind Class | Usage |
|---|---|---|
| 400 | `font-normal` | Body copy, captions, form labels |
| 500 | `font-medium` | UI labels, nav links, button text |
| 600 | `font-semibold` | Sub-headings, card titles, badges |
| 700 | `font-bold` | H2–H4, emphasis, stat numbers |
| 800 | `font-extrabold` | H1, hero text, display headings |

### 3.4 Line Heights & Letter Spacing

```css
--leading-tight:   1.15;   /* Display/hero headings */
--leading-snug:    1.3;    /* H2–H4 */
--leading-normal:  1.5;    /* Body copy default */
--leading-relaxed: 1.7;    /* Long-form article text */
--leading-loose:   2.0;    /* Captions, labels */

--tracking-tight:   -0.03em;   /* Large display headings */
--tracking-normal:   0em;      /* Body copy */
--tracking-wide:     0.05em;   /* Labels, badges, eyebrows */
--tracking-widest:   0.12em;   /* Overline/eyebrow caps */
```

### 3.5 Typographic Roles

| Role | Font | Size | Weight | Tracking |
|---|---|---|---|---|
| Hero | Syne | `--text-hero` | 800 | `--tracking-tight` |
| H1 | Syne | `--text-4xl` | 800 | `--tracking-tight` |
| H2 | Syne | `--text-3xl` | 700 | `--tracking-tight` |
| H3 | Syne | `--text-2xl` | 700 | normal |
| H4 | Syne | `--text-xl` | 600 | normal |
| H5/H6 | Syne | `--text-lg` | 600 | `--tracking-wide` |
| Eyebrow | Syne | `--text-sm` | 600 | `--tracking-widest` uppercase |
| Body Large | Inter | `--text-lg` | 400 | normal |
| Body | Inter | `--text-base` | 400 | normal |
| Body Small | Inter | `--text-sm` | 400 | normal |
| Caption | Inter | `--text-xs` | 400 | `--tracking-wide` |
| Label / UI | Inter | `--text-sm` | 500 | `--tracking-wide` |
| Button | Inter | `--text-sm` | 600 | `--tracking-wide` |
| Mono | JetBrains Mono | `--text-sm` | 400 | normal |

---

## 4. Spacing System

Based on an **8pt grid** (multiples of `0.5rem`).

```css
--space-1:   0.25rem;   /*  4px */
--space-2:   0.5rem;    /*  8px */
--space-3:   0.75rem;   /* 12px */
--space-4:   1rem;      /* 16px */
--space-5:   1.25rem;   /* 20px */
--space-6:   1.5rem;    /* 24px */
--space-8:   2rem;      /* 32px */
--space-10:  2.5rem;    /* 40px */
--space-12:  3rem;      /* 48px */
--space-16:  4rem;      /* 64px */
--space-20:  5rem;      /* 80px */
--space-24:  6rem;      /* 96px */
--space-32:  8rem;      /* 128px */
--space-40:  10rem;     /* 160px */
```

### Section Rhythm

```css
--section-padding-y: clamp(6rem, 10vw, 10rem);   /* py-24 md:py-32 lg:py-40 */
--section-padding-x: clamp(1.5rem, 5vw, 6rem);   /* px-6 md:px-12 lg:px-24 */
```

### Component Spacing Defaults

| Component | Padding | Gap |
|---|---|---|
| Card | `p-6` to `p-8` | — |
| Button (md) | `py-3 px-6` | — |
| Button (lg) | `py-4 px-8` | — |
| Input | `py-3 px-4` | — |
| Badge | `py-1 px-3` | — |
| Card grid | — | `gap-6 md:gap-8` |
| Section inner | — | `gap-12 md:gap-16` |

---

## 5. Grid & Layout

### 5.1 Container

```css
.container {
  width: 100%;
  max-width: 1440px;
  margin-inline: auto;
  padding-inline: var(--section-padding-x);
}
```

### 5.2 Common Layout Patterns

| Pattern | Columns (desktop) | Usage |
|---|---|---|
| Full width | 12 | Hero sections, full-bleed CTAs |
| Content + sidebar | 8 + 4 | Blog posts, program detail |
| Three-up cards | 4 + 4 + 4 | Program cards, team cards |
| Four-up cards | 3 + 3 + 3 + 3 | Partner logos, stat blocks |
| Hero split | 6 + 6 | HeroHome |
| Centered editorial | 8 (offset 2) | Blog body, about text |

### 5.3 Breakpoints

```ts
screens: {
  sm:    '480px',
  md:    '768px',
  lg:    '1024px',
  xl:    '1280px',
  '2xl': '1440px',
}
```

---

## 6. Elevation & Shadow

```css
--shadow-xs:  0 1px 2px 0 rgba(10,37,64,0.06);
--shadow-sm:  0 2px 6px 0 rgba(10,37,64,0.08);
--shadow-md:  0 4px 16px 0 rgba(10,37,64,0.10);
--shadow-lg:  0 8px 32px 0 rgba(10,37,64,0.12);
--shadow-xl:  0 16px 48px 0 rgba(10,37,64,0.16);
--shadow-2xl: 0 24px 64px 0 rgba(10,37,64,0.20);

/* Gold glow — accent/hover states */
--shadow-accent: 0 0 24px 0 rgba(212,168,83,0.25);

/* Inset — pressed/active states */
--shadow-inset: inset 0 2px 6px 0 rgba(10,37,64,0.08);
```

Shadow color derives from `--color-brand-primary` for cohesion, not generic black.

---

## 7. Border Radius

```css
--radius-xs:   0.125rem;   /*  2px — dividers */
--radius-sm:   0.25rem;    /*  4px — badge, input */
--radius-md:   0.5rem;     /*  8px — button, compact card */
--radius-lg:   1rem;       /* 16px — card, modal */
--radius-xl:   1.5rem;     /* 24px — large card, hero image */
--radius-2xl:  2rem;       /* 32px — feature card, media block */
--radius-full: 9999px;     /* pill — chip, avatar, toggle */
```

---

## 8. Motion System

### 8.1 Easing Curves (`constants/motion.ts`)

```ts
export const EASING = {
  smooth:    [0.25, 0.1, 0.25, 1],    /* Natural ease-in-out */
  snappy:    [0.77, 0, 0.175, 1],     /* Quick deceleration */
  bouncy:    [0.34, 1.56, 0.64, 1],   /* Slight overshoot */
  cinematic: [0.76, 0, 0.24, 1],      /* Dramatic, authoritative */
  enter:     [0.0, 0.0, 0.2, 1.0],    /* Element entering view */
  exit:      [0.4, 0.0, 1.0, 1.0],    /* Element leaving view */
}

export const DURATION = {
  instant:   0.1,
  fast:      0.3,
  base:      0.6,
  slow:      1.0,
  cinematic: 1.6,
}

export const STAGGER = {
  tight:  0.05,
  base:   0.10,
  loose:  0.18,
}
```

### 8.2 Motion Patterns

| Pattern | Approach | Duration | Easing |
|---|---|---|---|
| Hero text reveal | SplitText — lines clip-path + `translateY(40px)` → 0 | `cinematic` | `cinematic` |
| Section fade-up | `opacity: 0, y: 40` → `opacity: 1, y: 0` via ScrollTrigger | `base` | `smooth` |
| Page enter | `opacity: 0, y: 20` → `1, 0` | `fast` | `enter` |
| Page exit | `opacity: 1, y: 0` → `0, -10` | `fast` | `exit` |
| Card hover lift | `translateY(-6px)` + shadow intensify | `fast` | `snappy` |
| Magnetic button | GSAP `quickTo` x/y tracking mouse proximity | — | `smooth` |
| Counter animate | GSAP `to({val: target})` from 0 | `slow` | `smooth` |
| Parallax layer | ScrollTrigger `scrub: 1.5`, Y ±15–30% | — | — |
| Horizontal scroll | GSAP pin + `xPercent` driven by scroll | — | — |
| Cursor follower | GSAP `quickTo` x/y, 0.12s lag | — | — |
| Image zoom hover | CSS `scale(1.04)` transition 0.6s | 0.6s | `smooth` |

### 8.3 Reduced Motion

```ts
// composables/useMotionSafe.ts
export function useMotionSafe() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return { safe: !prefersReduced }
}
```

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 9. Iconography

- **Library:** Phosphor Icons — consistent optical weight, generous stroke
- **Sizes:** `16px` inline · `20px` UI default · `24px` nav · `32px` feature · `48px` hero accent
- **Weight:** `regular` for body context · `bold` for emphasis · `fill` for active/selected
- **Color:** Icons always inherit `currentColor`. No hardcoded fills.
- All decorative icons: `aria-hidden="true"`. Standalone meaningful icons: `aria-label` on parent.

---

## 10. Components

### 10.1 Buttons

| Variant | Background | Text | Hover |
|---|---|---|---|
| Primary | `--color-brand-primary` | `--color-text-inverse` | `--color-primary-800` + lift |
| Accent | `--color-brand-accent` | `--color-brand-primary` | `--color-accent-600` + lift |
| Secondary | transparent | `--color-brand-primary` | `--color-primary-50` fill |
| Ghost | transparent | `--color-brand-primary` | `--color-surface-muted` |
| Inverse | white | `--color-brand-primary` | off-white |

| Size | Padding | Font | Radius |
|---|---|---|---|
| sm | `py-2 px-4` | `--text-xs` | `--radius-sm` |
| md | `py-3 px-6` | `--text-sm` | `--radius-md` |
| lg | `py-4 px-8` | `--text-base` | `--radius-md` |
| xl | `py-5 px-10` | `--text-lg` | `--radius-lg` |

Focus state: `outline: 2px solid var(--color-brand-accent); outline-offset: 2px`.
Active state: `scale(0.97)`. Disabled: `opacity: 0.4; cursor: not-allowed`.

### 10.2 Badges & Tags

**Badge colour map:**

| Type | Background | Text |
|---|---|---|
| beginner | `--color-secondary-50` | `--color-brand-secondary` |
| intermediate | `--color-accent-50` | `--color-accent-700` |
| advanced | `--color-primary-50` | `--color-brand-primary` |
| featured | `--color-brand-accent` | `--color-brand-primary` |
| new | `--color-brand-secondary` | white |

### 10.3 Cards

Base: `--color-surface-muted` background · `--shadow-md` · `--radius-xl` · `border: 1px solid var(--color-border)`.
Hover: `--shadow-lg` + `translateY(-6px)` (0.3s `snappy`).

**Image aspect ratios:**

| Card | Ratio |
|---|---|
| ProgramCard | 4:3 |
| EventCard | 16:9 |
| BlogCard | 3:2 |
| ProjectCard | 1:1 |
| TeamCard | 1:1 circular |

### 10.4 Form Inputs

```css
.input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: var(--text-base);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input:focus {
  outline: none;
  border-color: var(--color-brand-accent);
  box-shadow: 0 0 0 3px rgba(212,168,83,0.2);
}
.input[aria-invalid="true"] {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(192,57,43,0.15);
}
```

### 10.5 Navigation

| State | Background | Links |
|---|---|---|
| Transparent (over hero) | transparent | white |
| Scrolled | `rgba(250,250,248,0.92)` + `backdrop-filter: blur(12px)` | primary navy |
| Over dark section | `rgba(10,37,64,0.92)` + blur | white |

Height: `72px` desktop · `60px` mobile. `position: sticky; top: 0; z-index: 100`.

---

## 11. Imagery

### Photography Direction

- Warm Nigerian daylight; avoid cold or over-processed tones
- Students in action: hands working, collaborating, focused
- Environments: workshop floors, classrooms, outdoor Nigerian settings
- Golden-hour photography preferred for hero imagery

### Image Treatments

```css
/* Hero cinematic overlay */
.hero-overlay {
  background: linear-gradient(
    to bottom,
    rgba(10,37,64,0.3) 0%,
    rgba(10,37,64,0.0) 40%,
    rgba(10,37,64,0.5) 100%
  );
}
```

Always use `<NuxtImg format="avif,webp" loading="lazy">` with explicit dimensions and `sizes` attribute. Never use raw `<img>`.

---

## 12. Accessibility

| Requirement | Rule |
|---|---|
| Colour contrast | AA minimum everywhere; AAA for body text |
| Focus rings | `outline: 2px solid var(--color-brand-accent); outline-offset: 2px` on all interactive elements |
| Skip link | First focusable element, visually hidden until focused |
| Reduced motion | All GSAP/Lenis gated by `useMotionSafe()` + CSS fallback |
| Semantic HTML | `<header>` `<nav>` `<main>` `<aside>` `<footer>` always used |
| ARIA live regions | `role="alert"` for errors; `aria-live="polite"` for status |
| Keyboard nav | All modals, menus, dropdowns keyboard operable; Escape closes overlays |
| Form labels | Every control has `<label>`; no placeholder-only labelling |

---

## 13. Tailwind Configuration

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   'var(--color-brand-primary)',
          accent:    'var(--color-brand-accent)',
          secondary: 'var(--color-brand-secondary)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          muted:   'var(--color-surface-muted)',
          inset:   'var(--color-surface-inset)',
          inverse: 'var(--color-surface-inverse)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong:  'var(--color-border-strong)',
        },
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted:     'var(--color-text-muted)',
          inverse:   'var(--color-text-inverse)',
          accent:    'var(--color-text-accent)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body:    ['var(--font-body)'],
        mono:    ['var(--font-mono)'],
      },
      fontSize: {
        xs:    ['var(--text-xs)'],
        sm:    ['var(--text-sm)'],
        base:  ['var(--text-base)'],
        lg:    ['var(--text-lg)'],
        xl:    ['var(--text-xl)'],
        '2xl': ['var(--text-2xl)'],
        '3xl': ['var(--text-3xl)'],
        '4xl': ['var(--text-4xl)'],
        hero:  ['var(--text-hero)'],
      },
      boxShadow: {
        xs:     'var(--shadow-xs)',
        sm:     'var(--shadow-sm)',
        md:     'var(--shadow-md)',
        lg:     'var(--shadow-lg)',
        xl:     'var(--shadow-xl)',
        '2xl':  'var(--shadow-2xl)',
        accent: 'var(--shadow-accent)',
      },
      borderRadius: {
        xs:    'var(--radius-xs)',
        sm:    'var(--radius-sm)',
        md:    'var(--radius-md)',
        lg:    'var(--radius-lg)',
        xl:    'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      screens: {
        sm:    '480px',
        md:    '768px',
        lg:    '1024px',
        xl:    '1280px',
        '2xl': '1440px',
      },
    },
  },
} satisfies Config
```

---

## 14. CSS File Structure

```
app/assets/css/
├── tokens.css        ← All CSS custom properties (Sections 2–8 of this doc)
├── typography.css    ← @font-face declarations, base heading styles
├── global.css        ← CSS reset, base element styles, imports tokens.css first
└── animations.css    ← @keyframes for CSS-only transitions
```

`tokens.css` is always imported first. All component stylesheets reference tokens via `var()`. Hard-coded hex values in components are a build error.

---

*N-CEDI Design System v1.0 — Every design decision must be traceable to a token or a principle in this document.*
