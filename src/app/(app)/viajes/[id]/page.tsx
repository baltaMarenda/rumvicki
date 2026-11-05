import { Suspense } from "react";
import { notFound } from "next/navigation";
import { and, count, eq, inArray } from "drizzle-orm";
import { CalendarDays, Clock, Gauge, ShieldCheck, UsersRound } from "lucide-react";
import { db } from "@/db";
import { reservations, trips, users } from "@/db/schema";
import { estaVerificado, promedio, requerirUsuario } from "@/lib/dal";
import { esFuturo, formatFecha, formatHora } from "@/lib/fechas";
import { desgloseParte } from "@/lib/pricing";
import { PriceSimulator } from "@/components/price-simulator";
import { ReservaSheet } from "@/components/reserva-sheet";
import { RouteLine } from "@/components/trip-card";
import { Alerta, Avatar, Badge, ButtonLink, Card, PageHeader, PageSkeleton, SectionTitle, Stars } from "@/components/ui";

const estadoTexto = { pendiente: "Esperando aprobación", confirmada: "Lugar confirmado" } as const;

async function Contenido({ params }: { params: Promise<{ id: string }> }) {
  const u = await requerirUsuario();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [row] = await db
    .select({ trip: trips, conductor: users })
    .from(trips)
    .innerJoin(users, eq(users.id, trips.conductorId))
    .where(eq(trips.id, id));
  if (!row) notFound();
  const { trip, conductor } = row;

  const activas = await db
    .select({ pasajeroId: reservations.pasajeroId, estado: reservations.estado })
    .from(reservations)
    .where(and(eq(reservations.tripId, id), inArray(reservations.estado, ["pendiente", "confirmada"])));
  const confirmados = activas.filter((r) => r.estado === "confirmada").length;
  const mia = activas.find((r) => r.pasajeroId === u.id);
  const [{ viajes }] = await db
    .select({ viajes: count() })
    .from(trips)
    .where(and(eq(trips.conductorId, conductor.id), eq(trips.estado, "finalizado")));
  const rating = await promedio(conductor.id, "conductor");

  const libres = trip.capacidad - confirmados;
  const conPremio = u.premiosDisponibles > 0;
  const pasajerosEstimados = Math.min(confirmados + (mia ? 0 : 1), trip.capacidad) || 1;
  const estimado = desgloseParte(trip.km, pasajerosEstimados, conPremio).aPagar;
  const disponible = trip.estado === "publicado" && esFuturo(trip.fechaHora);

  return (
    <main>
      <PageHeader tono="azul" back="/buscar" title={`${trip.origen} → ${trip.destino}`} subtitle={`${formatFecha(trip.fechaHora)} · ${formatHora(trip.fechaHora)} hs`} />
      <div className="space-y-4 px-5 pt-5">
        <Card className="animate-rise">
          <RouteLine origen={trip.origen} destino={trip.destino} hora={formatHora(trip.fechaHora)} />
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gris-100 pt-4 text-center">
            {[
              { icon: Gauge, label: "Distancia", value: `${trip.km} km` },
              { icon: UsersRound, label: "Lugares", value: `${libres}/${trip.capacidad}` },
              { icon: CalendarDays, label: "Salida", value: formatHora(trip.fechaHora) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <Icon className="mx-auto size-5 text-azul" aria-hidden />
                <p className="mt-1 font-display text-base font-bold text-gris">{value}</p>
                <p className="text-xs text-gris/60">{label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <Avatar nombre={conductor.nombre} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gris/60">Conductor</p>
            <p className="truncate font-display text-lg font-semibold text-gris">{conductor.nombre}</p>
            <div className="flex items-center gap-3">
              <Stars {...rating} />
              <span className="text-xs text-gris/60">{viajes} {viajes === 1 ? "viaje" : "viajes"}</span>
            </div>
          </div>
          {estaVerificado(conductor) && (
            <Badge tono="verde">
              <ShieldCheck className="size-3.5" aria-hidden /> Verificado
            </Badge>
          )}
        </Card>

        <SectionTitle>Precio por integrante</SectionTitle>
        <PriceSimulator km={trip.km} capacidad={trip.capacidad} inicial={pasajerosEstimados} conPremio={conPremio} />

        <div className="pt-2">
          {trip.conductorId === u.id ? (
            <ButtonLink href={`/mis-viajes/${trip.id}`} variant="azul" className="w-full">
              Gestionar mi viaje
            </ButtonLink>
          ) : mia ? (
            <Alerta tono={mia.estado === "confirmada" ? "verde" : "azul"}>
              <p className="font-semibold">{estadoTexto[mia.estado as keyof typeof estadoTexto]}</p>
              <p className="text-white/90">Podés verla o cancelarla desde Reservas.</p>
            </Alerta>
          ) : !disponible ? (
            <Alerta>Este viaje ya no acepta reservas.</Alerta>
          ) : libres <= 0 ? (
            <Alerta>El viaje está completo.</Alerta>
          ) : !estaVerificado(u) ? (
            <ButtonLink href={`/verificacion?next=/viajes/${trip.id}`} variant="azul" className="w-full">
              <ShieldCheck className="size-5" aria-hidden /> Verificá tu identidad para reservar
            </ButtonLink>
          ) : (
            <ReservaSheet tripId={trip.id} estimado={estimado} pasajerosEstimados={pasajerosEstimados} />
          )}
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gris/60">
            <Clock className="size-3.5" aria-hidden /> El precio final depende de cuántos viajen. Peajes aparte.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ViajePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton tono="azul" />}>
      <Contenido params={params} />
    </Suspense>
  );
}
