import type { Category, Center, CommunityInitiative, CommunityPost, Listing, Municipality, Provider } from "./types";
import { centerTypeLabel } from "./display-labels";

const images = {
  center: "https://images.unsplash.com/photo-1577891729319-f4871c6ec217?auto=format&fit=crop&w=1200&q=80",
  nursery: "https://images.unsplash.com/photo-1544253386-89d1b7642674?auto=format&fit=crop&w=1200&q=80",
  sport: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80",
  activity: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
  birthday: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
  books: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
  uniform: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80",
  service: "https://images.unsplash.com/photo-1581578731522-aa0bd3a67d28?auto=format&fit=crop&w=1200&q=80",
  community: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1200&q=80"
};

export const municipalities: Municipality[] = [
  { id: "las-rozas", name: "Las Rozas de Madrid", slug: "las-rozas", description: "Colegios, guarderías, uniformes, actividades y servicios para familias en Las Rozas de Madrid." },
  { id: "majadahonda", name: "Majadahonda", slug: "majadahonda", description: "Recursos familiares cercanos para familias de Majadahonda y Madrid noroeste." },
  { id: "pozuelo", name: "Pozuelo de Alarcón", slug: "pozuelo", description: "Directorio local para familias con centros educativos en Pozuelo de Alarcón." },
  { id: "boadilla", name: "Boadilla del Monte", slug: "boadilla", description: "Recursos próximos al colegio para familias de Boadilla del Monte." }
];

export const categories: Category[] = [
  { id: "uniformes", name: "Uniformes", slug: "uniformes", description: "Uniformes escolares, prendas y reutilización segura por zona y centro orientativo.", seoTitle: "Uniformes escolares cerca de tu centro | Tenlo", seoDescription: "Encuentra uniformes escolares en buen estado cerca de tu zona y centro educativo, con publicaciones moderadas." },
  { id: "libros-material", name: "Libros y material", slug: "libros-material", description: "Libros, material escolar, calzado y lotes por etapa educativa sin identificar a menores.", seoTitle: "Libros y material escolar cerca de ti | Tenlo", seoDescription: "Localiza libros, material escolar, calzado y lotes por municipio, edad recomendada y centro orientativo." },
  { id: "clases-particulares", name: "Clases particulares", slug: "clases-particulares", description: "Profesores, academias e idiomas para apoyo escolar, ciencias, arte y exámenes.", seoTitle: "Clases particulares en Las Rozas | Tenlo", seoDescription: "Encuentra clases particulares por materia, modalidad, municipio y nivel educativo recomendado." },
  { id: "canguros", name: "Canguros", slug: "canguros", description: "Canguros y babysitters con experiencia, disponibilidad general y referencias verificables.", seoTitle: "Canguros y babysitters en Las Rozas | Tenlo", seoDescription: "Busca canguros por zona, edad recomendada, disponibilidad general y verificación." },
  { id: "campamentos", name: "Campamentos y días sin cole", slug: "campamentos", description: "Campamentos urbanos, días sin cole y actividades vacacionales cerca de casa.", seoTitle: "Campamentos y días sin cole en Madrid noroeste | Tenlo", seoDescription: "Compara campamentos urbanos y actividades para días sin cole por zona, edad orientativa y disponibilidad." },
  { id: "extraescolares", name: "Extraescolares", slug: "extraescolares", description: "Actividades, deporte, clubes, creatividad, música y ocio familiar para distintas edades.", seoTitle: "Extraescolares y deporte cerca del colegio | Tenlo", seoDescription: "Descubre actividades extraescolares por zona, edad recomendada, precio y disponibilidad." },
  { id: "centros-deportivos", name: "Centros deportivos", slug: "centros-deportivos", description: "Polideportivos, clubes y escuelas deportivas con oferta familiar local.", seoTitle: "Centros deportivos para familias | Tenlo", seoDescription: "Encuentra centros deportivos, escuelas y actividades por municipio en el noroeste de Madrid." },
  { id: "tecnologia", name: "Talleres tecnológicos", slug: "tecnologia", description: "Robótica, programación, tecnología creativa y clases online para distintas edades.", seoTitle: "Talleres tecnológicos y programación para niños | Tenlo", seoDescription: "Busca talleres tecnológicos, robótica y programación por zona y modalidad." },
  { id: "centros", name: "Centros educativos", slug: "centros", description: "Fichas estructuradas de colegios, escuelas infantiles e institutos con información pública.", seoTitle: "Colegios y centros educativos en Las Rozas | Tenlo", seoDescription: "Consulta colegios y centros educativos con información pública, etapas, servicios, etiquetas y reseñas moderadas." }
];

const excludedTagKeys = new Set([
  "familia",
  "familias",
  "nino",
  "ninos",
  "nina",
  "ninas",
  "canguros",
  "referencias",
  "madrid noroeste",
  "ocio familiar"
]);

const preferredTagLabels: Record<string, string> = {
  "0-3 anos": "0-3 años",
  cumpleanos: "Cumpleaños",
  ingles: "Inglés",
  matematicas: "Matemáticas",
  musica: "Música",
  tecnologia: "Tecnología",
  robotica: "Robótica",
  reutilizacion: "Reutilización",
  "dias sin cole": "Días sin cole",
  "metodo propio": "Método propio",
  "material escolar": "Material escolar",
  "sala multiusos": "Sala multiusos",
  "salas multiusos": "Salas multiusos",
  "parque infantil": "Parque infantil",
  "centro cultural": "Centro cultural",
  "actividades familiares": "Actividades familiares",
  "cesion de espacios": "Cesión de espacios",
  "escuela deportiva": "Escuela deportiva",
  "eso": "ESO"
};

function tagKey(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("es-ES")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatTag(value: string) {
  const cleaned = value.trim().replace(/\s+/g, " ");
  const key = tagKey(cleaned);
  if (preferredTagLabels[key]) return preferredTagLabels[key];
  const lower = cleaned.toLocaleLowerCase("es-ES");
  return lower.charAt(0).toLocaleUpperCase("es-ES") + lower.slice(1);
}

function normalizeTags(values: string[]) {
  const seen = new Set<string>();
  const tags: string[] = [];

  values.forEach((value) => {
    const key = tagKey(value);
    if (!key || excludedTagKeys.has(key) || seen.has(key)) return;
    seen.add(key);
    tags.push(formatTag(value));
  });

  return tags;
}

type CenterSeed = [string, string, string, Center["type"], NonNullable<Center["religiousCharacter"]>, string[], string, string[], string, string];
const centerSeeds: CenterSeed[] = [
  ["el-cantizal", "colegio-el-cantizal", "Colegio El Cantizal", "publico", "laico", ["Infantil", "Primaria", "ESO"], "CEIPSO público bilingüe en Las Rozas.", ["Público", "Bilingüe"], "Las Rozas de Madrid", "916 40 73 80"],
  ["berriz-veracruz", "colegio-berriz-veracruz", "Colegio Berriz - Veracruz", "concertado", "catolico", ["Infantil", "Primaria", "ESO", "Bachillerato"], "Centro concertado católico bilingüe.", ["Concertado", "Católico"], "Las Rozas de Madrid", "916 31 82 23"],
  ["europeo-madrid", "colegio-europeo-de-madrid", "Colegio Europeo de Madrid", "privado", "laico", ["Infantil", "Primaria", "ESO", "Bachillerato"], "Colegio privado internacional.", ["Privado", "Bilingüe"], "Las Rozas de Madrid", "916 36 10 21"],
  ["boadilla-agora", "ceip-agora-boadilla", "CEIP Ágora", "publico", "laico", ["Infantil", "Primaria"], "Colegio público bilingüe de referencia en Boadilla.", ["Público", "Bilingüe"], "Boadilla del Monte", "916 33 03 64"],
  ["boadilla-helade", "colegio-helade-boadilla", "Colegio Hélade", "concertado", "laico", ["Infantil", "Primaria", "ESO", "Bachillerato"], "Centro concertado con excelentes instalaciones.", ["Concertado", "Laico"], "Boadilla del Monte", "916 32 63 60"],
  ["boadilla-mirabal", "mirabal-international-school", "Mirabal International School", "privado", "laico", ["Infantil", "Primaria", "ESO", "Bachillerato"], "Prestigioso colegio privado bilingüe.", ["Privado", "Internacional"], "Boadilla del Monte", "916 33 15 50"],
  ["boadilla-quercus", "colegio-quercus-boadilla", "Colegio Quercus", "concertado", "laico", ["Infantil", "Primaria", "ESO", "Bachillerato"], "Cooperativa de enseñanza con enfoque integral.", ["Concertado", "Laico"], "Boadilla del Monte", "916 33 80 50"],
  ["boadilla-stmichaels", "st-michaels-school-boadilla", "St. Michael's School", "privado", "catolico", ["Infantil", "Primaria", "ESO", "Bachillerato"], "Colegio privado con fuerte base en inglés.", ["Privado", "Bilingüe"], "Boadilla del Monte", "916 33 00 11"],
  ["ei-romanillos", "escuela-infantil-romanillos", "E.I. Romanillos", "publico", "laico", ["0-3 años"], "Escuela infantil pública en Boadilla.", ["Público", "0-3 años"], "Boadilla del Monte", "916 33 10 06"],
  ["ei-juan-austria", "escuela-infantil-juan-de-austria", "E.I. Juan de Austria", "publico", "laico", ["0-3 años"], "Escuela infantil pública de calidad.", ["Público", "0-3 años"], "Boadilla del Monte", "916 32 27 44"],
  ["pozuelo-everest", "colegio-everest-pozuelo", "Colegio Everest", "privado", "catolico", ["Infantil", "Primaria", "ESO", "Bachillerato"], "Colegio privado bilingüe en Pozuelo.", ["Privado", "Católico"], "Pozuelo de Alarcón", "917 15 45 42"],
  ["pozuelo-kensington", "colegio-kensington-pozuelo", "Colegio Kensington", "privado", "laico", ["Infantil", "Primaria", "ESO", "Bachillerato"], "Colegio británico de alto nivel.", ["Privado", "Británico"], "Pozuelo de Alarcón", "917 15 46 12"],
  ["pozuelo-sanjose", "ceip-san-jose-obrero-pozuelo", "CEIP San José Obrero", "publico", "laico", ["Infantil", "Primaria"], "Colegio público de Pozuelo.", ["Público", "Laico"], "Pozuelo de Alarcón", "913 52 14 62"],
  ["pozuelo-montetabor", "colegio-monte-tabor-pozuelo", "Colegio Monte Tabor", "concertado", "catolico", ["Infantil", "Primaria", "ESO", "Bachillerato"], "Centro concertado con ideario católico.", ["Concertado", "Católico"], "Pozuelo de Alarcón", "917 15 57 55"],
  ["pozuelo-british", "british-council-school-pozuelo", "British Council School", "privado", "laico", ["Infantil", "Primaria", "ESO", "Bachillerato"], "El colegio oficial del British Council.", ["Privado", "Británico"], "Pozuelo de Alarcón", "913 37 36 00"],
  ["ei-los-alamos", "escuela-infantil-los-alamos", "E.I. Los Álamos", "publico", "laico", ["0-3 años"], "Escuela infantil pública en Pozuelo.", ["Público", "0-3 años"], "Pozuelo de Alarcón", "913 52 14 61"],
  ["ei-principito", "escuela-infantil-el-principito-pozuelo", "E.I. El Principito", "publico", "laico", ["0-3 años"], "Escuela infantil de la Comunidad de Madrid.", ["Público", "0-3 años"], "Pozuelo de Alarcón", "913 52 66 44"],
  ["majadahonda-caude", "colegio-caude-majadahonda", "Colegio Caude", "concertado", "laico", ["Infantil", "Primaria", "ESO", "Bachillerato"], "Centro concertado de calidad en Majadahonda.", ["Concertado", "Laico"], "Majadahonda", "916 38 65 11"],
  ["majadahonda-sanjaime", "colegio-san-jaime-majadahonda", "Colegio San Jaime", "concertado", "catolico", ["Infantil", "Primaria", "ESO", "Bachillerato"], "Prestigioso colegio concertado.", ["Concertado", "Católico"], "Majadahonda", "916 34 16 02"],
  ["majadahonda-quevedo", "ceip-francisco-de-quevedo-majadahonda", "CEIP Francisco de Quevedo", "publico", "laico", ["Infantil", "Primaria"], "Colegio público bilingüe.", ["Público", "Bilingüe"], "Majadahonda", "916 38 72 13"],
  ["majadahonda-engage", "colegio-engage-majadahonda", "Colegio Engage", "privado", "laico", ["Infantil", "Primaria", "ESO", "Bachillerato"], "Enfoque en innovación y tecnología.", ["Privado", "Innovación"], "Majadahonda", "916 34 50 63"],
  ["majadahonda-galdos", "ceip-benito-perez-galdos-majadahonda", "CEIP Benito Pérez Galdós", "publico", "laico", ["Infantil", "Primaria"], "Colegio público comprometido.", ["Público", "Laico"], "Majadahonda", "916 34 23 11"],
  ["ei-tamaral", "escuela-infantil-tamaral-majadahonda", "E.I. Tamaral", "publico", "laico", ["0-3 años"], "Escuela infantil pública municipal.", ["Público", "0-3 años"], "Majadahonda", "916 34 28 11"],
  ["ei-talin", "escuela-infantil-talin-majadahonda", "E.I. Talín", "publico", "laico", ["0-3 años"], "Escuela infantil con larga trayectoria.", ["Público", "0-3 años"], "Majadahonda", "916 38 42 11"]
];

export const centers: Center[] = centerSeeds.map(([id, slug, name, type, religiousCharacter, stages, description, tags, municipality, phone]) => ({
  id,
  slug,
  name,
  type,
  religiousCharacter,
  stages,
  municipality,
  address: "Consultar dirección pública",
  phone,
  email: "",
  website: "",
  languages: ["Inglés"],
  services: ["Comedor", "Extraescolares", "Orientación"],
  description,
  source: "",
  sourceUrl: undefined,
  lastReviewed: "Mayo de 2026",
  verificationStatus: "",
  isPublicInformation: true,
  tags: normalizeTags(tags),
  image: stages.includes("0-3 años") ? images.nursery : images.center,
  verified: false,
  trustLevel: "collected"
}));

function centerAgeRange(stages: string[]) {
  if (stages.includes("0-3 años")) return [0, 3] as const;
  if (stages.includes("Bachillerato")) return [3, 18] as const;
  if (stages.includes("ESO")) return [3, 16] as const;
  if (stages.includes("Primaria")) return [3, 12] as const;
  if (stages.includes("Infantil")) return [3, 6] as const;
  return [undefined, undefined] as const;
}

type ProviderSeed = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string?,
  string?,
  string?
];

const providerSeeds: ProviderSeed[] = [
  ["boadilla-beone", "BeOne Boadilla", "Extraescolares", "deporte, natación, fitness", images.sport, "extraescolares", "Boadilla del Monte", "916 33 63 36", "info@beone.es"],
  ["boadilla-musica", "Academia de Música Boadilla", "Extraescolares", "música, piano, guitarra", images.activity, "extraescolares", "Boadilla del Monte", "916 32 30 54", "info@musica-boadilla.es"],
  ["boadilla-british", "British Council Boadilla", "Idiomas", "inglés, oficial, niños", images.activity, "clases-particulares", "Boadilla del Monte", "913 37 36 00", "madrid@britishcouncil.es"],
  ["boadilla-mencia", "Papelería Doña Mencía", "Libros y material", "papelería, libros, material escolar", images.books, "libros-material", "Boadilla del Monte", "916 33 03 40", "libreria@mencia.es"],
  ["pozuelo-cruiz", "Polideportivo Carlos Ruiz", "Extraescolares", "deporte, municipal, escuelas", images.sport, "extraescolares", "Pozuelo de Alarcón", "913 52 23 60", "deportes@pozuelodealarcon.org"],
  ["pozuelo-kumon", "Kumon Pozuelo", "Extraescolares", "matemáticas, lectura, apoyo", images.activity, "clases-particulares", "Pozuelo de Alarcón", "654 32 10 98", "pozuelo@kumon.es"],
  ["majadahonda-hvieja", "Polideportivo Huerta Vieja", "Extraescolares", "deporte, natación, municipal", images.sport, "extraescolares", "Majadahonda", "916 34 94 24", "deportes@majadahonda.org"],
  ["majadahonda-kidsus", "Kids&Us Majadahonda", "Idiomas", "inglés, niños, método propio", images.activity, "clases-particulares", "Majadahonda", "916 39 82 25", "majadahonda@kidsandus.es"],
  ["profesor-mates", "Carlos P.", "Clases particulares", "matemáticas, eso, bachillerato", images.activity, "clases-particulares", "Las Rozas de Madrid", "Contacto protegido", "contacto@tenlo.es"],
  ["canguro-ana", "Ana M.", "Canguros", "canguro, tardes, ayuda con deberes", images.service, "canguros", "Las Rozas de Madrid", "Contacto protegido", "contacto@tenlo.es"],
  ["canguro-laura", "Laura R.", "Canguros", "canguro, fines de semana", images.service, "canguros", "Pozuelo de Alarcón", "Contacto protegido", "contacto@tenlo.es"],
  ["hanky-planet-las-rozas-sala-1", "Hanky Planet Las Rozas - Sala 1", "Salas multiusos", "cumpleaños, salas multiusos, ocio familiar", images.birthday, "extraescolares", "Las Rozas de Madrid", "666 222 269", "lasrozas@hankyplanet.com", "https://www.hankyplanet.com/celebracion-de-cumpleanos-en-las-rozas/", "Sala equipada para cumpleaños, comuniones y fiestas familiares, con servicios opcionales de monitores, decoración y catering.", "Turnos publicados: mañana 10:00-14:30, comida 12:00-18:00, tarde 16:30-21:00, cena 20:00-01:00 y noche 22:00-02:00."],
  ["hanky-planet-las-rozas-sala-2", "Hanky Planet Las Rozas - Sala 2", "Salas multiusos", "cumpleaños, salas multiusos, ocio familiar", images.birthday, "extraescolares", "Las Rozas de Madrid", "666 222 269", "lasrozas@hankyplanet.com", "https://fiestalasrozas.com/", "Sala para fiestas privadas con configuración útil para cumpleaños y celebraciones familiares.", "Turnos publicados: mañana 10:00-14:30, comida 12:00-18:00, tarde 16:30-21:00, cena 19:30-01:00 y noche 22:00-00:00."],
  ["hanky-planet-las-rozas-sala-3", "Hanky Planet Las Rozas - Sala 3", "Salas multiusos", "cumpleaños, salas multiusos, ocio familiar", images.birthday, "extraescolares", "Las Rozas de Madrid", "666 222 269", "lasrozas@hankyplanet.com", "https://www.salasdeocio.com/salas/1244-hanky-planet-las-rozas-i", "Sala de uso exclusivo para cumpleaños familiares con equipamiento de ocio y cocina de apoyo.", "Turnos publicados: mañana 10:00-15:00, tarde 16:00-21:00 y noche 22:00-02:00."],
  ["ilusiona-equinoccio-majadahonda", "Ilusiona Equinoccio", "Ocio familiar", "cumpleaños, ocio familiar, actividades", images.birthday, "extraescolares", "Majadahonda", "916 39 73 62", "info@ilusiona.com", "https://ilusiona.com/equinoccio/", "Centro de ocio familiar en C.C. Equinoccio con actividades y reserva de cumpleaños.", "Centro de ocio: lun-jue 16:00-00:00, vie 16:00-01:00, sáb 11:00-01:00, dom 11:00-00:00."],
  ["piccoli-majadahonda", "Piccoli Majadahonda", "Talleres y campamentos", "cumpleaños, talleres, campamentos", images.birthday, "extraescolares", "Majadahonda", "693 74 15 10", "Consultar en web", "https://www.piccoli.es/", "Centro que ofrece cumpleaños a medida con temática y taller, además de campamentos y días sin cole.", "Horario no publicado de forma estable en la web; conviene confirmar disponibilidad al reservar."],
  ["centro-juvenil-principe-asturias", "Centro Juvenil Príncipe de Asturias", "Sala multiusos municipal", "sala multiusos, cesión de espacios, juventud, Majadahonda", images.birthday, "extraescolares", "Majadahonda", "916 34 91 20", "centrojuvenil@majadahonda.org", "https://juventud.majadahonda.org/información-general-horario-y-localización", "Recurso municipal con cesión de espacios, salas multiusos y actividades culturales, útil para familias que buscan espacios comunitarios sujetos a normativa municipal.", "Lun-vie 8:15-21:15, sáb 9:45-14:15 y 16:45-21:15, dom 9:45-14:15."],
  ["magic-forest-pozuelo", "The Magic Forest", "Restaurante familiar", "cumpleaños, restaurante familiar, ocio familiar", images.birthday, "extraescolares", "Pozuelo de Alarcón", "915 12 70 70", "Consultar en web", "https://madridalacarta.com/en-madrid-restaurante/the-magic-forest/", "Restaurante familiar en Kinépolis Ciudad de la Imagen, orientado a comidas, meriendas y celebraciones.", "Lun-jue 17:00-20:30, vie 17:00-22:00, sáb 11:00-22:30, dom 11:00-21:00."],
  ["espacio-cultural-mira-pozuelo", "Espacio Cultural MIRA", "Sala multiusos y cultura", "centro cultural, sala multiusos, actividades familiares, Pozuelo", images.birthday, "extraescolares", "Pozuelo de Alarcón", "917 62 83 00", "pmc@pozuelo.madrid", "https://www.pozuelodealarcon.org/node/26355", "Centro cultural municipal con instalaciones amplias y programación familiar; las cesiones o usos de sala dependen de normativa y disponibilidad municipal.", "Instalaciones: 8:00-22:00. Secretaría: lun-vie 10:00-12:00 y mar-jue 14:30-18:00."],
  ["centro-cultural-volturno-pozuelo", "Centro Cultural Volturno", "Sala multiusos y cultura", "centro cultural, sala, talleres, Pozuelo", images.birthday, "extraescolares", "Pozuelo de Alarcón", "915 12 03 40", "Consultar en web municipal", "https://www.pozuelodealarcon.org/", "Espacio cultural en Pozuelo con aulas y servicios municipales, adecuado para familias que buscan actividades o espacios culturales con niños.", "Lun-vie 8:30-22:00, sáb 9:30-14:00, dom cerrado según directorios locales."],
  ["hop-galaxy-boadilla", "Hop Galaxy Boadilla", "Parque infantil", "cumpleaños, parque infantil, ocio familiar", images.birthday, "extraescolares", "Boadilla del Monte", "630 69 06 19", "info@hopgalaxy.com", "https://www.hopgalaxy.com/boadilla", "Centro de ocio infantil con atracciones y opción de fiesta privada.", "Lun-jue 17:00-21:00, vie 11:00-15:00 y 17:00-22:00, sáb 11:00-22:00, dom 11:00-21:00."],
  ["el-miniclub-boadilla", "El Miniclub", "Parque infantil", "cumpleaños, parque infantil, ocio familiar", images.birthday, "extraescolares", "Boadilla del Monte", "916 33 68 80", "info@elminiclub.com", "https://elminiclub.com/", "Parque de ocio infantil en Boadilla con cumpleaños, monitores, cafetería para familias y actividades.", "Mié-vie 17:00-20:30; sáb-dom 11:00-14:00 y 17:00-20:30; lunes y martes cerrado salvo cumpleaños."],
  ["club-las-encinas-boadilla", "Club Las Encinas de Boadilla", "Celebraciones familiares", "cumpleaños, celebraciones familiares, ocio familiar", images.birthday, "extraescolares", "Boadilla del Monte", "916 33 03 64", "Consultar en web", "https://www.clublasencinas.es/Pages/108-cumpleanyos_y_celebraciones_infantiles_i_club_las_encinas_de_boadilla", "Club con instalaciones sociales, infantiles y deportivas en entorno natural para cumpleaños y celebraciones familiares.", "Horario y disponibilidad de cumpleaños sujetos a reserva y calendario del club; confirmar con el centro." ]
];

providerSeeds.push(
  ["las-rozas-campamentos-activa", "Activa Campamentos Las Rozas", "Campamentos", "campamentos urbanos, días sin cole, conciliación", images.activity, "campamentos", "Las Rozas de Madrid", "", "", "", "Campamentos urbanos por semanas y días sin cole para familias de Las Rozas de Madrid.", "Consultar calendario por temporada."],
  ["pozuelo-robotica-lab", "Robótica Lab Pozuelo", "Talleres tecnológicos", "robótica, programación, tecnología", images.activity, "tecnologia", "Pozuelo de Alarcón", "", "", "", "Talleres de robótica, programación y pensamiento computacional por grupos de edad en Pozuelo.", "Tardes entre semana y campamentos tecnológicos en vacaciones."],
  ["majadahonda-club-raqueta", "Club Raqueta Majadahonda", "Centros deportivos", "tenis, pádel, escuela deportiva", images.sport, "centros-deportivos", "Majadahonda", "", "", "", "Escuela deportiva con tenis, pádel y actividades de iniciación en Majadahonda.", "Consultar horarios de escuela y grupos."],
  ["boadilla-uniformes-local", "Uniformes Boadilla", "Uniformes", "uniformes, arreglos, reutilización", images.uniform, "uniformes", "Boadilla del Monte", "", "", "", "Uniformes, prendas escolares y pequeños arreglos en Boadilla del Monte.", "Horario comercial habitual."]
);

const childcareProfileDetails: Record<string, Record<string, string>> = {
  "canguro-ana": {
    Tarifa: "12 €/hora",
    Disponibilidad: "Tardes entre semana y sábados por la mañana",
    Preaviso: "Confirmación recomendada con 24 h de antelación",
    Experiencia: "4 años de experiencia",
    Referencias: "Referencias disponibles bajo solicitud",
    Verificaciones: "Identidad y documentación pendientes de validación por Tenlo",
    Edades: "Infantil y Primaria",
    Modalidad: "En casa de la familia",
    Comodidades: "Ayuda con deberes, merienda y rutinas de tarde",
    Idiomas: "Español",
    "Disponibilidad semanal": "Lu:Tarde; Ma:Tarde; Mi:Tarde; Ju:Tarde; Vi:Consultar; Sa:Mañana; Do:No disponible"
  },
  "canguro-laura": {
    Tarifa: "14 €/hora",
    Disponibilidad: "Fines de semana y noches puntuales",
    Preaviso: "Confirmación recomendada con 48 h de antelación",
    Experiencia: "3 años de experiencia",
    Referencias: "Referencias disponibles bajo solicitud",
    Verificaciones: "Identidad y documentación pendientes de validación por Tenlo",
    Edades: "Primaria y primeros cursos de ESO",
    Modalidad: "En casa de la familia",
    Comodidades: "Cenas sencillas, rutinas de noche y apoyo puntual con deberes",
    Idiomas: "Español e inglés básico",
    "Disponibilidad semanal": "Lu:No disponible; Ma:No disponible; Mi:Tarde; Ju:Consultar; Vi:Noche; Sa:Tarde y noche; Do:Mañana"
  }
};

const childcareDescriptions: Record<string, string> = {
  "canguro-ana": "Soy Ana, canguro en Las Rozas. Acompaño rutinas de tarde, merienda y deberes con un trato tranquilo, responsable y cercano.",
  "canguro-laura": "Soy Laura, canguro en Pozuelo. Trabajo fines de semana y noches puntuales, cuidando rutinas de cena, juego tranquilo y descanso."
};

export const providers: Provider[] = providerSeeds.map(([id, businessName, category, rawTags, image, categoryId, municipality, phone, email, website, description]) => {
  const hasOfficialWebsite = Boolean(website?.startsWith("http"));
  const protectedContact = phone.includes("Contacto protegido") || email.includes("tenlo.es");
  const verificationStatus = hasOfficialWebsite ? "Información pública localizada" : "Pendiente de revisión";

  return {
    id,
    userId: id,
    businessName,
    category,
    description: childcareDescriptions[id] ?? description ?? providerDescription(businessName, category, municipality),
    municipality,
    serviceArea: `${municipality} y alrededores`,
    website: hasOfficialWebsite ? website! : "",
    phone,
    email,
    sourceName: hasOfficialWebsite ? "Web oficial del proveedor" : "",
    sourceUrl: hasOfficialWebsite ? website : undefined,
    lastReviewed: "Mayo de 2026",
    verificationStatus,
    isPublicInformation: hasOfficialWebsite,
    verified: false,
    trustLevel: "collected",
    plan: "gratuito",
    tags: normalizeTags(rawTags.split(", ")),
    image
  };
});

function providerDescription(businessName: string, category: string, municipality: string) {
  const value = category.toLowerCase();
  if (value.includes("idiomas")) return `${businessName} ofrece aprendizaje de idiomas con grupos y niveles orientados a familias de ${municipality}.`;
  if (value.includes("extraescolares")) return `${businessName} reúne actividades extraescolares y deportivas con horarios consultables en ${municipality}.`;
  if (value.includes("libros")) return `${businessName} facilita material escolar, papelería y libros para el curso en ${municipality}.`;
  if (value.includes("canguro")) return `${businessName} es una ficha de cuidado infantil con contacto protegido y disponibilidad orientativa en ${municipality}.`;
  if (value.includes("clases")) return `${businessName} ofrece apoyo educativo por materia y nivel, con disponibilidad a confirmar en ${municipality}.`;
  return `${businessName} es una ficha local de ${category.toLowerCase()} con datos de contacto y cobertura en ${municipality}.`;
}

function providerCategoryId(provider: Provider) {
  if (provider.category.toLowerCase().includes("clases") || provider.category.toLowerCase().includes("idiomas")) return "clases-particulares";
  if (provider.category.toLowerCase().includes("canguro")) return "canguros";
  if (provider.category.toLowerCase().includes("libros") || provider.category.toLowerCase().includes("papelería")) return "libros-material";
  if (provider.category.toLowerCase().includes("uniformes")) return "uniformes";
  if (provider.category.toLowerCase().includes("campamentos")) return "campamentos";
  if (provider.category.toLowerCase().includes("tecnológicos")) return "tecnologia";
  if (provider.category.toLowerCase().includes("deportivos")) return "centros-deportivos";
  return "extraescolares";
}

export const listings: Listing[] = [
  ...centers.map((center) => ({
    id: `ficha-${center.id}`,
    slug: center.slug,
    userId: "tenlo",
    categoryId: "centros",
    centerId: center.id,
    title: center.name,
    description: center.description,
    municipality: center.municipality,
    area: center.municipality,
    recommendedAgeMin: centerAgeRange(center.stages)[0],
    recommendedAgeMax: centerAgeRange(center.stages)[1],
    priceLabel: "Consultar",
    availability: "Ficha pública",
    sourceName: center.source,
    sourceUrl: center.sourceUrl,
    lastReviewed: center.lastReviewed,
    verificationStatus: center.verificationStatus,
    isPublicInformation: center.isPublicInformation,
    publicationType: "centro" as const,
    status: "published" as const,
      verified: center.verified,
    trustLevel: center.trustLevel,
    tags: center.tags,
    image: center.image,
    details: {
      Tipo: centerTypeLabel(center.type),
      Etapas: center.stages.join(", "),
      Teléfono: center.phone,
      Web: center.website
    }
  })),
  ...providers.map((provider) => {
    const seed = providerSeeds.find(([id]) => id === provider.id);
    const availability = seed?.[11] ?? "Consultar disponibilidad";
    const childcareDetails = childcareProfileDetails[provider.id];

    return {
      id: `p-${provider.id}`,
      slug: provider.id,
      userId: provider.userId,
      categoryId: providerCategoryId(provider),
      title: provider.businessName,
      description: provider.description,
      municipality: provider.municipality,
      area: provider.serviceArea,
      recommendedAgeMin: provider.category.toLowerCase().includes("canguro") ? 3 : provider.category.toLowerCase().includes("cumpleaños") ? 3 : 3,
      recommendedAgeMax: provider.category.toLowerCase().includes("canguro") ? 14 : provider.category.toLowerCase().includes("cumpleaños") ? 14 : 16,
      priceLabel: childcareDetails?.Tarifa ?? "Consultar",
      availability: childcareDetails?.Disponibilidad ?? availability,
      sourceName: provider.sourceName,
      sourceUrl: provider.sourceUrl,
      lastReviewed: provider.lastReviewed,
      verificationStatus: provider.verificationStatus,
      isPublicInformation: provider.isPublicInformation,
      publicationType: "proveedor" as const,
      status: "published" as const,
      verified: provider.verified,
      trustLevel: provider.trustLevel,
      tags: provider.tags,
      image: provider.image,
      details: {
        ...childcareDetails,
        Contacto: provider.phone,
        Email: provider.email,
        Horario: childcareDetails?.Disponibilidad ?? availability,
        Web: provider.website || "No indicado"
      }
    };
  })
];

const communityTagOverrides: Record<string, string[]> = {
  "afn-boadilla": normalizeTags(["Familias numerosas", "Beneficios"]),
  "cruz-roja-boadilla": normalizeTags(["Acción social", "Voluntariado"]),
  "banco-alimentos-pozuelo": normalizeTags(["Acción social", "Alimentos"]),
  "fundacion-cana-pozuelo": normalizeTags(["Inclusión", "Discapacidad"]),
  "asur-majadahonda": normalizeTags(["Acción social", "Urgencia social"]),
  "majadahonda-ayuda": normalizeTags(["Apoyo mutuo", "Voluntariado"])
};

export const communityInitiatives: CommunityInitiative[] = [
  { id: "afn-boadilla", name: "Asociación Familias Numerosas Boadilla", url: "", municipality: "Boadilla del Monte", summary: "Apoyo y beneficios para familias numerosas de Boadilla.", tags: ["Familias", "Boadilla"], image: images.community, ctaLabel: "Consultar recurso comunitario" },
  { id: "cruz-roja-boadilla", name: "Cruz Roja Boadilla", url: "", municipality: "Boadilla del Monte", summary: "Acción social y apoyo comunitario en Boadilla.", tags: ["Social", "Boadilla"], image: images.community, ctaLabel: "Consultar recurso comunitario" },
  { id: "banco-alimentos-pozuelo", name: "Banco de Alimentos Pozuelo", url: "", municipality: "Pozuelo de Alarcón", summary: "Recogida y distribución de alimentos en Pozuelo.", tags: ["Social", "Pozuelo"], image: images.community, ctaLabel: "Consultar recurso comunitario" },
  { id: "fundacion-cana-pozuelo", name: "Fundación Caná", url: "", municipality: "Pozuelo de Alarcón", summary: "Atención a personas con discapacidad y sus familias.", tags: ["Inclusión", "Pozuelo"], image: images.community, ctaLabel: "Consultar recurso comunitario" },
  { id: "asur-majadahonda", name: "ASUR Majadahonda", url: "", municipality: "Majadahonda", summary: "Asistencia social de urgencia en Majadahonda.", tags: ["Social", "Majadahonda"], image: images.community, ctaLabel: "Consultar recurso comunitario" },
  { id: "majadahonda-ayuda", name: "Majadahonda Ayuda", url: "", municipality: "Majadahonda", summary: "Movimiento ciudadano de apoyo mutuo.", tags: ["Comunidad", "Majadahonda"], image: images.community, ctaLabel: "Consultar recurso comunitario" }
].map((initiative) => ({
  ...initiative,
  tags: communityTagOverrides[initiative.id] ?? normalizeTags(initiative.tags)
}));

export const searchTags = Array.from(new Set([
  ...centers.flatMap((center) => center.tags),
  ...listings.flatMap((listing) => listing.tags),
  ...providers.flatMap((provider) => provider.tags),
  ...communityInitiatives.flatMap((initiative) => initiative.tags)
])).sort((a, b) => a.localeCompare(b, "es"));

export const communityPosts: CommunityPost[] = [
  { id: "cp1", title: "Mejores parques en Boadilla para ir con niños", category: "General", municipality: "Boadilla del Monte", summary: "Recomendaciones de la comunidad.", status: "published" },
  { id: "cp2", title: "Actividades gratuitas en Pozuelo este fin de semana", category: "Extraescolares", municipality: "Pozuelo de Alarcón", summary: "Agenda cultural y deportiva.", status: "published" }
];

export function findCategory(slug: string) { return categories.find((category) => category.slug === slug); }
export function findListing(slugOrId: string) { return listings.find((listing) => listing.slug === slugOrId || listing.id === slugOrId); }
export function findCenter(slug: string) { return centers.find((center) => center.slug === slug); }
export function findProvider(id: string) { return providers.find((provider) => provider.id === id); }
export function findCommunityInitiative(id: string) { return communityInitiatives.find((initiative) => initiative.id === id); }
export function ageLabel(listing: Listing) {
  if (listing.recommendedAgeMin === undefined || listing.recommendedAgeMax === undefined) return "Consultar edad recomendada";
  return `${listing.recommendedAgeMin}-${listing.recommendedAgeMax} años`;
}
