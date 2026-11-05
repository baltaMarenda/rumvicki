import "server-only";
import { redirect } from "next/navigation";
import { and, avg, count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { ratings, users, type User } from "@/db/schema";
import { leerUserId } from "./session";

export async function usuarioActual(): Promise<User | null> {
  const id = await leerUserId();
  if (!id) return null;
  const [u] = await db.select().from(users).where(eq(users.id, id));
  return u ?? null;
}

/** Usuario logueado o redirect a /login. */
export async function requerirUsuario(): Promise<User> {
  const u = await usuarioActual();
  if (!u) redirect("/login");
  return u;
}

export const estaVerificado = (u: User) => u.dniVerificado && u.antecedentesVerificados;

export type Promedio = { promedio: number | null; cantidad: number };

/** Promedios de estrellas por usuario en un rol (conductor o pasajero). */
export async function promedios(
  ids: number[],
  rol: "pasajero" | "conductor",
): Promise<Map<number, Promedio>> {
  const map = new Map<number, Promedio>();
  if (ids.length === 0) return map;
  const rows = await db
    .select({
      id: ratings.destinatarioId,
      promedio: avg(ratings.estrellas),
      cantidad: count(),
    })
    .from(ratings)
    .where(and(inArray(ratings.destinatarioId, ids), eq(ratings.rolDestinatario, rol)))
    .groupBy(ratings.destinatarioId);
  for (const r of rows) {
    map.set(r.id, { promedio: r.promedio ? Number(r.promedio) : null, cantidad: r.cantidad });
  }
  return map;
}

export async function promedio(id: number, rol: "pasajero" | "conductor"): Promise<Promedio> {
  return (await promedios([id], rol)).get(id) ?? { promedio: null, cantidad: 0 };
}
