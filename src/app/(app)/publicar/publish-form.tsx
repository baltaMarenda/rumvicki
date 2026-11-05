"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { Minus, Plus, Send } from "lucide-react";
import { publicarViaje } from "@/app/actions/viajes";
import type { FormState } from "@/app/actions/auth";
import { LocalidadSelect } from "@/components/localidad-select";
import { PriceSimulator } from "@/components/price-simulator";
import { SubmitButton } from "@/components/submit-button";
import { Card, Field, SectionTitle } from "@/components/ui";
import { formatPesos, liquidacionConductor } from "@/lib/pricing";
import { isoFechaAR } from "@/lib/fechas";
import { MAX_PASAJEROS } from "@/lib/reglas";

export function PublishForm({ conPremio }: { conPremio: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(publicarViaje, {});
  const v = state.values ?? {};
  const [km, setKm] = useState(Number(v.km) || 0);
  const [capacidad, setCapacidad] = useState(Math.min(Number(v.capacidad) || 3, MAX_PASAJEROS));
  const fechaRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (fechaRef.current) fechaRef.current.min = isoFechaAR(new Date());
  }, []);

  const kmValido = km >= 5 && km <= 1500;
  const liq = liquidacionConductor(km, Array(capacidad).fill(false), conPremio);

  return (
    <form action={action} className="space-y-4">
      <Card className="space-y-4">
        <LocalidadSelect name="origen" label="Origen" defaultValue={v.origen} placeholder="¿Desde dónde salís?" required />
        <LocalidadSelect name="destino" label="Destino" defaultValue={v.destino} placeholder="¿A dónde vas?" required />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha" htmlFor="fecha">
            <input id="fecha" name="fecha" type="date" ref={fechaRef} className="input" defaultValue={v.fecha} required />
          </Field>
          <Field label="Hora de salida" htmlFor="hora">
            <input id="hora" name="hora" type="time" className="input" defaultValue={v.hora} required />
          </Field>
        </div>
        <Field label="Distancia del recorrido" htmlFor="km" hint="Mirá los km en tu app de mapas. Se cobran $300 por km.">
          <div className="relative">
            <input
              id="km"
              name="km"
              type="number"
              inputMode="numeric"
              min={5}
              max={1500}
              className="input pr-14"
              placeholder="Ej: 400"
              defaultValue={v.km}
              onChange={(e) => setKm(Math.round(Number(e.target.value)) || 0)}
              required
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-gris/60">km</span>
          </div>
        </Field>
        <div>
          <p id="cap-label" className="mb-1.5 text-sm font-semibold text-gris">Lugares para pasajeros</p>
          <div className="flex items-center justify-between rounded-2xl border-[1.5px] border-gris-200 p-1.5" role="group" aria-labelledby="cap-label">
            <button type="button" onClick={() => setCapacidad((c) => Math.max(1, c - 1))} aria-label="Restar un lugar" className="grid size-11 cursor-pointer place-items-center rounded-xl bg-gris-100 text-gris disabled:opacity-40" disabled={capacidad <= 1}>
              <Minus className="size-5" />
            </button>
            <span className="font-display text-2xl font-bold tabular-nums text-gris" aria-live="polite">{capacidad}</span>
            <button type="button" onClick={() => setCapacidad((c) => Math.min(MAX_PASAJEROS, c + 1))} aria-label="Sumar un lugar" className="grid size-11 cursor-pointer place-items-center rounded-xl bg-azul text-white disabled:opacity-40" disabled={capacidad >= MAX_PASAJEROS}>
              <Plus className="size-5" />
            </button>
          </div>
          <input type="hidden" name="capacidad" value={capacidad} />
          <p className="mt-1.5 text-xs text-gris/70">Máximo {MAX_PASAJEROS} pasajeros + vos: 5 integrantes por auto.</p>
        </div>
      </Card>

      {kmValido && (
        <div className="animate-rise">
          <SectionTitle>Así lo verán los pasajeros</SectionTitle>
          <PriceSimulator key={`${capacidad}`} km={km} capacidad={capacidad} conPremio={conPremio} />
          <div className="mt-3 flex items-center justify-between rounded-3xl bg-verde px-5 py-4 text-white">
            <div>
              <p className="text-sm font-semibold text-white/95">Si se completa el auto, recibís</p>
              <p className="text-xs text-white/90">Ya descontada la comisión de Yendo (10% de cada parte)</p>
            </div>
            <p className="font-display text-2xl font-bold tabular-nums">{formatPesos(liq.recibe)}</p>
          </div>
        </div>
      )}

      {state.error && (
        <p role="alert" className="rounded-2xl bg-gris-100 px-4 py-3 text-sm font-semibold text-gris">{state.error}</p>
      )}
      <SubmitButton variant="azul" className="w-full text-base" pendingText="Publicando…">
        <Send className="size-5" aria-hidden /> Publicar viaje
      </SubmitButton>
    </form>
  );
}
