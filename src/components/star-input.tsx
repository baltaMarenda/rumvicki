"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { cx } from "./ui";

const textos = ["Sin estrellas", "Muy malo", "Malo", "Bien", "Muy bien", "¡Excelente!"];

export function StarInput({ name, label }: { name: string; label: string }) {
  const [valor, setValor] = useState<number | null>(null);
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
        <button
          type="button"
          role="radio"
          aria-checked={valor === 0}
          onClick={() => setValor(0)}
          className={cx(
            "mr-1 grid size-11 cursor-pointer place-items-center rounded-full border text-sm font-bold transition-colors",
            valor === 0 ? "border-azul bg-azul text-white" : "border-gris-200 text-gris",
          )}
          aria-label="0 estrellas"
        >
          0
        </button>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={valor === i}
            aria-label={`${i} ${i === 1 ? "estrella" : "estrellas"}`}
            onClick={() => setValor(i)}
            className="grid size-11 cursor-pointer place-items-center rounded-full transition-transform active:scale-90"
          >
            <Star
              className={cx(
                "size-8 transition-colors duration-150",
                valor !== null && i <= valor ? "fill-verde text-verde" : "text-gris-300",
                valor === i && "animate-pop",
              )}
              strokeWidth={1.8}
              aria-hidden
            />
          </button>
        ))}
      </div>
      <p className="mt-1 h-5 text-sm font-medium text-gris/80">{valor === null ? "Elegí de 0 a 5" : `${valor}/5 · ${textos[valor]}`}</p>
      <input type="hidden" name={name} value={valor ?? ""} />
    </fieldset>
  );
}
