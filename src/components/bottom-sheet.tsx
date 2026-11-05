"use client";
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cx } from "./ui";

/** Hoja inferior modal. Cierra con Escape, tocando afuera o con la X. */
export function BottomSheet({
  titulo,
  onClose,
  children,
  className,
}: {
  titulo: ReactNode;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-md items-end" role="dialog" aria-modal="true" aria-labelledby="sheet-titulo">
      <button aria-label="Cerrar" className="absolute inset-0 cursor-default bg-gris/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cx("relative max-h-[92dvh] w-full animate-rise overflow-y-auto rounded-t-[2rem] bg-white px-5 pt-3 pb-safe", className)}>
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gris-200" aria-hidden />
        <div className="flex items-center justify-between">
          <h2 id="sheet-titulo" className="font-display text-xl font-bold text-gris">{titulo}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-gris-100">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
