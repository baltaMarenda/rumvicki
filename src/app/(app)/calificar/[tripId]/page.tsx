import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { Send } from "lucide-react";
import { db } from "@/db";
import { ratings, reservations, trips, users } from "@/db/schema";
import { requerirUsuario } from "@/lib/dal";
import { formatFecha } from "@/lib/fechas";
import { calificar } from "@/app/actions/calificaciones";
import { StarInput } from "@/components/star-input";
import { SubmitButton } from "@/components/submit-button";
import { Avatar, Card, PageHeader, PageSkeleton } from "@/components/ui";

async function Contenido({ params }: { params: Promise<{ tripId: string }> }) {
  const u = await requerirUsuario();
  const id = Number((await params).tripId);
  const [t] = await db.select().from(trips).where(eq(trips.id, id));
  if (!t) notFound();
  if (t.estado !== "finalizado") redirect("/reservas");

  const esConductor = t.conductorId === u.id;
  const pasajeros = await db
    .select({ id: users.id, nombre: users.nombre })
    .from(reservations)
    .innerJoin(users, eq(users.id, reservations.pasajeroId))
    .where(and(eq(reservations.tripId, id), eq(reservations.estado, "finalizada")));
  if (!esConductor && !pasajeros.some((p) => p.id === u.id)) notFound();

  const [conductor] = await db.select({ id: users.id, nombre: users.nombre }).from(users).where(eq(users.id, t.conductorId));
  const [ya] = await db.select({ id: ratings.id }).from(ratings).where(and(eq(ratings.tripId, id), eq(ratings.autorId, u.id))).limit(1);
  if (ya) redirect(esConductor ? "/mis-viajes" : "/reservas");

  const personas = esConductor ? pasajeros : [conductor];

  return (
    <main>
      <PageHeader
        tono="azul"
        back={esConductor ? `/mis-viajes/${t.id}` : "/reservas"}
        title={esConductor ? "¿Cómo viajaron tus pasajeros?" : "¿Cómo fue tu viaje?"}
        subtitle={`${t.origen} → ${t.destino} · ${formatFecha(t.fechaHora)}`}
      />
      <form action={calificar} className="space-y-3 px-5 pt-5">
        <input type="hidden" name="tripId" value={t.id} />
        <div className="stagger space-y-3">
          {personas.map((p) => (
            <Card key={p.id}>
              <div className="mb-3 flex items-center gap-3">
                <Avatar nombre={p.nombre} tono={esConductor ? "verde" : "azul"} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gris/60">{esConductor ? "Pasajero" : "Conductor"}</p>
                  <p className="font-display text-lg font-semibold">{p.nombre}</p>
                </div>
              </div>
              <StarInput name={`r_${p.id}`} label={`Calificación para ${p.nombre}`} />
            </Card>
          ))}
        </div>
        <p className="px-1 text-center text-xs text-gris/60">Tu calificación es individual y ayuda a otros a decidir con quién viajar.</p>
        <SubmitButton variant="verde" className="w-full text-base" pendingText="Enviando…">
          <Send className="size-5" aria-hidden /> Enviar calificación
        </SubmitButton>
      </form>
    </main>
  );
}

export default function CalificarPage({ params }: { params: Promise<{ tripId: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton tono="azul" />}>
      <Contenido params={params} />
    </Suspense>
  );
}
