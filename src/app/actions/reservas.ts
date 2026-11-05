"use server";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { db } from "@/db";
import { reservations, trips } from "@/db/schema";
import { estaVerificado, requerirUsuario } from "@/lib/dal";
import { esCancelacionTardia } from "@/lib/reglas";
import { esMedioPago } from "@/lib/medios-pago";
import type { FormState } from "./auth";

export async function reservar(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requerirUsuario();
  const tripId = Number(fd.get("tripId"));
  if (!estaVerificado(u)) redirect(`/verificacion?next=/viajes/${tripId}`);

  const [t] = await db.select().from(trips).where(eq(trips.id, tripId));
  if (!t || t.estado !== "publicado" || t.fechaHora.getTime() < Date.now())
    return { error: "Este viaje ya no está disponible." };
  if (t.conductorId === u.id) return { error: "No podés reservar tu propio viaje." };

  const activas = await db
    .select({ pasajeroId: reservations.pasajeroId, estado: reservations.estado })
    .from(reservations)
    .where(and(eq(reservations.tripId, t.id), inArray(reservations.estado, ["pendiente", "confirmada"])));
  if (activas.some((r) => r.pasajeroId === u.id)) return { error: "Ya tenés una reserva en este viaje." };
  if (activas.filter((r) => r.estado === "confirmada").length >= t.capacidad)
    return { error: "El viaje ya está completo." };

  // El pago se hace con Mercado Pago (simulado) cuando el conductor finaliza el viaje.
  await db.insert(reservations).values({ tripId: t.id, pasajeroId: u.id });
  redirect("/reservas?nueva=1");
}

export async function cancelarReserva(fd: FormData) {
  const u = await requerirUsuario();
  const id = Number(fd.get("reservaId"));
  const [row] = await db
    .select({ fechaHora: trips.fechaHora })
    .from(reservations)
    .innerJoin(trips, eq(trips.id, reservations.tripId))
    .where(and(eq(reservations.id, id), eq(reservations.pasajeroId, u.id)));
  if (!row) return refresh();
  const ahora = new Date();
  await db
    .update(reservations)
    .set({ estado: "cancelada", canceladaAt: ahora, cancelacionTardia: esCancelacionTardia(row.fechaHora, ahora) })
    .where(
      and(
        eq(reservations.id, id),
        eq(reservations.pasajeroId, u.id),
        inArray(reservations.estado, ["pendiente", "confirmada"]),
      ),
    );
  refresh();
}

/** Pago simulado con Mercado Pago. Solo se puede pagar una reserva de un viaje ya finalizado. */
export type PagoState = FormState & { operacion?: string; fecha?: string };

export async function pagarConMercadoPago(_: PagoState, fd: FormData): Promise<PagoState> {
  const u = await requerirUsuario();
  const id = Number(fd.get("reservaId"));
  const medio = String(fd.get("medio") ?? "");
  if (!esMedioPago(medio)) return { error: "Elegí cómo querés pagar." };

  // Simula la demora de la pasarela.
  await new Promise((r) => setTimeout(r, 1200));
  const [r] = await db
    .update(reservations)
    .set({ pagadoAt: new Date(), medioPago: medio })
    .where(
      and(
        eq(reservations.id, id),
        eq(reservations.pasajeroId, u.id),
        eq(reservations.estado, "finalizada"),
        isNull(reservations.pagadoAt),
      ),
    )
    .returning({ id: reservations.id });
  if (!r) return { error: "Esta reserva no tiene un pago pendiente." };
  // Sin refresh(): si la lista se recarga ahora, la reserva sale de "Pagos pendientes" y se
  // desmonta el checkout antes de mostrar el comprobante. Se recarga al cerrar el comprobante.
  const ahora = new Date();
  return {
    ok: true,
    operacion: String(ahora.getTime()).slice(-10),
    fecha: new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" }).format(ahora),
  };
}
