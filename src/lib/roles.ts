export const inicioSegunRol = (rol: string | null) =>
  rol === "conductor" ? "/mis-viajes" : rol === "pasajero" ? "/buscar" : "/rol";
