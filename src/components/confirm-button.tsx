"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { buttonClass } from "./ui";

/** Botón de submit que pide un segundo toque para confirmar (sin diálogos del navegador). */
export function ConfirmButton({
  children,
  confirmText,
  variant = "blanco",
  className,
}: {
  children: ReactNode;
  confirmText: string;
  variant?: "verde" | "azul" | "blanco" | "suave";
  className?: string;
}) {
  const [armado, setArmado] = useState(false);
  const { pending } = useFormStatus();
  useEffect(() => {
    if (!armado) return;
    const t = setTimeout(() => setArmado(false), 4000);
    return () => clearTimeout(t);
  }, [armado]);

  return (
    <button
      type={armado ? "submit" : "button"}
      onClick={(e) => {
        if (!armado) {
          e.preventDefault();
          setArmado(true);
        }
      }}
      disabled={pending}
      className={buttonClass(armado ? "azul" : variant, className)}
    >
      {pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : armado ? confirmText : children}
    </button>
  );
}
