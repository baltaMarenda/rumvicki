import { describe, expect, it } from "vitest";
import { esCancelacionTardia, historialCancelaciones } from "./reglas";

const h = 3_600_000;
const ahora = new Date("2026-11-05T12:00:00Z");

describe("esCancelacionTardia", () => {
  it("menos de 24 hs es tardía", () => {
    expect(esCancelacionTardia(new Date(ahora.getTime() + 23 * h), ahora)).toBe(true);
    expect(esCancelacionTardia(new Date(ahora.getTime() + 25 * h), ahora)).toBe(false);
  });
});

describe("historialCancelaciones", () => {
  const r = (dias: number, estado: string, tardia = false, porPasajero = true) => ({
    estado,
    fechaHora: new Date(ahora.getTime() - dias * 24 * h),
    canceladaAt: estado === "cancelada" && porPasajero ? ahora : null,
    cancelacionTardia: tardia,
  });

  it("cuenta las tardías de los últimos 5", () => {
    const res = historialCancelaciones([
      r(1, "cancelada", true),
      r(2, "finalizada"),
      r(3, "cancelada", true),
      r(4, "finalizada"),
      r(5, "cancelada", true),
      r(6, "cancelada", true), // queda afuera: es el 6to
    ]);
    expect(res).toEqual({ tardias: 3, total: 5 });
  });

  it("ignora rechazadas y cancelaciones del conductor", () => {
    const res = historialCancelaciones([r(1, "rechazada"), r(2, "cancelada", false, false), r(3, "cancelada", false)]);
    expect(res).toEqual({ tardias: 0, total: 1 });
  });
});
