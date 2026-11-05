"use client";
import { useActionState, useEffect, useState } from "react";
import { CreditCard, Lock, X } from "lucide-react";
import { reservar } from "@/app/actions/reservas";
import { formatPesos } from "@/lib/pricing";
import { Field, buttonClass } from "./ui";
import { SubmitButton } from "./submit-button";

export function PaymentSheet({
  tripId,
  estimado,
  pasajerosEstimados,
}: {
  tripId: number;
  estimado: number;
  pasajerosEstimados: number;
}) {
  const [abierto, setAbierto] = useState(false);
  const [state, action] = useActionState(reservar, {});
  const [tarjeta, setTarjeta] = useState("");
  const [venc, setVenc] = useState("");

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [abierto]);

  return (
    <>
      <button type="button" onClick={() => setAbierto(true)} className={buttonClass("verde", "w-full text-base")}>
        Reservar mi lugar · {formatPesos(estimado)}
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-md items-end" role="dialog" aria-modal="true" aria-labelledby="pago-titulo">
          <button aria-label="Cerrar" className="absolute inset-0 cursor-default bg-gris/50 backdrop-blur-[2px]" onClick={() => setAbierto(false)} />
          <form action={action} className="relative w-full animate-rise rounded-t-[2rem] bg-white px-5 pt-3 pb-safe">
            <input type="hidden" name="tripId" value={tripId} />
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gris-200" aria-hidden />
            <div className="flex items-center justify-between">
              <h2 id="pago-titulo" className="font-display text-xl font-bold text-gris">Pago simulado</h2>
              <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar" className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-gris-100">
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-3 rounded-2xl bg-azul p-4 text-white">
              <div className="flex items-center justify-between text-sm font-medium text-white/90">
                <span>Se retiene hoy (estimado)</span>
                <CreditCard className="size-5" aria-hidden />
              </div>
              <p className="mt-1 font-display text-3xl font-bold tabular-nums">{formatPesos(estimado)}</p>
              <p className="mt-1 text-[13px] text-white/90">
                Calculado con {pasajerosEstimados} {pasajerosEstimados === 1 ? "pasajero" : "pasajeros"} + conductor. El monto final se ajusta al terminar el viaje según cuántos viajen. Peajes aparte.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <Field label="Número de tarjeta" htmlFor="tarjeta" hint="Es una simulación: usá cualquier número de 16 dígitos.">
                <input
                  id="tarjeta"
                  name="tarjeta"
                  inputMode="numeric"
                  autoComplete="off"
                  className="input tabular-nums tracking-wider"
                  placeholder="4242 4242 4242 4242"
                  value={tarjeta}
                  onChange={(e) =>
                    setTarjeta(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "))
                  }
                  required
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Vencimiento" htmlFor="vencimiento">
                  <input
                    id="vencimiento"
                    name="vencimiento"
                    inputMode="numeric"
                    className="input"
                    placeholder="MM/AA"
                    value={venc}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setVenc(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                    }}
                    required
                  />
                </Field>
                <Field label="CVV" htmlFor="cvv">
                  <input id="cvv" name="cvv" inputMode="numeric" maxLength={4} className="input" placeholder="123" required />
                </Field>
              </div>
            </div>

            {state.error && (
              <p role="alert" className="mt-3 rounded-xl bg-gris-100 px-3 py-2 text-sm font-semibold text-gris">
                {state.error}
              </p>
            )}

            <SubmitButton className="mt-5 w-full text-base" pendingText="Procesando pago…">
              <Lock className="size-4" aria-hidden /> Confirmar y enviar solicitud
            </SubmitButton>
            <p className="mt-3 mb-2 text-center text-xs text-gris/70">
              El conductor tiene que aceptar tu solicitud. Si la rechaza o cancelás, se libera el dinero.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
