import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

import sanity from "@sanity/astro";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://ubean.mn",

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

  adapter: vercel(),

  i18n: {
    locales: ["en", "mn"],
    defaultLocale: "en",
  },
});

