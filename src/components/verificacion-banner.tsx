import Link from "next/link";
import { ShieldCheck, ChevronRight } from "lucide-react";

export function VerificacionBanner({ next, accion }: { next: string; accion: string }) {
  return (
    <Link
      href={`/verificacion?next=${encodeURIComponent(next)}`}
      className="flex items-center gap-3 rounded-3xl bg-azul p-4 text-white shadow-float transition-transform active:scale-[0.99]"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15">
        <ShieldCheck className="size-6" aria-hidden />
      </span>
      <span className="flex-1">
        <span className="block font-semibold">Verificá tu identidad</span>
        <span className="block text-sm text-white/90">Necesitás DNI y antecedentes para {accion}.</span>
      </span>
      <ChevronRight className="size-5" aria-hidden />
    </Link>
  );
}
