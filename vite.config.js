import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import routify from '@roxi/routify/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  server: {
    https: true,
  },
  plugins: [svelte(), mkcert(), routify()],
})
