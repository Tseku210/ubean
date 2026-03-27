import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sanity from "@sanity/astro";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: "https://www.ubean.mn",

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

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    maxDuration: 8,
    imageService: true,
    devImageService: "sharp",
  }),
  output: "static",

  i18n: {
    locales: ["en", "mn"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },

  experimental: {
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: "Ubuntu",
        cssVariable: "--font-ubuntu",
        weights: [300, 400, 500, 600, 700],
        styles: ["normal", "italic"],
      },
      {
        provider: fontProviders.fontsource(),
        name: "Roboto",
        cssVariable: "--font-roboto",
        weights: [300, 400, 500, 600, 700],
        styles: ["normal"],
      },
    ],
  },
});
