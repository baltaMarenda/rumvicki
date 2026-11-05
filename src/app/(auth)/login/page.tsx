import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Ingresar" };

export default function LoginPage() {
  return (
    <main>
      <PageHeader title="¡Hola de nuevo!" subtitle="Ingresá para seguir viajando." back="/" />
      <div className="px-5 py-7">
        <AuthForm modo="login" />
        <div className="mt-8 rounded-2xl border border-dashed border-gris-300 bg-white p-4 text-sm text-gris">
          <p className="font-semibold">Cuentas demo (contraseña: yendo123)</p>
          <ul className="mt-1.5 space-y-0.5 text-gris/80">
            <li>sofia@yendo.app · pasajera, 750 km</li>
            <li>martin@yendo.app · conductor</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
