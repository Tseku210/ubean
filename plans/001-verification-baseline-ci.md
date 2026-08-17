# Plan 001: Establish a verification baseline (typecheck script + CI build gate)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a18fdfa..HEAD -- package.json .github/ vercel.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `a18fdfa`, 2026-08-16

## Why this matters

This repo has no command that answers "does this still work?": no test, no lint,
no typecheck script, no CI, and `vercel.json` disables git-triggered deploys, so
the only gate before production is a human running a build on their laptop. Git
history shows four consecutive deploy-breakage commits (`b4c0100`, `0aadad0`,
`011ecd6`, `b2418e2` — all "fix vercel adapter/deploy"). Every other plan in
`plans/` relies on `pnpm build` and `pnpm typecheck` as verification gates, so
this plan must land first.

## Current state

- `package.json:5-11` — the only scripts:

  ```json
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "format": "prettier --write \"**/*.{astro,css,html,js,jsx,json,md,mdx,ts,tsx,vue,yaml,yml}\"",
    "astro": "astro",
    "deploy": "astro build && vercel deploy --prebuilt && vercel deploy --prod"
  }
  ```

  Two problems beyond the missing typecheck: (a) pnpm 9 has a built-in
  `pnpm deploy` subcommand that shadows a script of the same name, so only
  `pnpm run deploy` works; (b) the second `vercel deploy --prod` lacks
  `--prebuilt`, so it triggers a fresh remote build instead of promoting the
  artifact that was just uploaded — production ships a different build than the
  preview.

- `devDependencies` contain neither `@astrojs/check` nor `typescript`, so
  `astro check` cannot run at all today.
- `tsconfig.json:2` extends `astro/tsconfigs/strict` — strictness is configured
  but nothing ever executes the compiler.
- There is no `.github/` directory.
- `packageManager` is pinned: `pnpm@9.7.0` (`package.json` bottom).
- `vercel.json` disables git deploys for `main` and `dev` — deploys are manual
  by design. This plan does NOT change that; it adds a CI check on GitHub
  instead.

## Commands you will need

| Purpose   | Command                          | Expected on success |
|-----------|----------------------------------|---------------------|
| Install   | `pnpm install`                   | exit 0              |
| Build     | `pnpm build`                     | exit 0, `dist/` written |
| Typecheck | `pnpm typecheck` (created here)  | runs `astro check`  |

## Scope

**In scope** (the only files you should modify/create):
- `package.json` (scripts + devDependencies)
- `pnpm-lock.yaml` (via `pnpm install` only)
- `.github/workflows/ci.yml` (create)

**Out of scope** (do NOT touch, even though they look related):
- `vercel.json` — the disabled git-deploys are intentional; do not re-enable.
- Any source file under `src/` — if `astro check` reports errors, you record
  the count, you do NOT fix them in this plan.
- Adding ESLint or a test runner — deferred (see Maintenance notes).

## Git workflow

- Branch: `advisor/001-verification-baseline`
- Commit style: conventional commits, e.g. `ci: add typecheck script and CI build gate`
  (matches repo history: `feat:`, `fix:`, `chore:`, `ref:`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add typecheck tooling

Run:

```
pnpm add -D @astrojs/check typescript
```

Then add to `package.json` scripts:

```json
"typecheck": "astro check"
```

**Verify**: `pnpm typecheck` → the command runs to completion (exit code may be
non-zero if pre-existing type errors exist — that is expected; record the exact
error/warning/hint counts it prints in your final report).

### Step 2: Fix the deploy script name and the double build

In `package.json`, replace the `deploy` script with:

```json
"deploy:prod": "astro build && vercel deploy --prebuilt --prod"
```

(Remove the old `deploy` entry. Rationale: `pnpm deploy` collides with pnpm 9's
built-in subcommand, and the old second command rebuilt remotely instead of
promoting the local artifact.)

**Verify**: `grep -n '"deploy"' package.json` → no matches;
`grep -n '"deploy:prod"' package.json` → one match. Do NOT run the deploy
script itself.

### Step 3: Create the CI workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4   # reads version from packageManager field
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm typecheck
        continue-on-error: true   # remove once the pre-existing error backlog is cleared
```

`continue-on-error` on typecheck is deliberate: this repo has never been
typechecked and strict mode will likely report a backlog. The build step is the
hard gate; typecheck is visible-but-advisory until the backlog is cleared.
If Step 1 showed **zero** errors, omit `continue-on-error`.

**Verify**: `pnpm build` locally → exit 0. (Note: `pnpm build` requires network
access to fetch Sanity/font resources; if it fails on network errors, report
the exact error rather than retrying blindly.)

### Step 4: Update AGENTS.md verification note (one line only)

`AGENTS.md` currently ends with "OpenAI Codex shouldn't run tests." Replace
that single line with:

```
Run `pnpm typecheck` and `pnpm build` to verify changes.
```

Do not rewrite the rest of the file (a fuller rewrite is deferred).

**Verify**: `grep -n "shouldn't run tests" AGENTS.md` → no matches.

## Test plan

No unit tests are added by this plan (the point is establishing the gates).
Verification is the gates themselves: build passes locally, workflow file is
syntactically valid YAML (`python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/ci.yml'))"` → exit 0).

## Done criteria

- [ ] `pnpm typecheck` executes `astro check` (exit code recorded; error count reported)
- [ ] `pnpm build` exits 0
- [ ] `.github/workflows/ci.yml` exists and parses as YAML
- [ ] `grep -n '"deploy"' package.json` → no matches (renamed to `deploy:prod`)
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `pnpm install` fails (network/registry problem — nothing here should change
  resolution beyond adding two devDeps).
- `pnpm build` fails after your changes but succeeded before them.
- `astro check` reports more than ~40 errors — that suggests a systemic config
  issue (e.g. wrong `@astrojs/check` major); report the output instead of
  chasing individual errors.
- You find an existing `.github/` directory with workflows (drift — the repo
  had none at planning time).

## Maintenance notes

- Once the `astro check` backlog is fixed (several plans in this directory fix
  type-level bugs), remove `continue-on-error` from the workflow so typecheck
  becomes a hard gate.
- Deferred follow-ups: ESLint (`eslint-plugin-astro`, `jsx-a11y`, `no-console`),
  Vitest for `src/i18n/utils.ts` / `src/lib/utils.ts` pure helpers, and a
  post-build asset-reference check (broken `og:image` paths — see plan 006).
- Reviewers: check that the workflow's Node version matches what Vercel builds
  with (currently Node 22 is a safe default for Astro 5).
