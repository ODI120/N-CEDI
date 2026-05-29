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
    enabled: true
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
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'apple-touch-icon', href: '/logo.png' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100;0,400;0,700;1,100;1,400;1,700&family=DM+Sans:wght@400;700&family=Sora:wght@400;700&family=Space+Grotesk:wght@300;500;700&display=swap' }
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
    '/': { prerender: true },
    '/about': { prerender: true },
    '/programs/**': { isr: 3600 },
    '/events/**': { isr: 1800 },
    '/blog/**': { isr: 3600 },
    '/gallery': { isr: 7200 },
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
      { name: 'Inter', provider: 'google' },
      { name: 'Sora', provider: 'google' },
      { name: 'DM Sans', provider: 'google' },
      { name: 'Space Grotesk', provider: 'google' }
    ]
  },

  supabase: {
    redirect: false
  },

  runtimeConfig: {
    // Server-only variables (never exposed to client)
    adminInitSecret: process.env.ADMIN_INIT_SECRET || process.env.NUXT_ADMIN_INIT_SECRET || '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY || '',
    
    public: {
      // Public variables (safe to expose to client)
      supabaseUrl: '',
      supabaseAnonKey: ''
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
