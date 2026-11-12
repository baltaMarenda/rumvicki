import { describe, expect, it } from "vitest";
import { desgloseParte, liquidacionConductor, precioPorPersona, precioTotal } from "./pricing";
import { nivelKm, premiosNuevos } from "./rewards";

describe("pricing", () => {
  it("calcula $280 por km", () => {
    expect(precioTotal(150)).toBe(42000);
  });
  it("divide entre conductor y pasajeros", () => {
    expect(precioPorPersona(150, 1)).toBe(21000);
    expect(precioPorPersona(150, 2)).toBe(14000);
    expect(precioPorPersona(150, 3)).toBe(10500);
  });
  it("desglosa la comisión del 2%", () => {
    expect(desgloseParte(150, 2)).toEqual({ parte: 14000, costoViaje: 13720, comision: 280, aPagar: 14000 });
    expect(desgloseParte(150, 2, true)).toEqual({ parte: 14000, costoViaje: 13720, comision: 0, aPagar: 13720 });
  });
  it("liquida al conductor: Yendo se queda con el 2% del total", () => {
    const l = liquidacionConductor(150, [false, false]);
    expect(l.cobrado).toBe(28000);
    expect(l.comisionYendo).toBe(840);
    expect(l.recibe).toBe(27160);
  });
  it("respeta premios", () => {
    const l = liquidacionConductor(150, [true, false], true);
    expect(l.cobrado).toBe(27720);
    expect(l.comisionYendo).toBe(280);
    expect(l.recibe).toBe(27440);
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
