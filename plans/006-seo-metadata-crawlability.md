# Plan 006: Fix broken social/SEO metadata and add sitemap, robots.txt, and hreflang

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a18fdfa..HEAD -- src/components/Head.astro src/layouts/ astro.config.mjs public/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline-ci.md (build gate); run after
  plans/003-dependency-hygiene.md to avoid lockfile churn conflicts
- **Category**: bug / direction
- **Planned at**: commit `a18fdfa`, 2026-08-16

## Why this matters

For a physical coffee shop whose acquisition funnel is local search and social
sharing, the machine-readable layer is broken in five compounding ways:

1. Every page's `og:image`/`twitter:image` points at
   `/images/coffee-beans.webp`, **which does not exist** — every Facebook/
   Instagram/Messenger share renders with no preview image.
2. `Head.astro` emits **two** JSON-LD `CafeOrCoffeeShop` blocks on every page,
   both claiming `"@id": "https://ubean.mn/#coffee-shop"` with conflicting
   `url`/`description`/`inLanguage` — validators may discard both, wasting the
   carefully entered address/hours data. They also use apex `https://ubean.mn`
   while the site config canonicalizes to `https://www.ubean.mn`, reference
   `/images/about-us.webp` (doesn't exist), and point `hasMenu` at `/menu`
   (no such route).
3. The homepage layout (`HomeLayout.astro`) hardcodes English description/
   keywords, so `/mn` serves English metadata despite Mongolian variants
   existing in `src/consts.ts`.
4. No sitemap and no robots.txt — 13 routes, none advertised to crawlers.
5. No hreflang alternates — Google has no signal that `/about-us` and
   `/mn/about-us` are translations, the standard cause of one locale being
   deprioritized as duplicate content.

## Current state

- `astro.config.mjs` — `site: "https://www.ubean.mn"` (line 9); i18n block
  (lines 42-48): locales `["en", "mn"]`, `defaultLocale: "en"`,
  `prefixDefaultLocale: false`. Integrations array (lines 17-25) currently
  holds `react()` and `sanity(...)` only.
- `src/layouts/Layout.astro:16-25` — the CORRECT pattern (exemplar):

  ```astro
  const lang = getLangFromUrl(Astro.url);
  const siteDescription = getDescription(lang);
  const siteKeywords = getKeywords(lang);

  const {
    title,
    description = siteDescription,
    keywords = siteKeywords,
    image = "/images/coffee-beans.webp",
  } = Astro.props;
  ```

- `src/layouts/HomeLayout.astro:22-27` — the drifted copy:

  ```astro
  const {
    title,
    description = "UBean - Premium Coffee Experience",
    keywords = "ubean, roastery, coffee, beans, premium, espresso, americano",
    image = "/images/coffee-beans.webp",
  } = Astro.props;
  ```

  (It also lacks the `getDescription`/`getKeywords` imports — see
  `Layout.astro:5-6` for the import lines to copy:
  `import { getLangFromUrl } from "@/i18n/utils";` is already there;
  `import { getDescription, getKeywords } from "@/lib/seo";` is missing.)

- `public/images/` contains (verified): `aboutus-1.webp`, `aboutus-2.webp`,
  `bean-portofilter.webp`, `bg.webp`, `brazil-bean.webp`,
  `butalsan-portofilter.webp`, `company-discount.webp`, `cup.webp`,
  `dark-horse-bean.webp`, `ethiopia-bean.webp`, `guatemala-bean.webp`,
  `iron-horse-bean.webp`, `latte-portofilter.webp`, `logo.webp`,
  `loyalty-discount.webp`, `portofilters.webp`, `ubean-cup.webp`,
  `where-the-aroma-begins.webp`. There is NO `coffee-beans.webp` and NO
  `about-us.webp`.
- `src/components/Head.astro`:
  - Line 42: `<link rel="canonical" href={canonicalURL} />` — no hreflang
    alternates anywhere in the file.
  - Lines 56, 64: og/twitter image via `new URL(image, Astro.site).href`.
  - Lines 71-120: English JSON-LD block (`is:inline` script,
    `"@id": "https://ubean.mn/#coffee-shop"`, `"url": "https://ubean.mn"`,
    `"hasMenu": "https://ubean.mn/menu"`, `"image": [".../about-us.webp", ".../aboutus-2.webp"]`).
  - Lines 122-173: a second, Mongolian JSON-LD block with the SAME `@id`,
    `"url": "https://ubean.mn/mn"`, `inLanguage: "mn"`. Both blocks render on
    every page unconditionally.
  - The frontmatter has access to a `lang` value — check the top of the file
    for how `getLangFromUrl(Astro.url)` is used (it is imported in the layouts;
    if `Head.astro` doesn't compute it already, derive it the same way).
- Menu routes that actually exist: `/menu/coffee`, `/menu/non-coffee`,
  `/menu/specialty`, `/menu/grub` (+ `/mn/...` mirrors). There is no `/menu`.
- i18n URL scheme: English pages at `/x`, Mongolian at `/mn/x` (verified via
  `src/pages/` layout and `useTranslatedPath` in `src/i18n/utils.ts:15-19`).

## Commands you will need

| Purpose | Command      | Expected on success |
|---------|--------------|---------------------|
| Install | `pnpm add @astrojs/sitemap` | exit 0 |
| Build   | `pnpm build` | exit 0; `dist/` contains `sitemap-index.xml` |
| Typecheck | `pnpm typecheck` | error count ≤ pre-plan baseline |

## Scope

**In scope** (the only files you should modify/create):
- `src/components/Head.astro`
- `src/layouts/HomeLayout.astro`
- `astro.config.mjs` (integrations array only)
- `package.json` / `pnpm-lock.yaml` (adding `@astrojs/sitemap` only)
- `public/robots.txt` (create)

**Out of scope** (do NOT touch, even though they look related):
- `src/layouts/Layout.astro` — except its `image` default is ALSO broken; fix
  ONLY that one string (see Step 1). No other edits there.
- Flipping `defaultLocale` to `mn` — an owner-level decision that moves every
  URL; explicitly deferred.
- Translating the remaining English `mn` strings in `src/i18n/ui.ts` —
  content work, separate effort.
- Merging `Layout.astro`/`HomeLayout.astro` into one layout — worthwhile
  (they are ~95% identical) but a separate refactor; here you only sync the
  metadata defaults.
- The `hasMenu` structured-data type could be a full `Menu` graph from Sanity
  data — deferred (see Maintenance notes).

## Git workflow

- Branch: `advisor/006-seo-metadata-crawlability`
- Conventional commits (e.g. `fix: point og:image at an existing asset`,
  `feat: add sitemap, robots.txt and hreflang alternates`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fix the OG image default in both layouts

In `src/layouts/Layout.astro` (line 24) and `src/layouts/HomeLayout.astro`
(line 26), change:

```astro
image = "/images/coffee-beans.webp",
```

to:

```astro
image = "/images/where-the-aroma-begins.webp",
```

(An existing 1200-px-class photo asset; verified present in `public/images/`.)

**Verify**: `grep -rn "coffee-beans.webp" src/` → 0 matches.

### Step 2: Make `HomeLayout.astro` locale-aware

Add the missing import and replace the hardcoded defaults so the block matches
the `Layout.astro` exemplar shown in "Current state" (same
`getDescription(lang)` / `getKeywords(lang)` pattern).

**Verify**: `grep -n "Premium Coffee Experience" src/layouts/HomeLayout.astro`
→ 0 matches; `pnpm typecheck` → no new errors.

### Step 3: Collapse the JSON-LD to one locale-selected block

In `src/components/Head.astro`:

1. Ensure the frontmatter computes `lang` (via the existing
   `getLangFromUrl(Astro.url)` convention if not already available).
2. Build ONE structured-data object in the frontmatter, selected by `lang`,
   and render it with a single `<script type="application/ld+json"
   set:html={JSON.stringify(jsonLd)} />`. Keep all existing field values
   (address, phone, hours, sameAs) but correct:
   - all `https://ubean.mn` origins → `https://www.ubean.mn` (build them with
     `new URL(path, Astro.site).href` where practical),
   - `"image"` array → existing files only:
     `["https://www.ubean.mn/images/aboutus-1.webp", "https://www.ubean.mn/images/aboutus-2.webp"]`,
   - `"logo"` → `https://www.ubean.mn/images/logo.webp` (file exists),
   - `"hasMenu"` → `https://www.ubean.mn/menu/coffee` (en) /
     `https://www.ubean.mn/mn/menu/coffee` (mn),
   - `"url"` → `https://www.ubean.mn/` (en) / `https://www.ubean.mn/mn` (mn),
   - keep a single shared `"@id": "https://www.ubean.mn/#coffee-shop"` (one
     entity, locale-varying description/inLanguage is fine once only one block
     renders per page).
   - `name`/`description`/`servesCuisine`/`inLanguage` per locale, taking the
     Mongolian strings verbatim from the current second block (lines 122-173)
     before deleting it.
3. Delete both old `is:inline` JSON-LD blocks.

**Verify**: `pnpm build` → exit 0, then
`grep -c "application/ld+json" dist/index.html` → 1 (was 2), and
`grep -c "application/ld+json" dist/mn/index.html` → 1; `grep -o '"inLanguage":"[a-z]*"' dist/mn/index.html` → `mn`.
(If dist paths differ, locate the built homepage with `ls dist` first —
static output may nest under `dist/client/`.)

### Step 4: Add hreflang alternates

In `Head.astro`, next to the canonical link, emit alternates for both locales.
The URL scheme: English page at `/x` ↔ Mongolian at `/mn/x`. Compute from the
current path:

```astro
const path = Astro.url.pathname.replace(/^\/mn(?=\/|$)/, "") || "/";
const enUrl = new URL(path, Astro.site).href;
const mnUrl = new URL(`/mn${path === "/" ? "" : path}`, Astro.site).href;
```

```astro
<link rel="alternate" hreflang="en" href={enUrl} />
<link rel="alternate" hreflang="mn" href={mnUrl} />
<link rel="alternate" hreflang="x-default" href={enUrl} />
```

**Verify**: after `pnpm build`,
`grep -c 'hreflang' <built about-us html>` → 3, and the `mn` alternate on
`/about-us` points to `/mn/about-us` (inspect the built HTML for both locales
of one page).

### Step 5: Add the sitemap integration and robots.txt

1. `pnpm add @astrojs/sitemap`
2. In `astro.config.mjs`, import and append it to `integrations`:

   ```js
   import sitemap from "@astrojs/sitemap";
   // ...
   integrations: [
     react(),
     sanity({ ... }),   // unchanged
     sitemap({
       i18n: {
         defaultLocale: "en",
         locales: { en: "en", mn: "mn" },
       },
       filter: (page) => !page.includes("/admin"),
     }),
   ],
   ```

3. Create `public/robots.txt`:

   ```
   User-agent: *
   Disallow: /admin
   Sitemap: https://www.ubean.mn/sitemap-index.xml
   ```

**Verify**: `pnpm build` → exit 0;
`find dist -name "sitemap*"` → at least `sitemap-index.xml` exists; sitemap
files contain no `/admin` URL (`grep -l admin dist/**/sitemap*.xml` → nothing);
`find dist -name robots.txt` → present.

## Test plan

No unit tests (template/config work). Post-merge operator checks (list in your
report): run the built homepage HTML through Google's Rich Results Test
(expect one valid `CafeOrCoffeeShop`), and a share-preview debugger
(Facebook Sharing Debugger) against the deployed URL — the preview image must
resolve.

## Done criteria

- [ ] `grep -rn "coffee-beans.webp" src/` → 0 matches
- [ ] Built homepage HTML contains exactly 1 `application/ld+json` script per
      page, none referencing `about-us.webp`, `ubean.mn/menu"`, or a bare
      `https://ubean.mn` origin (`grep -o 'https://ubean\.mn[^w]' <built html>` → nothing)
- [ ] Built pages contain `hreflang="en"`, `hreflang="mn"`, `hreflang="x-default"`
- [ ] `sitemap-index.xml` emitted; `/admin` excluded; `robots.txt` in build output
- [ ] `pnpm typecheck` error count ≤ baseline; `pnpm build` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `Head.astro`'s current content doesn't match the line references above.
- `@astrojs/sitemap`'s i18n option shape rejects the config (API drift between
  versions) — report the installed version and its documented shape.
- The built output contains zero pages in the sitemap (integration
  misconfigured vs `output: "static"`).
- Fixing the JSON-LD seems to require touching `src/consts.ts` or adding new
  translation keys — the current blocks already contain all strings needed;
  needing more means drift.

## Maintenance notes

- Deferred, high-value follow-up: generate a real `schema.org/Menu` +
  `MenuSection`/`MenuItem` graph on the four menu pages from the Sanity data
  that already flows through `src/components/menu/MenuList.astro` — prices,
  bilingual names, and images are all in the CMS.
- Deferred decision for the owner: `defaultLocale: "en"` on a Mongolian
  business — flipping it moves every URL and needs redirects + the hreflang
  from this plan as prerequisites. Also: 8 `mn` homepage strings in
  `src/i18n/ui.ts` are still verbatim English — a translator pass converts
  this plan's plumbing into actual Mongolian search presence.
- Reviewers: check the hreflang URLs on the `/mn` homepage specifically
  (`/mn` has no trailing path — the regex edge case in Step 4).
- If pages are ever added or renamed, the sitemap updates automatically, but
  the JSON-LD `hasMenu` URL is hardcoded — keep it pointing at a live route.
