// @ts-check
import { defineConfig } from 'astro/config'

// GitHub Pages project site: https://kovtunov08-alt.github.io/personal-portfolio/
export default defineConfig({
  site: 'https://kovtunov08-alt.github.io',
  base: '/personal-portfolio',
  server: {
    host: '127.0.0.1',
    port: 4321,
  },
  build: {
    assets: 'assets',
  },
})
