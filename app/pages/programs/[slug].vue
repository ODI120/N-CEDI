<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, createError } from '#app'
import HeroProgram from '~/components/sections/HeroProgram.vue'
import RichTextRenderer from '~/components/cms/RichTextRenderer.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
import ProgramCard from '~/components/cards/ProgramCard.vue'
import { usePageSeo } from '~/composables/useSeo'
import { useSupabase } from '~/composables/useSupabase'

const route = useRoute()
const slug = route.params.slug as string
const { client } = useSupabase()

// Fetch program from database
const { data: dbProgram, error } = await useAsyncData(`program-${slug}`, async () => {
  try {
    const { data, error } = await client
      .from('programs')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (err) {
    console.warn(`Supabase fetch failed for program ${slug}, using static fallback`, err)
    return null
  }
})

// Detailed static fallback programs
const defaultPrograms = [
  {
    title: 'Fashion Design & Garment Construction',
    slug: 'fashion-design',
    subtitle: 'Acquire couture drafting, high-end finishing, and sustainable brand launch strategies.',
    description: 'Learn modern garment construction, pattern drafting, and entrepreneurial fashion branding.',
    coverImageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200',
    durationWeeks: 12,
    level: 'beginner' as const,
    isFeatured: true,
    requirements: 'No prior sewing experience required. Passion for design is key.',
    outcomes: [
      'Draft customized bodices, skirts, and trousers from scratch.',
      'Operate domestic and industrial sewing machines and sergers.',
      'Develop a collection from mood board to finished physical garments.',
      'Set up a digital micro-brand ready for e-commerce integration.'
    ],
    body: [
      {
        type: 'heading',
        data: { level: 2, text: 'Program Overview' }
      },
      {
        type: 'paragraph',
        data: { text: 'Our Fashion Design program at N-CEDI is structured to take you from a novice to an industry-ready fashion entrepreneur. We believe in bridging structural design principles with modern digital branding to prepare you for the competitive Nigerian and international markets.' }
      },
      {
        type: 'heading',
        data: { level: 3, text: 'What You Will Learn' }
      },
      {
        type: 'list',
        data: {
          style: 'unordered',
          items: [
            '<strong>Introduction to textiles:</strong> Fiber types, fabric properties, and industrial sourcing.',
            '<strong>Flat pattern drafting:</strong> Drafting base blocks (slopers) and executing complex manipulations.',
            '<strong>Garment construction:</strong> Interfacing, seams, hems, collars, zippers, and advanced finishing techniques.',
            '<strong>Brand incubation:</strong> Pricing, collections timeline, social commerce, and supplier relationships.'
          ]
        }
      },
      {
        type: 'quote',
        data: {
          text: 'The N-CEDI fashion program gave me more than sewing skills; it taught me how to structure my design collections and launch my online boutique.',
          caption: 'Halima Bello, Founder of Bello Couture (Cohort 2)'
        }
      }
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800'
    ]
  },
  {
    title: 'Woodwork & Modern Furniture Design',
    slug: 'woodwork-furniture-design',
    subtitle: 'From basic joinery to high-concept interior fittings using advanced power tools and finishings.',
    description: 'Master precision carpentry, modern furniture construction, and spatial installation designs.',
    coverImageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=1200',
    durationWeeks: 16,
    level: 'intermediate' as const,
    isFeatured: false,
    requirements: 'Completion of basic workshop safety briefing (provided at orientation).',
    outcomes: [
      'Perform precision joinery techniques including mortise-and-tenon and dovetails.',
      'Create technical workshop drawings and cut lists from architectural briefs.',
      'Operate tablesaws, routers, planers, and sanding equipment safely.',
      'Execute high-durability spray and hand-applied veneer finishes.'
    ],
    body: [
      {
        type: 'heading',
        data: { level: 2, text: 'Program Overview' }
      },
      {
        type: 'paragraph',
        data: { text: 'Our Woodwork and Furniture Design track focuses on modern manufacturing methods. Students study timber technology, ergonomics, and spatial design to craft products that meet functional, commercial, and structural specifications.' }
      },
      {
        type: 'heading',
        data: { level: 3, text: 'Practical Lab Experience' }
      },
      {
        type: 'paragraph',
        data: { text: 'Students spend 80% of their program in the workshop floor. Working on projects from design sketching to production planning, assembly, and final delivery, you develop a portfolio of items including chairs, cabinets, and office tables.' }
      },
      {
        type: 'quote',
        data: {
          text: 'The precision and safety training at N-CEDI labs rivaled the industrial standards I saw in large wood fabrication factories.',
          caption: 'Joseph Okechukwu, Design Lead at WoodCrafts (Cohort 1)'
        }
      }
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800'
    ]
  },
  {
    title: 'Web Design & Fullstack Development',
    slug: 'web-design-development',
    subtitle: 'Build enterprise-grade modern web applications and design visually stunning interfaces.',
    description: 'Build premium responsive websites using Nuxt, Tailwind CSS, Javascript and database integrations.',
    coverImageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200',
    durationWeeks: 12,
    level: 'intermediate' as const,
    isFeatured: true,
    requirements: 'Basic computer literacy and typing speeds above 30 words per minute.',
    outcomes: [
      'Build frontend architectures using Vue 3, Nuxt 4, and Tailwind CSS v4.',
      'Design fully interactive user interfaces using modern design tools like Figma.',
      'Implement secure user authentication, CRUD operations, and relational storage with Supabase.',
      'Deploy production sites with dynamic route caching on Vercel.'
    ],
    body: [
      {
        type: 'heading',
        data: { level: 2, text: 'Become a Fullstack Innovator' }
      },
      {
        type: 'paragraph',
        data: { text: 'N-CEDI Web Design & Development course is designed to empower you with the tools of the modern web. We skip outdated methods and jump directly into standard frameworks and workflows utilized by leading tech hubs globally.' }
      },
      {
        type: 'heading',
        data: { level: 3, text: 'Core Tech Stack Taught' }
      },
      {
        type: 'list',
        data: {
          style: 'unordered',
          items: [
            '<strong>Vue 3 & Nuxt 4:</strong> Reusable SFC structures, reactivity, composables, and layouts.',
            '<strong>Tailwind CSS v4:</strong> Custom CSS property setups, utility mappings, responsive flexbox/grid.',
            '<strong>Supabase Backends:</strong> PostgreSQL tables, Row Level Security rules, auth controllers, and Storage buckets.',
            '<strong>Git & GitHub workflows:</strong> Continuous integration and team codebase branch reviews.'
          ]
        }
      },
      {
        type: 'quote',
        data: {
          text: 'This program is the perfect launching pad. Right after graduating, N-CEDI incubation program helped me secure three international freelancing projects.',
          caption: 'Emeka Nwosu, Freelance Developer (Cohort 4)'
        }
      }
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800'
    ]
  },
  {
    title: 'Computer Hardware Engineering',
    slug: 'computer-hardware-engineering',
    subtitle: 'Master structural computer assembly, motherboard diagnostics, repair mechanics, and network configuration.',
    description: 'Understand computer architecture, component diagnostics, micro-soldering, and system repairs.',
    coverImageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1200',
    durationWeeks: 12,
    level: 'beginner' as const,
    isFeatured: false,
    requirements: 'An analytical mindset. No prior electronic assembly experience required.',
    outcomes: [
      'Identify and isolate faulty hardware chips, cards, and drives.',
      'Perform micro-soldering on circuit boards and replace damaged capacitors.',
      'Install, optimize, and secure OS layouts and device drivers.',
      'Configure local office LAN/WLAN networks and file servers.'
    ],
    body: [
      {
        type: 'heading',
        data: { level: 2, text: 'Program Overview' }
      },
      {
        type: 'paragraph',
        data: { text: 'Our Hardware Engineering laboratory is equipped with advanced testing tools. Students work on real customer devices, diagnosing motherboard failures, running thermal performance checks, and testing components under various load profiles.' }
      }
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800'
    ]
  },
  {
    title: 'Solar Installation & Energy Systems',
    slug: 'solar-installation-energy-systems',
    subtitle: 'Gain competence in green energy design, solar array installation, inverter setup, and grid operations.',
    description: 'Design and install sustainable solar panels, inverter systems, battery storage, and hybrid microgrids.',
    coverImageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200',
    durationWeeks: 8,
    level: 'beginner' as const,
    isFeatured: true,
    requirements: 'Basic arithmetic understanding. Comfortable working at heights on safety gear.',
    outcomes: [
      'Calculate daily solar load requirements and sizing battery backup configurations.',
      'Install photovoltaic (PV) arrays securely on roofing structures.',
      'Configure solar charge controllers, pure sine-wave inverters, and battery banks.',
      'Diagnose wiring drops, ground faults, and execute safety grounding grids.'
    ],
    body: [
      {
        type: 'heading',
        data: { level: 2, text: 'Harness the Power of the Sun' }
      },
      {
        type: 'paragraph',
        data: { text: 'With the growing demand for clean and off-grid power solutions in Nigeria, solar tech is a massive market. This practical course provides hands-on knowledge on design parameters, wiring regulations, battery chemistries (LiFePO4, Lead-acid), and real installation scenarios.' }
      }
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=800'
    ]
  },
  {
    title: 'Bakery & Bead Making Commercial Arts',
    slug: 'bakery-bead-making',
    subtitle: 'Acquire high-quality bakery skills, customized bead designs, and business models for retail.',
    description: 'Combine culinary pastry arts with intricate traditional African bead crafts for commercial enterprise.',
    coverImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200',
    durationWeeks: 8,
    level: 'beginner' as const,
    isFeatured: false,
    requirements: 'An interest in creative designs and culinary arts.',
    outcomes: [
      'Bake professional-grade yeast breads, pastries, cakes, and confectionaries.',
      'Understand commercial kitchen sanitation, safety rules, and bulk measurement.',
      'Create high-end traditional and contemporary bead jewelry designs.',
      'Price and package goods effectively for retail supermarkets and boutique stores.'
    ],
    body: [
      {
        type: 'heading',
        data: { level: 2, text: 'Artisanal Entrepreneurship' }
      },
      {
        type: 'paragraph',
        data: { text: 'This program is tailored to students seeking cashflow-generating skills. Baking and beadwork are in high demand during events, weddings, and daily catering settings. We teach the fine art of baking and the complex weaves of bead jewelry alongside business finance.' }
      }
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=800'
    ]
  }
]

// Determine which program details to display (DB or static fallback)
const program = computed(() => {
  if (dbProgram.value) {
    const p = dbProgram.value as any
    return {
      title: p.title,
      slug: p.slug,
      subtitle: p.subtitle || '',
      description: p.description || '',
      coverImageUrl: p.cover_image_url || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200',
      durationWeeks: p.duration_weeks || 12,
      level: (p.level || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
      isFeatured: p.is_featured || false,
      requirements: (p as any).requirements || 'Basic interest and commitment to attend all practical labs.',
      outcomes: (p as any).outcomes || [
        'Gain foundational competence in the program domain.',
        'Operate specialized tools and tech benches under safety standards.',
        'Develop a complete prototype/project portfolio.',
        'Structure a business plan ready for incubator funding.'
      ],
      body: p.body || [
        { type: 'heading', data: { level: 2, text: 'About the Program' } },
        { type: 'paragraph', data: { text: p.description || '' } }
      ],
      galleryUrls: p.gallery_urls || []
    }
  }

  // Fallback check
  const fallback = defaultPrograms.find(p => p.slug === slug)
  return fallback || null
})

// Return a 404 if program not found in DB and fallback list
if (!program.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Program "${slug}" not found`,
    fatal: true
  })
}

// Wire up SEO dynamically
usePageSeo({
  title: program.value.title,
  description: program.value.subtitle || program.value.description,
  image: program.value.coverImageUrl
})

// ─── REDESIGN ADDITIONAL SCRIPT LOGIC ───

const activeSection = ref('overview')
const isNavSticky = ref(false)
const activePhotoIndex = ref<number | null>(null)

const sections = computed(() => {
  const list = [
    { id: 'overview', label: 'Overview' },
    { id: 'outcomes', label: 'Outcomes' }
  ]
  if (program.value?.galleryUrls && program.value.galleryUrls.length > 0) {
    list.push({ id: 'gallery', label: 'Gallery & Labs' })
  }
  list.push({ id: 'specifications', label: 'Academic Integration' })
  return list
})

const scrollToSection = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    const offset = 145 // Header height + Sticky tabs bar height + safe padding
    const bodyRect = document.body.getBoundingClientRect().top
    const elementRect = el.getBoundingClientRect().top
    const elementPosition = elementRect - bodyRect
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
    activeSection.value = id
  }
}

// Determine related programs (exclude current page program)
const relatedPrograms = computed(() => {
  return defaultPrograms
    .filter(p => p.slug !== slug)
    .slice(0, 2)
})

// Gallery Lightbox controls
const openLightbox = (index: number) => {
  activePhotoIndex.value = index
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', handleLightboxKeydown)
}

const closeLightbox = () => {
  activePhotoIndex.value = null
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleLightboxKeydown)
}

const prevPhoto = () => {
  if (activePhotoIndex.value === null || !program.value?.galleryUrls) return
  activePhotoIndex.value = (activePhotoIndex.value - 1 + program.value.galleryUrls.length) % program.value.galleryUrls.length
}

const nextPhoto = () => {
  if (activePhotoIndex.value === null || !program.value?.galleryUrls) return
  activePhotoIndex.value = (activePhotoIndex.value + 1) % program.value.galleryUrls.length
}

const handleLightboxKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevPhoto()
  if (e.key === 'ArrowRight') nextPhoto()
}

// Map index to modern outline bootstrap icon
const getOutcomeIcon = (index: number) => {
  const icons = [
    'bi-journal-check',
    'bi-cpu',
    'bi-patch-check',
    'bi-rocket-takeoff',
    'bi-tools',
    'bi-briefcase'
  ]
  return icons[index % icons.length]
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  // Toggle sticky classes based on scroll coordinates
  const handleScroll = () => {
    const trigger = document.querySelector('.program-detail-layout')
    if (trigger) {
      isNavSticky.value = window.scrollY > trigger.getBoundingClientRect().top + window.scrollY - 160
    }
  }
  window.addEventListener('scroll', handleScroll)

  // Track page scroll to highlight relevant sticky tab
  const observerOptions = {
    root: null,
    rootMargin: '-160px 0px -50% 0px',
    threshold: 0
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeSection.value = entry.target.id
      }
    })
  }, observerOptions)

  sections.value.forEach((sec) => {
    const el = document.getElementById(sec.id)
    if (el) observer?.observe(el)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    observer?.disconnect()
  })
})
</script>

<template>
  <div v-if="program" class="program-detail-page">
    <HeroProgram :program="program" />

    <!-- Sticky Navigation Tab Bar -->
    <div class="program-sticky-nav-wrapper" :class="{ 'is-sticky': isNavSticky }">
      <div class="container">
        <nav class="program-sticky-nav" aria-label="Local section navigation">
          <button
            v-for="sec in sections"
            :key="sec.id"
            class="program-sticky-nav__tab"
            :class="{ 'is-active': activeSection === sec.id }"
            @click="scrollToSection(sec.id)"
          >
            {{ sec.label }}
          </button>
        </nav>
      </div>
    </div>

    <div class="program-detail-layout container">
      <!-- Main Content -->
      <div class="program-detail-layout__main">
        <!-- Overview Section -->
        <section id="overview" class="program-section-block">
          <MotionWrapper variant="fadeUp" :delay="100">
            <div class="program-body-section">
              <RichTextRenderer :body="program.body" />
            </div>
          </MotionWrapper>
        </section>

        <!-- Learning Outcomes -->
        <section id="outcomes" class="program-section-block">
          <MotionWrapper variant="fadeUp" :delay="200" class="outcomes-wrapper">
            <div class="outcomes-header">
              <span class="outcomes-eyebrow">Skills Acquired</span>
              <h2 class="outcomes-title">Key Learning Outcomes</h2>
            </div>
            <div class="outcomes-grid">
              <div
                v-for="(outcome, oIdx) in program.outcomes"
                :key="oIdx"
                class="outcome-card-pro"
              >
                <div class="outcome-card-pro__icon-wrapper">
                  <i :class="['bi', getOutcomeIcon(Number(oIdx))]"></i>
                </div>
                <div class="outcome-card-pro__content">
                  <h3 class="outcome-card-pro__title">Outcome {{ Number(oIdx) + 1 }}</h3>
                  <p class="outcome-card-pro__text">{{ outcome }}</p>
                </div>
              </div>
            </div>
          </MotionWrapper>
        </section>

        <!-- Facilities & Project Gallery -->
        <section
          v-if="program.galleryUrls && program.galleryUrls.length > 0"
          id="gallery"
          class="program-section-block program-gallery"
        >
          <div class="gallery-header">
            <span class="gallery-eyebrow">Visual Tour</span>
            <h2 class="program-gallery__title">Facilities & Student Work</h2>
          </div>
          <div class="program-gallery__grid">
            <div
              v-for="(url, gIdx) in program.galleryUrls"
              :key="gIdx"
              class="program-gallery__item"
              @click="openLightbox(Number(gIdx))"
            >
              <NuxtImg
                :src="url"
                alt="Program gallery asset"
                sizes="sm:100vw md:50vw lg:33vw xl:400px"
                format="webp"
                class="program-gallery__image"
                loading="lazy"
              />
              <div class="program-gallery__item-overlay">
                <i class="bi bi-zoom-in zoom-icon"></i>
                <span>View Fullscreen</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Sidebar details -->
      <aside id="specifications" class="program-detail-layout__sidebar">
        <MotionWrapper variant="fadeUp" :delay="300">
          <div class="program-sidebar-card">
            <div class="sidebar-badge-top">
              <span class="pulse-indicator"></span>
              Automatic NCAT Integration
            </div>
            <h3 class="sidebar-title">Academic Integration</h3>
            
            <div class="spec-list">
              <div class="spec-item">
                <span class="spec-label">Academic Path</span>
                <span class="spec-value">ND1 to HND2 Progression</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Eligible Schools</span>
                <span class="spec-value">AMS, ATE, AME Schools</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Enrollment Type</span>
                <span class="spec-value color-green">Automatic Participation</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Participation</span>
                <span class="spec-value">Track Selection Only</span>
              </div>
            </div>

            <div class="spec-requirements">
              <h4 class="spec-req-title">Prerequisites</h4>
              <p class="spec-req-desc">Active enrollment in an NCAT NBTE academic program (AMS, ATE, or AME schools).</p>
            </div>

            <!-- Automatic participation alert -->
            <div class="sidebar-cohort-alert info-alert">
              <i class="bi bi-info-circle-fill alert-icon"></i>
              <div class="alert-text">
                <span class="alert-title">No Public Applications</span>
                <span class="alert-desc">All NCAT NBTE students are automatically registered in the N-CEDI ecosystem. Simply choose this track at the center.</span>
              </div>
            </div>

            <div class="sidebar-cta-wrapper">
              <BaseButton variant="accent" block size="md" to="/about" class="btn-sidebar-apply">
                Track Selection Guide
              </BaseButton>
              <p class="sidebar-cta-note">No public application required. Integrated into your academic progression.</p>
            </div>
          </div>
        </MotionWrapper>
      </aside>
    </div>

    <!-- Related Programs Recommendations Section -->
    <section class="related-programs-section">
      <div class="container">
        <div class="related-header">
          <span class="related-eyebrow">Explore More</span>
          <h2 class="related-title">Other Programs You Might Like</h2>
        </div>
        <div class="related-grid">
          <div
            v-for="relProgram in relatedPrograms"
            :key="relProgram.slug"
            class="related-grid__item"
          >
            <ProgramCard :program="relProgram" />
          </div>
        </div>
      </div>
    </section>

    <!-- Custom Immersive Lightbox Modal -->
    <Transition name="lightbox-fade">
      <div
        v-if="activePhotoIndex !== null && program.galleryUrls"
        class="lightbox-overlay"
        @click.self="closeLightbox"
      >
        <button class="lightbox-close-btn" @click="closeLightbox" aria-label="Close Lightbox">
          <i class="bi bi-x-lg"></i>
        </button>

        <button class="lightbox-nav-btn prev" @click="prevPhoto" aria-label="Previous Image">
          <i class="bi bi-chevron-left"></i>
        </button>

        <div class="lightbox-content-wrapper">
          <img
            :src="program.galleryUrls[activePhotoIndex]"
            alt="Enlarged facility image"
            class="lightbox-main-img"
          />
          <div class="lightbox-caption">
            <span>Facilities & Student Work — Image {{ activePhotoIndex + 1 }} of {{ program.galleryUrls.length }}</span>
          </div>
        </div>

        <button class="lightbox-nav-btn next" @click="nextPhoto" aria-label="Next Image">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.program-detail-page {
  background-color: var(--color-surface);
}

.program-sticky-nav-wrapper {
  position: sticky;
  top: 72px; /* AppNavbar height offset */
  z-index: 50;
  background: rgba(249, 249, 249, 0.85); /* Matching var(--color-surface) with glass */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  transition: all 0.3s ease;
}

.program-sticky-nav-wrapper.is-sticky {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.program-sticky-nav {
  display: flex;
  gap: var(--space-8);
  padding: var(--space-4) 0;
  overflow-x: auto;
  scrollbar-width: none; /* Hide scrollbar Firefox */
}

.program-sticky-nav::-webkit-scrollbar {
  display: none; /* Hide scrollbar Chrome/Safari */
}

.program-sticky-nav__tab {
  background: none;
  border: none;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--space-2) 0;
  position: relative;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.program-sticky-nav__tab:hover {
  color: var(--color-brand-primary);
}

.program-sticky-nav__tab.is-active {
  color: var(--color-brand-accent);
}

.program-sticky-nav__tab.is-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2.5px;
  background-color: var(--color-brand-accent);
  border-radius: var(--radius-full);
}

.program-detail-layout {
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: var(--space-16);
  padding: var(--space-8) var(--section-padding-x) var(--space-20);
}

@media (max-width: 1024px) {
  .program-detail-layout {
    grid-template-columns: 1fr;
    gap: var(--space-12);
    padding: var(--space-4) var(--section-padding-x) var(--space-16);
  }
}

.program-section-block {
  padding-top: var(--space-8);
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-12);
}

.program-section-block:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.program-body-section {
  font-size: var(--text-base);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
}

/* Outcomes styling */
.outcomes-wrapper {
  display: flex;
  flex-direction: column;
}

.outcomes-header {
  margin-bottom: var(--space-8);
}

.outcomes-eyebrow {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
  color: var(--color-brand-accent);
  display: block;
  margin-bottom: var(--space-2);
}

.outcomes-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-brand-primary);
  margin: 0;
}

.outcomes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}

@media (max-width: 768px) {
  .outcomes-grid {
    grid-template-columns: 1fr;
  }
}

.outcome-card-pro {
  display: flex;
  gap: var(--space-4);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.outcome-card-pro:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(107, 89, 255, 0.08);
  border-color: rgba(107, 89, 255, 0.2);
}

.outcome-card-pro__icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: rgba(107, 89, 255, 0.08);
  color: var(--color-brand-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.outcome-card-pro:hover .outcome-card-pro__icon-wrapper {
  background: var(--color-brand-accent);
  color: #ffffff;
  transform: scale(1.05);
}

.outcome-card-pro__content {
  display: flex;
  flex-direction: column;
}

.outcome-card-pro__title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-brand-primary);
  margin: 0 0 var(--space-1) 0;
}

.outcome-card-pro__text {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* Gallery styling */
.program-gallery {
  display: flex;
  flex-direction: column;
}

.gallery-header {
  margin-bottom: var(--space-8);
}

.gallery-eyebrow {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
  color: var(--color-brand-accent);
  display: block;
  margin-bottom: var(--space-2);
}

.program-gallery__title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-brand-primary);
  margin: 0;
}

.program-gallery__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

@media (max-width: 768px) {
  .program-gallery__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }
}

@media (max-width: 480px) {
  .program-gallery__grid {
    grid-template-columns: 1fr;
  }
}

.program-gallery__item {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
  aspect-ratio: 4/3;
  background-color: var(--color-surface-inset);
  cursor: pointer;
}

.program-gallery__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.program-gallery__item:hover .program-gallery__image {
  transform: scale(1.08);
}

.program-gallery__item-overlay {
  position: absolute;
  inset: 0;
  background: rgba(11, 15, 25, 0.75);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  opacity: 0;
  transition: opacity 0.3s ease;
  color: #ffffff;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.program-gallery__item:hover .program-gallery__item-overlay {
  opacity: 1;
}

.zoom-icon {
  font-size: 1.6rem;
  color: var(--color-brand-accent);
}

/* Sidebar styling */
.program-sidebar-card {
  position: sticky;
  top: 170px; /* Offset spacing to sit neatly under header & tabs */
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.program-sidebar-card:hover {
  border-color: rgba(107, 89, 255, 0.2);
  box-shadow: 0 30px 60px rgba(107, 89, 255, 0.06);
}

@media (max-width: 1024px) {
  .program-sidebar-card {
    position: static;
    top: auto;
  }
}

.sidebar-badge-top {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--color-brand-accent);
  margin-bottom: var(--space-4);
}

.pulse-indicator {
  width: 8px;
  height: 8px;
  background-color: var(--color-brand-accent);
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 0 rgba(107, 89, 255, 0.7);
  animation: sidebarPulse 2s infinite;
}

@keyframes sidebarPulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(107, 89, 255, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(107, 89, 255, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(107, 89, 255, 0);
  }
}

.sidebar-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  color: var(--color-brand-primary);
  margin-top: 0;
  margin-bottom: var(--space-6);
  font-weight: 800;
  letter-spacing: var(--tracking-tight);
}

.spec-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.spec-item {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-3);
  align-items: center;
}

.spec-label {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}

.spec-value {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-brand-primary);
}

.color-green {
  color: #10b981 !important;
}

.spec-requirements {
  margin-top: var(--space-6);
  margin-bottom: var(--space-6);
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
}

.spec-req-title {
  font-family: var(--font-display);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-brand-primary);
  margin-top: 0;
  margin-bottom: var(--space-2);
}

.spec-req-desc {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  margin: 0;
}

.sidebar-cohort-alert {
  display: flex;
  gap: var(--space-3);
  background: rgba(245, 158, 11, 0.06);
  border: 1px solid rgba(245, 158, 11, 0.15);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}

.alert-icon {
  color: #fbbf24;
  font-size: 1.2rem;
  margin-top: 2px;
}

.alert-text {
  display: flex;
  flex-direction: column;
}

.alert-title {
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 700;
  color: #92400e;
}

.alert-desc {
  font-family: var(--font-body);
  font-size: 0.7rem;
  color: #b45309;
  margin-top: 1px;
  line-height: var(--leading-normal);
}

/* Info alert variant — blue tones for informational notices */
.sidebar-cohort-alert.info-alert {
  background: rgba(107, 89, 255, 0.05);
  border-color: rgba(107, 89, 255, 0.15);
}

.sidebar-cohort-alert.info-alert .alert-icon {
  color: var(--color-brand-accent);
}

.sidebar-cohort-alert.info-alert .alert-title {
  color: #3730a3;
}

.sidebar-cohort-alert.info-alert .alert-desc {
  color: #4338ca;
}

.sidebar-cta-wrapper {
  margin-top: var(--space-6);
}

.btn-sidebar-apply {
  box-shadow: 0 4px 14px rgba(107, 89, 255, 0.2);
  transition: all 0.3s ease;
}

.btn-sidebar-apply:hover {
  box-shadow: 0 6px 20px rgba(107, 89, 255, 0.4);
  transform: translateY(-1px);
}

.sidebar-cta-note {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-align: center;
  margin-top: var(--space-3);
  margin-bottom: 0;
}

/* Related programs section */
.related-programs-section {
  padding: var(--space-20) 0;
  background-color: var(--color-surface-muted);
  border-top: 1px solid var(--color-border);
}

.related-header {
  margin-bottom: var(--space-10);
}

.related-eyebrow {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
  color: var(--color-brand-accent);
  display: block;
  margin-bottom: var(--space-2);
}

.related-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-brand-primary);
  margin: 0;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-8);
}

@media (max-width: 768px) {
  .related-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}

/* Lightbox styles */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(11, 15, 25, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close-btn {
  position: absolute;
  top: var(--space-6);
  right: var(--space-6);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 1.4rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10000;
}

.lightbox-close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.08);
}

.lightbox-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 1.5rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10000;
}

.lightbox-nav-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-brand-accent);
  transform: translateY(-50%) scale(1.08);
}

.lightbox-nav-btn.prev {
  left: var(--space-8);
}

.lightbox-nav-btn.next {
  right: var(--space-8);
}

@media (max-width: 768px) {
  .lightbox-nav-btn {
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
  }
  .lightbox-nav-btn.prev {
    left: var(--space-4);
  }
  .lightbox-nav-btn.next {
    right: var(--space-4);
  }
}

.lightbox-content-wrapper {
  max-width: 80vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.lightbox-main-img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: var(--radius-lg);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.lightbox-caption {
  margin-top: var(--space-4);
  color: rgba(255, 255, 255, 0.65);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
}

/* Lightbox transition animation */
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}
</style>
