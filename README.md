# UBean Roastery House Landing Page

This project is a dedicated landing page for UBean Roastery House, a coffee shop that offers freshly roasted beans and brewed coffee. The website showcases the brand's commitment to quality coffee and exceptional customer experience.

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```bash
/
├── public/
│   └── images/       # Contains product 
images and branding assets
├── src/
│   ├── assets/       # SVG icons and other 
assets
│   ├── components/   # UI components 
organized by section
│   ├── layouts/      # Page layouts
│   ├── lib/          # Utility functions
│   ├── pages/        # Page routes
│   └── styles/       # Global styles
├── schemas/          # Sanity CMS schemas
└── package.json
```

## 🛠️ Technologies

- Astro - Fast, modern static site generator
- React - For interactive UI components
- Tailwind CSS - Utility-first CSS framework
- GSAP - Animation library
- Sanity CMS - Headless content management system

## ⚙️ Setup

Copy `.env.example` to `.env` and set `PUBLIC_WEB3FORMS_ACCESS_KEY` (from the Web3Forms dashboard) — the contact form cannot submit without it.

## 🍽️ Menu content updates

The menu pages are prerendered at build time (the Sanity query in
`src/components/menu/MenuList.astro` runs during `astro build`), so publishing
a menu change in Sanity Studio does **not** update the live site by itself — a
rebuild is required. One-time setup to make publishes deploy automatically:

1. **Vercel:** Project Settings → Git → Deploy Hooks → create a hook
   (e.g. `sanity-menu-publish`) and copy its URL.
2. **Sanity:** [sanity.io/manage](https://sanity.io/manage) → API → Webhooks →
   create a GROQ-powered webhook with filter `_type == "menuItem"` that POSTs
   to the Vercel deploy hook URL.
3. **Vercel env vars:** deploy-hook builds run on Vercel's infrastructure, so
   `PUBLIC_WEB3FORMS_ACCESS_KEY` must be set in the Vercel project's
   Environment Variables (local `.env` is gitignored and won't be there) —
   otherwise a cloud build silently ships a broken contact form.

After that, publishing in Studio goes live in ~1-2 minutes.
