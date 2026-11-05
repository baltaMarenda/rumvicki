import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";
import { Gift, Star, Ticket } from "lucide-react";
import { db } from "@/db";
import { ratings, reservations, trips, users } from "@/db/schema";
import { requerirUsuario } from "@/lib/dal";
import { formatFecha, formatHora } from "@/lib/fechas";
import { desgloseParte, formatPesos } from "@/lib/pricing";
import { cancelarReserva } from "@/app/actions/reservas";
import { ConfirmButton } from "@/components/confirm-button";
import { RouteLine } from "@/components/trip-card";
import { RoleSwitch } from "@/components/role-switch";
import { Alerta, Avatar, Badge, ButtonLink, EmptyState, PageHeader, PageSkeleton, SectionTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Mis reservas" };

type SP = Promise<{ nueva?: string; calificado?: string }>;

const estados = {
  pendiente: { label: "Esperando al conductor", tono: "azul" },
  confirmada: { label: "Confirmada", tono: "verde" },
  rechazada: { label: "Rechazada", tono: "borde" },
  cancelada: { label: "Cancelada", tono: "borde" },
  finalizada: { label: "Finalizada", tono: "gris" },
} as const;

async function Contenido({ searchParams }: { searchParams: SP }) {
  const u = await requerirUsuario();
  const sp = await searchParams;
  const lista = await db
    .select({ r: reservations, t: trips, c: { id: users.id, nombre: users.nombre } })
    .from(reservations)
    .innerJoin(trips, eq(trips.id, reservations.tripId))
    .innerJoin(users, eq(users.id, trips.conductorId))
    .where(eq(reservations.pasajeroId, u.id))
    .orderBy(desc(trips.fechaHora));

  const tripIds = lista.map((x) => x.t.id);
  const confirmadas = tripIds.length
    ? await db
        .select({ tripId: reservations.tripId })
        .from(reservations)
        .where(and(inArray(reservations.tripId, tripIds), eq(reservations.estado, "confirmada")))
    : [];
  const calificados = new Set(
    tripIds.length
      ? (await db.select({ tripId: ratings.tripId }).from(ratings).where(and(inArray(ratings.tripId, tripIds), eq(ratings.autorId, u.id)))).map(
          (r) => r.tripId,
        )
      : [],
  );

  const activas = lista.filter((x) => x.r.estado === "pendiente" || x.r.estado === "confirmada").reverse();
  const historial = lista.filter((x) => !(x.r.estado === "pendiente" || x.r.estado === "confirmada"));

  const Item = ({ x }: { x: (typeof lista)[number] }) => {
    const est = estados[x.r.estado];
    const ocupados = confirmadas.filter((c) => c.tripId === x.t.id).length + (x.r.estado === "pendiente" ? 1 : 0);
    const estimado = desgloseParte(x.t.km, Math.min(Math.max(ocupados, 1), x.t.capacidad), u.premiosDisponibles > 0).aPagar;
    const activa = x.r.estado === "pendiente" || x.r.estado === "confirmada";
    return (
      <div className="rounded-3xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between gap-2">
          <Badge tono={est.tono}>{est.label}</Badge>
          <span className="text-xs font-semibold text-gris/60">
            {formatFecha(x.t.fechaHora)} · {formatHora(x.t.fechaHora)}
          </span>
        </div>
        <Link href={`/viajes/${x.t.id}`} className="mt-3 flex items-center justify-between gap-3">
          <RouteLine origen={x.t.origen} destino={x.t.destino} />
          <div className="shrink-0 text-right">
            {x.r.estado === "finalizada" ? (
              <>
                <p className="text-xs text-gris/60">Pagaste</p>
                <p className="font-display text-lg font-bold tabular-nums">{formatPesos(x.r.montoPagado ?? 0)}</p>
              </>
            ) : (
              <>
                <p className="text-xs text-gris/60">{activa ? "Estimado" : "Precio"}</p>
                <p className="font-display text-lg font-bold tabular-nums">{formatPesos(estimado)}</p>
              </>
            )}
            <p className="text-xs font-semibold text-gris/70">+ peajes</p>
          </div>
        </Link>
        <div className="mt-3 flex items-center gap-2 border-t border-gris-100 pt-3">
          <Avatar nombre={x.c.nombre} size="sm" />
          <p className="flex-1 truncate text-sm font-semibold">{x.c.nombre}</p>
          {x.r.usoPremio && (
            <Badge tono="verde">
              <Gift className="size-3.5" aria-hidden /> Sin comisión
            </Badge>
          )}
          {x.r.tarjetaUltimos4 && activa && <span className="text-xs text-gris/60">•••• {x.r.tarjetaUltimos4}</span>}
        </div>
        {activa && (
          <form action={cancelarReserva} className="mt-3">
            <input type="hidden" name="reservaId" value={x.r.id} />
            <ConfirmButton className="w-full" confirmText="Tocá de nuevo para cancelar">
              Cancelar reserva
            </ConfirmButton>
          </form>
        )}
        {x.r.estado === "finalizada" && !calificados.has(x.t.id) && (
          <ButtonLink href={`/calificar/${x.t.id}`} variant="azul" className="mt-3 w-full">
            <Star className="size-4" aria-hidden /> Calificar al conductor
          </ButtonLink>
        )}
      </div>
    );
  };

  return (
    <main>
      <PageHeader title="Mis reservas" subtitle="Seguí el estado de tus lugares." right={<RoleSwitch rol={u.rol} ir="inicio" />} />
      <div className="px-5">
        {sp.nueva && (
          <div className="mt-5">
            <Alerta tono="verde">¡Solicitud enviada! El conductor la va a revisar. El pago quedó retenido (simulado).</Alerta>
          </div>
        )}
        {sp.calificado && (
          <div className="mt-5">
            <Alerta tono="verde">¡Gracias por calificar!</Alerta>
          </div>
        )}
        <SectionTitle>Activas</SectionTitle>
        {activas.length === 0 ? (
          <EmptyState
            icon={<Ticket className="size-7" />}
            title="No tenés reservas activas"
            text="Buscá un viaje y reservá tu lugar en segundos."
            action={<ButtonLink href="/buscar">Buscar viajes</ButtonLink>}
          />
        ) : (
          <div className="stagger space-y-3">
            {activas.map((x) => (
              <Item key={x.r.id} x={x} />
            ))}
          </div>
        )}
        {historial.length > 0 && (
          <>
            <SectionTitle>Historial</SectionTitle>
            <div className="stagger space-y-3">
              {historial.map((x) => (
                <Item key={x.r.id} x={x} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function ReservasPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Contenido searchParams={searchParams} />
    </Suspense>
  );
}
