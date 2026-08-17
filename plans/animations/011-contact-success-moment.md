# 011 — Give the contact form's success a real moment

- **Status**: TODO
- **Commit**: a18fdfa
- **Severity**: LOW (missed opportunity — rare, high-emotion, once per user)
- **Category**: Missed opportunities
- **Estimated scope**: 2 files (ContactForm.tsx, global.css), ~40 lines changed

## Problem

Submitting feedback is a once-per-user moment — the form even locks permanently afterward via `FEEDBACK_KEY` — and it currently renders as an in-place text substitution on the button, with the injected loader icon shoving the label sideways:

```tsx
// src/components/contact/ContactForm.tsx:106-118 — current
<Button
  size="lg"
  type="submit"
  isLoading={isSubmitting}
  disabled={isBlocked || isSubmitting}
  className="px-14"
>
  {isSubmitting
    ? t("contact.sending")
    : isSubmitSuccessful || isBlocked || isSent
      ? t("contact.success")
      : t("contact.submit")}
</Button>
```

State context: `isSent` flips in the `onSuccess` callback (line 44-49), which also sets `isBlocked` and persists the lock. `isBlocked` is also true on mount for returning users (line 34-36).

## Target

On a **fresh** success (`isSent`), the form swaps to a success panel that scales in gently (0.95 → 1 — never from 0 — with opacity, 300ms, strong ease-out). Returning visitors who are already blocked see the same panel statically, with no entrance animation (their moment already happened). The button and form markup stay unchanged for the normal filling state.

```tsx
// src/components/contact/ContactForm.tsx — target: early-return panel before the <form> return
if (isSent || isBlocked) {
  return (
    <div
      className={`flex size-full max-w-md flex-col items-center justify-center gap-4 text-center ${
        isSent ? "success-enter" : ""
      }`}
      role="status"
    >
      <CircleCheckIcon className="text-primary size-12" strokeWidth={1.5} />
      <p className="text-h5">{t("contact.success")}</p>
    </div>
  );
}
```

```css
/* src/styles/global.css — target: add near the .animate rules */
.success-enter {
  animation: success-pop 300ms var(--ease-out-quint) both;
}

@keyframes success-pop {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .success-enter {
    animation: success-pop 200ms ease-out both;
    transform: none;
  }
}
```

(A one-shot keyframe is acceptable here — the state is terminal and can never be re-triggered, so interruptibility doesn't apply. `--ease-out-quint` = `cubic-bezier(0.23, 1, 0.32, 1)`, `src/styles/global.css:154`. The reduced-motion override keeps the fade, drops the scale — note the global reduced-motion block zeroes `animation-duration`, so if that nuke is still in place after plan 002, the panel simply appears instantly, which is fine.)

`CircleCheckIcon` comes from `lucide-react` (already a dependency; exemplar import: `src/components/ui/MobileMenu.tsx:1`).

## Repo conventions to follow

- Use only existing i18n keys — `t("contact.success")` exists in both languages. Do NOT invent new keys (they'd need en+mn strings in `src/i18n/ui.ts`, which is content work outside this plan).
- Brand check color is `text-primary` (`#97d5d0`), matching the button palette.
- Global keyframes live at the bottom of `src/styles/global.css` with the other `@keyframes` (`fade-in` block region, or wherever plan 005 left them).

## Steps

1. **`src/components/contact/ContactForm.tsx`** — add `CircleCheckIcon` to the imports (`import { CircleCheckIcon } from "lucide-react";`), then insert the early-return block from Target immediately before the `return (` of the form (line 60).
2. Same file — the `<Button>`'s success-label branch (`isSubmitSuccessful || isBlocked || isSent ? t("contact.success") : ...`) is now unreachable; simplify the label to `{isSubmitting ? t("contact.sending") : t("contact.submit")}`.
3. **`src/styles/global.css`** — add the `.success-enter` rule, the `success-pop` keyframes, and the reduced-motion override from Target.

## Boundaries

- Do NOT change the submission logic, `FEEDBACK_KEY` persistence, web3forms config, or validation.
- Do NOT relax the permanent lock (that's a product decision, not a motion one).
- Do NOT add new i18n keys or new dependencies.
- If a step doesn't match the code you find (drift since commit a18fdfa), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` succeeds.
- **Feel check** (`pnpm dev`, `/contact`; use a throwaway `PUBLIC_WEB3FORMS_ACCESS_KEY` or temporarily call `onSuccess` manually in DevTools):
  - Submit valid input: while sending, the button shows the spinner + "sending" label; on success, the form is replaced by the check panel scaling in from 0.95 over ~300ms — one clean beat, no double-animation.
  - Reload the page (now blocked): the panel is there immediately, **no** entrance animation.
  - Clear the lock (`localStorage`, remove the feedback key), reload: the form is back.
  - In the Animations panel at 10% speed: the panel never starts from scale(0) or overshoots.
  - `prefers-reduced-motion: reduce`: the panel fades/appears without scaling.
- **Done when**: fresh success animates once, returning visitors get a static panel, and the lock behavior is unchanged.
