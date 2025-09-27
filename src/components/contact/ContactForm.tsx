import type { ui } from "@/i18n/ui";
import { Button } from "../ui/button";
import { LabeledInput } from "../ui/LabeledInput";
import { LabeledTextArea } from "../ui/LabeledTextArea";
import { useForm } from "react-hook-form";
import useWeb3Forms from "@web3forms/react";
import { useTranslations } from "@/i18n/utils";
import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { FEEDBACK_KEY } from "@/consts";

type FormValues = {
  name: string;
  email: string;
  message: string;
  botcheck?: boolean;
};

export default function ContactForm({ lang }: { lang: keyof typeof ui }) {
  const t = useTranslations(lang);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful, isSubmitting },
  } = useForm<FormValues>({
    mode: "onTouched",
    defaultValues: {
      botcheck: false,
    },
  });

  const [isSent, setIsSent] = useState(false);
  const [isBlocked, setIsBlocked] = useState(() =>
    Boolean(storage.get<boolean>(FEEDBACK_KEY)),
  );

  const { submit: submitToWeb3 } = useWeb3Forms({
    access_key: import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY || "",
    settings: {
      from_name: "Ubean Roastery Shop",
      subject: "Feedback from a user",
    },
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

  const onSubmit = handleSubmit(async (data) => {
    if (isBlocked) return;
    return submitToWeb3(data);
  });

  return (
    <form
      className="relative flex size-full max-w-md flex-col items-center justify-center gap-6"
      onSubmit={handleSubmit(onSubmit)}
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
        disabled={isBlocked || isSubmitting}
        className="px-14"
      >
        {isSubmitting
          ? t("contact.sending")
          : isSubmitSuccessful || isBlocked || isSent
            ? t("contact.success")
            : t("contact.submit")}
      </Button>
    </form>
  );
}
