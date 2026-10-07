# Implementación analítica de Tenlo

Estado: Cookiebot, GA4 y GTM de Tenlo creados y conectados en producción; rechazo verificado sin carga de Google. El informe base de Looker Studio está creado y conectado a la propiedad GA4 de Tenlo. Pendientes la prueba positiva en DebugView, las dimensiones personalizadas y construir las vistas cuando haya datos.

Definiciones, fórmulas y estructura de informes: [Catálogo de KPIs y reporting](./CATALOGO-DE-KPIS-Y-REPORTING.md).

## Arquitectura y responsabilidades

| Capa | Responsabilidad | No debe hacer |
| --- | --- | --- |
| Cookiebot + Consent Mode | Recoger preferencias y controlar almacenamiento | Guardar datos de producto |
| `dataLayer` + GTM | Transportar eventos con nombres estables y activar etiquetas | Recibir PII o texto libre |
| GA4 | Adquisición, navegación y funnels agregados | Ser CRM o fuente de conexiones útiles |
| Supabase | Búsquedas saneadas, solicitudes, respuestas, resultados y consentimientos | Exponer PII en vistas públicas |
| Looker Studio | Visualizar KPIs combinando fuentes preparadas | Definir métricas distintas en cada gráfico |

## Orden de activación

1. [x] Crear propiedad GA4 de Tenlo y un flujo web de producción para `https://tenlo.es`.
2. [x] Crear un contenedor web de GTM propiedad de Tenlo.
3. [x] Configurar y publicar la etiqueta base de Google/GA4. La aplicación no descarga GTM hasta que Cookiebot concede consentimiento estadístico.
4. Crear variables de capa de datos para `schema_version`, `event_id`, `page_type`, `provider_id`/`item`, `category`, `municipality`, `search_id`, `result_count` y `zero_results`.
5. Crear triggers de evento personalizado siguiendo `DICCIONARIO-DE-EVENTOS.md`; no usar selectores CSS como fuente principal.
6. [x] Configurar `NEXT_PUBLIC_GTM_ID` solo en producción. Cookiebot está disponible también en preview, pero GTM no mide ese entorno.
7. Validar rechazo, aceptación y cambio de preferencias con Cookiebot, GTM Preview, DevTools y GA4 DebugView. El 07/10/2026 se verificó que el rechazo no descarga GTM ni scripts de Google y que, al permitir solo estadísticas, se cargan el contenedor y la etiqueta de Google correctos. Falta confirmar eventos en DebugView.
8. Aplicar `0009_analytics_foundations.sql` y comprobar la escritura de búsquedas sin PII. Aplicada y verificada el 07/10/2026; la vista interna no concede `SELECT` a `anon` ni `authenticated`.
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

- Rechazar cookies: no aparecen cookies `_ga` y las etiquetas de GA4 no se activan con almacenamiento concedido.
- Aceptar estadísticas: Consent Mode cambia `analytics_storage` a `granted` y GA4 recibe eventos de prueba.
- Cambiar preferencias: el nuevo estado se propaga sin necesitar crear otra cuenta.
- Ningún payload contiene nombre, email, teléfono, dirección exacta, texto de búsqueda libre o datos de menores.
- Un evento crítico tiene un único `event_id`; cliente y servidor no duplican conversiones.
- Producción y preview no mezclan tráfico.
- Las cifras de Looker Studio coinciden con una consulta controlada de Supabase para el mismo periodo.

## Configuración activa desde el 07/10/2026

- Cookiebot separado en la cuenta de Tenlo y dominio `tenlo.es` verificado como activo.
- Banner en español con una explicación ajustada al uso actual: cookies necesarias y estadísticas opcionales, sin publicidad.
- La cuenta muestra una prueba Premium de 14 días; antes de que termine hay que revisar el plan resultante y confirmar que no se activa ningún coste.
- GA4 con medición mejorada desactivada para evitar duplicados con los eventos explícitos de producto.
- GTM publicado con la etiqueta base y `send_page_view=false`; la aplicación envía `page_view` y los eventos de producto con sus parámetros tras el consentimiento.
- El evento genérico creado durante la configuración quedó pausado para evitar duplicar los eventos enviados por la aplicación.
- Identificadores públicos almacenados como variables de tipo configuración en Vercel, no como secretos.
- Informe `Tenlo - adquisición, búsqueda y conexiones` creado en Looker Studio y conectado a la propiedad GA4 `Tenlo` (`558009522`). No se añaden todavía gráficos que puedan aparentar datos hasta confirmar la recepción de eventos.
- La prueba consentida cargó GTM y la etiqueta de Google, pero el informe en tiempo real de GA4 seguía en cero el 07/10/2026. Se mantiene abierta la comprobación de recepción antes de declarar operativa la medición.
