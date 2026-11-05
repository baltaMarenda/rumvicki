import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  rol: text("rol").$type<"pasajero" | "conductor">(),
  dni: text("dni"),
  dniVerificado: boolean("dni_verificado").notNull().default(false),
  antecedentesVerificados: boolean("antecedentes_verificados").notNull().default(false),
  kmTotales: integer("km_totales").notNull().default(0),
  premiosDisponibles: integer("premios_disponibles").notNull().default(0),
  premiosCanjeados: integer("premios_canjeados").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TripEstado = "publicado" | "finalizado" | "cancelado";

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  conductorId: integer("conductor_id")
    .notNull()
    .references(() => users.id),
  origen: text("origen").notNull(),
  destino: text("destino").notNull(),
  fechaHora: timestamp("fecha_hora", { withTimezone: true }).notNull(),
  km: integer("km").notNull(),
  capacidad: integer("capacidad").notNull(),
  estado: text("estado").$type<TripEstado>().notNull().default("publicado"),
  conductorUsoPremio: boolean("conductor_uso_premio").notNull().default(false),
  conductorComision: integer("conductor_comision"),
  conductorRecibe: integer("conductor_recibe"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ReservaEstado =
  | "pendiente"
  | "confirmada"
  | "rechazada"
  | "cancelada"
  | "finalizada";

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id")
    .notNull()
    .references(() => trips.id),
  pasajeroId: integer("pasajero_id")
    .notNull()
    .references(() => users.id),
  estado: text("estado").$type<ReservaEstado>().notNull().default("pendiente"),
  tarjetaUltimos4: text("tarjeta_ultimos4"),
  montoPagado: integer("monto_pagado"),
  comision: integer("comision"),
  usoPremio: boolean("uso_premio").notNull().default(false),
  /** Pago simulado con Mercado Pago, se hace cuando el viaje termina. */
  pagadoAt: timestamp("pagado_at", { withTimezone: true }),
  medioPago: text("medio_pago"),
  /** Solo se completa cuando el pasajero cancela (no cuando el conductor cancela el viaje). */
  canceladaAt: timestamp("cancelada_at", { withTimezone: true }),
  cancelacionTardia: boolean("cancelacion_tardia").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ratings = pgTable(
  "ratings",
  {
    id: serial("id").primaryKey(),
    tripId: integer("trip_id")
      .notNull()
      .references(() => trips.id),
    autorId: integer("autor_id")
      .notNull()
      .references(() => users.id),
    destinatarioId: integer("destinatario_id")
      .notNull()
      .references(() => users.id),
    estrellas: integer("estrellas").notNull(),
    rolDestinatario: text("rol_destinatario").$type<"pasajero" | "conductor">().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("ratings_unique").on(t.tripId, t.autorId, t.destinatarioId)],
);

export type User = typeof users.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
