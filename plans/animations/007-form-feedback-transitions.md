# 007 — Smooth the contact form's error and focus feedback

- **Status**: DONE
- **Commit**: a18fdfa
- **Severity**: MEDIUM
- **Category**: Missed transition / Cohesion
- **Estimated scope**: 4 files (input.tsx, textarea.tsx, LabeledInput.tsx, LabeledTextArea.tsx), ~20 lines changed

## Problem

**1. Validation errors shove the layout down with no transition.** The form validates `onTouched` (`src/components/contact/ContactForm.tsx:27`), so errors appear the moment a field is blurred — a routine action — and the `<small>` mounts instantly into the grid, pushing every following field down in a single frame:

```tsx
// src/components/ui/LabeledInput.tsx:28-42 — current
<div className="grid w-full max-w-sm items-center gap-3">
  <Label htmlFor={id}>{label}</Label>
  <Input ... />
  {error && (
    <small id={errorId} className="text-sm text-red-600">
      {error}
    </small>
  )}
</div>
```

```tsx
// src/components/ui/LabeledTextArea.tsx:42-46 — current (same pattern)
{error && (
  <small id={errorId} className="text-sm text-red-600">
    {error}
  </small>
)}
```

**2. Half the focus treatment snaps.** The inputs transition `color` and `box-shadow`, but the focus/invalid styles also change `border-color`, which `color` does not cover — so the ring fades in smoothly while the border changes on a different clock:

```tsx
// src/components/ui/input.tsx:11 — current (excerpt)
"... rounded-lg bg-white p-4 transition-[color,box-shadow] outline-none ..."
"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
```

```tsx
// src/components/ui/textarea.tsx:10 — current (excerpt, same defect)
"placeholder:text-muted-foreground focus-visible:border-ring ... transition-[color,box-shadow] outline-none ..."
```

## Target

1. The error row is always mounted and animates open with the `grid-template-rows: 0fr → 1fr` technique plus an opacity fade — interruptible (it's a transition, so re-blurring mid-animation retargets instead of restarting), no reserved blank space when valid:

```tsx
// target error block — identical in both LabeledInput.tsx and LabeledTextArea.tsx
<div
  className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
    error ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
  }`}
>
  <small
    id={errorId}
    aria-hidden={!error}
    className="overflow-hidden text-sm text-red-600"
  >
    {error}
  </small>
</div>
```

(200ms is the top of the 125–200ms budget for small feedback elements; `ease-out` because it's an entrance.)

2. `border-color` joins the transitioned properties on both primitives:

```
transition-[color,border-color,box-shadow]
```

## Repo conventions to follow

- These are shadcn-style primitives — edit the class strings in place; do not restructure the components or their props.
- Note the wrapper grids use `gap-3`: when the error row is collapsed (`0fr`), the gap still applies to it. To avoid a stray 12px of permanent extra space below each field, the error `<div>` must be the last child and the collapse must include the gap — verify in the feel check; if a gap remnant is visible, move the error div *outside* the gapped grid (as a sibling appended after it inside a new plain wrapper) rather than reintroducing conditional mounting.

## Steps

1. **`src/components/ui/input.tsx:11`** — change `transition-[color,box-shadow]` to `transition-[color,border-color,box-shadow]`.
2. **`src/components/ui/textarea.tsx:10`** — same change.
3. **`src/components/ui/LabeledInput.tsx:37-41`** — replace the conditional `{error && (<small ...>)}` block with the always-mounted grid-collapse block from Target, verbatim.
4. **`src/components/ui/LabeledTextArea.tsx:42-46`** — same replacement.

## Boundaries

- Do NOT touch `ContactForm.tsx`, validation logic, or `react-hook-form` config.
- Do NOT change `aria-describedby` wiring or the `errorId` values.
- Do NOT add reserved fixed-height rows — the collapse technique only.
- Do NOT add new dependencies.
- If a step doesn't match the code you find (drift since commit a18fdfa), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` succeeds.
- **Feel check** (`pnpm dev`, `/contact`):
  - Focus the name field, then blur it empty: the error message unfolds over ~200ms, pushing the email field down smoothly instead of teleporting it.
  - Type into the field: the error folds back up smoothly.
  - Blur–focus–blur rapidly: the row never jumps to a random height — it retargets mid-animation (transition, not keyframes).
  - Tab into any input: border color and focus ring now fade in together on one clock.
  - With no errors visible, measure the vertical gap between fields against a screenshot from before the change — no extra permanent spacing (see Repo conventions note if there is).
  - DevTools → `prefers-reduced-motion: reduce`: per the global reduced-motion CSS the transitions collapse to near-instant — error text must still appear and be readable.
- **Done when**: all six checks pass on both an `<input>` and the textarea.
