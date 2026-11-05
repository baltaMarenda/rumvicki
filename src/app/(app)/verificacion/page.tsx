import { Suspense } from "react";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { estaVerificado, requerirUsuario } from "@/lib/dal";
import { ButtonLink, Card, PageHeader, PageSkeleton } from "@/components/ui";
import { VerificacionForm } from "./verificacion-form";

export const metadata: Metadata = { title: "Verificación" };

type SP = Promise<{ next?: string }>;

async function Contenido({ searchParams }: { searchParams: SP }) {
  const u = await requerirUsuario();
  const raw = (await searchParams).next ?? "/perfil";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/perfil";
  return (
    <main>
      <PageHeader tono="azul" back={next} title="Verificá tu identidad" subtitle="Para publicar o reservar viajes pedimos DNI y antecedentes penales. Así viajamos todos tranquilos." />
      <div className="px-5 pt-5">
        {estaVerificado(u) ? (
          <Card className="flex flex-col items-center py-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-verde text-white animate-pop">
              <ShieldCheck className="size-8" aria-hidden />
            </span>
            <p className="mt-4 font-display text-xl font-bold">Ya estás verificado</p>
            <p className="mt-1 text-sm text-gris/70">Podés publicar y reservar viajes.</p>
            <ButtonLink href={next} className="mt-5">Continuar</ButtonLink>
          </Card>
        ) : (
          <VerificacionForm next={next} dni={u.dni} />
        )}
      </div>
    </main>
  );
}

export default function VerificacionPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<PageSkeleton tono="azul" />}>
      <Contenido searchParams={searchParams} />
    </Suspense>
  );
}
