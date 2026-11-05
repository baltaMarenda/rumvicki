"use client";
import { useId, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { LOCALIDADES, coincide, normalizar, regionDe } from "@/lib/localidades";
import { cx } from "./ui";

export function LocalidadSelect({
  name,
  label,
  defaultValue = "",
  placeholder = "Buscá una ciudad",
  required,
  onChange,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (v: string) => void;
}) {
  const id = useId();
  const [texto, setTexto] = useState(defaultValue);
  const [valor, setValor] = useState(defaultValue);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);

  const opciones = useMemo(() => {
    const q = normalizar(texto);
    const lista = q ? LOCALIDADES.filter((l) => coincide(l, q)) : LOCALIDADES;
    return lista.slice(0, 7);
  }, [texto]);

  const elegir = (l: string) => {
    setTexto(l);
    setValor(l);
    setAbierto(false);
    onChange?.(l);
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-gris">
        {label}
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-azul" aria-hidden />
        <input
          id={id}
          className="input pl-11"
          role="combobox"
          aria-expanded={abierto}
          aria-controls={`${id}-lista`}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder}
          required={required}
          value={texto}
          onFocus={() => setAbierto(true)}
          onBlur={() => setTimeout(() => setAbierto(false), 120)}
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
            setActivo(0);
            const exacta = LOCALIDADES.find((l) => normalizar(l) === normalizar(e.target.value));
            setValor(exacta ?? "");
            onChange?.(exacta ?? "");
          }}
          onKeyDown={(e) => {
            if (!abierto) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActivo((a) => Math.min(a + 1, opciones.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActivo((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && opciones[activo]) {
              e.preventDefault();
              elegir(opciones[activo]);
            } else if (e.key === "Escape") setAbierto(false);
          }}
        />
        <input type="hidden" name={name} value={valor} />
      </div>
      {abierto && opciones.length > 0 && (
        <ul
          id={`${id}-lista`}
          role="listbox"
          className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-gris-200 bg-white p-1.5 shadow-card animate-rise"
        >
          {opciones.map((l, i) => (
            <li
              key={l}
              role="option"
              aria-selected={i === activo}
              onMouseDown={(e) => {
                e.preventDefault();
                elegir(l);
              }}
              onMouseEnter={() => setActivo(i)}
              className={cx(
                "flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-3 text-[15px] text-gris",
                i === activo && "bg-azul-50",
              )}
            >
              <MapPin className="size-4 text-gris/50" aria-hidden />
              {l}
              <span className="ml-auto text-xs text-gris/50">{regionDe(l)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
