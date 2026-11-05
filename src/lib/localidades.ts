export const LOCALIDADES = [
  "25 de Mayo", "9 de Julio", "Adrogué", "Avellaneda", "Ayacucho", "Azul", "Bahía Blanca",
  "Balcarce", "Banfield", "Baradero", "Berazategui", "Berisso", "Bolívar", "Bragado",
  "Brandsen", "Campana", "Capital Federal (CABA)", "Cañuelas", "Capitán Sarmiento", "Carhué", "Carmen de Areco",
  "Castelli", "Chacabuco", "Chascomús", "Chivilcoy", "Colón", "Coronel Dorrego",
  "Coronel Pringles", "Coronel Suárez", "Dolores", "Ensenada", "Escobar", "Ezeiza",
  "Florencio Varela", "General Belgrano", "General Madariaga", "General Rodríguez",
  "General Villegas", "Junín", "La Plata", "Lanús", "Las Flores", "Lincoln", "Lobería",
  "Lobos", "Lomas de Zamora", "Luján", "Magdalena", "Mar de Ajó", "Mar del Plata",
  "Mercedes", "Merlo", "Miramar", "Monte Hermoso", "Moreno", "Morón", "Navarro",
  "Necochea", "Olavarría", "Pehuajó", "Pergamino", "Pilar", "Pinamar", "Quilmes",
  "Ramallo", "Rauch", "Rojas", "Saladillo", "Salto", "San Antonio de Areco",
  "San Clemente del Tuyú", "San Isidro", "San Miguel", "San Nicolás", "San Pedro",
  "San Vicente", "Santa Teresita", "Tandil", "Tigre", "Trenque Lauquen", "Tres Arroyos",
  "Villa Gesell", "Zárate",
] as const;

/** Términos extra para encontrar una localidad en el buscador. */
const ALIAS: Record<string, string[]> = {
  "Capital Federal (CABA)": ["caba", "ciudad de buenos aires", "buenos aires", "capital", "ciudad autonoma"],
};

export const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export const esLocalidad = (s: string) =>
  (LOCALIDADES as readonly string[]).includes(s);

/** true si la localidad coincide con lo que escribió el usuario (nombre o alias). */
export const coincide = (localidad: string, q: string) =>
  normalizar(localidad).includes(q) || (ALIAS[localidad] ?? []).some((a) => a.includes(q));

export const regionDe = (localidad: string) => (localidad.includes("CABA") ? "CABA" : "Bs. As.");
