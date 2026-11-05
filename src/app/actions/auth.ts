"use server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { cerrarSesion, crearSesion } from "@/lib/session";
import { requerirUsuario } from "@/lib/dal";
import { inicioSegunRol } from "@/lib/roles";

export type FormState = { error?: string; ok?: boolean; values?: Record<string, string> };

export async function registrar(_: FormState, fd: FormData): Promise<FormState> {
  const nombre = String(fd.get("nombre") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const values = { nombre, email };

  if (nombre.length < 2) return { error: "Ingresá tu nombre y apellido.", values };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "El email no parece válido.", values };
  if (password.length < 6) return { error: "La contraseña necesita al menos 6 caracteres.", values };

  const [existe] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existe) return { error: "Ya hay una cuenta con ese email. Probá ingresar.", values };

  const [u] = await db
    .insert(users)
    .values({ nombre, email, passwordHash: await bcrypt.hash(password, 10) })
    .returning({ id: users.id });
  await crearSesion(u.id);
  redirect("/rol");
}

export async function ingresar(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const [u] = await db.select().from(users).where(eq(users.email, email));
  if (!u || !(await bcrypt.compare(password, u.passwordHash))) {
    return { error: "Email o contraseña incorrectos.", values: { email } };
  }
  await crearSesion(u.id);
  redirect(inicioSegunRol(u.rol));
}

export async function salir() {
  await cerrarSesion();
  redirect("/");
}

export async function elegirRol(fd: FormData) {
  const rol = fd.get("rol") === "conductor" ? "conductor" : "pasajero";
  const u = await requerirUsuario();
  await db.update(users).set({ rol }).where(eq(users.id, u.id));
  if (fd.get("ir") === "inicio") redirect(inicioSegunRol(rol));
  refresh();
}
