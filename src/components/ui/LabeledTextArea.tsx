import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  label: string;
  id: string;
  rows?: number;
  name?: string;
  placeholder?: string;
  required?: boolean;
}

export function LabeledTextArea({ label, id, name, placeholder, rows, required }: Props) {
  return (
    <div className="grid w-full max-w-sm h-full gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Textarea name={name} placeholder={placeholder} id={id} rows={rows} required={required} />
    </div>
  );
}
