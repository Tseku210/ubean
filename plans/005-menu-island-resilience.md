# Plan 005: Make the menu island survive Sanity failures and empty data

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a18fdfa..HEAD -- src/components/menu/MenuList.astro src/components/menu/MenuItem.astro src/i18n/ui.ts src/lib/utils.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline-ci.md (build/typecheck gates)
- **Category**: bug
- **Planned at**: commit `a18fdfa`, 2026-08-16

## Why this matters

The menu is the reason customers visit this site, and it is the only content
fetched at request time (a `server:defer` island running per-request on
Vercel). The Sanity fetch has no try/catch and no empty-state branch: a Sanity
outage, misconfiguration, or an empty result renders a silently blank grid on
all 8 menu routes — and because the island renders after the page, a green
`astro build` proves nothing about it. Secondary fixes while in the file: the
GROQ query string-interpolates its filter value (an injection-shaped pattern,
harmless today because the value is a compile-time enum, cheap to fix now),
prices of `0` are hidden by truthiness checks, and `toLocaleString()` runs
with no explicit locale so thousands-separators depend on the server's
environment.

## Current state

- `src/components/menu/MenuList.astro` (whole relevant part):

  ```astro
  const { category, lang } = Astro.props;

  const MENU_ITEMS_QUERY = `*[_type == "menuItem" && category == "${category}" && available == true] | order(nameEn asc) { ... }`;

  const menuItems = await sanityClient.fetch<SanityDocument[]>(MENU_ITEMS_QUERY);
  ---

  <div class="grid grid-cols-2 items-stretch gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-8 md:gap-y-16">
    {
      menuItems.map((item) => (
        <div class="h-full">
          <MenuItem menuItem={item} lang={lang} />
        </div>
      ))
    }
  </div>
  ```

  (`category` comes from the `Category` enum in `src/types.ts` via the 8 page
  files `src/pages/menu/*.astro` and `src/pages/mn/menu/*.astro` — never from
  a request.)

- `src/components/menu/MenuItem.astro:40-55` — truthiness price gates:

  ```astro
  { defaultPrice && (<span class="text-h6 font-medium">{formatPrice(defaultPrice)}</span>) }
  { smallPrice && (...) }
  { largePrice && (...) }
  ```

- `src/lib/utils.ts:8-11`:

  ```ts
  export function formatPrice(price: number): string {
    if (price === 0) return "₮0";
    return `₮${price.toLocaleString()}`;
  }
  ```

  Note the contradiction: `formatPrice` handles `0`, but the truthiness gates
  above mean it can never receive `0` from the menu.

- Error-handling exemplar in this repo: `src/components/SanityImage.astro`
  wraps its builder in try/catch and renders conditionally — match that
  pattern's spirit.
- i18n: translations live in `src/i18n/ui.ts` as flat string keys under `en`
  and `mn`; components call `useTranslations(lang)`. The `en` and `mn` key
  sets are identical (a `keyof` type ties them together) — **any key you add
  must be added to both locales**.
- The island wiring (`src/components/menu/MenuLayout.astro:33`,
  `<MenuList server:defer>` with a `MenuListLoading` fallback) stays as is.

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Typecheck | `pnpm typecheck` | error count ≤ pre-plan baseline |
| Build     | `pnpm build`     | exit 0              |
| Dev server (manual QA) | `pnpm dev` | serves on localhost:4321 |

## Scope

**In scope** (the only files you should modify):
- `src/components/menu/MenuList.astro`
- `src/components/menu/MenuItem.astro`
- `src/lib/utils.ts` (the `formatPrice` locale argument only)
- `src/i18n/ui.ts` (adding two keys to BOTH locales — nothing else)

**Out of scope** (do NOT touch, even though they look related):
- `src/components/menu/MenuLayout.astro` / the `server:defer` architecture —
  switching the menu to build-time rendering is a separate decision (see
  Maintenance notes).
- The GROQ filter semantics (`available == true`) — items with an unset
  `available` field are excluded; that is current behavior, leave it.
- `schemas/menuItem.ts` — the Sanity schema is not in play.
- `src/components/SanityImage.astro` — referenced as an exemplar only.

## Git workflow

- Branch: `advisor/005-menu-island-resilience`
- Conventional commits (e.g. `fix: guard menu Sanity fetch and render empty state`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Parameterize the query and guard the fetch

In `MenuList.astro`, change the query to use a GROQ parameter and wrap the
fetch:

```astro
const MENU_ITEMS_QUERY = `*[_type == "menuItem" && category == $category && available == true] | order(nameEn asc) {
  _id, nameEn, nameMn, category, image,
  prices { default, small, large },
  variants[] { nameEn, nameMn }
}`;

let menuItems: SanityDocument[] = [];
let fetchFailed = false;
try {
  menuItems = await sanityClient.fetch<SanityDocument[]>(MENU_ITEMS_QUERY, {
    category,
  });
} catch (error) {
  fetchFailed = true;
  console.error("Menu fetch failed:", error);
}
```

**Verify**: `pnpm typecheck` → no new errors; `pnpm build` → exit 0.

### Step 2: Add the two i18n keys (both locales)

In `src/i18n/ui.ts` add to the `en` object:

```ts
"menu.empty": "No items in this category yet — check back soon.",
"menu.error": "The menu is temporarily unavailable. Please try again later.",
```

and to the `mn` object:

```ts
"menu.empty": "Энэ ангилалд одоогоор бүтээгдэхүүн алга.",
"menu.error": "Цэс түр ажиллахгүй байна. Дараа дахин оролдоно уу.",
```

(Flag in your report that the Mongolian strings should get a native-speaker
review — they are functional placeholders.)

**Verify**: `pnpm typecheck` → no new errors (the `keyof` union enforces
key parity; a missing key in either locale is a type error).

### Step 3: Render error and empty states

In `MenuList.astro`'s template, replace the bare grid with:

```astro
{
  fetchFailed ? (
    <p class="text-b1 py-12 text-center">{t("menu.error")}</p>
  ) : menuItems.length === 0 ? (
    <p class="text-b1 py-12 text-center">{t("menu.empty")}</p>
  ) : (
    <div class="grid grid-cols-2 items-stretch gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-8 md:gap-y-16">
      {menuItems.map((item) => (
        <div class="h-full">
          <MenuItem menuItem={item} lang={lang} />
        </div>
      ))}
    </div>
  )
}
```

You will need `useTranslations` in the frontmatter:
`import { useTranslations } from "@/i18n/utils";` then
`const t = useTranslations(lang);`. (`lang` is already a prop typed
`keyof typeof languages`; `useTranslations` accepts `keyof typeof ui` — these
are the same locale codes. If TypeScript complains about the mismatch, check
how `src/components/menu/MenuItem.astro` and other components bridge the two
types before improvising; a plain type error here is a STOP condition, not an
invitation to add `as any`.)

**Verify**: `pnpm typecheck` → no new errors; `pnpm build` → exit 0.

### Step 4: Fix the zero-price and locale issues

1. In `MenuItem.astro`, change the three truthiness gates to null checks,
   e.g.:

   ```astro
   { defaultPrice != null && (<span class="text-h6 font-medium">{formatPrice(defaultPrice)}</span>) }
   ```

   (same for `smallPrice`, `largePrice`).

2. In `src/lib/utils.ts`, pin the locale:

   ```ts
   return `₮${price.toLocaleString("en-US")}`;
   ```

   (`en-US` gives `12,000`-style grouping, which matches how prices render
   today when built on an en-locale machine; the point is determinism across
   build/server environments, not a format change.)

**Verify**: `pnpm typecheck` → no new errors; `pnpm build` → exit 0.

### Step 5: Manual QA

Run `pnpm dev` and load `http://localhost:4321/menu/coffee` and
`/mn/menu/coffee` — items render as before (prices formatted identically).
Then simulate failure: temporarily disconnect the network (or set an invalid
Sanity `projectId` in a scratch copy — do NOT commit it) and confirm the
error message renders instead of a blank grid. Restore before committing.

**Verify**: both states observed; `git status` clean of scratch edits.

## Test plan

No test runner exists (out of scope to add). The QA cases above are the
characterization set; if Vitest lands later, extract the query + mapping into
`src/lib/menu.ts` and unit-test populated/empty/rejecting fetches with a
stubbed client.

## Done criteria

- [ ] `grep -n '\${category}' src/components/menu/MenuList.astro` → 0 matches
      (parameterized as `$category`)
- [ ] `grep -n "try" src/components/menu/MenuList.astro` → ≥1 match
- [ ] `grep -cn "menu.empty\|menu.error" src/i18n/ui.ts` → 4 matches (2 keys × 2 locales)
- [ ] `grep -n "!= null" src/components/menu/MenuItem.astro` → 3 matches
- [ ] `pnpm typecheck` error count ≤ baseline; `pnpm build` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The `MenuList.astro` code differs from the "Current state" excerpt.
- `sanityClient.fetch` with a params object fails type-checking — the
  `sanity:client` virtual module's types may differ from `@sanity/client`;
  report the actual signature.
- The `lang` type bridge in Step 3 needs a cast — report instead of casting.
- The dev server shows the loading fallback forever after your change (the
  island response broke) — revert to diagnose, report findings.

## Maintenance notes

- Architectural follow-up (deliberately not in this plan): the menu changes
  rarely, so dropping `server:defer` and fetching at build time — paired with
  a Sanity publish webhook → Vercel deploy hook — would remove the runtime
  Sanity dependency, the serverless invocation per view, and the skeleton
  content swap. Decide once the error handling here has proven itself.
- If a "featured items" homepage section is ever built from the unused
  `featured` field in `schemas/menuItem.ts`, reuse this file's guarded-fetch
  pattern verbatim.
- Reviewers: confirm the error state actually renders inside the island (view
  the `/menu/coffee` page source or use dev tools) — `server:defer` swallows
  island exceptions differently from page exceptions.
