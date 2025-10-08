import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Celest-AR/',  
  esbuild: {
    jsx: 'automatic', // O kaya `transform` depende sa error
  },
})
