import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import flowbiteReact from "flowbite-react/plugin/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    flowbiteReact(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "MyCafe",
        short_name: "Aplikasi",
        description: "mycafe-postproject",
        background_color: "#ffffff",
        start_url: "/",
        theme_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/images/logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/images/logo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "flowbite-react/dist/helpers/get-tailwind-version.js":
        "/src/shims/empty.js",
    },
  },
});
