# Sistema tipográfico de Tenlo

## Principios

- Cada página debe tener un único `h1` visible. Las distintas ramas condicionales pueden contener su propio `h1` si nunca se renderizan a la vez.
- La jerarquía semántica no se elige por tamaño: `h2` abre una sección, `h3` una subsección o tarjeta dentro de ella y `h4` un bloque menor dentro de esa tarjeta.
- No se saltan niveles de encabezado para conseguir un tamaño visual.
- Los párrafos relevantes usan al menos 15 px en móvil y 16 px desde `sm`. Los 12–13 px se reservan para fechas, estados, etiquetas y metadatos secundarios.
- Campos y botones mantienen 16 px para evitar zoom automático en iOS. Los objetivos táctiles son de al menos 48 px; los CTAs principales mantienen 56 px de alto mínimo.
- Los títulos se equilibran y los párrafos usan ajuste de línea optimizado para evitar líneas viudas cuando el navegador lo permite.

## Escala responsive

| Función | Clase | Móvil | Tablet/escritorio |
|---|---|---:|---:|
| H1 de página o hero | `page-title` | 32 px / 1.08 | 44–56 px / 1.12 |
| H1 de ficha o flujo compacto | `detail-title` | 32 px / 1.12 | 40 px / 1.12 |
| H2 de sección principal | `section-title` | 28 px / 1.2 | 36 px / 1.2 |
| H2 de subsección | `subsection-title` | 22 px / 1.25 | 24 px / 1.25 |
| H3 de tarjeta | `card-title` | 18 px / 28 px | 20 px / 28 px |
| H4 o título menor | `minor-title` | 16 px / 24 px | 16 px / 24 px |
| Introducción de página | `lead` | 16 px / 28 px | 18 px / 28 px |
| Descripción relevante | `supporting-copy` | 15 px / 24 px | 16 px / 28 px |
| Metadato secundario | `meta-copy` | 13 px / 20 px | 13 px / 20 px |

## Componentes interactivos

- `btn-primary` y `btn-secondary`: texto de 16 px, negrita y altura mínima de 56 px.
- `icon-button`: superficie táctil de 48 × 48 px y nombre accesible mediante `aria-label`.
- `field`, `filter-input` y `filter-select`: texto de 16 px y altura mínima de 56 px.
- `chip` y `label`: 14 px; comunican contexto, nunca sustituyen un título o una explicación.

## SEO y accesibilidad

- Los estilos visuales no cambian la estructura HTML ni sustituyen encabezados por texto en negrita.
- El H1 describe la intención principal y los H2 agrupan temas rastreables de la página.
- No se reduce el tamaño de la fuente para encajar texto: se simplifica el contenido o se permite el salto de línea.
- El zoom del navegador permanece habilitado y el diseño debe soportar ampliación de texto sin desplazamiento horizontal.
