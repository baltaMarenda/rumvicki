"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard, Handshake, Lock, Wallet } from "lucide-react";
import { pagarConMercadoPago, type PagoState } from "@/app/actions/reservas";
import { formatPesos } from "@/lib/pricing";
import { MEDIOS_PAGO, medioLabel } from "@/lib/medios-pago";
import { cx } from "./ui";
import { SubmitButton } from "./submit-button";
import { BottomSheet } from "./bottom-sheet";

/** Marca simple (no es el logo oficial): todo el pago es simulado. */
export function MercadoPagoLogo({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full bg-mp px-2 text-[11px] leading-5 font-bold tracking-tight text-white", className)}>
      <Handshake className="size-3.5" aria-hidden /> mercado pago
    </span>
  );
}

const MEDIOS = MEDIOS_PAGO.map((m) => ({ ...m, icon: m.id === "dinero_en_cuenta" ? Wallet : CreditCard }));

export function PagarMercadoPago({ reservaId, monto, concepto }: { reservaId: number; monto: number; concepto: string }) {
  const [abierto, setAbierto] = useState(false);
  const [medio, setMedio] = useState<string>(MEDIOS[0].id);
  const [state, action] = useActionState<PagoState, FormData>(pagarConMercadoPago, {});
  const router = useRouter();
  const volver = () => {
    setAbierto(false);
    router.replace("/reservas?pagado=1");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-mp px-4 font-semibold text-white transition hover:bg-mp-700 active:scale-[0.98]"
      >
        <Handshake className="size-5" aria-hidden /> Pagar con Mercado Pago · {formatPesos(monto)}
      </button>

      {abierto && state.ok && (
        <PagoAprobado monto={monto} concepto={concepto} medio={medioLabel(medio)} operacion={state.operacion} fecha={state.fecha} onClose={volver} />
      )}

      {abierto && !state.ok && (
        <BottomSheet
          onClose={() => setAbierto(false)}
          titulo={
            <span className="flex items-center gap-2">
              <MercadoPagoLogo className="text-xs leading-6" /> <span className="text-sm font-semibold text-gris/60">Simulación</span>
            </span>
          }
        >
          <form action={action}>
            <input type="hidden" name="reservaId" value={reservaId} />
            <input type="hidden" name="medio" value={medio} />
            <div className="mt-3 rounded-2xl bg-mp p-4 text-white">
              <p className="text-sm font-medium text-white/90">Pagás a Yendo</p>
              <p className="mt-1 font-display text-3xl font-bold tabular-nums">{formatPesos(monto)}</p>
              <p className="mt-1 text-[13px] text-white/90">{concepto}</p>
            </div>

            <fieldset className="mt-4">
              <legend className="mb-2 text-sm font-semibold text-gris">¿Cómo querés pagar?</legend>
              <div className="space-y-2" role="radiogroup">
                {MEDIOS.map(({ id, icon: Icon, titulo, detalle }) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={medio === id}
                    onClick={() => setMedio(id)}
                    className={cx(
                      "flex w-full cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] p-3 text-left transition",
                      medio === id ? "border-mp bg-mp/5" : "border-gris-200 hover:border-gris-300",
                    )}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gris-100 text-gris">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-gris">{titulo}</span>
                      <span className="block text-xs text-gris/70">{detalle}</span>
                    </span>
                    <span className={cx("size-5 shrink-0 rounded-full", medio === id ? "border-[6px] border-mp" : "border-2 border-gris-300")} aria-hidden />
                  </button>
                ))}
              </div>
            </fieldset>

            {state.error && (
              <p role="alert" className="mt-3 rounded-xl bg-gris-100 px-3 py-2 text-sm font-semibold text-gris">
                {state.error}
              </p>
            )}

            <SubmitButton variant="azul" className="mt-5 w-full bg-mp! text-base hover:bg-mp-700!" pendingText="Procesando pago…">
              <Lock className="size-4" aria-hidden /> Pagar {formatPesos(monto)}
            </SubmitButton>
            <p className="mt-3 mb-2 text-center text-xs text-gris/70">Es una simulación: no se mueve dinero real.</p>
          </form>
        </BottomSheet>
      )}
    </>
  );
}

/** Comprobante a pantalla completa, como la pantalla de "pago aprobado" de una billetera. */
function PagoAprobado({
  monto,
  concepto,
  medio,
  operacion,
  fecha,
  onClose,
}: {
  monto: number;
  concepto: string;
  medio: string;
  operacion?: string;
  fecha?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const filas = [
    { label: "Concepto", valor: concepto },
    { label: "Medio de pago", valor: medio },
    { label: "Fecha", valor: fecha },
    { label: "N.º de operación", valor: operacion },
  ].filter((f) => f.valor);

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-md flex-col bg-verde-600 text-white" role="alertdialog" aria-modal="true" aria-labelledby="pago-aprobado">
      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-10 text-center">
        <span className="grid size-24 animate-rise place-items-center rounded-full bg-white text-verde-600 shadow-float">
          <Check className="size-14" strokeWidth={3} aria-hidden />
        </span>
        <h2 id="pago-aprobado" className="mt-6 font-display text-3xl font-bold">¡Pago aprobado!</h2>
        <p className="mt-1 font-display text-4xl font-bold tabular-nums">{formatPesos(monto)}</p>
        <p className="mt-2 text-sm text-white/90">Le avisamos al conductor que ya pagaste tu parte.</p>

        <dl className="mt-8 w-full divide-y divide-gris-100 rounded-3xl bg-white px-4 text-left text-sm text-gris shadow-card">
          {filas.map((f) => (
            <div key={f.label} className="flex justify-between gap-3 py-3">
              <dt className="text-gris/70">{f.label}</dt>
              <dd className="text-right font-semibold tabular-nums">{f.valor}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-white/85">
          <MercadoPagoLogo /> Simulación: no se movió dinero real.
        </p>
      </div>
      <div className="px-5 pb-safe">
        <button type="button" onClick={onClose} autoFocus className="mb-3 min-h-12 w-full cursor-pointer rounded-2xl bg-white font-semibold text-verde-600 transition active:scale-[0.98]">
          Volver a Yendo
        </button>
      </div>
    </div>
  );
}
