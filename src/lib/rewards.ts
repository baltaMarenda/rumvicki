export const TRAMO_KM = 800;

/** Estado de la barrita de km: tramo actual (0–800, 800–1600, …) y progreso dentro de él. */
export function nivelKm(km: number) {
  const tramo = Math.floor(km / TRAMO_KM);
  const desde = tramo * TRAMO_KM;
  const hasta = desde + TRAMO_KM;
  return {
    tramo,
    desde,
    hasta,
    progreso: (km - desde) / TRAMO_KM,
    faltan: hasta - km,
    premiosGanados: tramo,
  };
}

/** Cuántos premios nuevos se desbloquean al pasar de `antes` a `despues` km. */
export function premiosNuevos(antes: number, despues: number) {
  return Math.floor(despues / TRAMO_KM) - Math.floor(antes / TRAMO_KM);
}
