# Catálogo de KPIs y reporting de Tenlo

Versión: `1.0`  
Ámbito inicial: piloto de Madrid noroeste.

Este documento fija una definición única para producto, GA4, Supabase y Looker Studio. Los dashboards no deben redefinir una métrica: solo representarla.

## Reglas comunes

- Zona horaria: `Europe/Madrid`.
- Periodos estándar: últimos 7, 28 y 90 días y comparación con el periodo anterior equivalente.
- Cada persona, sesión, búsqueda, ficha, proveedor o solicitud se cuenta por su identificador estable; nunca por nombre o email.
- GA4 no recibe nombres, emails, teléfonos, direcciones precisas, texto libre ni información de menores.
- `0` significa que se midió y no ocurrió; `Sin dato`, que todavía no existe medición suficiente; `No aplicable`, que la métrica no corresponde.
- Una visita, clic o contacto iniciado no se presenta como cliente, reserva ni conexión útil.
- Los benchmarks de terceros solo se mostrarán agregados cuando haya al menos 10 proveedores y 30 eventos en el segmento y periodo.

## North Star y liquidez

| KPI | Definición y fórmula | Fuente | Frecuencia | Responsable | Limitación inicial |
| --- | --- | --- | --- | --- | --- |
| Conexiones útiles mensuales | Solicitudes relevantes respondidas dentro de 48 horas y valoradas como útiles, o con resultado confirmado, durante 28 días | Supabase | Diaria | Tenlo | Requiere recoger respuesta y utilidad |
| Tasa de conexión útil | Conexiones útiles / solicitudes entregadas elegibles | Supabase | Diaria | Tenlo | No mezclar solicitudes canceladas o spam |
| Cobertura de demanda | Búsquedas con al menos una opción adecuada / búsquedas registradas | Supabase | Diaria | Tenlo | La adecuación necesita criterios por vertical |
| Fill rate | Solicitudes entregadas a un proveedor disponible / solicitudes creadas válidas | Supabase | Diaria | Tenlo | Disponibilidad debe estar actualizada |
| Respuesta dentro del SLA | Solicitudes con primera respuesta en 48 h / solicitudes entregadas | Supabase | Diaria | Tenlo y proveedor | Excluir fallos de entrega atribuibles a Tenlo |
| Oferta activa | Proveedores publicados, disponibles y actualizados dentro del umbral acordado | Supabase | Diaria | Tenlo | El umbral de actividad debe validarse en piloto |
| Demanda no atendida | Búsquedas con cero resultados más solicitudes sin proveedor disponible, sin duplicar una misma necesidad | Supabase | Diaria | Tenlo | La deduplicación inicial será aproximada |

## Buscador y adquisición

| KPI | Definición y fórmula | Fuente | Frecuencia | Responsable | Limitación inicial |
| --- | --- | --- | --- | --- | --- |
| Búsquedas | `search_results_viewed` únicos por `search_id` | GA4 + Supabase | Diaria | Producto | El texto libre solo se conserva saneado en backend |
| Tasa de cero resultados | Búsquedas con `zero_results=true` / búsquedas | Supabase | Diaria | Producto | Comparar por categoría y municipio |
| CTR de resultados | `result_opened` / impresiones visibles de resultado | GA4 | Diaria | Producto | Requiere activar `result_impression` |
| Profundidad de búsqueda | Fichas abiertas / búsqueda | GA4 | Semanal | Producto | No mide por sí sola calidad |
| Conversión búsqueda-solicitud | Solicitudes creadas con `search_id` / búsquedas | GA4 + Supabase | Semanal | Producto | Requiere atribuir `search_id` a la solicitud |
| Adquisición activada | Usuarios que realizan una acción de valor / usuarios adquiridos por canal | GA4 | Semanal | Marketing | Depende del consentimiento estadístico |
| Demanda por segmento | Búsquedas por vertical, categoría, municipio y periodo | Supabase | Diaria | Producto y captación | No mostrar texto individual al proveedor |

## Informe de ficha para proveedores

El informe se divide en cuatro bloques para que el proveedor entienda dónde se genera o pierde valor.

### 1. Visibilidad

| KPI | Definición y fórmula | Fuente | Mostrar al proveedor |
| --- | --- | --- | --- |
| Impresiones | Veces que la ficha entra en el área visible de un listado | GA4 | Total y evolución |
| Aperturas de ficha | Vistas únicas de la ficha por sesión | GA4 | Total y evolución |
| CTR de ficha | Aperturas desde resultados / impresiones | GA4 | Porcentaje, con muestra |
| Procedencia | Distribución por buscador, vertical, zona y canal no identificativo | GA4 | Porcentajes agregados |

### 2. Interés

| KPI | Definición y fórmula | Fuente | Mostrar al proveedor |
| --- | --- | --- | --- |
| Guardados | Altas netas en favoritos durante el periodo | Supabase | Total; sin identificar usuarios |
| Clics web | Pulsaciones hacia la web oficial | GA4 | Total |
| Clics teléfono | Pulsaciones en llamar | GA4 | Total |
| Cómo llegar | Aperturas del mapa o indicaciones | GA4 | Total para fichas con ubicación pública |
| Contactos iniciados | Aperturas del flujo interno de contacto | GA4 + Supabase | Total |

### 3. Oportunidades y respuesta

| KPI | Definición y fórmula | Fuente | Mostrar al proveedor |
| --- | --- | --- | --- |
| Solicitudes recibidas | Solicitudes válidas entregadas al proveedor | Supabase | Total y estado |
| Tasa de respuesta | Solicitudes con respuesta / solicitudes entregadas | Supabase | Porcentaje |
| Tiempo de primera respuesta | Mediana y p75 entre entrega y primera respuesta | Supabase | Horas, solo con muestra suficiente |
| Relevancia | Solicitudes valoradas como relevantes / solicitudes valoradas | Supabase | Porcentaje y base |
| Conexiones útiles | Solicitudes que cumplen la definición de North Star | Supabase | Total, nunca inferido desde clics |

### 4. Calidad de la ficha

| KPI | Definición y fórmula | Fuente | Mostrar al proveedor |
| --- | --- | --- | --- |
| Completitud | Campos relevantes completos / campos aplicables de su plantilla | Supabase | Porcentaje y campos pendientes |
| Frescura | Días desde la última confirmación de datos | Supabase | Fecha y aviso si está desactualizada |
| Confianza | Estado `No verificada`, `Gestionada`, `Verificada` u `Oficial` | Supabase | Estado y siguiente acción |
| Incidencias | Correcciones o reportes abiertos durante el periodo | Supabase | Estado, sin datos del informante |

## Páginas mínimas de Looker Studio

1. **Dirección:** North Star, cobertura, fill rate, respuesta, oferta activa y alertas.
2. **Demanda:** búsquedas, cero resultados, categorías, municipios, tendencias y propuestas recibidas.
3. **Oferta:** proveedores por estado, vertical, municipio, completitud, frescura y disponibilidad.
4. **Funnel familiar:** búsqueda, apertura, contacto, solicitud, respuesta y conexión útil.
5. **Funnel proveedor:** captación, visita, reclamación, aprobación, publicación, primera solicitud y primera respuesta.
6. **Ficha de proveedor:** los cuatro bloques anteriores con selector de proveedor y periodo.
7. **Calidad de medición:** eventos sin identificador, duplicados, datos retrasados y cambios de versión.

## Controles y acceso

- El proveedor solo accede a sus fichas y a benchmarks agregados; nunca a datos de otros proveedores ni a usuarios identificables.
- El dashboard interno puede filtrar por proveedor, pero la versión compartida debe aplicar control de acceso o generarse como informe individual.
- Los datos operativos llegan a Looker mediante vistas agregadas o una exportación controlada, no conectando tablas con información personal.
- Cualquier cambio de fórmula incrementa la versión del catálogo y se anota con fecha en el dashboard.

## Dependencias para activar el primer informe real

- Cookiebot configurado con un ID real y consentimiento validado.
- Contenedor GTM y propiedad GA4 propiedad de Tenlo.
- `NEXT_PUBLIC_GTM_ID` configurado únicamente tras superar QA.
- Eventos de impresión, búsqueda, apertura, contacto y solicitud validados sin duplicados.
- Estados de entrega, respuesta, relevancia y utilidad persistidos en Supabase.
- Al menos un periodo piloto con datos suficientes; antes de eso, el dashboard se presenta como muestra sin cifras ficticias.
