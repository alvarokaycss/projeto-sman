import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 1. Permite que o Vite responda a requisições de fora do container
    host: true,
    // 2. Resolve o problema do WebSocket do HMR com Docker
    port: 5173,
    // 3. Força o Vite a verificar mudanças ativamente (Polling)
    watch: {
      usePolling: true,
    },
  },
});
