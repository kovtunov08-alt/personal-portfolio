// @ts-check
import { defineConfig } from 'astro/config'

// GitHub Pages project site: https://kovtunov08-alt.github.io/personal-portfolio/
export default defineConfig({
  site: 'https://kovtunov08-alt.github.io',
  base: '/personal-portfolio',
  server: {
    // ponytail: allow phone/LAN Host headers; use --host 0.0.0.0 when testing on device
    host: '127.0.0.1',
    port: 4321,
    allowedHosts: true,
  },
  build: {
    assets: 'assets',
  },
})
