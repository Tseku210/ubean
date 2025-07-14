import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

import sanity from "@sanity/astro";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    sanity({
      projectId: "ulqjwxud",
      dataset: "production",
      useCdn: false,
      studioBasePath: "/admin",
    }),
  ],
  image: {
    domains: ["cdn.sanity.io"],
    remotePatterns: [{ protocol: "https" }],
  },
});
