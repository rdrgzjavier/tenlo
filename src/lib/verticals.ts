export type VerticalId =
  | "education"
  | "education_support"
  | "activities"
  | "care"
  | "health"
  | "school_goods"
  | "other_services"
  | "unclassified";

function normalizedCategory(value?: string) {
  return value
    ?.trim()
    .toLocaleLowerCase("es-ES")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function verticalIdForCategory(category?: string): VerticalId {
  const key = normalizedCategory(category);
  if (!key) return "unclassified";

  if (key === "centros" || key.includes("colegio") || key.includes("escuela-infantil")) return "education";
  if (key === "clases-particulares" || key.includes("idioma") || key.includes("apoyo-escolar")) return "education_support";
  if (key === "canguros" || key.includes("cuidado")) return "care";
  if (key.includes("salud") || key.includes("dental") || key.includes("bienestar") || key.includes("psicolog")) return "health";
  if (key === "uniformes" || key === "libros-material" || key.includes("papeleria") || key.includes("material-escolar")) return "school_goods";
  if (
    key === "campamentos" ||
    key === "extraescolares" ||
    key === "centros-deportivos" ||
    key === "tecnologia" ||
    key.includes("ocio") ||
    key.includes("deport") ||
    key.includes("taller") ||
    key.includes("parque-infantil") ||
    key.includes("centro-cultural") ||
    key.includes("sala-multiusos") ||
    key.includes("celebraciones")
  ) return "activities";

  return "other_services";
}
