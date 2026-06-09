import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    lightningcss: {
      errorRecovery: true,
    }
  },
  resolve: {
  alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})
