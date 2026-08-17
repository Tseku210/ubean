# Plan 003: Patch vulnerable dependencies, fix the deprecated adapter import, remove dead packages

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a18fdfa..HEAD -- package.json astro.config.mjs pnpm-lock.yaml`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW–MED (each step individually LOW; build-verify after each)
- **Depends on**: plans/001-verification-baseline-ci.md (`pnpm build`/`pnpm typecheck` gates)
- **Category**: security / migration
- **Planned at**: commit `a18fdfa`, 2026-08-16

## Why this matters

- Installed `astro@5.14.5` is below the fix for a **reflected XSS advisory in
  the server-islands feature** (patched in `>=5.15.8`). The vulnerable
  `/_server-islands/` route IS deployed (the menu uses a `server:defer`
  island), and an XSS on this origin also reaches `/admin`, where the CMS
  session lives.
- `astro.config.mjs` imports the adapter from `@astrojs/vercel/serverless` —
  a deprecated shim in the installed v8 that warns on every build and will be
  removed in the next major.
- Several production dependencies have zero imports anywhere in the repo
  (`resend`, `styled-components`, `react-is`, `@tailwindcss/typography`,
  `@radix-ui/react-dialog`, `@vercel/analytics`, and the redundant bare
  `@mux/mux-player`), bloating installs and misleading readers about what the
  site does. **Note**: `@mux/mux-player-react` IS used
  (`src/components/home/Hero.tsx:1`, `src/components/home/Since.tsx:1`) and
  must stay.
- `vite` is explicitly pinned at `^7.0.0` (resolving 7.0.0), in range for a
  dev-server arbitrary-file-read advisory patched in `>=7.3.2`; `sharp@0.34.x`
  is below the libvips fixes in `0.35.0`.

## Current state

- `package.json` dependencies (relevant lines):

  ```json
  "@mux/mux-player": "^3.5.1",
  "@mux/mux-player-react": "^3.6.1",
  "@radix-ui/react-dialog": "^1.1.15",
  "@tailwindcss/typography": "^0.5.16",
  "@vercel/analytics": "^2.0.1",
  "astro": "^5.14.5",
  "react-is": "^19.1.0",
  "resend": "^4.7.0",
  "sharp": "^0.34.3",
  "styled-components": "^6.1.19",
  ```

  devDependencies include `"vite": "^7.0.0"`.

- `astro.config.mjs:5`: `import vercel from "@astrojs/vercel/serverless";`
- `astro.config.mjs:32-39` uses the adapter with options
  `{ webAnalytics: { enabled: true }, maxDuration: 8, imageService: true, devImageService: "sharp" }` —
  these options are unchanged by this plan.
- Verified usage facts (grep over `src/`, `schemas/`, root configs at planning
  time): zero import sites for `resend`, `styled-components`, `react-is`,
  `@tailwindcss/typography`, `@radix-ui/react-dialog`, `@vercel/analytics`.
  `@radix-ui/react-dialog` is a transitive dependency of `vaul` (used by
  `src/components/ui/drawer.tsx`) and `react-is` of `styled-components`, so
  removing the direct entries is safe — pnpm keeps transitive copies.

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Install   | `pnpm install`   | exit 0              |
| Build     | `pnpm build`     | exit 0              |
| Typecheck | `pnpm typecheck` | same error count as before this plan (record before/after) |
| Version check | `pnpm ls astro vite sharp --depth 0` | shows expected versions |

## Scope

**In scope** (the only files you should modify):
- `package.json`
- `pnpm-lock.yaml` (via pnpm commands only)
- `astro.config.mjs` (line 5 import only)

**Out of scope** (do NOT touch, even though they look related):
- Astro v6 — the SSRF advisory fixed in `>=6.4.6` is a MAJOR upgrade decision;
  stay on latest 5.x.
- `sanity` (the full Studio package) — genuinely used by `/admin`; moving it to
  devDependencies is untested against Vercel's production install pruning.
- Any component source files.
- The adapter options object in `astro.config.mjs` (only the import specifier
  changes).

## Git workflow

- Branch: `advisor/003-dependency-hygiene`
- One commit per step (conventional commits: `fix: ...`, `chore: ...`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Record the baseline

Run `pnpm build` and `pnpm typecheck`; record exit codes and the typecheck
error count. These are your comparison baseline for every later step.

**Verify**: `pnpm build` → exit 0 (if it fails at baseline, STOP — the repo is
already broken and this plan assumes a green build).

### Step 2: Bump astro within the 5.x line

```
pnpm update astro
pnpm ls astro --depth 0
```

**Verify**: reported astro version is `>=5.15.8` and `<6.0.0`; `pnpm build` →
exit 0.

### Step 3: Fix the adapter import

In `astro.config.mjs` change line 5:

```js
import vercel from "@astrojs/vercel";
```

**Verify**: `pnpm build` → exit 0 AND the build output no longer prints the
deprecation warning mentioning `@astrojs/vercel/serverless`;
`grep -rn "@astrojs/vercel/serverless" astro.config.mjs` → no matches.

### Step 4: Remove unused dependencies

```
pnpm remove resend styled-components react-is @tailwindcss/typography @radix-ui/react-dialog @mux/mux-player @vercel/analytics
```

**Verify**: `pnpm build` → exit 0. Then confirm the drawer still type-checks
(`pnpm typecheck` — error count must not increase vs Step 1 baseline).
If the build errors mentioning `@vercel/analytics` (the adapter's
`webAnalytics` option may require it), reinstate ONLY that package
(`pnpm add @vercel/analytics`) and note it in your report.

### Step 5: Patch sharp and vite

```
pnpm add sharp@^0.35.0
pnpm add -D vite@^7.3.2
```

**Verify**: `pnpm ls sharp vite --depth 0` → sharp `>=0.35.0`, vite `>=7.3.2`;
`pnpm build` → exit 0.

### Step 6: Confirm the advisory is cleared

```
pnpm audit --prod 2>&1 | head -40
```

**Verify**: no advisory for `astro` appears. (Other transitive advisories
under the `sanity` toolchain will remain — that is expected; list the count in
your report, do not chase them.)

## Test plan

No unit tests exist yet. The gates are: build green after every step, typecheck
error count not increased, and a manual smoke instruction for the operator:
after the next deploy, load `/`, `/menu/coffee`, `/contact`, `/admin` (login
screen), and confirm the two homepage videos still play (Mux player usage in
`Hero.tsx` / `Since.tsx` — the packages kept must still resolve).

## Done criteria

- [ ] `pnpm ls astro --depth 0` shows `>=5.15.8 <6`
- [ ] `grep -c "@astrojs/vercel/serverless" astro.config.mjs` → 0
- [ ] `resend`, `styled-components`, `react-is`, `@tailwindcss/typography`,
      `@radix-ui/react-dialog`, `@mux/mux-player` absent from `package.json`
      (`@mux/mux-player-react` still present)
- [ ] sharp `>=0.35.0`, vite `>=7.3.2` in `pnpm ls`
- [ ] `pnpm build` exits 0; `pnpm typecheck` error count ≤ baseline
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The Step 1 baseline build fails.
- `pnpm update astro` resolves to a 6.x version (the range in package.json
  should prevent this; if it happens, the manifest drifted).
- Step 4's build failure mentions any package other than `@vercel/analytics`.
- Step 5's build fails with a sharp/native-module error (platform binary
  issue) — report, don't downgrade silently.
- Removing the vite pin entirely seems attractive — don't; the plan
  deliberately bumps it instead because the reason for the original pin is
  unknown.

## Maintenance notes

- Astro 6 (fixes a Host-header SSRF in prerendered error-page fetch) is a
  deliberate future migration — schedule separately with the Astro 6 upgrade
  guide.
- If the menu ever stops using `server:defer` (see plan 005's maintenance
  notes / PERF-08), the server-islands attack surface disappears entirely.
- Reviewers: the diff should be almost entirely `package.json`/lockfile plus
  one import line; any `src/` change is out of scope and suspect.
