import type { Listing, Provider } from "@/lib/types";

export type ProviderField = { label: string; value: string };
export type ProviderSection = { title: string; fields: ProviderField[] };

const pending = "Pendiente de verificar";

function value(input?: string | number | null) {
  if (input === undefined || input === null || String(input).trim() === "") return pending;
  const normalized = String(input).trim();
  if (normalized.toLowerCase().includes("no indicado") || normalized.toLowerCase().includes("pendiente")) return pending;
  return normalized;
}

function verticalFor(provider: Provider) {
  const text = [provider.category, provider.businessName, ...provider.tags].join(" ").toLowerCase();
  if (/dental|odont/.test(text)) return "dental";
  if (/psic|salud mental|bienestar|logoped/.test(text)) return "mental-health";
  if (/campamento|día sin cole|dias sin cole|vacaciones/.test(text)) return "camps";
  if (/deport|natación|natacion|pádel|padel|fútbol|futbol/.test(text)) return "sports";
  if (/academia|clase|idioma|apoyo|profesor|refuerzo/.test(text)) return "classes";
  return "activities";
}

export function providerTemplateLabel(provider: Provider) {
  return {
    dental: "Clínica dental",
    "mental-health": "Salud mental y bienestar familiar",
    camps: "Campamentos y días sin cole",
    sports: "Actividad deportiva",
    classes: "Academia y clases",
    activities: "Actividad y ocio familiar"
  }[verticalFor(provider)];
}

export function providerProfileSections(provider: Provider, listing?: Listing): ProviderSection[] {
  const details = listing?.details ?? {};
  const common: ProviderSection[] = [
    {
      title: "Información esencial",
      fields: [
        { label: "Tipo de servicio", value: providerTemplateLabel(provider) },
        { label: "Municipio", value: value(provider.municipality) },
        { label: "Zona de cobertura", value: value(provider.serviceArea) },
        { label: "Modalidad", value: value(details.Modalidad) }
      ]
    }
  ];

  const templates: Record<string, ProviderSection[]> = {
    activities: [{
      title: "Actividad",
      fields: [
        { label: "Edades", value: value(details.Edades) },
        { label: "Horarios", value: value(details.Horario ?? listing?.availability) },
        { label: "Precio", value: value(listing?.priceLabel) },
        { label: "Plazas disponibles", value: value(details.Plazas) },
        { label: "Duración", value: value(details.Duración) },
        { label: "Material incluido", value: value(details.Material) }
      ]
    }],
    sports: [{
      title: "Actividad deportiva",
      fields: [
        { label: "Disciplina", value: value(details.Disciplina ?? provider.category) },
        { label: "Edades y niveles", value: value(details.Edades) },
        { label: "Instalaciones", value: value(details.Instalaciones) },
        { label: "Horarios", value: value(details.Horario ?? listing?.availability) },
        { label: "Precio", value: value(listing?.priceLabel) },
        { label: "Clase de prueba", value: value(details["Clase de prueba"]) }
      ]
    }],
    classes: [{
      title: "Clases y aprendizaje",
      fields: [
        { label: "Materias o idiomas", value: value(details.Materias ?? provider.category) },
        { label: "Etapas y niveles", value: value(details.Edades) },
        { label: "Formato", value: value(details.Modalidad) },
        { label: "Tamaño de grupo", value: value(details.Grupos) },
        { label: "Horarios", value: value(details.Horario ?? listing?.availability) },
        { label: "Precio", value: value(listing?.priceLabel) }
      ]
    }],
    camps: [{
      title: "Campamento o día sin cole",
      fields: [
        { label: "Fechas", value: value(details.Fechas) },
        { label: "Edades", value: value(details.Edades) },
        { label: "Horario", value: value(details.Horario ?? listing?.availability) },
        { label: "Comedor", value: value(details.Comedor) },
        { label: "Precio", value: value(listing?.priceLabel) },
        { label: "Plazas disponibles", value: value(details.Plazas) }
      ]
    }],
    "mental-health": [{
      title: "Atención y especialidades",
      fields: [
        { label: "Especialidades", value: value(details.Especialidades) },
        { label: "Personas atendidas", value: value(details.Edades) },
        { label: "Modalidad", value: value(details.Modalidad) },
        { label: "Colegiación o acreditación", value: value(details.Colegiación) },
        { label: "Primera consulta", value: value(details["Primera consulta"]) },
        { label: "Precio orientativo", value: value(listing?.priceLabel) }
      ]
    }],
    dental: [{
      title: "Servicios de la clínica",
      fields: [
        { label: "Especialidades", value: value(details.Especialidades) },
        { label: "Odontopediatría", value: value(details.Odontopediatría) },
        { label: "Urgencias", value: value(details.Urgencias) },
        { label: "Horario", value: value(details.Horario ?? listing?.availability) },
        { label: "Financiación", value: value(details.Financiación) },
        { label: "Colegiación o responsable sanitario", value: value(details.Colegiación) }
      ]
    }]
  };

  return [
    ...common,
    ...templates[verticalFor(provider)],
    {
      title: "Contacto y actualización",
      fields: [
        { label: "Web oficial", value: value(provider.website) },
        { label: "Email", value: value(provider.email) },
        { label: "Teléfono", value: value(provider.phone) },
        { label: "Fuente", value: value(provider.sourceName) },
        { label: "Última revisión", value: value(provider.lastReviewed) },
        { label: "Estado de disponibilidad", value: value(listing?.availability) }
      ]
    }
  ];
}
