"use client";
import { useEffect, useState } from "react";
import { nivelKm } from "@/lib/rewards";

export function KmProgress({ km }: { km: number }) {
  const n = nivelKm(km);
  const [ancho, setAncho] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAncho(n.progreso * 100));
    return () => cancelAnimationFrame(id);
  }, [n.progreso]);

  return (
    <div>
      <div className="flex items-end justify-between">
        <p className="font-display text-5xl font-bold tabular-nums text-white">
          {km.toLocaleString("es-AR")}
          <span className="ml-1 text-xl font-semibold text-white/85">km</span>
        </p>
        <p className="pb-1.5 text-sm font-semibold text-white/90 tabular-nums">
          meta {n.hasta.toLocaleString("es-AR")} km
        </p>
      </div>
      <div
        className="relative mt-4 h-5 overflow-hidden rounded-full bg-white/25"
        role="progressbar"
        aria-valuemin={n.desde}
        aria-valuemax={n.hasta}
        aria-valuenow={km}
        aria-label={`Progreso hacia el próximo premio: ${km} de ${n.hasta} km`}
      >
        <div
          className="h-full rounded-full bg-white transition-[width] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${ancho}%` }}
        />
        {[25, 50, 75].map((m) => (
          <span key={m} aria-hidden className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-azul/40" style={{ left: `${m}%` }} />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs font-semibold text-white/90 tabular-nums">
        <span>{n.desde.toLocaleString("es-AR")} km</span>
        <span>Faltan {n.faltan.toLocaleString("es-AR")} km</span>
        <span>{n.hasta.toLocaleString("es-AR")} km</span>
      </div>
    </div>
  );
}
