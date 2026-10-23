import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// El backend (FastAPI) corre en el puerto 8000. Vite reenvía /api y /static
// hacia él, así React y la API comparten origen y la cookie de sesión funciona.
const BACKEND = 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': BACKEND,
      '/static': BACKEND,
    },
  },
})
