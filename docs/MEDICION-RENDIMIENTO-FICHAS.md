# Medición del rendimiento de fichas

Fecha de diseño técnico: 23 de octubre de 2026.

## Objetivo

Conservar en Supabase un histórico operativo por ficha que permita responder, por periodo, a estas preguntas:

- cuántas veces apareció una ficha en resultados;
- cuántas aperturas y visitas recibió;
- cuántas intenciones de contacto, solicitudes, guardados y compartidos generó;
- qué categoría, vertical y municipio explican ese tráfico;
- qué parte de la demanda puede relacionarse mediante un `search_id` anónimo.

GA4 seguirá siendo la herramienta de adquisición y uso agregado. Supabase será la fuente del histórico por ficha, porque no conviene depender de dimensiones de alta cardinalidad en GA4 para elaborar informes de proveedor.

## Privacidad y consentimiento

La persistencia solo se inicia cuando `analytics_storage` ha sido aceptado. La tabla `directory_events` no guarda:

- nombres, alias o identificadores de cuenta;
- emails, teléfonos, direcciones o mensajes;
- texto libre de búsquedas;
- IP, agente de usuario o URL completa de referencia.

Cada evento contiene un identificador aleatorio de sesión del navegador, la ficha, dimensiones estables y, cuando existe, el `search_id`. La sesión se limita a `sessionStorage` y desaparece al cerrar la pestaña o sesión del navegador.

## Eventos persistidos

- impresión y apertura desde resultados;
- primera visita de ficha por sesión;
- inicio y finalización de contacto;
- solicitud creada;
- clic en teléfono, email, web o mapa;
- guardado, retirada de favorito y compartido.

Los eventos se deduplican por `event_id` y nombre. Esto permite que una misma conversión técnica alimente dos hitos diferentes, por ejemplo `contact_form_completed` y `request_created`, sin duplicar reintentos de red.

## Informe administrativo

La ruta privada `/admin/rendimiento` permite elegir el periodo y separa:

- sesiones observadas;
- impresiones;
- aperturas;
- visitas de ficha;
- CTR desde resultados;
- intenciones de contacto;
- tasa de contacto sobre visita;
- solicitudes y guardados.

Las tasas no se muestran con menos de 20 observaciones en el denominador. El informe no crea rankings ni interpreta una muestra insuficiente como falta de interés.

## Estado de implantación

- `0024_directory_performance_events.sql` aplicada en Supabase con RLS y escritura pública limitada a `INSERT`.
- Código, persistencia e informes desplegados y validados mediante typecheck, lint, build y prueba limpia en producción.
- El 29/10/2026 se confirmó que el rechazo no persiste eventos ni carga Google y que, tras aceptar, `page_view` y `provider_profile_viewed` llegan al `dataLayer` y el endpoint propio responde sin errores 4xx.
- El informe ya relaciona visibilidad con solicitudes, primeras respuestas, tiempos de respuesta, valoración de utilidad y fecha de revisión de la ficha.
- Sigue pendiente observar una petición `collect` y la recepción en tiempo real de GA4 antes de declarar completa la capa externa de analítica.
