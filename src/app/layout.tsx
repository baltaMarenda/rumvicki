import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ["500", "600", "700"] });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "Yendo · Viajes compartidos en PBA", template: "%s · Yendo" },
  description:
    "Publicá tu viaje en auto o sumate a uno dentro de la Provincia de Buenos Aires y compartí los costos.",
  applicationName: "Yendo",
  appleWebApp: { capable: true, title: "Yendo", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#8BCB70",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${outfit.variable} ${jakarta.variable}`}>
      <body className="min-h-dvh">
        <div className="mx-auto min-h-dvh w-full max-w-md bg-gris-50 sm:shadow-card">{children}</div>
      </body>
    </html>
  );
}
