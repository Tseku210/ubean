# Animation Improvement Plans

Written by the `improve-animations` audit at commit `a18fdfa`. Each plan is fully self-contained — an executor needs no context beyond the plan file. Execute with any agent, or via `improve-animations execute <plan>`.

This is the **animation** plan set; the general codebase plan set lives one level up in `plans/` with its own README and numbering — the two sets are independent except where noted below.

## Plans

| # | Plan | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Rebuild the `.animate` page-reveal system](001-rebuild-animate-reveal.md) | HIGH | DONE |
| 002 | [Gate GSAP behind reduced-motion + fix ScrollSmoother lifecycle](002-gsap-reduced-motion-and-scrollsmoother.md) | HIGH | TODO |
| 003 | [Stop the per-frame tween storm in the droplet ScrollTrigger](003-motionpath-scroll-performance.md) | HIGH | TODO |
| 004 | [Fix the broken Discount reveal and Portofilters freeze](004-fix-broken-homepage-entrances.md) | MEDIUM | TODO |
| 005 | [Purge dead animation code](005-purge-dead-animation-code.md) | LOW | TODO |
| 006 | [Reveal the Hero on mount, not via ScrollTrigger](006-hero-mount-reveal.md) | MEDIUM | TODO |
| 007 | [Smooth the contact form's error and focus feedback](007-form-feedback-transitions.md) | MEDIUM | TODO |
| 008 | [Smooth the menu's skeleton → content handoff](008-menu-loading-handoff.md) | MEDIUM | TODO |
| 009 | [Easing & transition polish sweep](009-easing-transition-polish.md) | LOW–MED | TODO |
| 010 | [Menu category switching via ClientRouter](010-menu-view-transitions.md) | MEDIUM | TODO |
| 011 | [Contact form success moment](011-contact-success-moment.md) | LOW | TODO |
| 012 | [Cup arrival payoff](012-cup-arrival-payoff.md) | LOW | TODO |
| 013 | [Mux poster → stream crossfade](013-mux-poster-crossfade.md) | LOW | TODO |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (with one-line reason).

## Recommended execution order

**Wave 1 (corrective, highest leverage): 001 → 002 → 003 → 004 → 005.**
**Wave 2 (corrective, smaller): 006, 007, 009 — mutually independent, any order.**
**Wave 3 (additive / missed opportunities): 008, 010, 011, 012, 013 — any order, after their dependencies.**

Dependencies and interactions:

- **001 before 005**: 005's choice of surviving easing tokens assumes 001 switched `.animate` to `--ease-out-quint`.
- **001 before 008 and 010**: 008 reuses the `html.js` gate 001 introduces (hard STOP in the plan if missing); 010 assumes 001 removed the `.animate` entrance from menu pages.
- **002 first among the GSAP plans** is cleanest: 003, 004, 006, and 012 all note that if 002 has landed, their GSAP edits go inside (or follow the pattern of) its `matchMedia("(prefers-reduced-motion: no-preference)")` branches. Landing them before 002 also works — 002's steps wrap whatever they find.
- **005 last in Wave 1, always**: it deletes by content-match and expects earlier edits in place. It skips `HomePage.tsx` (002 owns the `MotionPathHelper` removal) and the 404 period change (009 owns it).
- **009 and 005 touch `404.astro` disjointly** (009: wobble period; 005: `will-change` + `steam-rise` deletion) — safe in either order.
- **011's reduced-motion note** assumes 002's softening of the global CSS nuke; it degrades gracefully either way.
- **Coordination with the general plan set (`plans/`)**: its backlog lists "GSAP hygiene", "dead code removal" (`animations.ts`, `AnimatedDroplet.tsx`), and "Mux preload" items that overlap animation plans 002/004/005/013 — these plans are the concrete implementations; mark the corresponding backlog bullets done when they land. Its plan 004 (contact form correctness) touches `ContactForm.tsx` like animation plans 007/011 do — execute those in separate commits and rebase-check if both sets run concurrently.

Each plan's Verification section includes mechanical checks (`pnpm build`, greps) and feel checks (what to watch in the browser, including a reduced-motion pass). Run the feel checks — several of these fixes can be mechanically correct and still feel wrong.

## Audit notes

- Findings rejected during vetting: "sticky hover on touch" for Tailwind `hover:`/`group-hover:` utilities — Tailwind v4 already gates them behind `@media (hover: hover)` (verified in built CSS). The related easing defects are real and live in plan 009.
- The homepage `client:only` hydration architecture (no SSR, LCP gated on JS) is intentionally NOT addressed by these plans — it's tracked in the general plan set's backlog as a larger change. Plan 006 fixes only the reveal mechanism within that constraint.
