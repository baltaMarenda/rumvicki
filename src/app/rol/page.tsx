import { Suspense } from "react";
import type { Metadata } from "next";
import { ArrowRight, CarFront, Backpack } from "lucide-react";
import { elegirRol } from "@/app/actions/auth";
import { PageHeader, PageSkeleton } from "@/components/ui";
import { requerirUsuario } from "@/lib/dal";

export const metadata: Metadata = { title: "Elegí tu rol" };

async function Contenido() {
  const u = await requerirUsuario();
  const nombre = u.nombre.split(" ")[0];
  return (
    <main>
      <PageHeader title={`¡Bienvenido, ${nombre}!`} subtitle="¿Cómo querés usar Yendo hoy? Lo podés cambiar cuando quieras." />
      <form action={elegirRol} className="stagger space-y-4 px-5 py-7">
        <input type="hidden" name="ir" value="inicio" />
        <button name="rol" value="pasajero" className="group flex w-full cursor-pointer items-center gap-4 rounded-3xl bg-azul p-5 text-left text-white shadow-float transition-transform active:scale-[0.99]">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/15">
            <Backpack className="size-8" aria-hidden />
          </span>
          <span className="flex-1">
            <span className="block font-display text-2xl font-bold">Pasajero</span>
            <span className="mt-0.5 block text-[15px] text-white/90">Buscá viajes y reservá tu lugar.</span>
          </span>
          <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" aria-hidden />
        </button>
        <button name="rol" value="conductor" className="group flex w-full cursor-pointer items-center gap-4 rounded-3xl bg-verde p-5 text-left text-white shadow-card transition-transform active:scale-[0.99]">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/20">
            <CarFront className="size-8" aria-hidden />
          </span>
          <span className="flex-1">
            <span className="block font-display text-2xl font-bold">Conductor</span>
            <span className="mt-0.5 block text-[15px] text-white/95">Publicá tu viaje y compartí los gastos.</span>
          </span>
          <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" aria-hidden />
        </button>
      </form>
    </main>
  );
}

export default function RolPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Contenido />
    </Suspense>
  );
}
