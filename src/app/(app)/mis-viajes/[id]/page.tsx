import { Suspense } from "react";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray, ne } from "drizzle-orm";
import { Check, CircleCheck, Clock, Flag, Gift, ShieldCheck, Star, TriangleAlert, UserRoundX, X } from "lucide-react";
import { db } from "@/db";
import { ratings, reservations, trips, users } from "@/db/schema";
import { estaVerificado, promedios, requerirUsuario } from "@/lib/dal";
import { formatFecha, formatHora } from "@/lib/fechas";
import { formatPesos, liquidacionConductor } from "@/lib/pricing";
import { HORAS_CANCELACION, historialCancelaciones } from "@/lib/reglas";
import { cancelarViaje, finalizarViaje, responderSolicitud } from "@/app/actions/viajes";
import { ConfirmButton } from "@/components/confirm-button";
import { SubmitButton } from "@/components/submit-button";
import { PriceSimulator } from "@/components/price-simulator";
import { RouteLine } from "@/components/trip-card";
import { Alerta, Avatar, Badge, ButtonLink, Card, EmptyState, PageHeader, PageSkeleton, SectionTitle, Stars } from "@/components/ui";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ publicado?: string }> };

async function Contenido({ params, searchParams }: Props) {
  const u = await requerirUsuario();
  const id = Number((await params).id);
  const sp = await searchParams;
  const [t] = await db.select().from(trips).where(and(eq(trips.id, id), eq(trips.conductorId, u.id)));
  if (!t) notFound();

  const res = await db
    .select({ r: reservations, p: users })
    .from(reservations)
    .innerJoin(users, eq(users.id, reservations.pasajeroId))
    .where(eq(reservations.tripId, id))
    .orderBy(asc(reservations.createdAt));
  const proms = await promedios(res.map((x) => x.p.id), "pasajero");
  const pendientes = res.filter((x) => x.r.estado === "pendiente");
  const previos = pendientes.length
    ? await db
        .select({
          pasajeroId: reservations.pasajeroId,
          estado: reservations.estado,
          canceladaAt: reservations.canceladaAt,
          cancelacionTardia: reservations.cancelacionTardia,
          fechaHora: trips.fechaHora,
        })
        .from(reservations)
        .innerJoin(trips, eq(trips.id, reservations.tripId))
        .where(and(inArray(reservations.pasajeroId, pendientes.map((x) => x.p.id)), ne(reservations.tripId, id)))
    : [];
  const cancelaciones = new Map(
    pendientes.map((x) => [x.p.id, historialCancelaciones(previos.filter((r) => r.pasajeroId === x.p.id))]),
  );
  const confirmados = res.filter((x) => x.r.estado === (t.estado === "finalizado" ? "finalizada" : "confirmada"));
  const [yaCalifique] = await db
    .select({ id: ratings.id })
    .from(ratings)
    .where(and(eq(ratings.tripId, id), eq(ratings.autorId, u.id)))
    .limit(1);

  const lleno = confirmados.length >= t.capacidad;
  const liq = liquidacionConductor(
    t.km,
    confirmados.map((x) => (t.estado === "finalizado" ? x.r.usoPremio : x.p.premiosDisponibles > 0)),
    t.estado === "finalizado" ? t.conductorUsoPremio : u.premiosDisponibles > 0,
  );

  const Persona = ({ x, children }: { x: (typeof res)[number]; children?: React.ReactNode }) => {
    const pr = proms.get(x.p.id) ?? { promedio: null, cantidad: 0 };
    return (
      <Card className="animate-rise">
        <div className="flex items-center gap-3">
          <Avatar nombre={x.p.nombre} tono="verde" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-gris">{x.p.nombre}</p>
            <div className="flex items-center gap-2">
              <Stars {...pr} />
              {estaVerificado(x.p) && (
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-gris/70">
                  <ShieldCheck className="size-3.5 text-azul" aria-hidden /> Verificado
                </span>
              )}
            </div>
          </div>
          {x.r.usoPremio && (
            <Badge tono="verde">
              <Gift className="size-3.5" aria-hidden /> Premio
            </Badge>
          )}
        </div>
        {children}
      </Card>
    );
  };

  return (
    <main>
      <PageHeader tono="azul" back="/mis-viajes" title={`${t.origen} → ${t.destino}`} subtitle={`${formatFecha(t.fechaHora)} · ${formatHora(t.fechaHora)} hs · ${t.km} km`} />
      <div className="space-y-4 px-5 pt-5">
        {sp.publicado && <Alerta tono="verde">¡Viaje publicado! Ya aparece en las búsquedas de los pasajeros.</Alerta>}
        {t.estado === "cancelado" && <Alerta>Cancelaste este viaje. Les avisamos a los pasajeros.</Alerta>}

        <Card>
          <RouteLine origen={t.origen} destino={t.destino} hora={formatHora(t.fechaHora)} />
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gris-100 pt-4">
            <div>
              <p className="text-xs text-gris/60">{t.estado === "finalizado" ? "Recibiste" : "Recibirías hoy"}</p>
              <p className="font-display text-xl font-bold tabular-nums">{formatPesos(t.conductorRecibe ?? (confirmados.length ? liq.recibe : 0))}</p>
            </div>
            <div>
              <p className="text-xs text-gris/60">Comisión Yendo</p>
              <p className="font-display text-xl font-bold tabular-nums">{formatPesos(confirmados.length ? liq.comisionYendo : 0)}</p>
            </div>
          </div>
          {t.conductorUsoPremio && (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-gris">
              <Gift className="size-4 text-verde" aria-hidden /> Usaste tu premio: no pagaste tu comisión.
            </p>
          )}
        </Card>

        {t.estado === "publicado" && (
          <>
            <SectionTitle aside={<span className="text-sm font-semibold text-gris/70">{pendientes.length}</span>}>Solicitudes</SectionTitle>
            {pendientes.length === 0 ? (
              <p className="rounded-3xl bg-white p-4 text-sm text-gris/70 shadow-card">No hay solicitudes pendientes por ahora.</p>
            ) : (
              <div className="space-y-3">
                {pendientes.map((x) => (
                  <Persona key={x.r.id} x={x}>
                    <AlertaCancelaciones {...(cancelaciones.get(x.p.id) ?? { tardias: 0, total: 0 })} />
                    <form action={responderSolicitud} className="mt-4 grid grid-cols-2 gap-2">
                      <input type="hidden" name="reservaId" value={x.r.id} />
                      <SubmitButton variant="blanco" name="accion" value="rechazar">
                        <X className="size-4" aria-hidden /> Rechazar
                      </SubmitButton>
                      {lleno ? (
                        <span className="grid place-items-center rounded-2xl bg-gris-100 text-sm font-semibold text-gris">Auto completo</span>
                      ) : (
                        <SubmitButton name="accion" value="aceptar">
                          <Check className="size-4" aria-hidden /> Aceptar
                        </SubmitButton>
                      )}
                    </form>
                  </Persona>
                ))}
              </div>
            )}
          </>
        )}

        <SectionTitle aside={<span className="text-sm font-semibold text-gris/70">{confirmados.length}/{t.capacidad}</span>}>Pasajeros</SectionTitle>
        {confirmados.length === 0 ? (
          <EmptyState icon={<UserRoundX className="size-7" />} title="Sin pasajeros confirmados" text="Cuando aceptes una solicitud, el pasajero aparece acá." />
        ) : (
          <div className="space-y-3">
            {confirmados.map((x) => (
              <Persona key={x.r.id} x={x}>
                {t.estado === "finalizado" && (
                  <p className="mt-3 flex items-center justify-between border-t border-gris-100 pt-3 text-sm">
                    <span className="font-semibold tabular-nums">{formatPesos(x.r.montoPagado ?? 0)}</span>
                    {x.r.pagadoAt ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-gris">
                        <CircleCheck className="size-4 text-mp" aria-hidden /> Pagó con Mercado Pago
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-gris/70">
                        <Clock className="size-4" aria-hidden /> Pago pendiente
                      </span>
                    )}
                  </p>
                )}
              </Persona>
            ))}
          </div>
        )}

        {t.estado === "publicado" && (
          <>
            <SectionTitle>Precio por integrante</SectionTitle>
            <PriceSimulator key={confirmados.length} km={t.km} capacidad={t.capacidad} inicial={Math.max(1, confirmados.length)} compacto />
            <div className="space-y-2 pt-2">
              {confirmados.length > 0 && (
                <form action={finalizarViaje}>
                  <input type="hidden" name="tripId" value={t.id} />
                  <ConfirmButton variant="verde" className="w-full text-base" confirmText="Tocá de nuevo para finalizar">
                    <Flag className="size-5" aria-hidden /> Finalizar viaje
                  </ConfirmButton>
                </form>
              )}
              <form action={cancelarViaje}>
                <input type="hidden" name="tripId" value={t.id} />
                <ConfirmButton className="w-full" confirmText="Tocá de nuevo para cancelar el viaje">
                  Cancelar viaje
                </ConfirmButton>
              </form>
            </div>
          </>
        )}

        {t.estado === "finalizado" && !yaCalifique && (
          <ButtonLink href={`/calificar/${t.id}`} variant="azul" className="w-full text-base">
            <Star className="size-5" aria-hidden /> Calificar a mis pasajeros
          </ButtonLink>
        )}
      </div>
    </main>
  );
}

function AlertaCancelaciones({ tardias, total }: { tardias: number; total: number }) {
  if (tardias === 0) return null;
  return (
    <div role="alert" className="mt-3 flex items-start gap-2 rounded-2xl border border-alerta-200 bg-alerta-50 px-3 py-2.5 text-sm text-alerta">
      <TriangleAlert className="mt-0.5 size-4.5 shrink-0" aria-hidden />
      <p>
        <span className="font-bold">Alerta:</span>{" "}
        {total === 1
          ? "canceló su último viaje"
          : `${tardias} de los últimos ${total} viajes ${tardias === 1 ? "lo" : "los"} canceló`}{" "}
        con menos de {HORAS_CANCELACION} hs de anticipación.
      </p>
    </div>
  );
}

export default function GestionViajePage(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton tono="azul" />}>
      <Contenido {...props} />
    </Suspense>
  );
}
