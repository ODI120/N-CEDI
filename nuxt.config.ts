// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-15',

  future: {
    compatibilityVersion: 4
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxtjs/seo',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-schema-org',
    '@nuxtjs/supabase',
    '@vueuse/motion/nuxt'
  ],

  devtools: {
    enabled: process.env.NODE_ENV !== 'production'
  },

  css: ['~/assets/css/main.css'],

  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'theme-color', content: '#0256ff' }
      ],
      link: [
        // Favicons — generated from logo.webp at correct sizes
        { rel: 'icon', type: 'image/png', href: '/favicon-32x32.png', sizes: '32x32' },
        { rel: 'icon', type: 'image/png', href: '/favicon-16x16.png', sizes: '16x16' },
        { rel: 'shortcut icon', href: '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', type: 'image/png', href: '/apple-touch-icon.png', sizes: '180x180' },
        // Preload critical LCP assets (site navbar logo)
        { rel: 'preload', as: 'image', href: '/logo.webp', type: 'image/webp' },
        // Async Bootstrap Icons — prevents render-blocking
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css', media: 'print', onload: "this.media='all'" },
        // DNS prefetch for Supabase API
        { rel: 'dns-prefetch', href: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || '' },
        // Preconnect to CDN for Bootstrap Icons woff2
        { rel: 'preconnect', href: 'https://cdn.jsdelivr.net' }
      ]
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    }
  },

  site: {
    url: 'https://ncedi.edu.ng',
    name: 'N-CEDI — NCAT Centre for Entrepreneurship Development and Innovation',
    description: 'Empowering the next generation of African innovators through hands-on vocational and tech training.',
    defaultLocale: 'en'
  },

  routeRules: {
    // ISR so homepage stats/gallery/programs reflect DB without full redeploy
    '/': { isr: 600, swr: true },
    '/about': { prerender: true },
    '/programs/**': { isr: 900 },
    '/events/**': { isr: 1800 },
    '/blog/**': { isr: 1800 },
    '/gallery': { isr: 600 },
    '/partners': { isr: 600 },
    '/admin/**': { ssr: false }
  },

  image: {
    quality: 80,
    format: ['avif', 'webp'],
    screens: {
      sm: 480,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1440
    }
  },

  fonts: {
    families: [
      { name: 'Lato', provider: 'local' },
      { name: 'JetBrains Mono', provider: 'local' },
      // { name: 'Inter', provider: 'local' },
      // { name: 'Space Grotesk', provider: 'local' }
    ]
  },

  supabase: {
    redirect: false,
    url: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
    key:
      process.env.SUPABASE_KEY
      || process.env.SUPABASE_ANON_KEY
      || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY
  },

  runtimeConfig: {
    // Server-only variables (never exposed to client)
    adminInitSecret: process.env.ADMIN_INIT_SECRET || process.env.NUXT_ADMIN_INIT_SECRET || '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY || '',

    public: {
      // Public variables (safe to expose to client)
      supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey:
        process.env.SUPABASE_KEY
        || process.env.SUPABASE_ANON_KEY
        || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
        || ''
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
