import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      "/v1/chat": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/v1/health": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
