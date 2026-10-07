# Implementación analítica de Tenlo

Estado: base técnica y migración de búsqueda desplegadas; cuentas de GA4/GTM y validación de etiquetas pendientes.

## Arquitectura y responsabilidades

| Capa | Responsabilidad | No debe hacer |
| --- | --- | --- |
| Cookiebot + Consent Mode | Recoger preferencias y controlar almacenamiento | Guardar datos de producto |
| `dataLayer` + GTM | Transportar eventos con nombres estables y activar etiquetas | Recibir PII o texto libre |
| GA4 | Adquisición, navegación y funnels agregados | Ser CRM o fuente de conexiones útiles |
| Supabase | Búsquedas saneadas, solicitudes, respuestas, resultados y consentimientos | Exponer PII en vistas públicas |
| Looker Studio | Visualizar KPIs combinando fuentes preparadas | Definir métricas distintas en cada gráfico |

## Orden de activación

1. Crear propiedad GA4 de Tenlo y un flujo web de producción para `https://tenlo.es`.
2. Crear un contenedor web de GTM propiedad de Tenlo.
3. Configurar en GTM una etiqueta de Google/GA4 condicionada al consentimiento `analytics_storage`.
4. Crear variables de capa de datos para `schema_version`, `event_id`, `page_type`, `provider_id`/`item`, `category`, `municipality`, `search_id`, `result_count` y `zero_results`.
5. Crear triggers de evento personalizado siguiendo `DICCIONARIO-DE-EVENTOS.md`; no usar selectores CSS como fuente principal.
6. Configurar `NEXT_PUBLIC_GTM_ID` solo en producción; preview permanece sin medición o usa un contenedor separado.
7. Validar rechazo, aceptación y cambio de preferencias con Cookiebot, GTM Preview, DevTools y GA4 DebugView.
8. Aplicar `0009_analytics_foundations.sql` y comprobar la escritura de búsquedas sin PII. Aplicada y verificada el 07/10/2026; la vista interna no concede `SELECT` a `anon` ni `authenticated`.
9. Marcar como eventos clave iniciales `request_created` y `claim_submitted` después de descartar duplicados.
10. Construir Looker Studio sobre GA4 para adquisición y sobre vistas agregadas/exportaciones controladas de Supabase para operación y valor.

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
