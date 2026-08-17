import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UseFormRegisterReturn } from "react-hook-form";

interface Props {
  label: string;
  id: string;
  type?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  registration?: UseFormRegisterReturn;
  error?: string;
}

export function LabeledInput({
  label,
  id,
  type,
  name,
  registration,
  error,
  required,
  ...rest
}: Props) {
  const errorId = `${id}-error`;
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        required={required}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? errorId : undefined}
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
