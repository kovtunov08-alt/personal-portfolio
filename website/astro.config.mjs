// @ts-check
import { defineConfig } from 'astro/config'

// ponytail: pure static build for Vercel CDN. Committed `.vercel/output` kept routing `/_astro/*`
// to a dead serverless function (CSS 500). Custom assets dir sidesteps that stale route.
export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 4321,
  },
  build: {
    assets: 'assets',
  },
})
