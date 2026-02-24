import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: {
        name: "Boreal Insurance",
        short_name: "Boreal",
        description: "Personal Guarantee Insurance",
        theme_color: "#0b1f35",
        background_color: "#0b1f35",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml"
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /\/api\/bi\/application\/.*\/documents$/,
            handler: "NetworkOnly",
            options: {
              backgroundSync: {
                name: "bi-upload-queue",
                options: {
                  maxRetentionTime: 24 * 60
                }
              }
            }
          }
        ]
      }
    })
  ]
});
