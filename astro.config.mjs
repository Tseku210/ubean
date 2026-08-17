import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sanity from "@sanity/astro";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://www.ubean.mn",

  compressHTML: true,

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
      // @sanity/astro 3.5 defaults this to "hash" when `output: "static"`,
      // which prerenders the /admin route. That would leave the build with no
      // on-demand route at all, so Astro would emit no server function and the
      // menu's `server:defer` island would 404. "browser" keeps the previous
      // (3.2.x) behaviour: an on-demand /admin route and real Studio URLs.
      studioRouterHistory: "browser",
    }),
  ],

  image: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
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
});
