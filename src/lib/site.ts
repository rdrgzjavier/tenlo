export const siteConfig = {
  name: "Tenlo",
  currentDomain: process.env.NEXT_PUBLIC_SITE_URL || "https://tenlo.es",
  tagline: "Todo lo que necesitas alrededor del colegio, filtrado por tu zona y tu centro",
  shortDescription: "Servicios, centros y recursos familiares cerca del colegio",
  description:
    "Tenlo organiza servicios, centros educativos, iniciativas y recursos familiares en Madrid noroeste, con información revisada y sin datos identificativos de menores.",
  area: "Madrid noroeste",
  municipalities: [
    "Las Rozas de Madrid",
    "Majadahonda",
    "Pozuelo de Alarcón",
    "Boadilla del Monte"
  ],
  social: {
    instagram: "https://www.instagram.com/tenlocerca/",
    linkedin: "https://www.linkedin.com/company/tenlocerca"
  }
} as const;

export function absoluteUrl(path = "") {
  return `${siteConfig.currentDomain}${path.startsWith("/") ? path : `/${path}`}`;
}
