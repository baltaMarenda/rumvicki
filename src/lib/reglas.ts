/** Un auto lleva como máximo 5 integrantes: 4 pasajeros + conductor. */
export const MAX_PASAJEROS = 4;

/** Cancelar con menos de estas horas de anticipación cuenta como cancelación tardía. */
export const HORAS_CANCELACION = 24;

/** Cuántos viajes recientes del pasajero se miran para la alerta. */
export const VIAJES_RECIENTES = 5;

export function esCancelacionTardia(salida: Date, ahora = new Date()) {
  return salida.getTime() - ahora.getTime() < HORAS_CANCELACION * 3_600_000;
}

type Previo = { estado: string; canceladaAt: Date | null; cancelacionTardia: boolean; fechaHora: Date };

/**
 * Mira los últimos 5 viajes del pasajero (los que hizo o canceló él mismo; no cuenta
 * los rechazados ni los que canceló el conductor) y cuenta cuántos canceló tarde.
 */
export function historialCancelaciones(previos: Previo[]) {
  const viajes = previos
    .filter((r) => r.estado === "finalizada" || r.estado === "confirmada" || (r.estado === "cancelada" && r.canceladaAt))
    .sort((a, b) => b.fechaHora.getTime() - a.fechaHora.getTime())
    .slice(0, VIAJES_RECIENTES);
  return { tardias: viajes.filter((r) => r.estado === "cancelada" && r.cancelacionTardia).length, total: viajes.length };
}
