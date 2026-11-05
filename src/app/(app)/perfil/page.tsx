import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, ChevronRight, FileText, Gauge, IdCard, LogOut } from "lucide-react";
import { estaVerificado, promedio, requerirUsuario } from "@/lib/dal";
import { salir } from "@/app/actions/auth";
import { RoleSwitch } from "@/components/role-switch";
import { Avatar, Badge, Card, PageSkeleton, SectionTitle, Stars } from "@/components/ui";

export const metadata: Metadata = { title: "Perfil" };

async function Contenido() {
  const u = await requerirUsuario();
  const [comoConductor, comoPasajero] = await Promise.all([promedio(u.id, "conductor"), promedio(u.id, "pasajero")]);
  const verificado = estaVerificado(u);

  return (
    <main>
      <header className="relative overflow-hidden rounded-b-[2rem] bg-azul px-5 pb-7 pt-[max(env(safe-area-inset-top),1.25rem)] text-center text-white">
        <div aria-hidden className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full bg-white/10" />
        <div className="relative mt-6 flex flex-col items-center">
          <span className="rounded-full ring-4 ring-white/30">
            <Avatar nombre={u.nombre} size="lg" tono="verde" />
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold">{u.nombre}</h1>
          <p className="text-sm text-white/90">{u.email}</p>
          <div className="mt-4">
            <RoleSwitch rol={u.rol} />
          </div>
        </div>
      </header>

      <div className="px-5">
        <SectionTitle>Mis calificaciones</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-gris/60">Como conductor</p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums">{comoConductor.promedio?.toFixed(1) ?? "–"}</p>
            <Stars {...comoConductor} className="justify-center" />
          </Card>
          <Card className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-gris/60">Como pasajero</p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums">{comoPasajero.promedio?.toFixed(1) ?? "–"}</p>
            <Stars {...comoPasajero} className="justify-center" />
          </Card>
        </div>

        <SectionTitle>Verificación</SectionTitle>
        <Card className="divide-y divide-gris-100 p-0">
          {[
            { icon: IdCard, label: "DNI", ok: u.dniVerificado, detalle: u.dni ? `••• ${u.dni.slice(-3)}` : "Sin cargar" },
            { icon: FileText, label: "Antecedentes penales", ok: u.antecedentesVerificados, detalle: u.antecedentesVerificados ? "PDF validado" : "Sin cargar" },
          ].map(({ icon: Icon, label, ok, detalle }) => (
            <div key={label} className="flex items-center gap-3 p-4">
              <Icon className="size-5 text-azul" aria-hidden />
              <div className="flex-1">
                <p className="font-semibold">{label}</p>
                <p className="text-xs text-gris/60">{detalle}</p>
              </div>
              <Badge tono={ok ? "verde" : "borde"}>{ok ? <><BadgeCheck className="size-3.5" aria-hidden /> Verificado</> : "Pendiente"}</Badge>
            </div>
          ))}
          {!verificado && (
            <Link href="/verificacion?next=/perfil" className="flex items-center justify-between p-4 font-semibold">
              Verificar ahora <ChevronRight className="size-5" aria-hidden />
            </Link>
          )}
        </Card>

        <SectionTitle>Cuenta</SectionTitle>
        <Card className="divide-y divide-gris-100 p-0">
          <Link href="/km" className="flex items-center gap-3 p-4">
            <Gauge className="size-5 text-azul" aria-hidden />
            <span className="flex-1 font-semibold">Mis km</span>
            <span className="text-sm text-gris/60 tabular-nums">{u.kmTotales.toLocaleString("es-AR")} km</span>
            <ChevronRight className="size-5 text-gris/40" aria-hidden />
          </Link>
          <form action={salir}>
            <button className="flex w-full cursor-pointer items-center gap-3 p-4 text-left font-semibold">
              <LogOut className="size-5 text-azul" aria-hidden /> Cerrar sesión
            </button>
          </form>
        </Card>
        <p className="mt-6 text-center text-xs text-gris/50">Yendo · TP universitario · datos y pagos simulados</p>
      </div>
    </main>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={<PageSkeleton tono="azul" />}>
      <Contenido />
    </Suspense>
  );
}
