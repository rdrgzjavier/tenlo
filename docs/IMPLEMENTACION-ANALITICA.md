# Implementación analítica de Tenlo

Estado: GA4 y GTM de Tenlo están creados y conectados. El 28/10/2026 una prueba limpia en Chrome detectó que Cookiebot había pausado el banner al terminar su prueba Premium y exigía un plan de 30 €/mes por las 446 URL detectadas. Para mantener el MVP sin coste se sustituyó por un consentimiento propio de Tenlo: denegado por defecto, sin publicidad, persistido durante doce meses y con GTM descargado únicamente tras aceptar analítica. El informe base de Looker Studio está conectado a la propiedad GA4 de Tenlo. Queda repetir en producción la recepción de eventos tras el despliegue de esta sustitución, registrar las dimensiones personalizadas y construir las vistas cuando haya datos.

Definiciones, fórmulas y estructura de informes: [Catálogo de KPIs y reporting](./CATALOGO-DE-KPIS-Y-REPORTING.md).

Procedimiento reproducible de validación: [QA de analítica y consentimiento](./QA-ANALITICA.md).

## Arquitectura y responsabilidades

| Capa | Responsabilidad | No debe hacer |
| --- | --- | --- |
| Consentimiento propio + Consent Mode | Recoger la elección estadística y controlar almacenamiento | Guardar datos de producto o activar publicidad |
| `dataLayer` + GTM | Transportar eventos con nombres estables y activar etiquetas | Recibir PII o texto libre |
| GA4 | Adquisición, navegación y funnels agregados | Ser CRM o fuente de conexiones útiles |
| Supabase | Búsquedas saneadas, solicitudes, respuestas, resultados y consentimientos | Exponer PII en vistas públicas |
| Looker Studio | Visualizar KPIs combinando fuentes preparadas | Definir métricas distintas en cada gráfico |

## Orden de activación

1. [x] Crear propiedad GA4 de Tenlo y un flujo web de producción para `https://tenlo.es`.
2. [x] Crear un contenedor web de GTM propiedad de Tenlo.
3. [x] Configurar y publicar la etiqueta base de Google/GA4. La aplicación no descarga GTM hasta que el usuario concede consentimiento estadístico.
4. Crear variables de capa de datos para `schema_version`, `event_id`, `page_type`, `provider_id`/`item`, `profile_id`, `category_id`, `vertical_id`, `municipality_id`, `search_id`, `result_count` y `zero_results`. La aplicación ya añade de forma central `category_id`, `vertical_id`, `municipality_id` y `profile_id` cuando existen sus datos de origen; falta registrar estas dimensiones personalizadas en GA4/GTM.
5. Crear triggers de evento personalizado siguiendo `DICCIONARIO-DE-EVENTOS.md`; no usar selectores CSS como fuente principal.
6. [x] Configurar `NEXT_PUBLIC_GTM_ID` solo en producción; GTM no mide preview.
7. Validar rechazo, aceptación y cambio de preferencias con Chrome limpio, GTM Preview, DevTools y GA4 DebugView. El 28/10/2026 la prueba externa confirmó que el bloqueo era la pausa comercial de Cookiebot, no la taxonomía: con consentimiento reproducido, `page_view` y `provider_profile_viewed` entraban correctamente en `dataLayer`. Falta repetir la captura `collect` y la recepción en GA4 después de desplegar el gestor propio.
8. Aplicar `0009_analytics_foundations.sql` y comprobar la escritura de búsquedas sin PII. Aplicada y verificada el 07/10/2026; la vista interna no concede `SELECT` a `anon` ni `authenticated`.
   La migración `0015_critical_event_envelopes.sql` se aplicó y verificó el 13/10/2026: solicitudes y reclamaciones tienen `event_id` único, `schema_version` y `created_at` generado por servidor.
9. Marcar como eventos clave iniciales `request_created` y `claim_submitted` después de descartar duplicados.
10. [x] Crear el informe base de Looker Studio y conectarlo exclusivamente a la propiedad GA4 de Tenlo.
11. Construir sus vistas de adquisición y comportamiento cuando GA4 reciba datos, y añadir después vistas agregadas/exportaciones controladas de Supabase para operación y valor.

## Informes mínimos antes de ofrecer reporting a proveedores

- Demanda: búsquedas, cero resultados y municipios/categorías con oferta insuficiente.
- Ficha: impresiones, aperturas, CTR, guardados, inicios de contacto y solicitudes.
- Respuesta: solicitudes recibidas, tasa y tiempo de respuesta, relevancia y conexión útil.
- Calidad: completitud, frescura, estado de confianza e incidencias.
- Comparativa: benchmark agregado solo con un umbral mínimo que evite identificar a terceros.

El informe de proveedor debe separar claramente visibilidad, interés, contactos y resultados. Un clic o una visita no se presentará como cliente conseguido.

## QA obligatorio

La matriz de fuentes, deduplicación y casos paso a paso se mantiene en `QA-ANALITICA.md`.

- Rechazar cookies: no aparecen cookies `_ga` y las etiquetas de GA4 no se activan con almacenamiento concedido.
- Aceptar estadísticas: Consent Mode cambia `analytics_storage` a `granted` y GA4 recibe eventos de prueba.
- Cambiar preferencias: el nuevo estado se propaga sin necesitar crear otra cuenta.
- Ningún payload contiene nombre, email, teléfono, dirección exacta, texto de búsqueda libre o datos de menores.
- Un evento crítico tiene un único `event_id`; cliente y servidor no duplican conversiones.
- Producción y preview no mezclan tráfico.
- Las cifras de Looker Studio coinciden con una consulta controlada de Supabase para el mismo periodo.

## Configuración preparada el 28/10/2026

- Gestor propio de Tenlo, sin coste recurrente, con cookies necesarias y estadísticas opcionales, sin publicidad y sin widget flotante tras decidir.
- La elección se conserva en la cookie técnica `tenlo_analytics_consent` durante doce meses y puede reabrirse desde `/cookies`, donde el gestor muestra el estado vigente y permite modificarlo.
- La primera capa ofrece `Rechazar`, `Configurar` y `Aceptar`. Aceptar y rechazar tienen el mismo tamaño y peso visual; configurar abre directamente el panel granular de cookies necesarias y analíticas, con una acción explícita para guardar la selección.
- La API de eventos propios exige además la cookie `tenlo_analytics_consent=accepted` en el servidor. La escritura utiliza `INSERT` bajo RLS y no amplía permisos con `UPSERT`, `UPDATE` ni `SELECT` públicos.
- Cookiebot queda retirado: la prueba Premium terminó, el banner fue pausado y no se contrató el plan de 30 €/mes.
- GA4 con medición mejorada desactivada para evitar duplicados con los eventos explícitos de producto.
- GTM publicado con la etiqueta base y `send_page_view=false`; la aplicación envía `page_view` y los eventos de producto con sus parámetros tras el consentimiento.
- La etiqueta genérica `GA4 - Eventos Tenlo` está activa en la versión 3 del contenedor y transforma los eventos consentidos de `dataLayer` en eventos de GA4.
- El cargador condicionado al consentimiento emite el evento estándar `gtm.js` con `gtm.start` justo antes de descargar el contenedor. Así GTM conserva su secuencia de inicialización normal aunque se cargue después de aceptar la analítica.
- Identificadores públicos almacenados como variables de tipo configuración en Vercel, no como secretos.
- Informe `Tenlo - adquisición, búsqueda y conexiones` creado en Looker Studio y conectado a la propiedad GA4 `Tenlo` (`558009522`). No se añaden todavía gráficos que puedan aparentar datos hasta confirmar la recepción de eventos.
- Verificación de producción completada el 29/10/2026: con rechazo hubo 0 cargas de GTM y 0 peticiones `collect`; con aceptación se creó la preferencia propia, se cargó GTM, aparecieron las cookies `_ga`, se observaron tres peticiones `collect` sin 4xx y GA4 Tiempo real mostró `page_view` y `provider_profile_viewed` para las páginas probadas.
