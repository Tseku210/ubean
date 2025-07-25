import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

import sanity from "@sanity/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://your-coffee-shop.com", // Replace with your actual domain
  prefetch: true,
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    sanity({
      projectId: "ulqjwxud",
      dataset: "production",
      useCdn: true,
      studioBasePath: "/admin",
    }),
  ],
  image: {
    domains: ["cdn.sanity.io"],
    remotePatterns: [{ protocol: "https" }],
  },
});
