import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sanity from "@sanity/astro";
import sitemap from "@astrojs/sitemap";
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
      // All sanityClient.fetch calls run at build time (the menu is
      // prerendered), where the CDN's cache offers no benefit — only the risk
      // of a publish-triggered rebuild baking stale data.
      useCdn: false,
      studioBasePath: "/admin",
      // @sanity/astro 3.5 defaults this to "hash" when `output: "static"`,
      // which prerenders the /admin route. "browser" keeps /admin as an
      // on-demand route with real Studio URLs; that Studio route is now the
      // only consumer of the Vercel server function (the menu is fully
      // prerendered). Switch to "hash" only if hash-based Studio URLs are
      // acceptable and a fully static build is wanted.
      studioRouterHistory: "browser",
    }),
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: { en: "en", mn: "mn" },
      },
      filter: (page) => !page.includes("/admin"),
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
      // cyrillic-ext carries Mongolian's Ө/Ү — without these subsets the MN
      // locale falls back to system fonts with mismatched weights
      subsets: ["latin", "cyrillic", "cyrillic-ext"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Roboto",
      cssVariable: "--font-roboto",
      weights: [300, 400, 500, 600, 700],
      styles: ["normal"],
      subsets: ["latin", "cyrillic", "cyrillic-ext"],
    },
  ],
});
