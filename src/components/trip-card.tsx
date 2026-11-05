import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatFecha, formatHora } from "@/lib/fechas";
import { formatPesos, precioPorPersona, precioTotal } from "@/lib/pricing";
import type { Promedio } from "@/lib/dal";
import { Avatar, Badge, Stars } from "./ui";

export function RouteLine({ origen, destino, hora }: { origen: string; destino: string; hora?: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-1.5" aria-hidden>
        <span className="size-3 rounded-full border-[3px] border-azul bg-white" />
        <span className="my-1 w-0.5 flex-1 rounded bg-gris-200" />
        <span className="size-3 rounded-full bg-verde" />
      </div>
      <div className="min-w-0 space-y-3">
        <p className="truncate font-display text-[17px] font-semibold leading-tight text-gris">
          {origen}
          {hora && <span className="ml-2 text-sm font-medium text-gris/60">{hora}</span>}
        </p>
        <p className="truncate font-display text-[17px] font-semibold leading-tight text-gris">{destino}</p>
      </div>
    </div>
  );
}

export function TripCard({
  trip,
  conductor,
  rating,
  ocupados,
  href,
}: {
  trip: { id: number; origen: string; destino: string; fechaHora: Date; km: number; capacidad: number };
  conductor: { nombre: string };
  rating: Promedio;
  ocupados: number;
  href: string;
}) {
  const libres = trip.capacidad - ocupados;
  return (
    <Link
      href={href}
      className="group block rounded-3xl bg-white p-4 shadow-card transition-transform duration-200 active:scale-[0.99]"
    >
      <div className="flex items-center justify-between">
        <Badge tono="gris">
          {formatFecha(trip.fechaHora)} · {formatHora(trip.fechaHora)}
        </Badge>
        <span className="text-xs font-semibold text-gris/60">{trip.km} km</span>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <RouteLine origen={trip.origen} destino={trip.destino} />
        <div className="shrink-0 text-right">
          <p className="font-display text-xl font-bold tabular-nums text-gris">
            {formatPesos(precioTotal(trip.km))}
          </p>
          <p className="text-[13px] font-semibold text-gris/70">+ peajes</p>
          <p className="mt-1 text-xs text-gris/60">
            desde {formatPesos(precioPorPersona(trip.km, trip.capacidad))} c/u
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-gris-100 pt-3">
        <Avatar nombre={conductor.nombre} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gris">{conductor.nombre}</p>
          <Stars {...rating} className="text-xs" />
        </div>
        <Badge tono={libres > 0 ? "verde" : "gris"}>
          {libres > 0 ? `${libres} ${libres === 1 ? "lugar" : "lugares"}` : "Completo"}
        </Badge>
        <ChevronRight className="size-5 text-gris/40 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </div>
    </Link>
  );
}
