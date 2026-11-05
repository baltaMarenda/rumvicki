import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yendo · Viajes compartidos",
    short_name: "Yendo",
    description: "Compartí viajes en auto dentro de la Provincia de Buenos Aires.",
    start_url: "/buscar",
    display: "standalone",
    background_color: "#F6F7F8",
    theme_color: "#8BCB70",
    lang: "es-AR",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
