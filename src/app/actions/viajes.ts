"use server";
import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { db } from "@/db";
import { reservations, trips, users } from "@/db/schema";
import { estaVerificado, requerirUsuario } from "@/lib/dal";
import { esLocalidad } from "@/lib/localidades";
import { fechaHoraAR } from "@/lib/fechas";
import { desgloseParte, liquidacionConductor } from "@/lib/pricing";
import { premiosNuevos } from "@/lib/rewards";
import { MAX_PASAJEROS } from "@/lib/reglas";
import type { FormState } from "./auth";

export async function publicarViaje(_: FormState, fd: FormData): Promise<FormState> {
  const u = await requerirUsuario();
  if (!estaVerificado(u)) redirect("/verificacion?next=/publicar");

  const origen = String(fd.get("origen") ?? "");
  const destino = String(fd.get("destino") ?? "");
  const fecha = String(fd.get("fecha") ?? "");
  const hora = String(fd.get("hora") ?? "");
  const km = Number(fd.get("km"));
  const capacidad = Number(fd.get("capacidad"));
  const values = { origen, destino, fecha, hora, km: String(fd.get("km") ?? ""), capacidad: String(capacidad) };

  if (!esLocalidad(origen) || !esLocalidad(destino))
    return { error: "Elegí origen y destino de la lista de localidades.", values };
  if (origen === destino) return { error: "El origen y el destino tienen que ser distintos.", values };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora))
    return { error: "Completá la fecha y la hora de salida.", values };
  const fechaHora = fechaHoraAR(fecha, hora);
  if (fechaHora.getTime() < Date.now()) return { error: "La salida tiene que ser en el futuro.", values };
  if (!Number.isInteger(km) || km < 5 || km > 1500)
    return { error: "Los km tienen que estar entre 5 y 1.500.", values };
  if (!Number.isInteger(capacidad) || capacidad < 1 || capacidad > MAX_PASAJEROS)
    return { error: `Entran hasta ${MAX_PASAJEROS} pasajeros + vos (5 integrantes).`, values };

  const [t] = await db
    .insert(trips)
    .values({ conductorId: u.id, origen, destino, fechaHora, km, capacidad })
    .returning({ id: trips.id });
  redirect(`/mis-viajes/${t.id}?publicado=1`);
}

async function viajePropio(tripId: number) {
  const u = await requerirUsuario();
  const [t] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.conductorId, u.id)));
  if (!t) throw new Error("Viaje no encontrado");
  return { u, t };
}

export async function responderSolicitud(fd: FormData) {
  const reservaId = Number(fd.get("reservaId"));
  const aceptar = fd.get("accion") === "aceptar";
  const [r] = await db.select().from(reservations).where(eq(reservations.id, reservaId));
  if (!r || r.estado !== "pendiente") return refresh();
  const { t } = await viajePropio(r.tripId);
  if (t.estado !== "publicado") return refresh();

  if (aceptar) {
    const confirmadas = await db
      .select({ id: reservations.id })
      .from(reservations)
      .where(and(eq(reservations.tripId, t.id), eq(reservations.estado, "confirmada")));
    if (confirmadas.length >= t.capacidad) return refresh();
  }
  await db
    .update(reservations)
    .set({ estado: aceptar ? "confirmada" : "rechazada" })
    .where(eq(reservations.id, reservaId));
  refresh();
}

export async function cancelarViaje(fd: FormData) {
  const { t } = await viajePropio(Number(fd.get("tripId")));
  if (t.estado !== "publicado") return refresh();
  await db.batch([
    db.update(trips).set({ estado: "cancelado" }).where(eq(trips.id, t.id)),
    db
      .update(reservations)
      .set({ estado: "cancelada" })
      .where(and(eq(reservations.tripId, t.id), inArray(reservations.estado, ["pendiente", "confirmada"]))),
  ]);
  refresh();
}

/** Finaliza el viaje: liquida pagos simulados, suma km, entrega y consume premios. */
export async function finalizarViaje(fd: FormData) {
  const { u, t } = await viajePropio(Number(fd.get("tripId")));
  if (t.estado !== "publicado") return refresh();

  const confirmadas = await db
    .select({ r: reservations, p: users })
    .from(reservations)
    .innerJoin(users, eq(users.id, reservations.pasajeroId))
    .where(and(eq(reservations.tripId, t.id), eq(reservations.estado, "confirmada")));
  if (confirmadas.length === 0) return refresh();

  const n = confirmadas.length;
  const conductorUsaPremio = u.premiosDisponibles > 0;
  const liq = liquidacionConductor(
    t.km,
    confirmadas.map(({ p }) => p.premiosDisponibles > 0),
    conductorUsaPremio,
  );

  const actualizarUsuario = (user: typeof u, usaPremio: boolean) => {
    const km = user.kmTotales + t.km;
    return db
      .update(users)
      .set({
        kmTotales: km,
        premiosDisponibles: user.premiosDisponibles - (usaPremio ? 1 : 0) + premiosNuevos(user.kmTotales, km),
        premiosCanjeados: user.premiosCanjeados + (usaPremio ? 1 : 0),
      })
      .where(eq(users.id, user.id));
  };

  const queries = [
    db
      .update(trips)
      .set({
        estado: "finalizado",
        conductorUsoPremio: conductorUsaPremio,
        conductorComision: liq.comisionConductor,
        conductorRecibe: liq.recibe,
      })
      .where(eq(trips.id, t.id)),
    db
      .update(reservations)
      .set({ estado: "rechazada" })
      .where(and(eq(reservations.tripId, t.id), eq(reservations.estado, "pendiente"))),
    actualizarUsuario(u, conductorUsaPremio),
    ...confirmadas.flatMap(({ r, p }) => {
      const usa = p.premiosDisponibles > 0;
      const d = desgloseParte(t.km, n, usa);
      return [
        db
          .update(reservations)
          .set({ estado: "finalizada", montoPagado: d.aPagar, comision: d.comision, usoPremio: usa })
          .where(eq(reservations.id, r.id)),
        actualizarUsuario(p, usa),
      ];
    }),
  ];
  await db.batch(queries as [ (typeof queries)[number], ...(typeof queries)[number][] ]);
  redirect(`/calificar/${t.id}`);
}
