import { Suspense } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { usuarioActual } from "@/lib/dal";

async function Nav() {
  const u = await usuarioActual();
  if (!u?.rol) return null;
  return <BottomNav rol={u.rol} />;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-28">{children}</div>
      <Suspense>
        <Nav />
      </Suspense>
    </>
  );
}
