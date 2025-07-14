import { Button } from "../ui/button";
import { LabeledInput } from "../ui/LabeledInput";
import { LabeledTextArea } from "../ui/LabeledTextArea";

export default function ContactForm() {
  return (
    <form className="relative flex w-full max-w-md flex-col items-center justify-center gap-6">
      <LabeledInput
        label="Name"
        placeholder="Enter your name"
        id="name"
        required
      />
      <LabeledInput
        label="Email"
        placeholder="Enter your email"
        id="email"
        type="email"
        required
      />
      <LabeledTextArea
        label="Message"
        id="message"
        placeholder="Enter your message"
        required
      />
      <Button size="lg" type="submit">
        Submit
      </Button>
    </form>
  );
}
