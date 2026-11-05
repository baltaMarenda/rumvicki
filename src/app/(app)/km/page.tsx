import { Suspense } from "react";
import type { Metadata } from "next";
import { and, count, eq, or } from "drizzle-orm";
import { Gift, Lock, Sparkles, Trophy } from "lucide-react";
import { db } from "@/db";
import { reservations, trips } from "@/db/schema";
import { requerirUsuario } from "@/lib/dal";
import { TRAMO_KM, nivelKm } from "@/lib/rewards";
import { KmProgress } from "@/components/km-progress";
import { Card, PageSkeleton, SectionTitle, cx } from "@/components/ui";

export const metadata: Metadata = { title: "Mis km" };

async function Contenido() {
  const u = await requerirUsuario();
  const n = nivelKm(u.kmTotales);
  const [{ comoConductor }] = await db
    .select({ comoConductor: count() })
    .from(trips)
    .where(and(eq(trips.conductorId, u.id), eq(trips.estado, "finalizado")));
  const [{ comoPasajero }] = await db
    .select({ comoPasajero: count() })
    .from(reservations)
    .where(and(eq(reservations.pasajeroId, u.id), or(eq(reservations.estado, "finalizada"))));

  const hitos = Array.from({ length: Math.max(3, n.tramo + 2) }, (_, i) => (i + 1) * TRAMO_KM).slice(0, n.tramo + 3);

  return (
    <main>
      <header className="relative overflow-hidden rounded-b-[2rem] bg-verde px-5 pb-7 pt-[max(env(safe-area-inset-top),1.25rem)] text-white">
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-16 size-56 rounded-full bg-white/10" />
        <p className="relative mt-3 text-[15px] font-semibold text-white/95">Recorriste con Yendo</p>
        <div className="relative mt-1">
          <KmProgress km={u.kmTotales} />
        </div>
        <p className="relative mt-4 text-sm font-medium text-white/95">
          Cada {TRAMO_KM} km desbloqueás un viaje <strong>sin la comisión del 10%</strong>.
        </p>
      </header>

      <div className="px-5">
        {u.premiosDisponibles > 0 ? (
          <div className="relative mt-5 overflow-hidden rounded-3xl bg-azul p-5 text-white shadow-float animate-pop">
            <Sparkles aria-hidden className="absolute right-4 top-4 size-6 text-white/70" />
            <Gift className="size-9" aria-hidden />
            <p className="mt-3 font-display text-2xl font-bold">
              ¡Tenés {u.premiosDisponibles} {u.premiosDisponibles === 1 ? "premio" : "premios"}!
            </p>
            <p className="mt-1 text-[15px] text-white/90">
              En tu próximo viaje no pagás la comisión de Yendo. Se aplica solo al finalizar, como pasajero o conductor.
            </p>
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Como pasajero", value: comoPasajero },
            { label: "Como conductor", value: comoConductor },
            { label: "Premios usados", value: u.premiosCanjeados },
          ].map((s) => (
            <Card key={s.label} className="p-3 text-center">
              <p className="font-display text-2xl font-bold tabular-nums">{s.value}</p>
              <p className="text-[11px] font-medium leading-tight text-gris/60">{s.label}</p>
            </Card>
          ))}
        </div>

        <SectionTitle>Tus metas</SectionTitle>
        <ol className="stagger space-y-2">
          {hitos.map((meta, i) => {
            const logrado = u.kmTotales >= meta;
            const actual = !logrado && i === n.tramo;
            return (
              <li
                key={meta}
                className={cx(
                  "flex items-center gap-3 rounded-2xl p-3",
                  logrado ? "bg-verde text-white" : actual ? "bg-white shadow-card" : "bg-white/60",
                )}
              >
                <span
                  className={cx(
                    "grid size-10 place-items-center rounded-xl",
                    logrado ? "bg-white/20" : actual ? "bg-azul text-white" : "bg-gris-100 text-gris/50",
                  )}
                >
                  {logrado ? <Trophy className="size-5" aria-hidden /> : actual ? <Gift className="size-5" aria-hidden /> : <Lock className="size-4" aria-hidden />}
                </span>
                <div className="flex-1">
                  <p className={cx("font-display font-semibold", !logrado && !actual && "text-gris/60")}>
                    {meta.toLocaleString("es-AR")} km
                  </p>
                  <p className={cx("text-xs", logrado ? "text-white/90" : "text-gris/60")}>
                    {logrado ? "Premio desbloqueado" : actual ? `Te faltan ${n.faltan} km` : "Viaje sin comisión"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}

export default function KmPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Contenido />
    </Suspense>
  );
}
