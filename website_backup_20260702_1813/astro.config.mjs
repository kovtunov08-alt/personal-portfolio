// @ts-check
import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'

// Static SSG for portfolio pages; `/api/contact` stays server-rendered for file uploads.
// Vercel adapter matches the planned production host.
export default defineConfig({
  output: 'static',
  adapter: vercel(),
})
