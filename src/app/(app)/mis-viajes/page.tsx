import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";
import { CarFront, ChevronRight, Plus } from "lucide-react";
import { db } from "@/db";
import { ratings, reservations, trips } from "@/db/schema";
import { requerirUsuario } from "@/lib/dal";
import { formatFecha, formatHora } from "@/lib/fechas";
import { formatPesos, precioTotal } from "@/lib/pricing";
import { RouteLine } from "@/components/trip-card";
import { RoleSwitch } from "@/components/role-switch";
import { Alerta, Badge, ButtonLink, EmptyState, PageHeader, PageSkeleton, SectionTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Mis viajes" };

type SP = Promise<{ calificado?: string }>;

async function Contenido({ searchParams }: { searchParams: SP }) {
  const u = await requerirUsuario();
  const sp = await searchParams;
  const lista = await db.select().from(trips).where(eq(trips.conductorId, u.id)).orderBy(desc(trips.fechaHora));
  const ids = lista.map((t) => t.id);
  const res = ids.length
    ? await db
        .select({ tripId: reservations.tripId, estado: reservations.estado })
        .from(reservations)
        .where(inArray(reservations.tripId, ids))
    : [];
  const calificados = new Set(
    ids.length
      ? (
          await db
            .select({ tripId: ratings.tripId })
            .from(ratings)
            .where(and(inArray(ratings.tripId, ids), eq(ratings.autorId, u.id)))
        ).map((r) => r.tripId)
      : [],
  );
  const contar = (id: number, estado: string) => res.filter((r) => r.tripId === id && r.estado === estado).length;

  const proximos = lista.filter((t) => t.estado === "publicado").reverse();
  const historial = lista.filter((t) => t.estado !== "publicado");

  const Item = ({ t }: { t: (typeof lista)[number] }) => {
    const pendientes = contar(t.id, "pendiente");
    const confirmados = contar(t.id, t.estado === "finalizado" ? "finalizada" : "confirmada");
    return (
      <Link href={`/mis-viajes/${t.id}`} className="group block rounded-3xl bg-white p-4 shadow-card transition-transform active:scale-[0.99]">
        <div className="flex items-center justify-between gap-2">
          <Badge tono="gris">
            {formatFecha(t.fechaHora)} · {formatHora(t.fechaHora)}
          </Badge>
          <div className="flex gap-1.5">
            {t.estado === "publicado" && pendientes > 0 && (
              <Badge tono="azul">
                {pendientes} {pendientes === 1 ? "solicitud" : "solicitudes"}
              </Badge>
            )}
            {t.estado === "finalizado" && !calificados.has(t.id) && <Badge tono="verde">Calificar</Badge>}
            {t.estado === "cancelado" && <Badge tono="borde">Cancelado</Badge>}
            {t.estado === "finalizado" && calificados.has(t.id) && <Badge tono="borde">Finalizado</Badge>}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <RouteLine origen={t.origen} destino={t.destino} />
          <div className="shrink-0 text-right">
            <p className="font-display text-lg font-bold tabular-nums">{formatPesos(precioTotal(t.km))}</p>
            <p className="text-xs font-semibold text-gris/70">+ peajes</p>
            <p className="mt-1 text-xs text-gris/60">
              {confirmados}/{t.capacidad} pasajeros
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-gris/40" aria-hidden />
        </div>
      </Link>
    );
  };

  return (
    <main>
      <PageHeader title="Mis viajes" subtitle="Gestioná solicitudes, pasajeros y calificaciones." right={<RoleSwitch rol={u.rol} ir="inicio" />}>
        <ButtonLink href="/publicar" variant="blanco" className="w-full">
          <Plus className="size-5" aria-hidden /> Publicar un viaje nuevo
        </ButtonLink>
      </PageHeader>
      <div className="px-5">
        {sp.calificado && (
          <div className="mt-5">
            <Alerta tono="verde">¡Gracias por calificar! Eso ayuda a toda la comunidad.</Alerta>
          </div>
        )}
        <SectionTitle>Próximos</SectionTitle>
        {proximos.length === 0 ? (
          <EmptyState
            icon={<CarFront className="size-7" />}
            title="Todavía no publicaste viajes"
            text="Publicá tu próximo recorrido y empezá a compartir los gastos."
          />
        ) : (
          <div className="stagger space-y-3">
            {proximos.map((t) => (
              <Item key={t.id} t={t} />
            ))}
          </div>
        )}
        {historial.length > 0 && (
          <>
            <SectionTitle>Historial</SectionTitle>
            <div className="stagger space-y-3">
              {historial.map((t) => (
                <Item key={t.id} t={t} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function MisViajesPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Contenido searchParams={searchParams} />
    </Suspense>
  );
}
