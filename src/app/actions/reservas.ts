"use server";
import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { db } from "@/db";
import { reservations, trips } from "@/db/schema";
import { estaVerificado, requerirUsuario } from "@/lib/dal";
import type { FormState } from "./auth";

export async function reservar(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requerirUsuario();
  const tripId = Number(fd.get("tripId"));
  if (!estaVerificado(u)) redirect(`/verificacion?next=/viajes/${tripId}`);

  const tarjeta = String(fd.get("tarjeta") ?? "").replace(/\s/g, "");
  const venc = String(fd.get("vencimiento") ?? "");
  const cvv = String(fd.get("cvv") ?? "");
  if (!/^\d{16}$/.test(tarjeta)) return { error: "La tarjeta tiene que tener 16 números." };
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(venc)) return { error: "El vencimiento va como MM/AA." };
  if (!/^\d{3,4}$/.test(cvv)) return { error: "El código de seguridad tiene 3 o 4 números." };

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

  await db.insert(reservations).values({ tripId: t.id, pasajeroId: u.id, tarjetaUltimos4: tarjeta.slice(-4) });
  redirect("/reservas?nueva=1");
}

export async function cancelarReserva(fd: FormData) {
  const u = await requerirUsuario();
  const id = Number(fd.get("reservaId"));
  await db
    .update(reservations)
    .set({ estado: "cancelada" })
    .where(
      and(
        eq(reservations.id, id),
        eq(reservations.pasajeroId, u.id),
        inArray(reservations.estado, ["pendiente", "confirmada"]),
      ),
    );
  refresh();
}
