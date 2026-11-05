import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-verde text-white">
        <Compass className="size-8" aria-hidden />
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold">Nos perdimos en el camino</h1>
      <p className="mt-1 text-gris/70">No encontramos lo que buscabas.</p>
      <ButtonLink href="/" className="mt-6">Volver al inicio</ButtonLink>
    </main>
  );
}
