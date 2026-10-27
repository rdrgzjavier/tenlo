export type SearchIntentId =
  | "education"
  | "education_support"
  | "activities"
  | "care"
  | "health"
  | "technology"
  | "transport"
  | "school_goods"
  | "other_services"
  | "unclassified";

const intentLabels: Record<SearchIntentId, string> = {
  education: "Centro educativo",
  education_support: "Apoyo escolar e idiomas",
  activities: "Actividades y ocio",
  care: "Cuidado y conciliación",
  health: "Salud y bienestar",
  technology: "Tecnología y robótica",
  transport: "Transporte familiar",
  school_goods: "Material y equipamiento escolar",
  other_services: "Otros servicios familiares",
  unclassified: "Sin clasificar"
};

const stableVerticals = new Set<SearchIntentId>([
  "education",
  "education_support",
  "activities",
  "care",
  "health",
  "school_goods"
]);

const textRules: Array<{ intent: SearchIntentId; patterns: RegExp[] }> = [
  {
    intent: "health",
    patterns: [
      /\b(psicolog|psiquiatr|terapi|salud mental|ansiedad|tdah|logoped|dentist|dental|ortodon|fisioter|nutricion)\w*/
    ]
  },
  {
    intent: "care",
    patterns: [/\b(cangur|ninera|cuidador|cuidado infantil|conciliacion|acompanamiento)\w*/]
  },
  {
    intent: "education_support",
    patterns: [
      /\b(clase particular|profesor particular|apoyo escolar|refuerzo|academia|idioma|ingles|frances|aleman|matematic|lectoescritura)\w*/
    ]
  },
  {
    intent: "technology",
    patterns: [/\b(robotic|programacion|tecnolog|informatica|impresion 3d|videojuego)\w*/]
  },
  {
    intent: "transport",
    patterns: [/\b(transporte|ruta escolar|autobus|autocar|traslado)\w*/]
  },
  {
    intent: "school_goods",
    patterns: [/\b(uniforme|material escolar|libro escolar|papeleria|mochila)\w*/]
  },
  {
    intent: "education",
    patterns: [/\b(colegio|escuela infantil|guarderia|instituto|bachillerato|centro educativo)\w*/]
  },
  {
    intent: "activities",
    patterns: [
      /\b(actividad|extraescolar|campamento|cumplean|ocio|deporte|futbol|natacion|baile|danza|musica|teatro|parque|aire libre|manualidad)\w*/
    ]
  }
];

function comparable(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

export function searchIntentLabel(intent: SearchIntentId) {
  return intentLabels[intent];
}

export function classifySearchIntent(query?: string | null, vertical?: string | null): SearchIntentId {
  const normalizedVertical = comparable(vertical).replace(/\s+/g, "_") as SearchIntentId;
  if (stableVerticals.has(normalizedVertical)) return normalizedVertical;

  const normalizedQuery = comparable(query);
  if (!normalizedQuery) return "unclassified";

  for (const rule of textRules) {
    if (rule.patterns.some((pattern) => pattern.test(normalizedQuery))) return rule.intent;
  }

  if (normalizedVertical === "other_services") return "other_services";

  return "unclassified";
}
