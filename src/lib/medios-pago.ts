/** Medios de pago del checkout simulado de Mercado Pago. */
export const MEDIOS_PAGO = [
  { id: "dinero_en_cuenta", titulo: "Dinero en cuenta", detalle: "Disponible: $250.000" },
  { id: "tarjeta_debito", titulo: "Débito Visa", detalle: "•••• 4242" },
  { id: "tarjeta_credito", titulo: "Crédito Mastercard", detalle: "•••• 5555 · 1 cuota sin interés" },
] as const;

export const esMedioPago = (id: string) => MEDIOS_PAGO.some((m) => m.id === id);

export const medioLabel = (id: string | null) => MEDIOS_PAGO.find((m) => m.id === id)?.titulo ?? "Mercado Pago";
