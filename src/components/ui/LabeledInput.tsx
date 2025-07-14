import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

export function LabeledInput({
  label,
  id,
  type,
  placeholder,
  required,
}: Props) {
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Input
        type={type ?? "text"}
        id={id}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
