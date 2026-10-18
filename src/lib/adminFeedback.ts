const contextLabels: Record<string, string> = {
  general: "Sugerencia general",
  contact_request: "Solicitud de ayuda",
  provider_suggestion: "Propuesta de proveedor",
  report_listing: "Reporte de publicación",
  anuncio: "Cambio en un anuncio",
  centro: "Cambio en un centro",
  servicio: "Cambio en un servicio",
  comunidad: "Sugerencia de comunidad"
};

const requestTypeLabels: Record<string, string> = {
  correction: "Corrección de información",
  update: "Actualización de ficha",
  withdrawal: "Solicitud de retirada",
  unsafe_content: "Contenido inapropiado",
  other: "Otro motivo"
};

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  pending_review: "Pendiente de revisión",
  approved: "Resuelta",
  rejected: "Descartada",
  archived: "Archivada",
  submitted: "Recibida",
  delivered: "Enviada al proveedor",
  viewed: "Vista por el proveedor",
  responded: "Respondida",
  declined: "Rechazada",
  alternative_requested: "Alternativa solicitada",
  alternative_offered: "Alternativa ofrecida",
  closed: "Cerrada"
};

export function feedbackContextParts(value?: string | null) {
  const [context = "general", requestType = ""] = (value || "general").split(":", 2);
  return {
    context,
    requestType,
    title: requestTypeLabels[requestType] || contextLabels[context] || "Aviso recibido",
    category: contextLabels[context] || "Aviso recibido",
    requestTypeLabel: requestTypeLabels[requestType] || null
  };
}

export function moderationStatusLabel(value?: string | null) {
  return statusLabels[value || ""] || value || "Sin estado";
}

export function feedbackTargetHref(contextValue?: string | null, itemId?: string | null) {
  if (!itemId) return null;
  const { context } = feedbackContextParts(contextValue);
  if (context === "centro") return `/centros/${encodeURIComponent(itemId)}`;
  if (context === "servicio") return `/servicios/${encodeURIComponent(itemId)}`;
  if (context === "anuncio" || context === "report_listing") return `/anuncios/${encodeURIComponent(itemId)}`;
  if (context === "comunidad") return `/comunidad/${encodeURIComponent(itemId)}`;
  return null;
}

