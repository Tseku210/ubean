// components/contact/ContactForm.tsx
import { Button } from "../ui/button";
import { LabeledInput } from "../ui/LabeledInput";
import { LabeledTextArea } from "../ui/LabeledTextArea";
import { useState } from "react"; // <--- Add this import

export default function ContactForm() {
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
        label="Name"
        placeholder="Enter your name"
        id="name"
        name="name"
        required
      />
      <LabeledInput
        label="Email"
        placeholder="Enter your email"
        id="email"
        name="email"
        type="email"
        required
      />
      <LabeledTextArea
        label="Message"
        id="message"
        name="message"
        placeholder="Enter your message"
        rows={5}
        required
      />
      <Button
        size="lg"
        type="submit"
        className="aspect-[165/44] rounded-full py-2"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending..." : "Submit"}
      </Button>

      {message && (
        <p
          className={`text-center ${
            status === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}