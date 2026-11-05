"use client";
import { useState } from "react";
import { Gift, UsersRound } from "lucide-react";
import { desgloseParte, formatPesos, precioPorPersona, precioTotal } from "@/lib/pricing";
import { cx } from "./ui";

export function PriceSimulator({
  km,
  capacidad,
  inicial,
  conPremio = false,
  compacto = false,
}: {
  km: number;
  capacidad: number;
  inicial?: number;
  conPremio?: boolean;
  compacto?: boolean;
}) {
  const [n, setN] = useState(Math.min(Math.max(inicial ?? capacidad, 1), capacidad));
  const opciones = Array.from({ length: capacidad }, (_, i) => i + 1);
  const max = precioPorPersona(km, 1);
  const d = desgloseParte(km, n, conPremio);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gris/70">Cada integrante paga</p>
          <p className="mt-0.5 font-display text-4xl font-bold text-gris tabular-nums" aria-live="polite">
            {formatPesos(d.parte)}
            <span className="ml-1.5 text-base font-semibold text-gris/60">+ peajes</span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gris/80">
            <UsersRound className="size-4 text-azul" aria-hidden />
            {n} {n === 1 ? "pasajero" : "pasajeros"} + conductor = {n + 1} integrantes
          </p>
        </div>
        <div className="rounded-2xl bg-azul px-3 py-2 text-right text-white">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/85">Total</p>
          <p className="font-display text-lg font-bold tabular-nums">{formatPesos(precioTotal(km))}</p>
          <p className="text-[11px] font-medium text-white/85">{km} km × $300</p>
        </div>
      </div>

      {/* Mini gráfico: cómo baja el precio cuantos más se suman */}
      <div className="mt-5" role="radiogroup" aria-label="Cantidad de pasajeros">
        <div className="flex h-24 items-end gap-2">
          {opciones.map((i) => {
            const p = precioPorPersona(km, i);
            const sel = i === n;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={sel}
                aria-label={`${i} pasajeros: ${formatPesos(p)} cada uno`}
                onClick={() => setN(i)}
                className="group flex h-full flex-1 cursor-pointer flex-col items-center justify-end gap-1"
              >
                <span className={cx("text-[10px] font-semibold tabular-nums transition-opacity", sel ? "text-gris" : "text-gris/0 group-hover:text-gris/60")}>
                  {formatPesos(p)}
                </span>
                <span
                  className={cx(
                    "w-full rounded-t-xl transition-[height,background-color] duration-300 ease-out",
                    sel ? "bg-azul" : "bg-verde-100 group-hover:bg-verde",
                  )}
                  style={{ height: `${Math.max(14, (p / max) * 100) * 0.62}px` }}
                />
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2">
          {opciones.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setN(i)}
              aria-hidden
              tabIndex={-1}
              className={cx(
                "h-9 flex-1 cursor-pointer rounded-xl text-sm font-bold transition-colors",
                i === n ? "bg-azul text-white" : "bg-gris-100 text-gris",
              )}
            >
              {i}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-gris/70">Tocá para ver el precio según cuántos pasajeros viajen</p>
      </div>

      {!compacto && (
        <dl className="mt-5 space-y-2 border-t border-dashed border-gris-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-gris/80">Costo del viaje (90%)</dt>
            <dd className="font-semibold tabular-nums">{formatPesos(d.costoViaje)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gris/80">Comisión Yendo (10%)</dt>
            <dd className={cx("font-semibold tabular-nums", conPremio && "line-through decoration-2")}>
              {formatPesos(desgloseParte(km, n).comision)}
            </dd>
          </div>
          {conPremio && (
            <div className="flex items-center gap-2 rounded-xl bg-verde px-3 py-2 text-white">
              <Gift className="size-4" aria-hidden />
              <span className="font-semibold">Tu premio de km: no pagás comisión</span>
            </div>
          )}
          <div className="flex justify-between pt-1 text-base">
            <dt className="font-semibold">Tu parte</dt>
            <dd className="font-display font-bold tabular-nums">{formatPesos(d.aPagar)} + peajes</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
