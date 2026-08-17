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
    <div className="w-full max-w-sm">
      <div className="grid items-center gap-3">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : undefined}
          {...registration}
          {...rest}
        />
      </div>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          error ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <small
          id={errorId}
          aria-hidden={!error}
          className={`overflow-hidden text-sm text-red-600 ${error ? "pt-3" : ""}`}
        >
          {error}
        </small>
      </div>
    </div>
  );
}
