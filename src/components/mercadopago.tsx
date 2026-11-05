"use client";
import { useActionState, useState } from "react";
import { CircleCheck, CreditCard, Handshake, Lock, Wallet } from "lucide-react";
import { pagarConMercadoPago } from "@/app/actions/reservas";
import { formatPesos } from "@/lib/pricing";
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

const MEDIOS = [
  { id: "dinero_en_cuenta", icon: Wallet, titulo: "Dinero en cuenta", detalle: "Disponible: $250.000" },
  { id: "tarjeta_debito", icon: CreditCard, titulo: "Débito Visa", detalle: "•••• 4242" },
  { id: "tarjeta_credito", icon: CreditCard, titulo: "Crédito Mastercard", detalle: "•••• 5555 · 1 cuota sin interés" },
] as const;

export const medioLabel = (id: string | null) => MEDIOS.find((m) => m.id === id)?.titulo ?? "Mercado Pago";

export function PagarMercadoPago({ reservaId, monto, concepto }: { reservaId: number; monto: number; concepto: string }) {
  const [abierto, setAbierto] = useState(false);
  const [medio, setMedio] = useState<string>(MEDIOS[0].id);
  const [state, action] = useActionState(pagarConMercadoPago, {});

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-mp px-4 font-semibold text-white transition hover:bg-mp-700 active:scale-[0.98]"
      >
        <Handshake className="size-5" aria-hidden /> Pagar con Mercado Pago · {formatPesos(monto)}
      </button>

      {abierto && (
        <BottomSheet
          onClose={() => setAbierto(false)}
          titulo={
            <span className="flex items-center gap-2">
              <MercadoPagoLogo className="text-xs leading-6" /> <span className="text-sm font-semibold text-gris/60">Simulación</span>
            </span>
          }
        >
          {state.ok ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CircleCheck className="size-16 text-verde" aria-hidden />
              <p className="mt-3 font-display text-2xl font-bold text-gris">¡Listo! Pagaste {formatPesos(monto)}</p>
              <p className="mt-1 text-sm text-gris/70">{concepto} · con {medioLabel(medio)}</p>
              <button type="button" onClick={() => setAbierto(false)} className="mt-6 min-h-12 w-full cursor-pointer rounded-2xl bg-mp font-semibold text-white hover:bg-mp-700">
                Volver a Yendo
              </button>
            </div>
          ) : (
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
          )}
        </BottomSheet>
      )}
    </>
  );
}
