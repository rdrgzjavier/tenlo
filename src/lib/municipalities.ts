const municipalityIds: Record<string, string> = {
  "boadilla-del-monte": "boadilla",
  "las-rozas": "las-rozas",
  "las-rozas-de-madrid": "las-rozas",
  majadahonda: "majadahonda",
  pozuelo: "pozuelo",
  "pozuelo-de-alarcon": "pozuelo"
};

function normalizedMunicipality(value?: string) {
  return value
    ?.trim()
    .toLocaleLowerCase("es-ES")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function municipalityIdForName(municipality?: string) {
  const key = normalizedMunicipality(municipality);
  if (!key) return "unclassified";
  return municipalityIds[key] ?? key;
}
