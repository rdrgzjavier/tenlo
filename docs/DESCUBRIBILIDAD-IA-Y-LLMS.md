# Descubribilidad de Tenlo para buscadores y agentes de IA

Fecha de revisión: 24 de octubre de 2026.

## Decisión

Tenlo tratará la descubribilidad para IA como una extensión del contenido público, accesible y verificable, no como una copia paralela del producto. El orden de prioridad es:

1. HTML público claro, semántico y actualizado.
2. URLs canónicas, enlaces internos, `robots.txt` y sitemap.
3. Datos estructurados Schema.org que coincidan con lo visible.
4. Un índice editorial `/llms.txt` con las rutas y límites de uso principales.
5. Markdown alternativo por página solo si una necesidad real demuestra su utilidad y puede generarse desde la misma fuente de datos.

## Estado implementado

- `robots.txt` publica el sitemap y excluye cuenta, administración, API y rutas privadas.
- `sitemap.xml` incluye las rutas editoriales y fichas públicas.
- La web publica JSON-LD para la organización, el buscador, listados y fichas.
- `/llms.txt` utiliza Markdown, URLs absolutas, contexto, rutas prioritarias y límites de interpretación.
- `/llms.txt` se entrega como `text/markdown; charset=utf-8`.
- Las páginas enlazan el índice mediante `rel="describedby"`.
- La prueba de producción comprueba `robots.txt`, sitemap y `llms.txt`.
- El sitemap no inventa una fecha de modificación nueva para todas las URLs en cada despliegue; solo deberá publicar fechas cuando procedan de datos canónicos fiables.

## Política de rastreadores

- `OAI-SearchBot` puede mantenerse permitido si Tenlo quiere aparecer en resultados de búsqueda de ChatGPT.
- `GPTBot` se considera una decisión independiente sobre posible uso para entrenamiento; permitir búsqueda no obliga a permitir entrenamiento.
- `ChatGPT-User` responde a acciones iniciadas por una persona y no debe tratarse como sustituto del control de acceso.
- Los rastreadores de otros proveedores deben revisarse por finalidad, no por marca.
- Ninguna regla de `robots.txt` sustituye autenticación, RLS o autorización. Las áreas privadas permanecen protegidas por aplicación y base de datos.

La regla general actual permite rastrear contenido público e impide las rutas privadas conocidas. La decisión específica sobre GPTBot se mantiene abierta para que sea consciente y reversible.

## Por qué no se publica `llms-full.txt`

No forma parte de la necesidad básica del proyecto y duplicaría gran parte del directorio. Mantener una exportación masiva introduce riesgo de desactualización, extracción indiscriminada y contradicciones con las fichas visibles. Solo se reconsiderará si puede generarse automáticamente desde la fuente canónica, excluir campos privados y conservar estado de verificación, procedencia y fecha.

## Tecnología y coste

La base no requiere una plataforma nueva ni coste recurrente adicional: Next.js genera robots, sitemap y datos estructurados, mientras `llms.txt` es un archivo estático versionado. Los costes aparecerían únicamente si más adelante se contratan herramientas de monitorización de bots, generación masiva, búsqueda vectorial o infraestructura propia de API/MCP.

No se construirá un servidor MCP durante el MVP. Antes hacen falta permisos estables, datos suficientemente frescos y un contrato público de API que no permita eludir RLS, moderación o límites de uso.

## Siguientes comprobaciones

- Validar periódicamente las plantillas con herramientas de datos estructurados.
- Revisar cada trimestre la política y nombres de rastreadores.
- Tomar una decisión explícita sobre GPTBot.
- Medir tráfico identificable de bots en logs si el volumen justifica el trabajo.
- Crear Markdown alternativo por ficha solo si agentes o integraciones reales lo necesitan.
