"use server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requerirUsuario } from "@/lib/dal";

export async function verificarIdentidad(
  _: { error?: string },
  fd: FormData,
): Promise<{ error?: string }> {
  const u = await requerirUsuario();
  const dni = String(fd.get("dni") ?? "").replace(/\D/g, "");
  const pdfNombre = String(fd.get("pdfNombre") ?? "");
  const next = String(fd.get("next") ?? "");

  if (dni.length < 7 || dni.length > 8) return { error: "El DNI tiene que tener 7 u 8 números." };
  if (!pdfNombre.toLowerCase().endsWith(".pdf")) return { error: "Subí el certificado de antecedentes en PDF." };

  // Validación simulada: en un sistema real se consultaría RENAPER y el Registro Nacional de Reincidencia.
  await new Promise((r) => setTimeout(r, 600));
  await db
    .update(users)
    .set({ dni, dniVerificado: true, antecedentesVerificados: true })
    .where(eq(users.id, u.id));

  redirect(next.startsWith("/") ? next : "/perfil");
}
