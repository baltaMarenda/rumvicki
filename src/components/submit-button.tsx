"use client";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { buttonClass } from "./ui";
import type { ReactNode } from "react";

export function SubmitButton({
  children,
  variant = "verde",
  className,
  name,
  value,
  pendingText,
}: {
  children: ReactNode;
  variant?: "verde" | "azul" | "blanco" | "suave";
  className?: string;
  name?: string;
  value?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} disabled={pending} aria-busy={pending} className={buttonClass(variant, className)}>
      {pending ? (
        <>
          <LoaderCircle className="size-5 animate-spin" aria-hidden /> {pendingText ?? "Un segundo…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}
