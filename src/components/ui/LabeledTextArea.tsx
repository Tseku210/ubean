import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  label: string;
  id: string;
  placeholder?: string;
  required?: boolean;
}

export function LabeledTextArea({ label, id, placeholder, required }: Props) {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Textarea placeholder={placeholder} id={id} required={required} />
    </div>
  );
}
