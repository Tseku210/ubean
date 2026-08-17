import type { ui } from "@/i18n/ui";
import { Button } from "../ui/button";
import { LabeledInput } from "../ui/LabeledInput";
import { LabeledTextArea } from "../ui/LabeledTextArea";
import { useForm } from "react-hook-form";
import { CircleCheckIcon } from "lucide-react";
import useWeb3Forms from "@web3forms/react";
import { useTranslations } from "@/i18n/utils";
import { useState } from "react";
import { storage } from "@/lib/storage";
import { FEEDBACK_KEY } from "@/consts";
import { useMountEffect } from "@/hooks/useMountEffect";

type FormValues = {
  name: string;
  email: string;
  message: string;
  botcheck?: boolean;
};

export default function ContactForm({ lang }: { lang: keyof typeof ui }) {
  const t = useTranslations(lang);

  const accessKey = import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY;
  if (!accessKey && import.meta.env.DEV) {
    console.error(
      "PUBLIC_WEB3FORMS_ACCESS_KEY is not set — contact form cannot submit.",
    );
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onTouched",
    defaultValues: {
      botcheck: false,
    },
  });

  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  // The form is server-rendered (client:load), so localStorage must not be
  // read during the initial render — the build HTML has isBlocked=false and a
  // returning submitter would get a hydration mismatch. Sync after mount;
  // `hydrated` also keeps the button inert until React can handle the submit
  // (before hydration a submit would GET-navigate with the form data).
  const [isBlocked, setIsBlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useMountEffect(() => {
    setIsBlocked(Boolean(storage.get<boolean>(FEEDBACK_KEY)));
    setHydrated(true);
  });

  const { submit: submitToWeb3 } = useWeb3Forms({
    access_key: accessKey || "",
    settings: {
      from_name: "Ubean Roastery Shop",
      subject: "Feedback from a user",
    },
    onSuccess: () => {
      setStatus("sent");
      reset();
      storage.set<boolean>(FEEDBACK_KEY, true);
      setIsBlocked(true);
    },
    onError: () => {
      setStatus("error");
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!accessKey) {
      setStatus("error");
      return;
    }
    if (isBlocked) return;
    try {
      await submitToWeb3(data);
    } catch {
      // useWeb3Forms only calls onError for error responses; a transport
      // failure (offline, DNS) rejects instead.
      setStatus("error");
    }
  });

  if (status === "sent" || isBlocked) {
    return (
      <div
        className={`flex size-full max-w-md flex-col items-center justify-center gap-4 text-center ${
          status === "sent" ? "success-enter" : ""
        }`}
        role="status"
      >
        <CircleCheckIcon className="text-primary size-12" strokeWidth={1.5} />
        <p className="text-h5">{t("contact.success")}</p>
      </div>
    );
  }

  return (
    <form
      className="relative flex size-full max-w-md flex-col items-center justify-center gap-6"
      onSubmit={onSubmit}
      noValidate
    >
      <input
        type="checkbox"
        className="hidden"
        style={{ display: "none" }}
        {...register("botcheck")}
      />
      <LabeledInput
        label={t("contact.name")}
        placeholder={t("contact.name_placeholder")}
        id="name"
        name="name"
        registration={register("name", {
          required: t("contact.error.name"),
        })}
        error={errors.name?.message}
        required
      />
      <LabeledInput
        label={t("contact.email")}
        placeholder={t("contact.email_placeholder")}
        id="email"
        name="email"
        type="email"
        registration={register("email", {
          required: t("contact.error.mail"),
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: t("contact.error.mail"),
          },
        })}
        error={errors.email?.message}
        required
      />
      <LabeledTextArea
        label={t("contact.message")}
        placeholder={t("contact.message_placeholder")}
        id="message"
        name="message"
        rows={5}
        registration={register("message", {
          required: t("contact.error.message"),
        })}
        error={errors.message?.message}
        required
      />
      <Button
        size="lg"
        type="submit"
        isLoading={isSubmitting}
        disabled={!hydrated || isBlocked || isSubmitting || !accessKey}
        className="px-14"
      >
        {isSubmitting ? t("contact.sending") : t("contact.submit")}
      </Button>
      {status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {t("contact.error")}
        </p>
      )}
    </form>
  );
}
