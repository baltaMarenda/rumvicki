"use server";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { ratings, reservations, trips } from "@/db/schema";
import { requerirUsuario } from "@/lib/dal";

export async function calificar(fd: FormData) {
  const u = await requerirUsuario();
  const tripId = Number(fd.get("tripId"));
  const [t] = await db.select().from(trips).where(eq(trips.id, tripId));
  if (!t || t.estado !== "finalizado") redirect("/reservas");

  const pasajeros = (
    await db
      .select({ id: reservations.pasajeroId })
      .from(reservations)
      .where(and(eq(reservations.tripId, t.id), eq(reservations.estado, "finalizada")))
  ).map((r) => r.id);

  const esConductor = t.conductorId === u.id;
  if (!esConductor && !pasajeros.includes(u.id)) redirect("/reservas");

  const destinatarios = esConductor ? pasajeros : [t.conductorId];
  const filas = destinatarios
    .map((id) => ({ id, valor: fd.get(`r_${id}`) }))
    .filter((x) => x.valor !== null && x.valor !== "")
    .map(({ id, valor }) => ({
      tripId: t.id,
      autorId: u.id,
      destinatarioId: id,
      estrellas: Math.min(5, Math.max(0, Math.round(Number(valor)))),
      rolDestinatario: (esConductor ? "pasajero" : "conductor") as "pasajero" | "conductor",
    }));

  if (filas.length) await db.insert(ratings).values(filas).onConflictDoNothing();
  redirect(esConductor ? "/mis-viajes?calificado=1" : "/reservas?calificado=1");
}
