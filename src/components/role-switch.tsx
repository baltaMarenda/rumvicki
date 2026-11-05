import { elegirRol } from "@/app/actions/auth";
import { cx } from "./ui";

/** Selector de rol. Pensado para ir sobre fondo de color (texto blanco). */
export function RoleSwitch({ rol, ir }: { rol: "pasajero" | "conductor" | null; ir?: "inicio" }) {
  return (
    <form action={elegirRol} className="flex rounded-full bg-white/20 p-1" aria-label="Cambiar rol">
      {ir && <input type="hidden" name="ir" value={ir} />}
      {(["pasajero", "conductor"] as const).map((r) => (
        <button
          key={r}
          name="rol"
          value={r}
          aria-pressed={rol === r}
          className={cx(
            "min-h-9 cursor-pointer rounded-full px-3.5 text-[13px] font-bold capitalize transition-colors",
            rol === r ? "bg-white text-gris shadow-sm" : "text-white hover:bg-white/10",
          )}
        >
          {r}
        </button>
      ))}
    </form>
  );
}
