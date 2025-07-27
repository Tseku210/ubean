import type { ui } from "@/i18n/ui";
import { Button } from "../ui/button";
import { LabeledInput } from "../ui/LabeledInput";
import { LabeledTextArea } from "../ui/LabeledTextArea";
import { useState } from "react";
import { useTranslations } from "@/i18n/utils";

export default function ContactForm({ lang }: { lang: keyof typeof ui }) {
  const t = useTranslations(lang);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // setStatus("submitting");
    // setMessage(null);

    // const formData = new FormData(event.currentTarget);
    // const name = formData.get("name") as string;
    // const email = formData.get("email") as string;
    // const messageContent = formData.get("message") as string;

    // try {
    //   const response = await fetch("/api/contact", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ name, email, message: messageContent }),
    //   });

    //   if (response.ok) {
    //     setStatus("success");
    //     setMessage("Your message has been sent successfully!");
    //     event.currentTarget.reset();
    //   } else {
    //     const errorData = await response.json();
    //     setStatus("error");
    //     setMessage(errorData.error || "Something went wrong. Please try again.");
    //   }
    // } catch (error) {
    //   console.error("Submission failed:", error);
    //   setStatus("error");
    //   setMessage("Network error. Please check your connection and try again.");
    // }
  };

  return (
    <form
      className="relative flex size-full max-w-md flex-col items-center justify-center gap-6"
      onSubmit={handleSubmit}
    >
      <LabeledInput
        label={t("contact.name")}
        placeholder={t("contact.name_placeholder")}
        id="name"
        name="name"
        required
      />
      <LabeledInput
        label={t("contact.email")}
        placeholder={t("contact.email_placeholder")}
        id="email"
        name="email"
        type="email"
        required
      />
      <LabeledTextArea
        label={t("contact.message")}
        placeholder={t("contact.message_placeholder")}
        id="message"
        name="message"
        rows={5}
        required
      />
      <Button size="lg" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? t("contact.sending") : t("contact.submit")}
      </Button>

      {message && (
        <p
          className={`text-center ${status === "success" ? "text-green-600" : "text-red-600"}`}
        >
          {message}
        </p>
      )}
    </form>
  );
}

