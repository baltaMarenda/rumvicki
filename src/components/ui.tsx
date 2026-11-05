import Link from "next/link";
import { ChevronLeft, Star, Info } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

type Variant = "verde" | "azul" | "blanco" | "suave";
const variants: Record<Variant, string> = {
  verde: "bg-verde text-white hover:bg-verde-600 shadow-[0_8px_20px_-10px_rgb(116_184_88/0.9)]",
  azul: "bg-azul text-white hover:bg-azul-700 shadow-float",
  blanco: "bg-white text-gris border border-gris-200 hover:border-gris-300",
  suave: "bg-gris-100 text-gris hover:bg-gris-200",
};

export function buttonClass(variant: Variant = "verde", extra?: string) {
  return cx(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-[15px] font-semibold",
    "transition-[transform,background-color,border-color] duration-150 active:scale-[0.98] cursor-pointer",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    extra,
  );
}

export function ButtonLink({
  variant,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("rounded-3xl bg-white p-4 shadow-card", className)} {...props} />;
}

export function Logo({ className, claro }: { className?: string; claro?: boolean }) {
  return (
    <span className={cx("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 64 64" className="size-8" aria-hidden>
        <rect width="64" height="64" rx="16" fill={claro ? "#fff" : "#8BCB70"} />
        <path
          d="M20 46c0-9 6-12 12-12s12-3 12-12"
          fill="none"
          stroke={claro ? "#8BCB70" : "#fff"}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="20" cy="46" r="5" fill="#2B74A6" stroke={claro ? "#fff" : "#fff"} strokeWidth="3" />
        <circle cx="44" cy="20" r="5" fill={claro ? "#2B74A6" : "#fff"} />
      </svg>
      <span className={cx("font-display text-2xl font-bold", claro ? "text-white" : "text-gris")}>
        yendo
      </span>
    </span>
  );
}

/** Header de color (texto blanco). */
export function PageHeader({
  title,
  subtitle,
  back,
  right,
  tono = "verde",
  children,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  right?: ReactNode;
  tono?: "verde" | "azul";
  children?: ReactNode;
}) {
  return (
    <header
      className={cx(
        "relative overflow-hidden rounded-b-[2rem] px-5 pb-6 pt-[max(env(safe-area-inset-top),1.25rem)] text-white",
        tono === "verde" ? "bg-verde" : "bg-azul",
      )}
    >
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-white/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 right-20 size-40 rounded-full bg-white/10" />
      <div className="relative flex min-h-11 items-center justify-between gap-3">
        {back ? (
          <Link
            href={back}
            aria-label="Volver"
            className="-ml-2 grid size-11 place-items-center rounded-full transition hover:bg-white/15"
          >
            <ChevronLeft className="size-6" />
          </Link>
        ) : (
          <span />
        )}
        {right}
      </div>
      <div className="relative mt-1">
        <h1 className="font-display text-[1.75rem] font-bold leading-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] font-medium text-white/90">{subtitle}</p>}
      </div>
      {children && <div className="relative mt-5">{children}</div>}
    </header>
  );
}

export function Avatar({ nombre, size = "md", tono = "azul" }: { nombre: string; size?: "sm" | "md" | "lg"; tono?: "azul" | "verde" }) {
  const iniciales = nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={cx(
        "grid shrink-0 place-items-center rounded-full font-display font-semibold text-white",
        tono === "azul" ? "bg-azul" : "bg-verde",
        size === "sm" && "size-9 text-sm",
        size === "md" && "size-11 text-base",
        size === "lg" && "size-20 text-2xl",
      )}
      aria-hidden
    >
      {iniciales}
    </span>
  );
}

export function Stars({ promedio, cantidad, className }: { promedio: number | null; cantidad: number; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1 text-sm font-semibold text-gris", className)}>
      <Star className="size-4 fill-verde text-verde" aria-hidden />
      {promedio === null ? (
        <span className="font-medium text-gris/70">Nuevo</span>
      ) : (
        <>
          {promedio.toFixed(1)}
          <span className="font-normal text-gris/60">({cantidad})</span>
        </>
      )}
    </span>
  );
}

const badgeTonos = {
  verde: "bg-verde text-white",
  azul: "bg-azul text-white",
  gris: "bg-gris-100 text-gris",
  borde: "border border-gris-200 text-gris",
};
export function Badge({ children, tono = "gris" }: { children: ReactNode; tono?: keyof typeof badgeTonos }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", badgeTonos[tono])}>
      {children}
    </span>
  );
}

export function Field({ label, htmlFor, hint, error, children }: { label: string; htmlFor: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-gris">
        {label}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-sm font-medium text-gris" role="alert">
          <Info className="size-4 text-azul" aria-hidden /> {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-gris/70">{hint}</p>
      ) : null}
    </div>
  );
}

export function Alerta({ children, tono = "azul" }: { children: ReactNode; tono?: "azul" | "verde" }) {
  return (
    <div
      role="status"
      className={cx(
        "flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white",
        tono === "azul" ? "bg-azul" : "bg-verde",
      )}
    >
      <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-gris-200 bg-white px-6 py-10 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-verde-100 text-verde-600">{icon}</div>
      <h3 className="mt-4 font-display text-lg font-semibold text-gris">{title}</h3>
      <p className="mt-1 max-w-64 text-sm text-gris/70">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 mt-7 flex items-baseline justify-between">
      <h2 className="font-display text-lg font-semibold text-gris">{children}</h2>
      {aside}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-2xl bg-gris-200/70", className)} />;
}

export function PageSkeleton({ tono = "verde" }: { tono?: "verde" | "azul" }) {
  return (
    <div>
      <div className={cx("h-44 rounded-b-[2rem]", tono === "verde" ? "bg-verde" : "bg-azul")} />
      <div className="space-y-3 p-5">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  );
}
