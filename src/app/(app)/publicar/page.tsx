import { Suspense } from "react";
import type { Metadata } from "next";
import { estaVerificado, requerirUsuario } from "@/lib/dal";
import { PageHeader, PageSkeleton } from "@/components/ui";
import { RoleSwitch } from "@/components/role-switch";
import { VerificacionBanner } from "@/components/verificacion-banner";
import { PublishForm } from "./publish-form";

export const metadata: Metadata = { title: "Publicar viaje" };

async function Contenido() {
  const u = await requerirUsuario();
  return (
    <main>
      <PageHeader
        title="Publicá tu viaje"
        subtitle="Sumá pasajeros y compartí los gastos del camino."
        right={<RoleSwitch rol={u.rol} ir="inicio" />}
      />
      <div className="space-y-4 px-5 pt-5">
        {!estaVerificado(u) && <VerificacionBanner next="/publicar" accion="publicar viajes" />}
        <PublishForm conPremio={u.premiosDisponibles > 0} />
      </div>
    </main>
  );
}

export default function PublicarPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Contenido />
    </Suspense>
  );
}
