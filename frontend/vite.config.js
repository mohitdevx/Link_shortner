import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // In Docker Compose, backend is reachable at http://backend:5000.
  // Locally outside Docker, it is reachable at http://localhost:5000.
  const proxyTarget =
    process.env.BACKEND_PROXY_URL ||
    env.BACKEND_PROXY_URL ||
    "http://backend:5000";

  return {
    plugins: [tailwindcss(), react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
