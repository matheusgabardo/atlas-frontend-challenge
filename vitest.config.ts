import { defineVitestConfig } from '@nuxt/test-utils/config'

// Pure logic (shared/, composables, utils, server) runs in the 'node' environment.
// Component tests declare `// @vitest-environment nuxt` (or happy-dom) at the top of the file.
export default defineVitestConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['shared/**', 'app/composables/**', 'app/utils/**', 'server/**'],
    },
  },
})
