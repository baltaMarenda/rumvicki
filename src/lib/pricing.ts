export const PRECIO_KM = 300;
export const COMISION = 0.1;

/** Precio total del viaje (sin peajes). */
export function precioTotal(km: number) {
  return Math.round(km * PRECIO_KM);
}

/** Lo que aporta cada integrante (conductor + pasajeros) según cuántos pasajeros viajen. */
export function precioPorPersona(km: number, pasajeros: number) {
  const integrantes = Math.max(1, pasajeros) + 1;
  return Math.round(precioTotal(km) / integrantes);
}

/** 10% de la parte de un integrante. */
export const comisionDe = (parte: number) => Math.round(parte * COMISION);

/**
 * Desglose de la parte de un integrante.
 * De cada parte, el 10% es comisión de Yendo y el 90% cubre el viaje.
 * Con el premio de km, el integrante no paga ese 10%.
 */
export function desgloseParte(km: number, pasajeros: number, usaPremio = false) {
  const parte = precioPorPersona(km, pasajeros);
  const com = comisionDe(parte);
  return {
    parte,
    costoViaje: parte - com,
    comision: usaPremio ? 0 : com,
    aPagar: usaPremio ? parte - com : parte,
  };
}

/**
 * Liquidación del conductor. Cada pasajero aporta su parte; al conductor le llega
 * el 90% de cada una. Además, Yendo cobra el 10% de la parte del propio conductor
 * (salvo que use su premio).
 */
export function liquidacionConductor(
  km: number,
  pasajerosConPremio: boolean[],
  conductorUsaPremio = false,
) {
  const n = pasajerosConPremio.length;
  const parte = precioPorPersona(km, n);
  const com = comisionDe(parte);
  const cobrado = pasajerosConPremio.reduce((a, p) => a + (p ? parte - com : parte), 0);
  const comisionPasajeros = pasajerosConPremio.reduce((a, p) => a + (p ? 0 : com), 0);
  const comisionConductor = conductorUsaPremio ? 0 : com;
  const recibe = n * (parte - com) - comisionConductor;
  return {
    parte,
    cobrado,
    comisionPasajeros,
    comisionConductor,
    comisionYendo: comisionPasajeros + comisionConductor,
    recibe,
  };
}

export const formatPesos = (n: number) =>
  "$" + Math.round(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });
