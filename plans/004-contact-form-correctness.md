# Plan 004: Make the contact form validate email, surface failures, and fail loudly on missing config

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a18fdfa..HEAD -- src/components/contact/ContactForm.tsx src/components/ui/LabeledInput.tsx src/env.d.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline-ci.md (typecheck gate)
- **Category**: bug
- **Planned at**: commit `a18fdfa`, 2026-08-16

## Why this matters

The contact form is the site's only lead-capture channel, and it fails
silently in three ways: (1) the email field is actually a plain text input —
`LabeledInput` destructures `type`/`required` out of props and never forwards
them, and the react-hook-form rule has no email pattern, so `"asdf"` submits;
(2) a failed Web3Forms submission shows the **success** label — `onError` only
flips an unused state and the button text keys off `isSubmitSuccessful`, which
react-hook-form sets whenever the handler resolves without throwing; the
translated error strings in `src/i18n/ui.ts` are dead; (3) a missing
`PUBLIC_WEB3FORMS_ACCESS_KEY` degrades to `access_key: ""` — submissions fail
server-side with no signal, and no `.env.example` documents the variable.

## Current state

- `src/components/ui/LabeledInput.tsx:16-36` — the bug. `type`, `name`,
  `required` are destructured (removed from `...rest`) and never applied:

  ```tsx
  export function LabeledInput({
    label, id, type, name, registration, error, required, ...rest
  }: Props) {
    ...
      <Input
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? errorId : undefined}
        {...registration}
        {...rest}
      />
  ```

  Compare `src/components/ui/LabeledTextArea.tsx:31-41`, which forwards its
  props correctly — that is the in-repo exemplar to match.

- `src/components/contact/ContactForm.tsx:38-58` — submission wiring:

  ```tsx
  const { submit: submitToWeb3 } = useWeb3Forms({
    access_key: import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY || "",
    settings: { from_name: "Ubean Roastery Shop", subject: "Feedback from a user" },
    onSuccess: () => {
      setIsSent(true);
      reset();
      storage.set<boolean>(FEEDBACK_KEY, true);
      setIsBlocked(true);
    },
    onError: () => {
      setIsSent(false);
    },
  });
  ```

- `ContactForm.tsx:113-117` — the button label:

  ```tsx
  {isSubmitting
    ? t("contact.sending")
    : isSubmitSuccessful || isBlocked || isSent
      ? t("contact.success")
      : t("contact.submit")}
  ```

- `ContactForm.tsx:88-90` — email registered with only `required`, no pattern.
- Available i18n keys (`src/i18n/ui.ts`, en at :50, :52; mn at :108-109 — both
  locales have them): `contact.error` ("Something went wrong. Please try
  again."), `contact.error.mail` ("Please enter a valid email."),
  `contact.network_error`. None is currently rendered anywhere.
- `src/env.d.ts` — contains only `/// <reference ...>` directives, no
  `ImportMetaEnv` interface. A local `.env` exists (gitignored) holding
  `PUBLIC_WEB3FORMS_ACCESS_KEY`; there is no `.env.example`.
- Repo conventions: TypeScript, functional components, Tailwind classes,
  translation via `t("key")` from `useTranslations(lang)`.
- The one-submission-per-browser localStorage lockout (`FEEDBACK_KEY`) is
  **intentional product behavior** — keep it.

## Commands you will need

| Purpose   | Command          | Expected on success |
|-----------|------------------|---------------------|
| Typecheck | `pnpm typecheck` | error count ≤ pre-plan baseline |
| Build     | `pnpm build`     | exit 0              |
| Dev server (manual QA) | `pnpm dev` | serves on localhost:4321 |

## Suggested executor toolkit

- If the `agent-browser` CLI is available, use it for the manual QA step
  (fill the form with an invalid email on `http://localhost:4321/contact`
  and assert the validation message appears).

## Scope

**In scope** (the only files you should modify/create):
- `src/components/ui/LabeledInput.tsx`
- `src/components/contact/ContactForm.tsx`
- `src/env.d.ts`
- `.env.example` (create)
- `README.md` (add one line documenting the env var — nothing else)

**Out of scope** (do NOT touch, even though they look related):
- `src/components/ui/LabeledTextArea.tsx` — already correct.
- `src/lib/storage.ts` and the lockout behavior — intentional.
- `src/i18n/ui.ts` — all needed keys already exist; do not add or edit keys.
- Spam controls (captcha/origin restriction) — Web3Forms dashboard work, not
  code; noted for the operator in Maintenance notes.
- `.env` — never read, print, or commit its contents.

## Git workflow

- Branch: `advisor/004-contact-form-correctness`
- Conventional commits (e.g. `fix: forward input attributes and validate email in contact form`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Forward the dropped attributes in `LabeledInput`

Keep `name` out of the DOM props (react-hook-form's `registration` spread
supplies `name`), but forward `type` and `required`:

```tsx
<Input
  id={id}
  type={type}
  required={required}
  aria-invalid={!!error || undefined}
  aria-describedby={error ? errorId : undefined}
  {...registration}
  {...rest}
/>
```

**Verify**: `pnpm typecheck` → no new errors vs baseline.

### Step 2: Add email format validation

In `ContactForm.tsx`, extend the email registration:

```tsx
registration={register("email", {
  required: t("contact.error.mail"),
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: t("contact.error.mail"),
  },
})}
```

**Verify**: `pnpm typecheck` → no new errors.

### Step 3: Replace the boolean tangle with an explicit status

In `ContactForm.tsx`:

1. Replace `const [isSent, setIsSent] = useState(false);` with
   `const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");`
2. `onSuccess`: call `setStatus("sent")` (keep the existing `reset()`,
   `storage.set`, `setIsBlocked(true)` calls).
3. `onError`: call `setStatus("error")`.
4. Button label — drop `isSubmitSuccessful` from the condition entirely
   (remove it from the `formState` destructuring too):

   ```tsx
   {isSubmitting
     ? t("contact.sending")
     : isBlocked || status === "sent"
       ? t("contact.success")
       : t("contact.submit")}
   ```

5. Below the button, render the error message when `status === "error"`:

   ```tsx
   {status === "error" && (
     <p role="alert" className="text-sm text-red-600">
       {t("contact.error")}
     </p>
   )}
   ```

**Verify**: `pnpm typecheck` → no new errors;
`grep -n "isSubmitSuccessful" src/components/contact/ContactForm.tsx` → no matches.

### Step 4: Fail loudly when the access key is missing

At the top of the component body (after `const t = ...`):

```tsx
const accessKey = import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY;
if (!accessKey && import.meta.env.DEV) {
  console.error("PUBLIC_WEB3FORMS_ACCESS_KEY is not set — contact form cannot submit.");
}
```

Pass `access_key: accessKey || ""` as before, but disable the submit button
when the key is absent by adding `|| !accessKey` to its `disabled` condition,
and treat a submit attempt with no key as an error
(`if (!accessKey) { setStatus("error"); return; }` at the top of `onSubmit`,
before the `isBlocked` check).

**Verify**: `pnpm typecheck` → no new errors.

### Step 5: Declare and document the env var

1. In `src/env.d.ts`, add:

   ```ts
   interface ImportMetaEnv {
     readonly PUBLIC_WEB3FORMS_ACCESS_KEY: string;
   }

   interface ImportMeta {
     readonly env: ImportMetaEnv;
   }
   ```

   (Keep the existing `/// <reference ...>` lines above it.)

2. Create `.env.example` containing exactly:

   ```
   # Web3Forms access key for the contact form (public by design)
   PUBLIC_WEB3FORMS_ACCESS_KEY=
   ```

3. In `README.md`, under the Technologies section, add a short "Setup" note:
   copy `.env.example` to `.env` and fill in `PUBLIC_WEB3FORMS_ACCESS_KEY`
   (from the Web3Forms dashboard).

**Verify**: `pnpm build` → exit 0; `ls .env.example` → exists;
never print `.env` contents.

## Test plan

No JS test runner exists in this repo (adding one is out of scope). Manual QA
with `pnpm dev` (use agent-browser if available):

1. `/contact` — submit with email `asdf` → the email error message renders,
   no network request fires.
2. Valid inputs, DevTools → Network → Offline → submit → the error paragraph
   (`role="alert"`) appears; button does NOT say success.
3. (Only if the operator provides a test key) online submit → success label,
   button disabled, reload keeps it disabled (localStorage lockout intact).

Record which of these you actually ran.

## Done criteria

- [ ] `grep -n "type={type}" src/components/ui/LabeledInput.tsx` → 1 match
- [ ] `grep -n "isSubmitSuccessful" src/components/contact/ContactForm.tsx` → 0 matches
- [ ] `grep -n 'role="alert"' src/components/contact/ContactForm.tsx` → 1 match
- [ ] `.env.example` exists; `ImportMetaEnv` declared in `src/env.d.ts`
- [ ] `pnpm typecheck` error count ≤ baseline; `pnpm build` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The `ContactForm.tsx` code differs from the "Current state" excerpts.
- `@web3forms/react`'s `useWeb3Forms` signature rejects the changes (its
  `onError` shape differs from assumed) — report the actual types.
- You find yourself wanting to edit `src/i18n/ui.ts` — the keys exist; if a
  key you need is genuinely missing, that's drift; STOP.
- Manual QA step 2 shows the success label on failure after your change.

## Maintenance notes

- Operator follow-ups (dashboard, not code): restrict the Web3Forms access key
  to the `www.ubean.mn` origin, and consider enabling its Turnstile/hCaptcha
  integration — the localStorage lockout is UX, not a spam control.
- If a test runner (Vitest) is added later, the four QA cases above are the
  characterization tests to write first.
- Reviewers: check that forwarding `required` doesn't produce a native browser
  validation popup racing the RHF message (RHF's `onTouched` mode + `noValidate`
  may be desired — if the double-validation UX appears, add `noValidate` to the
  `<form>` element and note it).
