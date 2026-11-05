/* Seed de datos demo. Uso: npm run db:seed (borra y recrea todo). */
import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as s from "./schema";

const db = drizzle(neon(process.env.DATABASE_URL!), { schema: s });

const dia = 86_400_000;
const enDias = (d: number, hora: string) => {
  const base = new Date(Date.now() + d * dia);
  const fecha = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(base);
  return new Date(`${fecha}T${hora}:00-03:00`);
};

async function main() {
  await db.execute(sql`TRUNCATE ratings, reservations, trips, users RESTART IDENTITY CASCADE`);
  const hash = await bcrypt.hash("yendo123", 10);
  const base = { passwordHash: hash, dniVerificado: true, antecedentesVerificados: true };

  const us = await db
    .insert(s.users)
    .values([
      { ...base, nombre: "Sofía Gómez", email: "sofia@yendo.app", rol: "pasajero", dni: "40111222", kmTotales: 750 },
      { ...base, nombre: "Martín Ríos", email: "martin@yendo.app", rol: "conductor", dni: "35222333", kmTotales: 1340, premiosDisponibles: 0, premiosCanjeados: 1 },
      { ...base, nombre: "Lucía Fernández", email: "lucia@yendo.app", rol: "conductor", dni: "38333444", kmTotales: 520 },
      { ...base, nombre: "Diego Paz", email: "diego@yendo.app", rol: "pasajero", dni: "42444555", kmTotales: 310 },
      { ...base, nombre: "Camila Torres", email: "camila@yendo.app", rol: "conductor", dni: "37555666", kmTotales: 980, premiosDisponibles: 1 },
      { ...base, nombre: "Juan Medina", email: "juan@yendo.app", rol: "pasajero", dni: "41666777", kmTotales: 160 },
    ])
    .returning({ id: s.users.id });
  const [sofia, martin, lucia, diego, camila, juan] = us.map((u) => u.id);

  // Viajes pasados ya finalizados (para que haya promedios de estrellas)
  const pasados = await db
    .insert(s.trips)
    .values([
      { conductorId: martin, origen: "La Plata", destino: "Mar del Plata", fechaHora: enDias(-20, "08:00"), km: 370, capacidad: 3, estado: "finalizado", conductorRecibe: 0 },
      { conductorId: lucia, origen: "Tandil", destino: "La Plata", fechaHora: enDias(-12, "15:30"), km: 360, capacidad: 3, estado: "finalizado", conductorRecibe: 0 },
      { conductorId: camila, origen: "Pergamino", destino: "Luján", fechaHora: enDias(-6, "07:15"), km: 160, capacidad: 2, estado: "finalizado", conductorRecibe: 0 },
    ])
    .returning({ id: s.trips.id });
  const [p1, p2, p3] = pasados.map((t) => t.id);
  await db.insert(s.reservations).values([
    { tripId: p1, pasajeroId: sofia, estado: "finalizada", montoPagado: 37000, comision: 3700, tarjetaUltimos4: "4242" },
    { tripId: p1, pasajeroId: diego, estado: "finalizada", montoPagado: 37000, comision: 3700, tarjetaUltimos4: "1111" },
    { tripId: p2, pasajeroId: sofia, estado: "finalizada", montoPagado: 54000, comision: 5400, tarjetaUltimos4: "4242" },
    { tripId: p2, pasajeroId: juan, estado: "finalizada", montoPagado: 54000, comision: 5400, tarjetaUltimos4: "5555" },
    { tripId: p3, pasajeroId: diego, estado: "finalizada", montoPagado: 24000, comision: 2400, tarjetaUltimos4: "1111" },
  ]);
  await db.insert(s.ratings).values([
    { tripId: p1, autorId: sofia, destinatarioId: martin, estrellas: 5, rolDestinatario: "conductor" },
    { tripId: p1, autorId: diego, destinatarioId: martin, estrellas: 4, rolDestinatario: "conductor" },
    { tripId: p1, autorId: martin, destinatarioId: sofia, estrellas: 5, rolDestinatario: "pasajero" },
    { tripId: p1, autorId: martin, destinatarioId: diego, estrellas: 3, rolDestinatario: "pasajero" },
    { tripId: p2, autorId: sofia, destinatarioId: lucia, estrellas: 5, rolDestinatario: "conductor" },
    { tripId: p2, autorId: juan, destinatarioId: lucia, estrellas: 5, rolDestinatario: "conductor" },
    { tripId: p2, autorId: lucia, destinatarioId: sofia, estrellas: 4, rolDestinatario: "pasajero" },
    { tripId: p2, autorId: lucia, destinatarioId: juan, estrellas: 2, rolDestinatario: "pasajero" },
    { tripId: p3, autorId: diego, destinatarioId: camila, estrellas: 4, rolDestinatario: "conductor" },
    { tripId: p3, autorId: camila, destinatarioId: diego, estrellas: 5, rolDestinatario: "pasajero" },
  ]);

  // Viajes futuros
  const futuros = await db
    .insert(s.trips)
    .values([
      { conductorId: martin, origen: "La Plata", destino: "Mar del Plata", fechaHora: enDias(2, "07:30"), km: 370, capacidad: 3 },
      { conductorId: martin, origen: "Mar del Plata", destino: "Tandil", fechaHora: enDias(5, "18:00"), km: 170, capacidad: 4 },
      { conductorId: lucia, origen: "Bahía Blanca", destino: "Tres Arroyos", fechaHora: enDias(1, "09:00"), km: 195, capacidad: 3 },
      { conductorId: lucia, origen: "Tandil", destino: "Olavarría", fechaHora: enDias(3, "14:00"), km: 115, capacidad: 2 },
      { conductorId: camila, origen: "Junín", destino: "Pergamino", fechaHora: enDias(2, "16:45"), km: 85, capacidad: 3 },
      { conductorId: camila, origen: "Luján", destino: "La Plata", fechaHora: enDias(4, "08:15"), km: 120, capacidad: 4 },
      { conductorId: martin, origen: "Quilmes", destino: "Pinamar", fechaHora: enDias(6, "06:30"), km: 330, capacidad: 3 },
      { conductorId: lucia, origen: "Chivilcoy", destino: "Bragado", fechaHora: enDias(7, "10:00"), km: 55, capacidad: 2 },
      { conductorId: camila, origen: "San Nicolás", destino: "Zárate", fechaHora: enDias(8, "17:30"), km: 160, capacidad: 3 },
      { conductorId: martin, origen: "Necochea", destino: "Bahía Blanca", fechaHora: enDias(9, "07:00"), km: 330, capacidad: 3 },
      { conductorId: lucia, origen: "Azul", destino: "Mar del Plata", fechaHora: enDias(10, "13:00"), km: 240, capacidad: 3 },
      { conductorId: camila, origen: "Pilar", destino: "San Antonio de Areco", fechaHora: enDias(3, "19:00"), km: 75, capacidad: 4 },
    ])
    .returning({ id: s.trips.id });
  const [f1, , f3, , f5] = futuros.map((t) => t.id);
  await db.insert(s.reservations).values([
    { tripId: f1, pasajeroId: diego, estado: "confirmada", tarjetaUltimos4: "1111" },
    { tripId: f1, pasajeroId: juan, estado: "pendiente", tarjetaUltimos4: "5555" },
    { tripId: f3, pasajeroId: sofia, estado: "confirmada", tarjetaUltimos4: "4242" },
    { tripId: f5, pasajeroId: diego, estado: "pendiente", tarjetaUltimos4: "1111" },
  ]);

  console.log("Seed listo: 6 usuarios (contraseña yendo123), 15 viajes.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
