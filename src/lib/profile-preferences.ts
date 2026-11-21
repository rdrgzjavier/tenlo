export const profileInterestOptions = [
  { id: "centros", label: "Centros educativos" },
  { id: "extraescolares", label: "Actividades y deporte" },
  { id: "clases-particulares", label: "Apoyo escolar" },
  { id: "salud-bienestar", label: "Salud y bienestar" },
  { id: "tecnologia", label: "Tecnología" },
  { id: "transporte", label: "Transporte" },
  { id: "campamentos", label: "Campamentos y días sin cole" }
] as const;

const allowedInterestIds = new Set<string>(profileInterestOptions.map((option) => option.id));

export function sanitizeProfileInterests(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string" && allowedInterestIds.has(item)))];
}
