# Definiciones operativas del piloto de Tenlo

Versión inicial: 13 de octubre de 2026. Estas definiciones permiten operar y medir el piloto de forma consistente; deben revisarse con evidencia real tras la primera cohorte.

## Foco y orden de activación

1. Actividades extraescolares, música, arte y ocio educativo.
2. Apoyo escolar, clases particulares e idiomas ofrecidos por organizaciones o profesionales con presencia verificable.
3. Deporte y centros deportivos con oferta familiar vigente.
4. Tecnología y creatividad.
5. Campamentos y días sin cole cuando haya oferta de temporada actualizada.
6. Como oferta complementaria, salud mental familiar/infantil, odontología y otros servicios sanitarios con credenciales contrastables.

Quedan fuera de la activación inicial los canguros particulares, el intercambio entre familias de uniformes o libros, el transporte y cualquier proveedor sin identidad profesional verificable. Las fichas editoriales de centros educativos pueden seguir visibles como contenido útil, pero no cuentan como oferta activa del piloto salvo que acepten solicitudes.

El piloto se abre a familias cuando existan al menos diez proveedores `Activos`, repartidos en un mínimo de dos categorías prioritarias y dos municipios. No basta con acumular fichas publicadas.

## Necesidad y propuesta de valor

- **Necesidad:** encontrar y contactar una opción familiar cercana, adecuada y suficientemente actualizada sin reconstruir la información en múltiples webs.
- **Opción adecuada:** coincide con la categoría, municipio o cobertura, edad o etapa aplicable y disponibilidad general; muestra una vía de contacto vigente y un nivel de confianza comprensible.
- **Familias:** “Encuentra y contacta actividades y servicios familiares cercanos con información comparable, procedencia visible y datos pendientes claramente señalados.”
- **Proveedores:** “Mantén una ficha clara y gratuita durante el piloto, recibe solicitudes contextualizadas y conoce qué interés genera tu oferta sin promesas de resultados.”

## Estados de una ficha o proveedor

Los estados son dimensiones distintas; no deben sustituirse entre sí.

| Estado | Definición operativa |
|---|---|
| `Reclamado` | Tenlo ha comprobado la relación de la persona con la entidad y ha aprobado la reclamación. No implica verificación completa. |
| `Completo` | La ficha tiene identidad, categoría, municipio/cobertura, descripción, modalidad, edades aplicables, vía de contacto, disponibilidad general, fuente y fecha de revisión. Los campos no aplicables están marcados como tales y no quedan incógnitas críticas. |
| `Verificado` | Tenlo ha contrastado identidad, contacto, servicio y credenciales aplicables con evidencias suficientes según `CRITERIOS-DE-CONFIANZA.md`. Una web oficial por sí sola no basta. |
| `Publicado` | La ficha superó moderación, tiene estado visible y puede consultarse públicamente. Puede seguir sin estar reclamada o activa. |
| `Activo` | Está publicada, acepta solicitudes, tiene una vía operativa y confirmó disponibilidad o revisión en los últimos 30 días. |
| `Inactivo` | No acepta solicitudes, comunica falta de disponibilidad, tiene un bloqueo operativo o no ha confirmado su vigencia en más de 30 días. Puede mantenerse visible si sigue aportando información y su estado se explica. |

## Solicitud relevante

Una solicitud es relevante cuando:

- procede de una persona adulta autenticada;
- corresponde a la categoría y zona o cobertura del proveedor;
- aporta contexto suficiente para valorar el encaje sin identificar a menores;
- no es spam, duplicado, prueba interna, publicidad ni una petición ajena al servicio;
- respeta las condiciones de uso y seguridad.

El proveedor puede marcarla como irrelevante con un motivo estructurado. Javier, como responsable operativo inicial, revisa discrepancias y decide su inclusión en métricas. Los fallos de entrega atribuibles a Tenlo no penalizan al proveedor.

## SLA y conexión útil

- El SLA inicial de primera respuesta es de **48 horas naturales** desde la entrega efectiva al proveedor.
- El plazo operativo de reclamaciones, correcciones y retiradas es de **cuatro días laborables**.
- Una **conexión útil** es una solicitud relevante y entregada a un proveedor adecuado que recibe dentro del SLA una respuesta con disponibilidad, una alternativa concreta o un siguiente paso accionable, y cuya utilidad confirma al menos una de las partes.
- Una llamada, clic, visita web, email abierto o respuesta automática no constituye por sí solo una conexión útil.

Durante el piloto se registran por separado: entrega, primera respuesta, conversación iniciada, propuesta, reserva y contratación. Respuesta y utilidad son los resultados mínimos operables; propuesta, reserva y contratación serán autodeclarados y no se presentarán como verificados salvo evidencia adicional.

## Flujo inicial

La familia contacta primero con un único proveedor. Si no hay disponibilidad o respuesta dentro del SLA, puede pedir una selección asistida a Tenlo. La plataforma no enviará automáticamente la misma solicitud a varios proveedores sin una elección explícita de la familia.
