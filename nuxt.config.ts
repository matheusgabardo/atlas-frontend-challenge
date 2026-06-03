import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/image', '@nuxt/eslint', '@pinia/nuxt'],

  // Auto-import components by filename (e.g. <AppIcon>, <ProviderCard>) without the dir prefix.
  components: [{ path: '~/components', pathPrefix: false }],

  css: [
    '~/assets/css/main.css',
    '~/assets/css/tokens.css',
    '~/assets/css/catalog.css',
    '~/assets/css/profile.css',
    '~/assets/css/overlays.css',
  ],

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
    domains: ['images.pexels.com', 'randomuser.me', 'picsum.photos', 'fastly.picsum.photos'],
    format: ['avif', 'webp'],
  },

  runtimeConfig: {
    public: {
      // Overridable via NUXT_PUBLIC_SITE_URL (used for canonical/OG/sitemap).
      siteUrl: 'https://quemfazeventos.com.br',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'QuemFaz Eventos — estrutura técnica para o seu evento',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Encontre e contrate fornecedores de estrutura técnica para o seu evento: som, iluminação, painel de LED, palco, projeção e energia.',
        },
      ],
      // Apply the persisted theme before paint to avoid a flash (light/dark).
      script: [
        {
          innerHTML:
            "(function(){try{var t=localStorage.getItem('qfe_theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();",
          tagPosition: 'head',
        },
      ],
    },
  },
})
