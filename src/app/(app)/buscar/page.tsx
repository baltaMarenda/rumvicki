import { Suspense } from "react";
import type { Metadata } from "next";
import Form from "next/form";
import { redirect } from "next/navigation";
import { and, asc, eq, gte, inArray, lt, ne } from "drizzle-orm";
import { Search, Route } from "lucide-react";
import { db } from "@/db";
import { reservations, trips, users } from "@/db/schema";
import { estaVerificado, promedios, requerirUsuario } from "@/lib/dal";
import { esLocalidad } from "@/lib/localidades";
import { fechaHoraAR, formatHora } from "@/lib/fechas";
import { LocalidadSelect } from "@/components/localidad-select";
import { TripCard } from "@/components/trip-card";
import { RoleSwitch } from "@/components/role-switch";
import { VerificacionBanner } from "@/components/verificacion-banner";
import { EmptyState, PageHeader, PageSkeleton, SectionTitle, buttonClass } from "@/components/ui";

export const metadata: Metadata = { title: "Buscar viajes" };

type SP = Promise<{ origen?: string; destino?: string; fecha?: string; hora?: string }>;

async function Contenido({ searchParams }: { searchParams: SP }) {
  const u = await requerirUsuario();
  if (!u.rol) redirect("/rol");
  const sp = await searchParams;
  const origen = sp.origen && esLocalidad(sp.origen) ? sp.origen : "";
  const destino = sp.destino && esLocalidad(sp.destino) ? sp.destino : "";
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(sp.fecha ?? "") ? sp.fecha! : "";
  const hora = /^\d{2}:\d{2}$/.test(sp.hora ?? "") ? sp.hora! : "";

  const ahora = new Date();
  const filtros = [eq(trips.estado, "publicado"), gte(trips.fechaHora, ahora), ne(trips.conductorId, u.id)];
  if (origen) filtros.push(eq(trips.origen, origen));
  if (destino) filtros.push(eq(trips.destino, destino));
  if (fecha) {
    const desde = fechaHoraAR(fecha, hora || "00:00");
    const hasta = new Date(fechaHoraAR(fecha, "00:00").getTime() + 86_400_000);
    filtros.push(gte(trips.fechaHora, desde), lt(trips.fechaHora, hasta));
  }

  let rows = await db
    .select({ trip: trips, conductor: { id: users.id, nombre: users.nombre } })
    .from(trips)
    .innerJoin(users, eq(users.id, trips.conductorId))
    .where(and(...filtros))
    .orderBy(asc(trips.fechaHora))
    .limit(40);
  if (hora && !fecha) rows = rows.filter((r) => formatHora(r.trip.fechaHora) >= hora);

  const ids = rows.map((r) => r.trip.id);
  const confirmadas = ids.length
    ? await db
        .select({ tripId: reservations.tripId })
        .from(reservations)
        .where(and(inArray(reservations.tripId, ids), eq(reservations.estado, "confirmada")))
    : [];
  const ocupados = new Map<number, number>();
  confirmadas.forEach((c) => ocupados.set(c.tripId, (ocupados.get(c.tripId) ?? 0) + 1));
  const ratings = await promedios([...new Set(rows.map((r) => r.conductor.id))], "conductor");
  const filtrando = Boolean(origen || destino || fecha || hora);

  return (
    <main>
      <PageHeader
        title="¿A dónde vamos?"
        subtitle={`Hola, ${u.nombre.split(" ")[0]}`}
        right={<RoleSwitch rol={u.rol} ir="inicio" />}
      >
        <Form action="/buscar" className="space-y-3 rounded-3xl bg-white p-4 text-gris shadow-card">
          <LocalidadSelect name="origen" label="Desde" defaultValue={origen} placeholder="Ciudad de origen" />
          <LocalidadSelect name="destino" label="Hasta" defaultValue={destino} placeholder="Ciudad de destino" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="fecha" className="mb-1.5 block text-sm font-semibold">Fecha</label>
              <input id="fecha" name="fecha" type="date" className="input" defaultValue={fecha} />
            </div>
            <div>
              <label htmlFor="hora" className="mb-1.5 block text-sm font-semibold">Desde las</label>
              <input id="hora" name="hora" type="time" className="input" defaultValue={hora} />
            </div>
          </div>
          <button className={buttonClass("azul", "w-full")}>
            <Search className="size-5" aria-hidden /> Buscar viajes
          </button>
        </Form>
      </PageHeader>

      <div className="px-5">
        {!estaVerificado(u) && (
          <div className="mt-5">
            <VerificacionBanner next="/buscar" accion="reservar" />
          </div>
        )}
        <SectionTitle
          aside={
            filtrando && (
              <a href="/buscar" className="text-sm font-semibold text-gris underline decoration-verde decoration-2 underline-offset-4">
                Limpiar
              </a>
            )
          }
        >
          {filtrando ? `${rows.length} ${rows.length === 1 ? "viaje encontrado" : "viajes encontrados"}` : "Próximos viajes"}
        </SectionTitle>
        {rows.length === 0 ? (
          <EmptyState
            icon={<Route className="size-7" />}
            title="No hay viajes para esa búsqueda"
            text="Probá con otra fecha u horario, o buscá solo por destino."
          />
        ) : (
          <div className="stagger space-y-3">
            {rows.map(({ trip, conductor }) => (
              <TripCard
                key={trip.id}
                trip={trip}
                conductor={conductor}
                rating={ratings.get(conductor.id) ?? { promedio: null, cantidad: 0 }}
                ocupados={ocupados.get(trip.id) ?? 0}
                href={`/viajes/${trip.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function BuscarPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Contenido searchParams={searchParams} />
    </Suspense>
  );
}
