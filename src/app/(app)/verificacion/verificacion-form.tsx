"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { Check, FileUp, IdCard, LoaderCircle, ShieldCheck, FileText } from "lucide-react";
import { verificarIdentidad } from "@/app/actions/verificacion";
import { Card, Field, buttonClass, cx } from "@/components/ui";

const pasos = ["Validando DNI con RENAPER", "Leyendo certificado de antecedentes", "Chequeando registros penales"];

export function VerificacionForm({ next, dni }: { next: string; dni?: string | null }) {
  const [pdf, setPdf] = useState<{ nombre: string; kb: number } | null>(null);
  const [pdfError, setPdfError] = useState<string>();
  const [foto, setFoto] = useState<string>();
  const [paso, setPaso] = useState(-1);
  const [state, action, pending] = useActionState(async (prev: { error?: string }, fd: FormData) => {
    const r = await verificarIdentidad(prev, fd);
    if (r.error) setPaso(-1);
    return r;
  }, {});
  const formRef = useRef<HTMLFormElement>(null);

  // Animación de verificación simulada antes de enviar al servidor
  useEffect(() => {
    if (paso < 0 || paso >= pasos.length) return;
    const t = setTimeout(() => setPaso((p) => p + 1), 750);
    return () => clearTimeout(t);
  }, [paso]);
  useEffect(() => {
    if (paso === pasos.length) formRef.current?.requestSubmit();
  }, [paso]);

  async function onPdf(file?: File) {
    setPdf(null);
    setPdfError(undefined);
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))
      return setPdfError("El certificado tiene que ser un archivo PDF.");
    if (file.size > 5 * 1024 * 1024) return setPdfError("El PDF no puede pesar más de 5 MB.");
    const cabecera = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
    if (cabecera !== "%PDF-") return setPdfError("El archivo no parece un PDF válido.");
    setPdf({ nombre: file.name, kb: Math.max(1, Math.round(file.size / 1024)) });
  }

  const verificando = paso >= 0 || pending;

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={(e) => {
        if (paso !== pasos.length) {
          e.preventDefault();
          if (!pdf) return setPdfError("Subí el certificado de antecedentes en PDF.");
          setPaso(0);
        }
      }}
      className="space-y-4"
    >
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="pdfNombre" value={pdf?.nombre ?? ""} />

      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-azul text-white">
            <IdCard className="size-5" aria-hidden />
          </span>
          <h2 className="font-display text-lg font-semibold">1. Tu DNI</h2>
        </div>
        <Field label="Número de documento" htmlFor="dni" hint="Sin puntos. 7 u 8 números.">
          <input id="dni" name="dni" inputMode="numeric" className="input tabular-nums" placeholder="40123456" defaultValue={dni ?? ""} maxLength={10} required />
        </Field>
        <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-gris-300 px-4 py-3 transition-colors hover:border-azul">
          {foto ? <Check className="size-5 text-verde" aria-hidden /> : <FileUp className="size-5 text-azul" aria-hidden />}
          <span className="flex-1 text-sm">
            <span className="block font-semibold">{foto ?? "Foto del frente del DNI"}</span>
            <span className="text-xs text-gris/60">Opcional · JPG o PNG</span>
          </span>
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => setFoto(e.target.files?.[0]?.name)} />
        </label>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-azul text-white">
            <FileText className="size-5" aria-hidden />
          </span>
          <h2 className="font-display text-lg font-semibold">2. Antecedentes penales</h2>
        </div>
        <label
          className={cx(
            "flex min-h-20 cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] border-dashed px-4 py-4 transition-colors",
            pdf ? "border-verde bg-verde-50" : "border-gris-300 hover:border-azul",
          )}
        >
          {pdf ? <Check className="size-6 text-verde-600" aria-hidden /> : <FileUp className="size-6 text-azul" aria-hidden />}
          <span className="min-w-0 flex-1 text-sm">
            <span className="block truncate font-semibold">{pdf ? pdf.nombre : "Subí el certificado en PDF"}</span>
            <span className="text-xs text-gris/60">{pdf ? `${pdf.kb} KB · listo para validar` : "Lo emite el Registro Nacional de Reincidencia · máx. 5 MB"}</span>
          </span>
          <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => onPdf(e.target.files?.[0])} />
        </label>
        {pdfError && <p role="alert" className="text-sm font-semibold">{pdfError}</p>}
      </Card>

      {verificando && (
        <Card className="animate-rise space-y-2.5" aria-live="polite">
          {pasos.map((p, i) => (
            <div key={p} className="flex items-center gap-3 text-sm">
              {i < paso || pending ? (
                <span className="grid size-6 place-items-center rounded-full bg-verde text-white animate-pop">
                  <Check className="size-4" aria-hidden />
                </span>
              ) : i === paso ? (
                <LoaderCircle className="size-6 animate-spin text-azul" aria-hidden />
              ) : (
                <span className="size-6 rounded-full border-2 border-gris-200" />
              )}
              <span className={cx(i > paso && !pending && "text-gris/50")}>{p} (simulado)</span>
            </div>
          ))}
        </Card>
      )}

      {state.error && <p role="alert" className="rounded-2xl bg-gris-100 px-4 py-3 text-sm font-semibold">{state.error}</p>}

      <button disabled={verificando} className={buttonClass("azul", "w-full text-base")}>
        {verificando ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <ShieldCheck className="size-5" aria-hidden />}
        {verificando ? "Verificando…" : "Verificar identidad"}
      </button>
    </form>
  );
}
