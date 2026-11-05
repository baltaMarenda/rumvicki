import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <main>
      <PageHeader title="Creá tu cuenta" subtitle="En un minuto estás listo para viajar." back="/" />
      <div className="px-5 py-7">
        <AuthForm modo="registro" />
      </div>
    </main>
  );
}
