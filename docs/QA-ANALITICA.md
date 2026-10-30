# QA de analítica y consentimiento de Tenlo

Este procedimiento valida el recorrido completo `navegador -> dataLayer -> GTM -> GA4` y, cuando corresponde, `navegador/servidor -> Supabase`. Debe repetirse antes de cambiar la taxonomía, publicar un flujo crítico o entregar informes a proveedores.

Antes de la prueba de navegador, ejecutar `npm run verify:gtm`. La comprobación descarga el contenedor público y exige paridad exacta entre su activador y los eventos declarados por `TrackingAction`; una etiqueta creada en GTM no basta si el activador omite eventos.

## Fuente de cada evento

| Familia | Cliente | Servidor / Supabase | Regla de deduplicación |
|---|---|---|---|
| Navegación y adquisición | `page_view` y contexto automático de GA4 | No | Un `page_view` explícito por cambio de ruta; `send_page_view=false` en la etiqueta base |
| Búsqueda | Eventos de interacción y resultados agregados | Una fila en `search_events` por búsqueda válida | `search_id` único; el texto libre nunca llega a GA4 |
| Impresión y apertura de ficha | Evento de cliente | No | `search_id` + ficha + posición para impresiones; una vista de ficha por sesión mediante `view_scope=session_unique` |
| Favorito | Evento solo tras confirmar la escritura | Tabla `favorites` | Restricción única `user_id,target_type,target_id`; no emitir si Supabase falla |
| Búsqueda guardada | `search_saved` solo tras confirmar la escritura; apertura y borrado separados | Tabla `saved_searches` | RLS por propietario, ruta interna única por cuenta y texto libre fuera de GA4 |
| Tráfico interno | Ningún evento llega a `dataLayer` cuando `tenlo_internal_traffic=1` | El endpoint devuelve `excluded: true` sin escribir | Control visible solo para `tenlo_admin` en Datos de cuenta; activación por navegador |
| Compartir | Evento tras completar compartir o copiar | No | Un evento por acción confirmada; cancelar el menú nativo no cuenta |
| Contacto externo | Evento de clic | No | El clic no se presenta como respuesta ni conexión útil |
| Solicitud interna | `contact_form_completed` y `request_created` tras insertar | Una fila en `connection_requests` | `event_id` se crea antes de insertar y es común a Supabase y GA4; `request_id` identifica la solicitud |
| Reclamación | `claim_submitted` tras respuesta correcta de la API | Una fila en `claim_requests` | La API devuelve el `event_id` persistido y el cliente lo reutiliza en GA4 |
| Newsletter | Evento tras respuesta correcta | Una fila única por email en `newsletter_subscribers` | El email no se envía a GA4; los duplicados se resuelven en Supabase |
| Respuesta y resultado | No hasta que exista la interfaz del proveedor | Supabase será la fuente de verdad | Un cambio de estado por solicitud y marca temporal de servidor |

## Preparación

1. Usar un navegador externo limpio, sin extensiones que bloqueen analítica.
2. Abrir una ventana privada y borrar la cookie `tenlo_analytics_consent` de `tenlo.es`.
3. Conectar GTM Preview a producción y abrir GA4 DebugView en la propiedad Tenlo.
4. Abrir el inspector de red filtrando por `gtm`, `collect` y `google-analytics`.
5. Tener preparada una consulta controlada de Supabase para `search_events` y, si se prueba una solicitud, `connection_requests`.

## Caso A: rechazo

- Elegir «Solo necesarias».
- Confirmar que el estado por defecto es `analytics_storage=denied`.
- Navegar por Home, búsqueda y una ficha.
- Confirmar que no se descarga GTM, no aparecen cookies `_ga` y no salen peticiones `collect`.
- Confirmar que los formularios estrictamente necesarios siguen funcionando cuando su base jurídica y finalidad no dependen del consentimiento analítico.

## Caso B: aceptación

- Elegir «Permitir analítica».
- Confirmar que `analytics_storage` cambia a `granted` antes de enviar eventos.
- Ejecutar una búsqueda con categoría y municipio.
- Abrir un resultado, guardar y quitar favorito, compartir, pulsar una salida externa y enviar una solicitud de prueba cuando exista una cuenta preparada.
- Comprobar en `dataLayer` que cada evento contiene `event_id`, `event_timestamp`, `schema_version` y, cuando proceda, `search_id`, `profile_id`, `category_id`, `vertical_id` y `municipality_id`.
- Comprobar que ningún payload contiene email, teléfono, dirección exacta, nombre, mensaje ni texto libre de búsqueda.
- Confirmar en DebugView un solo evento por acción y anotar cualquier duplicado.

## Caso C: cambio de preferencias

- Cambiar a «Solo necesarias» desde la página de cookies.
- Confirmar que las acciones posteriores dejan de enviar eventos a GA4 sin impedir la navegación.
- Volver a concederlo y confirmar que la medición se reanuda sin duplicar el primer evento.

## Contraste con Supabase

- Para búsqueda, contrastar el `search_id`, categoría, municipio, número de resultados y hora con la fila persistida.
- Para solicitud, contrastar `request_id`, ficha, categoría, municipio, estado y `created_at`.
- No comparar el total bruto de `page_view` con búsquedas o solicitudes: son poblaciones distintas.
- Documentar fecha, navegador, entorno, usuario de prueba, resultado y capturas de GTM/GA4/Supabase.

## Criterio de aprobación

La medición solo se considera operativa cuando rechazo, aceptación, cambio de preferencias, ausencia de PII, ausencia de duplicados y recepción en GA4 se han comprobado en una misma ronda. La creación de etiquetas o la presencia de eventos en `dataLayer` por sí solas no bastan.
