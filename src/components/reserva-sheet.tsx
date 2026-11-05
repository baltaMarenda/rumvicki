"use client";
import { useActionState, useState } from "react";
import { Flag, Send, UserCheck } from "lucide-react";
import { reservar } from "@/app/actions/reservas";
import { formatPesos } from "@/lib/pricing";
import { HORAS_CANCELACION } from "@/lib/reglas";
import { buttonClass } from "./ui";
import { SubmitButton } from "./submit-button";
import { BottomSheet } from "./bottom-sheet";
import { MercadoPagoLogo } from "./mercadopago";

export function ReservaSheet({
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

  const pasos = [
    { icon: Send, texto: "Enviás la solicitud. No pagás nada ahora." },
    { icon: UserCheck, texto: "El conductor acepta o rechaza tu lugar." },
    { icon: Flag, texto: "Cuando termina el viaje, pagás tu parte con Mercado Pago." },
  ];

  return (
    <>
      <button type="button" onClick={() => setAbierto(true)} className={buttonClass("verde", "w-full text-base")}>
        Reservar mi lugar · {formatPesos(estimado)}
      </button>

      {abierto && (
        <BottomSheet titulo="Reservar lugar" onClose={() => setAbierto(false)}>
          <form action={action}>
            <input type="hidden" name="tripId" value={tripId} />
            <div className="mt-3 rounded-2xl bg-azul p-4 text-white">
              <p className="text-sm font-medium text-white/90">Tu parte estimada</p>
              <p className="mt-1 font-display text-3xl font-bold tabular-nums">{formatPesos(estimado)}</p>
              <p className="mt-1 text-[13px] text-white/90">
                Calculado con {pasajerosEstimados} {pasajerosEstimados === 1 ? "pasajero" : "pasajeros"} + conductor. El monto final se ajusta al terminar el viaje según cuántos viajen. Peajes aparte.
              </p>
            </div>

            <ol className="mt-4 space-y-3">
              {pasos.map(({ icon: Icon, texto }, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gris">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-azul-50 text-azul">
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  {texto}
                </li>
              ))}
            </ol>

            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-gris-50 px-3 py-2.5 text-xs text-gris/80">
              <MercadoPagoLogo className="h-5 shrink-0" />
              <span>Pago al finalizar el viaje (simulado).</span>
            </div>

            {state.error && (
              <p role="alert" className="mt-3 rounded-xl bg-gris-100 px-3 py-2 text-sm font-semibold text-gris">
                {state.error}
              </p>
            )}

            <SubmitButton className="mt-5 w-full text-base" pendingText="Enviando…">
              <Send className="size-4" aria-hidden /> Enviar solicitud
            </SubmitButton>
            <p className="mt-3 mb-2 text-center text-xs text-gris/70">
              Si cancelás con menos de {HORAS_CANCELACION} hs de anticipación, el conductor lo va a ver en tus próximas solicitudes.
            </p>
          </form>
        </BottomSheet>
      )}
    </>
  );
}
