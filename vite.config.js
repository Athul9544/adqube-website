import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
    // Bind to all interfaces so phones on the same Wi-Fi can reach the dev
    // server at http://<your-lan-ip>:5173
    host: true,
  },
})
