import { describe, expect, it } from "vitest";
import { desgloseParte, liquidacionConductor, precioPorPersona, precioTotal } from "./pricing";
import { nivelKm, premiosNuevos } from "./rewards";

describe("pricing", () => {
  it("calcula $300 por km", () => {
    expect(precioTotal(100)).toBe(30000);
  });
  it("divide entre conductor y pasajeros", () => {
    expect(precioPorPersona(100, 1)).toBe(15000);
    expect(precioPorPersona(100, 2)).toBe(10000);
    expect(precioPorPersona(100, 3)).toBe(7500);
  });
  it("desglosa la comisión del 10%", () => {
    expect(desgloseParte(100, 2)).toEqual({ parte: 10000, costoViaje: 9000, comision: 1000, aPagar: 10000 });
    expect(desgloseParte(100, 2, true)).toEqual({ parte: 10000, costoViaje: 9000, comision: 0, aPagar: 9000 });
  });
  it("liquida al conductor: Yendo se queda con el 10% del total", () => {
    const l = liquidacionConductor(100, [false, false]);
    expect(l.cobrado).toBe(20000);
    expect(l.comisionYendo).toBe(3000);
    expect(l.recibe).toBe(17000);
  });
  it("respeta premios", () => {
    const l = liquidacionConductor(100, [true, false], true);
    expect(l.cobrado).toBe(19000);
    expect(l.comisionYendo).toBe(1000);
    expect(l.recibe).toBe(18000);
  });
});

describe("rewards", () => {
  it("calcula el tramo de la barra", () => {
    expect(nivelKm(340)).toMatchObject({ desde: 0, hasta: 800, faltan: 460 });
    expect(nivelKm(900)).toMatchObject({ desde: 800, hasta: 1600, premiosGanados: 1 });
  });
  it("detecta premios nuevos al cruzar 800", () => {
    expect(premiosNuevos(750, 820)).toBe(1);
    expect(premiosNuevos(100, 200)).toBe(0);
    expect(premiosNuevos(700, 1700)).toBe(2);
  });
});

import { coincide, esLocalidad, normalizar } from "./localidades";
describe("localidades", () => {
  it("encuentra CABA por nombre o alias", () => {
    const c = "Capital Federal (CABA)";
    expect(esLocalidad(c)).toBe(true);
    for (const q of ["caba", "capital federal", "Buenos Aires", "ciudad autónoma"]) {
      expect(coincide(c, normalizar(q))).toBe(true);
    }
    expect(coincide("La Plata", "caba")).toBe(false);
  });
});
