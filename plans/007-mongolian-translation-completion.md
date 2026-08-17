# Plan 007: Complete Mongolian translation coverage (100%)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise.
>
> **Drift note**: written during the `plans/execute-20260817` run, against the
> tree AFTER plans 001–006 landed. Plan 005 adds `menu.empty`/`menu.error`
> keys to `src/i18n/ui.ts` — expect them; they are already translated.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 005 (both edit `src/i18n/ui.ts`), 006 (locale-aware meta)
- **Category**: bug / i18n content
- **Planned at**: run branch `plans/execute-20260817` (base `a18fdfa`), 2026-08-17

## Why this matters

The user explicitly requested 100% Mongolian coverage. The i18n plumbing is
complete, but content gaps remain: eight `mn` keys in `src/i18n/ui.ts` hold
verbatim English marketing copy, two components hardcode English strings
outside the i18n system, the `BEANS` product data in `src/consts.ts` is
English-only (while its sibling `ADDONS` is locale-keyed), and there is no
Mongolian 404 page. A Mongolian visitor on `/mn` currently reads an
English-language homepage.

## Current state

- `src/i18n/ui.ts` — flat key/value objects `en` and `mn`; a `keyof` type
  ties the key sets together (adding a key to one locale only is a type
  error). The following `mn` keys hold English values (verify by comparing
  against the `en` values — they are identical strings): `home.title`,
  `home.hero.title`, `home.hero.desc`, `home.title2`, `home.beans.desc`,
  `home.since.desc`, `home.discount.title`, `home.discount.button`.
  (Exact line numbers may have shifted after plan 005 — locate by key name.)
- `src/components/home/RoastedBeans.tsx:44` — hardcodes the heading
  `"FRESHLY ROASTED BEANS"` in JSX instead of `t("...")`. The component
  already receives/derives `lang` — check its props and follow the pattern
  used by sibling components (`Hero.tsx`, `Discount.tsx`) which call
  `useTranslations(lang)`.
- `src/components/ui/MobileMenu.tsx:42` — hardcodes
  `"© 2025 All rights reserved"`; a translated `footer.allrights` key
  already exists in both locales of `ui.ts`.
- `src/consts.ts` — `BEANS` (lines ~3-38) is an array of
  `{ name, description, prices... }` in English only; the neighbouring
  `ADDONS` constant (~lines 41-57) is keyed by locale — that is the shape to
  mirror. Consumers to update: grep `BEANS` in `src/` (expected:
  `src/components/home/Beans.tsx`, `src/components/home/RoastedBeans.tsx`)
  and select the locale's entry the same way `ADDONS` consumers do.
- `src/pages/404.astro` — English-only 404; no `src/pages/mn/404.astro`
  exists. Its body already uses `t("error.404")` (translated in both
  locales) but its `<title>` is hardcoded English.

## Translation guidance

The executor translates to Mongolian (Cyrillic) directly:

- Match the register of the existing human-written `mn` strings in `ui.ts`
  (the about-us/contact sections) — natural marketing Mongolian, not
  word-for-word literalism.
- Keep brand terms as-is: "UBean", bean variety names ("Mogiana NY2 FC",
  "Dark Horse", etc.) stay Latin; translate only their descriptions.
- ALL-CAPS English headings render fine in Cyrillic caps — preserve the
  casing intent.
- Add a `// TODO: native-speaker review` comment above each block of
  machine-authored Mongolian, and list every translated string in your final
  report so the maintainer can hand them to a native reviewer.

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Typecheck | `pnpm typecheck` | error count ≤ pre-plan baseline |
| Build     | `pnpm build`     | exit 0              |

## Scope

**In scope** (the only files you should modify/create):
- `src/i18n/ui.ts`
- `src/consts.ts`
- `src/components/home/RoastedBeans.tsx`
- `src/components/home/Beans.tsx` (only if the `BEANS` shape change requires it)
- `src/components/ui/MobileMenu.tsx`
- `src/pages/404.astro` (title only)
- `src/pages/mn/404.astro` (create)

**Out of scope**:
- Menu content from Sanity (already bilingual via `nameMn` fields).
- `defaultLocale` — stays `en`; owner decision.
- Any layout/SEO file (plan 006 owns those).
- Translating the plans or docs.

## Steps

### Step 1: Translate the eight `mn` keys in `ui.ts`

Replace each English-valued `mn` string with natural Mongolian per the
guidance above.

**Verify**: `pnpm typecheck` → no new errors. Then confirm zero remaining
identical en/mn value pairs for these keys:
`node -e "const s=require('fs').readFileSync('src/i18n/ui.ts','utf8'); for (const k of ['home.title','home.hero.title','home.hero.desc','home.title2','home.beans.desc','home.since.desc','home.discount.title','home.discount.button']) { const re=new RegExp('\"'+k.replace(/\\./g,'\\\\.')+'\": \"([^\"]*)\"','g'); const m=[...s.matchAll(re)]; if(m.length>=2 && m[0][1]===m[1][1]) console.log('STILL ENGLISH:',k);}"`
→ no output.

### Step 2: Route the hardcoded strings through i18n

- `MobileMenu.tsx`: use the existing `footer.allrights` key.
- `RoastedBeans.tsx`: add a new key pair (e.g. `home.roasted.title`) to BOTH
  locales in `ui.ts` and use it.

**Verify**: `grep -rn "All rights reserved\|FRESHLY ROASTED" src/components/` →
no matches in the two components (the ui.ts `en` values are fine).

### Step 3: Localize `BEANS`

Restructure `BEANS` to the locale-keyed shape `ADDONS` uses (English names
kept, descriptions translated), and update its consumers to select by `lang`.

**Verify**: `pnpm typecheck` → no new errors; `pnpm build` → exit 0.

### Step 4: Mongolian 404

Create `src/pages/mn/404.astro` mirroring `src/pages/404.astro` (it will
derive `lang` from the URL and render the existing translated `error.404`
string); translate the hardcoded `<title>` in both files via a key or inline
per-locale strings.

**Verify**: `pnpm build` → exit 0 and the build output contains an mn 404
page (`find dist -path "*mn*404*"` → at least one file; if the output layout
differs, locate 404 output first with `find dist -name "404*"`).

## Done criteria

- [ ] Step 1 checker script → no output
- [ ] `grep -rn "All rights reserved\|FRESHLY ROASTED" src/components/` → no matches
- [ ] `BEANS` descriptions exist in both locales; consumers select by `lang`
- [ ] `src/pages/mn/404.astro` exists and builds
- [ ] `pnpm typecheck` ≤ baseline; `pnpm build` exit 0
- [ ] Final report lists every machine-translated string for native review

## STOP conditions

- The eight keys are not English-valued anymore (someone translated them
  already) — report and skip step 1.
- The `BEANS` shape change fans out beyond the two expected consumer
  components.
- Any i18n type error you cannot resolve by adding the key to both locales.

## Maintenance notes

- All machine translations carry `TODO: native-speaker review` comments —
  the maintainer should get a native speaker to review the marketing copy on
  the homepage especially.
- If `defaultLocale` is ever flipped to `mn`, this plan's work is what makes
  that flip meaningful.
