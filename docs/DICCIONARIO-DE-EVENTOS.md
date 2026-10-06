# Diccionario inicial de eventos de Tenlo

Versión: `1.0`  
Ámbito: piloto de Madrid noroeste.

## Reglas

- GA4 y GTM recogen adquisición y comportamiento agregado.
- Supabase conserva el estado real de reclamaciones, solicitudes, respuestas y conexiones útiles.
- Nunca se envían a GA4 nombres, emails, teléfonos, direcciones precisas, texto libre ni datos de menores.
- Los eventos críticos deben incluir `event_id`, `schema_version` y los identificadores no personales disponibles.
- Un clic en teléfono, web o email no equivale a una conexión útil.
- Los valores inexistentes se omiten; no se sustituyen por textos que parezcan datos reales.

## Descubrimiento y búsqueda

| Evento | Cuándo ocurre | Propiedades permitidas | Destino |
|---|---|---|---|
| `search_started` | La persona inicia una búsqueda | `search_id`, origen | GA4 |
| `search_results_viewed` | Se muestran resultados | `search_id`, categoría, municipio, filtros normalizados, `result_count`, `zero_results` | GA4 + Supabase |
| `search_zero_results` | La búsqueda no ofrece opciones | `search_id`, categoría, municipio, filtros | GA4 + Supabase |
| `search_refined` | Se modifican filtros o intención | `search_id`, filtro cambiado, número de intento | GA4 + Supabase |
| `result_impression` | Una ficha entra en el listado visible | `search_id`, `provider_id`, posición, categoría | GA4 |
| `result_opened` | Se abre una ficha desde resultados | `search_id`, `provider_id`, posición, categoría | GA4 |
| `provider_suggestion_started` | Desde cero resultados se abre el formulario para proponer una opción | categoría normalizada, municipio, origen | GA4 |
| `provider_suggestion_submitted` | La propuesta queda guardada para revisión | identificador interno de propuesta, categoría normalizada, municipio | GA4 + Supabase |

El término escrito solo se almacena en Supabase tras sanear emails, teléfonos y posibles datos sensibles. GA4 recibe una intención o categoría normalizada, no el texto libre.

El nombre, la web, la ubicación exacta, las notas y los datos de contacto aportados al proponer un proveedor permanecen en Supabase y no se envían a GA4. La propuesta requiere revisión humana antes de generar una ficha `No verificada`.

## Fichas y contacto

| Evento | Cuándo ocurre | Propiedades permitidas | Destino |
|---|---|---|---|
| `provider_profile_viewed` | Se abre una ficha de proveedor | `provider_id`, categoría, municipio, nivel de confianza | GA4 |
| `center_profile_viewed` | Se abre una ficha de centro | `center_id`, municipio, nivel de confianza | GA4 |
| `contact_started` | Se inicia el formulario interno | `provider_id`, categoría, origen | GA4 + Supabase |
| `contact_phone_clicked` | Se pulsa llamar | `provider_id`, categoría, origen | GA4 |
| `contact_web_clicked` | Se abre la web oficial | `provider_id`, categoría, origen | GA4 |
| `contact_email_clicked` | Se abre el correo externo | `provider_id`, categoría, origen | GA4 |
| `request_submitted` | Supabase confirma una solicitud | `request_id`, `provider_id`, categoría, municipio | GA4 + Supabase |
| `alternative_requested` | La familia pide alternativas | `request_id`, categoría, municipio, motivo normalizado | GA4 + Supabase |

## Respuesta y conexión útil

| Evento | Cuándo ocurre | Propiedades permitidas | Fuente de verdad |
|---|---|---|---|
| `request_delivered` | La solicitud llega al proveedor | `request_id`, `provider_id` | Supabase |
| `request_viewed` | El proveedor consulta la solicitud | `request_id`, `provider_id` | Supabase |
| `provider_responded` | El proveedor responde | `request_id`, resultado, bucket de tiempo | Supabase |
| `request_declined` | El proveedor no puede atenderla | `request_id`, motivo normalizado | Supabase |
| `usefulness_reported` | Una parte valora la conexión | `request_id`, parte, resultado | Supabase |
| `outcome_confirmed` | Se confirma conversación, propuesta, reserva o contratación | `request_id`, resultado | Supabase |

## Proveedores y reclamaciones

| Evento | Cuándo ocurre | Propiedades permitidas | Destino |
|---|---|---|---|
| `provider_landing_viewed` | Se visita el programa para proveedores | canal/campaña | GA4 |
| `claim_started` | Se inicia la gestión de una ficha | tipo de entidad, identificador | GA4 |
| `claim_submitted` | La solicitud queda registrada | identificador de reclamación, tipo | GA4 + Supabase |
| `claim_approved` | Tenlo aprueba la relación | identificador, tiempo de revisión | Supabase |
| `profile_section_completed` | Se completa una sección | sección, porcentaje de completitud | GA4 + Supabase |
| `profile_published` | La ficha queda publicada | `provider_id`, categoría, municipio, confianza | Supabase |

## Conversiones iniciales en GA4

- `request_submitted`
- `claim_submitted`
- `provider_responded`, solo si se envía desde servidor sin datos personales.
- `usefulness_reported`, únicamente como evento agregado.

Las conversiones se revisarán después de comprobar que no existen duplicados entre cliente y servidor.
