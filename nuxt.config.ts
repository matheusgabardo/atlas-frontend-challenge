import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/image', '@nuxt/eslint', '@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  // Tailwind v4 via the official Vite plugin (no UI library) — see docs/adr/0003.
  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
    // Type-checking runs via `npm run typecheck` (vue-tsc), outside the production build.
  },

  // @nuxt/image: optimization for external images (Pexels/randomuser) — see docs/adr/0006.
  image: {
    domains: ['images.pexels.com', 'randomuser.me'],
    format: ['avif', 'webp'],
  },

  runtimeConfig: {
    public: {
      // Overridable via NUXT_PUBLIC_SITE_URL (used for canonical/OG/sitemap).
      siteUrl: 'https://freelanceparaeventos.com.br',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Freelance para Eventos — profissionais para o seu evento',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Encontre e contrate profissionais e freelancers para o seu evento: fotógrafos, DJs, buffet, cerimonial e muito mais.',
        },
      ],
    },
  },
})
