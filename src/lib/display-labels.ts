import type { Center, TrustLevel } from "@/lib/types";

export function trustLevelLabel(level: TrustLevel) {
  if (level === "managed") return "Gestionada";
  if (level === "verified") return "Verificada";
  if (level === "official") return "Oficial";
  return "No verificada";
}

export function centerTypeLabel(type?: Center["type"]) {
  if (type === "publico") return "Público";
  if (type === "concertado") return "Concertado";
  if (type === "privado") return "Privado";
  return "Centro educativo";
}

export function religiousCharacterLabel(value?: Center["religiousCharacter"]) {
  if (value === "catolico") return "Católico";
  if (value === "laico") return "Laico";
  if (value === "no indicado") return "No indicado";
  return undefined;
}

function comparableLabel(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("es-ES")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function uniqueDisplayTags(tags: string[], hiddenTags: Array<string | undefined>) {
  const hidden = new Set(hiddenTags.filter(Boolean).map((tag) => comparableLabel(tag!)));
  const seen = new Set<string>();

  return tags.filter((tag) => {
    const key = comparableLabel(tag);
    if (!key || hidden.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
