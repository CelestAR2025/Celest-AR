import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Make sure the base matches your repo name exactly (case-sensitive)
export default defineConfig({
  base: '/Celest-AR/',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
})
