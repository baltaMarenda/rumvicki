/** true si la fecha todavía no pasó. */
export const esFuturo = (d: Date) => d.getTime() > Date.now();

export const TZ = "America/Argentina/Buenos_Aires";

/** Convierte "2026-11-20" + "08:30" (hora argentina) a Date. */
export const fechaHoraAR = (fecha: string, hora: string) =>
  new Date(`${fecha}T${hora}:00-03:00`);

export function formatFecha(d: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

export function formatHora(d: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/** Fecha "YYYY-MM-DD" en hora argentina. */
export function isoFechaAR(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}
