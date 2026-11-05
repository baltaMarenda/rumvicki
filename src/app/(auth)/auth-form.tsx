"use client";
import { useActionState } from "react";
import Link from "next/link";
import { ingresar, registrar, type FormState } from "@/app/actions/auth";
import { Field } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

export function AuthForm({ modo }: { modo: "login" | "registro" }) {
  const [state, action] = useActionState<FormState, FormData>(modo === "login" ? ingresar : registrar, {});
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      {modo === "registro" && (
        <Field label="Nombre y apellido" htmlFor="nombre">
          <input id="nombre" name="nombre" className="input" autoComplete="name" defaultValue={v.nombre} placeholder="Sofía Gómez" required />
        </Field>
      )}
      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" inputMode="email" className="input" autoComplete="email" defaultValue={v.email} placeholder="vos@mail.com" required />
      </Field>
      <Field label="Contraseña" htmlFor="password" hint={modo === "registro" ? "Mínimo 6 caracteres." : undefined}>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          autoComplete={modo === "login" ? "current-password" : "new-password"}
          required
          minLength={6}
        />
      </Field>
      {state.error && (
        <p role="alert" className="rounded-2xl bg-gris-100 px-4 py-3 text-sm font-semibold text-gris">
          {state.error}
        </p>
      )}
      <SubmitButton className="w-full text-base" pendingText={modo === "login" ? "Ingresando…" : "Creando cuenta…"}>
        {modo === "login" ? "Ingresar" : "Crear cuenta"}
      </SubmitButton>
      <p className="pt-2 text-center text-sm text-gris/80">
        {modo === "login" ? (
          <>
            ¿No tenés cuenta? <Link className="font-bold text-gris underline decoration-verde decoration-2 underline-offset-4" href="/registro">Registrate</Link>
          </>
        ) : (
          <>
            ¿Ya tenés cuenta? <Link className="font-bold text-gris underline decoration-verde decoration-2 underline-offset-4" href="/login">Ingresá</Link>
          </>
        )}
      </p>
    </form>
  );
}
