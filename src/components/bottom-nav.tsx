"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Ticket, Gauge, UserRound, CirclePlus, CarFront } from "lucide-react";
import { cx } from "./ui";

const items = {
  pasajero: [
    { href: "/buscar", label: "Buscar", icon: Search },
    { href: "/reservas", label: "Reservas", icon: Ticket },
    { href: "/km", label: "Mis km", icon: Gauge },
    { href: "/perfil", label: "Perfil", icon: UserRound },
  ],
  conductor: [
    { href: "/publicar", label: "Publicar", icon: CirclePlus },
    { href: "/mis-viajes", label: "Mis viajes", icon: CarFront },
    { href: "/km", label: "Mis km", icon: Gauge },
    { href: "/perfil", label: "Perfil", icon: UserRound },
  ],
};

export function BottomNav({ rol }: { rol: "pasajero" | "conductor" }) {
  const path = usePathname();
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-gris-200/70 bg-white/95 px-2 pt-2 backdrop-blur pb-safe"
    >
      <ul className="grid grid-cols-4">
        {items[rol].map(({ href, label, icon: Icon }) => {
          const activo = path === href || path.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className="group flex min-h-14 flex-col items-center justify-center gap-1 text-gris"
              >
                <span
                  className={cx(
                    "grid h-8 w-14 place-items-center rounded-full transition-colors duration-200",
                    activo ? "bg-verde text-white" : "text-gris/70 group-hover:bg-gris-100",
                  )}
                >
                  <Icon className="size-5" strokeWidth={activo ? 2.4 : 2} aria-hidden />
                </span>
                <span className={cx("text-[11px]", activo ? "font-bold" : "font-medium text-gris/70")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
