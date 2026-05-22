<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, createError } from '#app'
import HeroProgram from '~/components/sections/HeroProgram.vue'
import RichTextRenderer from '~/components/cms/RichTextRenderer.vue'
import MotionWrapper from '~/components/motion/MotionWrapper.vue'
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
    const p = dbProgram.value
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
</script>

<template>
  <div v-if="program" class="program-detail-page">
    <HeroProgram :program="program" />

    <div class="program-detail-layout container">
      <!-- Main Content -->
      <div class="program-detail-layout__main">
        <MotionWrapper variant="fadeUp" :delay="100">
          <div class="program-body-section">
            <RichTextRenderer :body="program.body" />
          </div>
        </MotionWrapper>

        <!-- Learning Outcomes -->
        <MotionWrapper variant="fadeUp" :delay="200" class="outcomes-wrapper">
          <div class="outcomes-box">
            <h2 class="outcomes-box__title">Key Learning Outcomes</h2>
            <ul class="outcomes-box__list">
              <li
                v-for="(outcome, oIdx) in program.outcomes"
                :key="oIdx"
                class="outcomes-box__item"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{{ outcome }}</span>
              </li>
            </ul>
          </div>
        </MotionWrapper>

        <!-- Facilities & Project Gallery -->
        <section v-if="program.galleryUrls && program.galleryUrls.length > 0" class="program-gallery">
          <h2 class="program-gallery__title">Facilities & Student Work</h2>
          <div class="program-gallery__grid">
            <div
              v-for="(url, gIdx) in program.galleryUrls"
              :key="gIdx"
              class="program-gallery__item"
            >
              <NuxtImg
                :src="url"
                alt="Program gallery asset"
                sizes="sm:100vw md:50vw lg:33vw xl:400px"
                format="webp"
                class="program-gallery__image"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </div>

      <!-- Sidebar details -->
      <aside class="program-detail-layout__sidebar">
        <MotionWrapper variant="fadeUp" :delay="300">
          <div class="program-sidebar-card">
            <h3 class="sidebar-title">Program Specifications</h3>
            
            <div class="spec-list">
              <div class="spec-item">
                <span class="spec-label">Duration</span>
                <span class="spec-value">{{ program.durationWeeks }} Weeks</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Level</span>
                <span class="spec-value capitalize">{{ program.level }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Tuition Funding</span>
                <span class="spec-value color-green">Sponsorship Available</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Intake Schedule</span>
                <span class="spec-value">Cohort 5 (June 2026)</span>
              </div>
            </div>

            <div class="spec-requirements">
              <h4 class="spec-req-title">Prerequisites</h4>
              <p class="spec-req-desc">{{ program.requirements }}</p>
            </div>

            <div class="sidebar-cta-wrapper">
              <BaseButton variant="accent" block size="md" to="/contact">
                Apply for Enrollment
              </BaseButton>
              <p class="sidebar-cta-note">Applications close on June 5, 2026. Limited seats.</p>
            </div>
          </div>
        </MotionWrapper>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.program-detail-page {
  background-color: var(--color-surface);
}

.program-detail-layout {
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: var(--space-12);
  padding: var(--space-16) var(--section-padding-x);
}

@media (max-width: 1024px) {
  .program-detail-layout {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
}

.program-body-section {
  margin-bottom: var(--space-12);
}

/* Outcomes box styling */
.outcomes-wrapper {
  margin-bottom: var(--space-12);
}

.outcomes-box {
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
}

.outcomes-box__title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  color: var(--color-brand-primary);
  margin-top: 0;
  margin-bottom: var(--space-6);
}

.outcomes-box__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .outcomes-box__list {
    grid-template-columns: 1fr;
  }
}

.outcomes-box__item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text-secondary);
}

.check-icon {
  color: var(--color-brand-secondary);
  flex-shrink: 0;
  margin-top: 2px;
}

/* Gallery styling */
.program-gallery {
  margin-bottom: var(--space-12);
}

.program-gallery__title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  color: var(--color-brand-primary);
  margin-top: 0;
  margin-bottom: var(--space-6);
}

.program-gallery__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .program-gallery__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .program-gallery__grid {
    grid-template-columns: 1fr;
  }
}

.program-gallery__item {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  aspect-ratio: 4/3;
  background-color: var(--color-surface-inset);
}

.program-gallery__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.program-gallery__item:hover .program-gallery__image {
  transform: scale(1.04);
}

/* Sidebar styling */
.program-sidebar-card {
  position: sticky;
  top: var(--space-24);
  background-color: var(--color-surface);
  border: 2.5px solid var(--color-brand-accent);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-lg);
}

.sidebar-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  color: var(--color-brand-primary);
  margin-top: 0;
  margin-bottom: var(--space-6);
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
}

.spec-label {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
}

.spec-value {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-brand-primary);
}

.color-green {
  color: var(--color-brand-secondary) !important;
}

.spec-requirements {
  margin-top: var(--space-6);
  margin-bottom: var(--space-8);
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
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
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
  margin: 0;
}

.sidebar-cta-wrapper {
  margin-top: var(--space-6);
}

.sidebar-cta-note {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-align: center;
  margin-top: var(--space-3);
  margin-bottom: 0;
}
</style>
