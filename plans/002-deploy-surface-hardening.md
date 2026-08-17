# Plan 002: Untrack committed build artifacts, close the open image proxy, add security headers

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a18fdfa..HEAD -- astro.config.mjs vercel.json .gitignore`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline-ci.md (uses `pnpm build` as a gate)
- **Category**: security
- **Planned at**: commit `a18fdfa`, 2026-08-16

## Why this matters

Three independent, cheap hardening fixes:

1. **~45 files under `.vercel/output/` are tracked in git** despite `.gitignore`
   listing them (they were committed before the ignore rule). The tracked
   `entry.mjs` contains Astro's generated `middlewareSecret` — a per-build
   authentication credential for the `/_server-islands/` endpoint — and a
   distinct secret value is recoverable from ~15 historical commits. Every
   future build-time-inlined secret would leak the same way.
2. **The image optimizer config makes the site an open image proxy**:
   `remotePatterns: [{ protocol: "https" }]` matches every HTTPS host on the
   internet, so anyone can use `ubean.mn`'s Vercel image optimization (billed
   per unique source image) to fetch/serve arbitrary third-party images.
3. **Zero security response headers** are set anywhere (no
   `X-Content-Type-Options`, `Referrer-Policy`, HSTS, or frame protection —
   including on `/admin`, which is the Sanity Studio login page).

## Current state

- `git ls-files .vercel | wc -l` → ~45 tracked files (~13 MB), including
  `.vercel/output/_functions/entry.mjs` (contains `middlewareSecret` —
  verified present; do NOT copy or print the value anywhere).
- `.gitignore` already ends with the correct rules:

  ```
  .vercel/output/
  .vercel
  ```

- `astro.config.mjs:27-30`:

  ```js
  image: {
    domains: ["cdn.sanity.io"],
    remotePatterns: [{ protocol: "https" }],
  },
  ```

  The `remotePatterns` entry (no hostname) ORs with `domains` and allows every
  HTTPS host. The only remote images actually rendered come from
  `cdn.sanity.io` via `src/components/SanityImage.astro`.

- `vercel.json` (entire file):

  ```json
  {
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "git": {
      "deploymentEnabled": {
        "main": false,
        "dev": false
      }
    }
  }
  ```

- The Sanity Studio is mounted at `/admin` (`astro.config.mjs:23`,
  `studioBasePath: "/admin"`). Access is gated by Sanity's own login — this
  plan only adds anti-framing/noindex headers, it does not move the studio.

## Commands you will need

| Purpose | Command      | Expected on success |
|---------|--------------|---------------------|
| Build   | `pnpm build` | exit 0              |
| JSON check | `node -e "JSON.parse(require('fs').readFileSync('vercel.json'))"` | exit 0 |

## Scope

**In scope** (the only files you should modify):
- Git index only for `.vercel/**` (untracking — no content edits there)
- `astro.config.mjs` (the `image` block only)
- `vercel.json`

**Out of scope** (do NOT touch, even though they look related):
- `.gitignore` — already correct.
- Moving the Sanity Studio off `/admin` — separate decision, not this plan.
- Content-Security-Policy — needs hash/nonce work for three inline scripts in
  `src/components/Head.astro` plus Vercel Analytics allowlisting; deferred.
- Rewriting git history — the leaked secret regenerates per build and is
  superseded by the next deploy; history rewriting is not worth the disruption.
- The `dist/` directory (already ignored and untracked).

## Git workflow

- Branch: `advisor/002-deploy-surface-hardening`
- Commit per step; conventional commits (e.g. `chore: untrack .vercel build output`,
  `fix: restrict image optimizer to cdn.sanity.io`, `feat: add security headers`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Untrack `.vercel/`

```
git rm -r --cached .vercel
git commit -m "chore: untrack .vercel build output (gitignored, contained generated middlewareSecret)"
```

**Verify**: `git ls-files .vercel | wc -l` → `0`; the directory still exists on
disk (`ls .vercel/output` → contents listed); `git status` shows no `.vercel`
entries (ignored).

### Step 2: Pin the image optimizer to Sanity's CDN

In `astro.config.mjs`, replace the `image` block with:

```js
image: {
  remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
},
```

(The `domains` key is dropped because the pinned remotePattern now covers it.)

**Verify**: `pnpm build` → exit 0, then
`node -e "const c=require('./.vercel/output/config.json'); console.log(JSON.stringify(c.images && (c.images.remotePatterns||c.images.domains)))"`
→ output mentions `cdn.sanity.io` and contains no hostname-less pattern.

### Step 3: Add security headers to `vercel.json`

Replace `vercel.json` with:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": {
    "deploymentEnabled": {
      "main": false,
      "dev": false
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/admin(/.*)?",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
      ]
    }
  ]
}
```

**Verify**: `node -e "JSON.parse(require('fs').readFileSync('vercel.json'))"` →
exit 0.

## Test plan

No unit tests (config-only change). Post-deploy manual check for the operator
(record in your report, do not deploy yourself):
`curl -sI https://www.ubean.mn | grep -i x-content-type-options` should show
`nosniff` after the next production deploy, and
`curl -sI "https://www.ubean.mn/_vercel/image?url=https%3A%2F%2Fexample.com%2Fa.png&w=640&q=75"`
should return 400/403, not an image.

## Done criteria

- [ ] `git ls-files .vercel | wc -l` → 0
- [ ] `astro.config.mjs` contains `hostname: "cdn.sanity.io"` and no
      hostname-less remote pattern (`grep -n 'protocol: "https" }' astro.config.mjs` → no match)
- [ ] `vercel.json` parses and contains both header blocks
- [ ] `pnpm build` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `git rm -r --cached .vercel` errors (e.g. partial-index weirdness) — do not
  force anything.
- After Step 2, `pnpm build` fails mentioning image config — the
  `remotePatterns` schema may have changed in the installed Astro version;
  report the exact error.
- Any site page renders remote images from a host other than `cdn.sanity.io`
  (search first: `grep -rn "https://" src/components src/layouts | grep -i "img\|image"` —
  if a non-Sanity remote image URL is found in a rendered `<img>`/`<Image>`,
  STOP and list it).
- You are tempted to edit `.gitignore` — it is already correct; drift check.

## Maintenance notes

- The next production deploy after this lands mints a fresh `middlewareSecret`
  that never touches git — deploying promptly is part of the fix.
- If a future feature loads images from a new remote host, it must be added to
  `remotePatterns` explicitly — the 400 on unknown hosts is deliberate.
- CSP was deferred: when attempted, start with
  `Content-Security-Policy-Report-Only`, account for the inline JSON-LD and
  init scripts in `src/components/Head.astro`, GSAP, Vercel Analytics/Speed
  Insights beacons, and the Sanity Studio at `/admin` (needs `blob:` workers).
- Reviewers: confirm the `/admin` header source pattern matches Vercel's path
  syntax (regex-like, anchored) — test on a preview deploy before promoting.
