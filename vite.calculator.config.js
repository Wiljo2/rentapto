import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url))

// Standalone calculator (no Supabase, no AI) — static build for GitHub Pages.
// base './' keeps asset paths relative, so it works under /<repo-name>/.
export default defineConfig({
  root: fromRoot('./calculator'),
  base: './',
  publicDir: fromRoot('./public'),
  plugins: [react()],
  build: {
    outDir: fromRoot('./dist-calculator'),
    emptyOutDir: true,
  },
})
