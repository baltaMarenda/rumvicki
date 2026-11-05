import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, Gauge, Wallet } from "lucide-react";
import { Logo, buttonClass } from "@/components/ui";
import { usuarioActual } from "@/lib/dal";
import { inicioSegunRol } from "@/lib/roles";

async function RedirigirSiLogueado() {
  const u = await usuarioActual();
  if (u) redirect(inicioSegunRol(u.rol));
  return null;
}

const features = [
  { icon: Wallet, title: "Pagá lo justo", text: "$300 por km, dividido entre todos los que viajan." },
  { icon: BadgeCheck, title: "Gente verificada", text: "DNI y antecedentes penales validados antes de viajar." },
  { icon: Gauge, title: "Sumá km, ganá premios", text: "Cada 800 km te regalamos un viaje sin comisión." },
];

export default function Landing() {
  return (
    <main className="flex min-h-dvh flex-col">
      <Suspense>
        <RedirigirSiLogueado />
      </Suspense>
      <section className="relative overflow-hidden rounded-b-[2.5rem] bg-verde px-6 pb-10 pt-[max(env(safe-area-inset-top),1.5rem)] text-white">
        <svg aria-hidden viewBox="0 0 400 300" className="pointer-events-none absolute -right-10 top-24 w-[120%] opacity-15">
          <path d="M-20 260 C 80 240, 90 140, 200 150 S 330 60, 420 40" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" strokeDasharray="1 28" />
        </svg>
        <Logo claro />
        <h1 className="relative mt-16 font-display text-[2.6rem] font-bold leading-[1.05]">
          Viajá por la provincia, compartiendo el camino.
        </h1>
        <p className="relative mt-4 max-w-80 text-[17px] font-medium text-white/95">
          Publicá tu viaje en auto o sumate a uno. Menos gastos, más compañía, de La Plata a Bahía Blanca.
        </p>
        <div className="relative mt-8 flex flex-col gap-3">
          <Link href="/registro" className={buttonClass("blanco", "text-base")}>
            Crear mi cuenta
          </Link>
          <Link href="/login" className={buttonClass("azul", "text-base")}>
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      <section className="stagger space-y-3 px-5 py-7">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-card">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-azul text-white">
              <Icon className="size-6" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-[17px] font-semibold text-gris">{title}</h2>
              <p className="text-sm text-gris/75">{text}</p>
            </div>
          </div>
        ))}
        <p className="pt-3 text-center text-xs text-gris/60">
          Trabajo práctico · Pagos y validaciones simulados
        </p>
      </section>
    </main>
  );
}
