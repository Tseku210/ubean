import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UseFormRegisterReturn } from "react-hook-form";

interface Props {
  label: string;
  id: string;
  rows?: number;
  name?: string;
  placeholder?: string;
  required?: boolean;
  registration?: UseFormRegisterReturn;
  error?: string;
}

export function LabeledTextArea({
  label,
  id,
  name,
  placeholder,
  rows,
  registration,
  error,
  required,
  ...rest
}: Props) {
  const errorId = `${id}-error`;
  return (
    <div className="grid h-full w-full max-w-sm gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        name={name}
        placeholder={placeholder}
        id={id}
        rows={rows}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? errorId : undefined}
        required={required}
        {...registration}
        {...rest}
      />
      {error && (
        <small id={errorId} className="text-sm text-red-600">
          {error}
        </small>
      )}
    </div>
  );
}
