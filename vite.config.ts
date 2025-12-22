import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    base: "/",
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Core React
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            
            // Router
            if (id.includes("react-router-dom")) {
              return "router";
            }
            
            // UI Libraries
            if (id.includes("lucide-react") || id.includes("recharts") || id.includes("sweetalert2")) {
              return "ui-vendor";
            }
            
            // Google Auth
            if (id.includes("google-auth-library")) {
              return "auth";
            }
            
            // Utils (UUID)
            if (id.includes("uuid")) {
              return "utils";
            }
            
            // Components (chunk by feature)
            if (id.includes("/components/")) {
              if (id.includes("Inventory") || id.includes("Pos")) {
                return "inventory-pos";
              }
              if (id.includes("Sales") || id.includes("Dashboard")) {
                return "sales-dashboard";
              }
              if (id.includes("Tournaments") || id.includes("Users")) {
                return "users-tournaments";
              }
              return "components";
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      host: "0.0.0.0",
      hmr: {
        overlay: false,
      },
      ws: false, // Disable WebSocket
    },
    plugins: [react()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      __DEV__: mode === 'development',
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
