# Backlog de producto, proveedores y medición de Tenlo

> Documento vivo para decidir, construir y comprobar el MVP de Tenlo.
>
> Última revisión: 5 de octubre de 2026.

## Cómo utilizar este documento

- Marcar una tarea solo cuando se cumpla su criterio de aceptación.
- Añadir junto a cada tarea, cuando se planifique, `Responsable:` y `Fecha objetivo:`.
- No interpretar una métrica como buena o mala sin una referencia válida.
- Separar siempre datos observados, hipótesis e interpretaciones.
- No publicar cifras, demanda, valoraciones o casos de éxito ficticios.
- No abrir nuevas zonas o categorías hasta lograr una base mínima de oferta activa en el segmento anterior.

## Objetivo inmediato

Preparar Tenlo para contactar con un grupo pequeño de proveedores reales, permitirles revisar y enriquecer su ficha, y medir desde el primer piloto si la plataforma facilita conexiones útiles con familias.

La secuencia que el MVP debe ser capaz de demostrar es:

`Una familia expresa una necesidad -> Tenlo muestra opciones adecuadas -> la familia envía una solicitud -> un proveedor responde -> ambas partes valoran si la conexión fue útil`

La prioridad no es completar todas las funcionalidades de un marketplace. Es demostrar esta secuencia en una categoría y una zona concretas, aprender y después ampliar.

---

## Estado auditado

### GitHub

- Repositorio: `rdrgzjavier/tenlo`.
- Rama de producción: `main`.
- Último commit revisado: `c2d12c9` (`Mejora perfiles de canguros`).
- Aplicación en Next.js 14, React 18, TypeScript y Tailwind.
- `typecheck` y `lint` pasan correctamente.
- El contenido público continúa dependiendo de `src/lib/mock-data.ts`.
- Existen cinco migraciones de Supabase para perfiles, publicaciones, eventos de contacto, solicitudes de reclamación y feedback.
- Hay autenticación y algunas páginas conectadas a Supabase, pero no una fuente de datos real unificada para el directorio.
- La reclamación de ficha se guarda en Supabase y envía emails, pero exige iniciar sesión antes de enviar la solicitud.
- Los CTAs de contacto no siguen un único flujo: algunos abren web, email o teléfono y el de canguros no crea aún una solicitud operativa.
- Favoritos mezcla una señal local de sesión con datos de Supabase y todavía no representa un flujo completo.
- GTM está cargado y existen eventos básicos en `dataLayer`, pero actualmente miden sobre todo clics y envíos, no el resultado completo de la conexión.
- El build local compila código, pero falla en el prerender de `/publicar`, `/area-personal`, `/datos-cuenta`, `/favoritos` y `/mis-publicaciones` si faltan variables de Supabase.
- La auditoría de dependencias detecta avisos de seguridad altos/críticos en la rama actual de Next.js y dependencias transitivas. Debe actualizarse y volver a auditarse antes de captar usuarios reales.

### Vercel y dominio

- GitHub registra como correcto el último despliegue de producción de Vercel.
- El despliegue concreto está protegido por autenticación de Vercel.
- El alias público `https://kiryco.vercel.app` responde correctamente.
- El código todavía utiliza `https://kiryco.vercel.app` como dominio actual.
- `tenlo.es` y `www.tenlo.es` siguen apuntando al parking de DonDominio, no a Vercel.
- No se ha podido auditar desde este entorno la matriz completa de variables de Vercel. Debe comprobarse manualmente en producción, preview y desarrollo.

---

# Fase 0 — Decisiones de producto que desbloquean el MVP

Estas decisiones deben cerrarse antes de construir más superficie.

## Segmento inicial y propuesta de valor

- [ ] Elegir una única combinación inicial de municipio y categoría.
  - Criterio: existe una razón clara para empezar ahí y una lista alcanzable de proveedores.
  - Decidir: `[municipio] + [categoría] + [tipo de familia/necesidad]`.
- [ ] Definir la necesidad concreta que Tenlo ayuda a resolver en ese segmento.
- [ ] Definir qué significa una opción adecuada para esa necesidad.
- [ ] Definir la propuesta de valor para la familia en una frase.
- [ ] Definir la propuesta de valor para el proveedor en una frase.
- [ ] Fijar el número mínimo de proveedores activos necesarios para iniciar el piloto.
- [ ] Fijar qué categorías quedan expresamente fuera del primer piloto.

## Definiciones operativas

- [ ] Definir **conexión útil**.
  - Propuesta inicial: solicitud suficientemente cualificada, enviada a un proveedor adecuado y respondida dentro del plazo acordado.
- [ ] Definir cuándo un proveedor está **reclamado**, **completo**, **verificado**, **publicado**, **activo** e **inactivo**.
- [ ] Definir un SLA inicial de respuesta: `[24/48/72 horas]`.
- [ ] Definir qué constituye una solicitud relevante y quién puede marcarla como irrelevante.
- [ ] Definir qué resultado se puede medir durante el piloto: respuesta, conversación, propuesta, reserva o contratación.
- [ ] Mantener separados `Verified` y `Pro`.
  - `Verified`: confianza comprobable.
  - `Pro`: plan comercial con herramientas o beneficios adicionales.
- [ ] Decidir si la reclamación de ficha requiere cuenta desde el principio.
  - Recomendación para el piloto: permitir una solicitud inicial sin registro y verificar la identidad después, para reducir fricción.
- [ ] Decidir si la familia contacta a un proveedor, a varios o pide a Tenlo una selección asistida.

---

# Fase 1 — Imprescindible antes de contactar proveedores

## P0. Infraestructura, seguridad y despliegue

- [ ] Actualizar Next.js y dependencias a versiones soportadas sin avisos críticos conocidos.
- [ ] Repetir `npm audit`, `typecheck`, `lint` y `build` tras la actualización.
- [ ] Hacer que el build falle con un mensaje claro o degrade de forma segura cuando falten variables de Supabase; evitar fallos durante el prerender.
- [ ] Crear `.env.example` sin secretos con todas las variables requeridas y su finalidad.
- [ ] Documentar variables por entorno: local, preview y production.
- [ ] Confirmar en Vercel la presencia de Supabase, Resend, Cookiebot, URL pública y correo administrativo en los tres entornos.
- [ ] Conectar `tenlo.es` y `www.tenlo.es` a Vercel.
- [ ] Definir dominio canónico y redirección única entre `www` y raíz.
- [ ] Sustituir `kiryco.vercel.app` en configuración, metadata, emails, sitemap y enlaces absolutos.
- [ ] Verificar SSL, sitemap, robots, canonical y Open Graph en el dominio definitivo.
- [ ] Añadir una comprobación automática en GitHub para `typecheck`, `lint` y `build` en cada cambio.
- [ ] Decidir si los previews deben permanecer protegidos y mantener producción pública.

## P0. Veracidad y confianza del contenido actual

- [ ] Eliminar cifras por defecto que puedan parecer reales, como las `100` familias registradas.
- [ ] Revisar el mensaje `100% moderado y seguro`; sustituirlo por una afirmación demostrable.
- [ ] Revisar cada ficha mock antes de hacerla pública como ficha real.
- [ ] No considerar una web oficial como verificación suficiente por sí sola.
- [ ] Definir los criterios y evidencias de cada nivel: `collected`, `verified`, `official`.
- [ ] Mostrar en cada ficha la fuente, fecha de última revisión y estado de control por el proveedor cuando corresponda.
- [ ] Crear un mecanismo sencillo para solicitar corrección, retirada o actualización.
- [ ] Revisar derechos de uso de imágenes remotas y evitar presentar imágenes genéricas como si fueran del proveedor.
- [ ] Revisar textos sobre reserva: Tenlo no debe afirmar que permite reservar hasta que exista ese flujo.

## P0. Modelo de datos real

- [ ] Elegir Supabase como fuente de verdad definitiva o documentar otra alternativa.
- [ ] Eliminar la dependencia del directorio de `mock-data.ts` mediante una capa de acceso a datos.
- [ ] Crear una migración/importación controlada para las fichas iniciales.
- [ ] Normalizar proveedores, servicios, categorías, municipios y zonas de cobertura.
- [ ] Añadir a proveedor/ficha:
  - [ ] estado de reclamación;
  - [ ] estado de publicación;
  - [ ] nivel de confianza;
  - [ ] plan comercial independiente;
  - [ ] fecha de última revisión;
  - [ ] fuente y URL de la fuente;
  - [ ] porcentaje de ficha completa;
  - [ ] disponibilidad para recibir solicitudes;
  - [ ] categorías y zonas aceptadas;
  - [ ] preferencias de contacto;
  - [ ] motivo de inactividad o rechazo.
- [ ] Añadir historial de cambios y responsable de cada modificación.
- [ ] Definir reglas RLS y permisos para proveedor, familia, moderación y administración.
- [ ] Crear copias de seguridad y procedimiento de recuperación.

## P0. Flujo para reclamar y enriquecer una ficha

- [ ] Crear una landing específica para proveedores que explique valor antes de pedir esfuerzo.
- [ ] Cambiar el CTA principal de `Validar ficha` a una opción más clara según el estado: `Revisar esta ficha`, `¿Es tu negocio?` o `Actualizar información`.
- [ ] Permitir localizar la ficha desde la landing del proveedor.
- [ ] Diseñar onboarding progresivo:
  1. confirmar relación con el negocio;
  2. corregir datos esenciales;
  3. definir servicios y zona;
  4. indicar disponibilidad y solicitudes deseadas;
  5. aportar evidencias de verificación;
  6. revisar y enviar.
- [ ] Evitar pedir todos los datos antes de mostrar la ficha actual y el beneficio de actualizarla.
- [ ] Confirmar por email la recepción y explicar el siguiente paso y plazo.
- [ ] Crear cola administrativa para revisar, aprobar, pedir información o rechazar reclamaciones.
- [ ] Notificar al proveedor cuando la ficha se publique o necesite cambios.
- [ ] Permitir que el proveedor solicite baja o retirada.
- [ ] Registrar cada estado y tiempo del flujo para poder medirlo.

## P0. Operación manual del piloto

- [ ] Preparar una hoja/CRM inicial de proveedores contactables, con base jurídica y origen del dato.
- [ ] Definir estados de outreach: identificado, preparado, contactado, abierto, interesado, reclamado, publicado, activo, descartado.
- [ ] Preparar email inicial, recordatorio y cierre sin urgencia artificial.
- [ ] Utilizar demanda real únicamente; no afirmar que hay familias esperando si no se ha observado.
- [ ] Preparar guion de entrevista de 20 minutos para proveedores.
- [ ] Preparar checklist manual de verificación y publicación.
- [ ] Definir responsable y tiempo máximo de moderación.
- [ ] Registrar motivos de no participación para mejorar la propuesta.

---

# Fase 2 — Flujo mínimo de familias y conexión útil

## P1. Búsqueda y comparación

- [ ] Sustituir filtros genéricos por los atributos que realmente permiten decidir en el segmento inicial.
- [ ] Mostrar el número de resultados sin sugerir que más siempre es mejor.
- [ ] Registrar búsquedas sin resultados y crear una salida útil.
- [ ] Permitir comparar un número pequeño de opciones con campos homogéneos.
- [ ] Hacer visibles cobertura, disponibilidad, actualización y confianza.
- [ ] Revisar el orden de resultados y definir criterios transparentes de ranking.
- [ ] Separar claramente resultados orgánicos de posiciones patrocinadas.

## P1. Solicitud de contacto

- [ ] Diseñar un único flujo de solicitud dentro de Tenlo para el piloto.
- [ ] Recoger solo la información necesaria para que el proveedor decida si puede ayudar.
- [ ] Evitar datos identificativos o sensibles de menores.
- [ ] Crear entidad `request` con ID, familia, proveedor, categoría, zona, estado y marcas de tiempo.
- [ ] Confirmar a la familia que la solicitud ha sido enviada y cuándo puede esperar respuesta.
- [ ] Notificar al proveedor con un enlace seguro para responder.
- [ ] Permitir responder, rechazar, indicar falta de disponibilidad o pedir aclaración.
- [ ] Registrar tiempo de primera respuesta y motivo de rechazo.
- [ ] Si no hay respuesta, recordar al proveedor y ofrecer alternativas a la familia.
- [ ] Preguntar a ambas partes si la conexión fue útil.
- [ ] Preguntar posteriormente si avanzó a conversación, propuesta, reserva o contratación.
- [ ] Evitar que email, teléfono y web externos sean la única fuente de contacto si se necesita medir resultados.

## P1. Backoffice mínimo

- [ ] Crear vista administrativa de fichas, reclamaciones, solicitudes y resultados.
- [ ] Permitir corregir estados sin editar directamente la base de datos.
- [ ] Crear alertas para reclamaciones pendientes, solicitudes sin respuesta y fichas desactualizadas.
- [ ] Registrar notas operativas sin exponerlas al proveedor o a la familia.
- [ ] Exportar datos básicos para seguimiento manual durante el piloto.

---

# Fase 3 — Plan de medición, GA4 y visualización

## Principio de arquitectura

GA4 debe medir adquisición y comportamiento de uso. Supabase debe ser la fuente de verdad de reclamaciones, solicitudes, respuestas, resultados, estados del proveedor y suscripciones.

No se deben calcular conexiones útiles únicamente con clics de GA4. Cada solicitud y respuesta necesita un ID y un registro persistente en backend.

Arquitectura inicial recomendada:

`Web/app -> dataLayer/GTM -> GA4`

`Web/app y procesos operativos -> Supabase -> vistas/tablas analíticas`

`GA4 + Supabase/BigQuery o conector intermedio -> Looker Studio`

## P0. Fundamentos de medición

- [ ] Crear propiedad GA4 de Tenlo y flujos separados para producción y pruebas.
- [ ] Confirmar que GTM pertenece a Tenlo y documentar propietarios y accesos.
- [ ] Eliminar el ID de GTM hardcodeado y moverlo a configuración por entorno.
- [ ] Implementar Consent Mode y verificar que analítica no se activa antes del consentimiento cuando sea necesario.
- [ ] Prohibir el envío a GA4 de nombre, email, teléfono, texto libre, direcciones precisas o información de menores.
- [ ] Crear un diccionario de datos y una taxonomía versionada de eventos.
- [ ] Definir identificadores estables no personales:
  - `provider_id`;
  - `profile_id`;
  - `request_id`;
  - `category_id`;
  - `municipality_id`;
  - `search_id`;
  - `experiment_id` y `variant_id` cuando corresponda.
- [ ] Definir qué eventos se envían desde cliente, cuáles desde servidor y cuáles desde ambos con deduplicación.
- [ ] Añadir `event_id`, timestamp de servidor y versión del esquema a los eventos críticos.
- [ ] Crear entornos de prueba y reglas para excluir tráfico interno.
- [ ] Preparar un procedimiento de QA con GTM Preview, GA4 DebugView y validación en Supabase.
- [ ] Definir retención, acceso, borrado y anonimización de datos.

## Taxonomía mínima de eventos

### Descubrimiento y búsqueda

- [ ] `search_started`
- [ ] `search_submitted`
- [ ] `search_results_viewed`
- [ ] `search_zero_results`
- [ ] `filter_applied`
- [ ] `provider_impression`
- [ ] `provider_profile_viewed`
- [ ] `provider_compared`
- [ ] `provider_saved`
- [ ] `provider_shared`

Propiedades recomendadas: `search_id`, categoría, municipio, zona, número de resultados, filtros, posición del proveedor, fuente/medio/campaña y tipo de dispositivo.

### Contacto y resultado familiar

- [ ] `contact_started`
- [ ] `contact_form_completed`
- [ ] `request_created`
- [ ] `request_failed`
- [ ] `provider_notified`
- [ ] `provider_response_received`
- [ ] `family_viewed_response`
- [ ] `connection_marked_useful`
- [ ] `outcome_reported`

Propiedades recomendadas: `request_id`, proveedor, categoría, municipio, posición de origen, tipo de solicitud, resultado, motivo de no avance y bucket de tiempo de respuesta. Los textos libres permanecen en backend y no se envían a GA4.

### Activación y ciclo del proveedor

- [ ] `provider_landing_viewed`
- [ ] `claim_started`
- [ ] `claim_submitted`
- [ ] `claim_approved`
- [ ] `claim_rejected`
- [ ] `profile_edit_started`
- [ ] `profile_section_completed`
- [ ] `profile_submitted`
- [ ] `profile_published`
- [ ] `verification_requested`
- [ ] `verification_approved`
- [ ] `provider_request_viewed`
- [ ] `provider_request_responded`
- [ ] `provider_request_declined`
- [ ] `lead_relevance_reported`
- [ ] `provider_reactivated`

Propiedades recomendadas: canal/campaña de captación, estado anterior y nuevo, porcentaje de completitud, nivel de confianza, plan, categoría, zona, motivo de rechazo y bucket de tiempo de respuesta.

### Monetización

- [ ] `pricing_viewed`
- [ ] `plan_compared`
- [ ] `subscription_started`
- [ ] `checkout_started`
- [ ] `subscription_activated`
- [ ] `subscription_renewed`
- [ ] `subscription_cancelled`
- [ ] `payment_failed`

Propiedades recomendadas: plan, periodicidad, precio, moneda, promoción, estado anterior, antigüedad del proveedor y valor recibido antes de la compra.

## Métricas y fórmulas que deben poder calcularse

### North Star Metric

- [ ] **Conexiones útiles mensuales**: solicitudes relevantes respondidas dentro del SLA y valoradas como útiles, o una definición inicial equivalente aprobada.
- [ ] Mostrar por separado volumen, porcentaje y tiempo; no mezclar poblaciones distintas en una única puntuación.

### Funnel de familias

- [ ] Búsquedas iniciadas y completadas.
- [ ] Porcentaje de búsquedas con resultados.
- [ ] Resultados y fichas vistas por búsqueda.
- [ ] Tasa de ficha vista a contacto iniciado.
- [ ] Tasa de contacto iniciado a solicitud enviada.
- [ ] Tasa de solicitudes con respuesta.
- [ ] Mediana y percentiles de tiempo de respuesta.
- [ ] Tasa de conexiones útiles.
- [ ] Tasa de resultado confirmado.
- [ ] Recuperación de búsquedas guardadas y retorno cuando reaparece una necesidad.

### Funnel de proveedores

- [ ] Proveedores identificados, contactados y que visitan la landing.
- [ ] Tasa de inicio y envío de reclamación.
- [ ] Tiempo hasta aprobación.
- [ ] Tasa de perfil suficientemente completo.
- [ ] Tiempo hasta publicación.
- [ ] Tiempo hasta primera solicitud.
- [ ] Tasa de primera respuesta.
- [ ] Proveedores activos a 7, 30 y 90 días.
- [ ] Relevancia percibida de las solicitudes.
- [ ] Motivos de rechazo, inactividad y abandono.
- [ ] Conversión de gratuito a plan de pago cuando exista.

### Liquidez del marketplace

- [ ] Proveedores publicados, disponibles y activos por categoría y municipio.
- [ ] Necesidades y solicitudes por categoría y municipio.
- [ ] Cobertura: porcentaje de necesidades con al menos una opción adecuada.
- [ ] Fill rate: porcentaje de solicitudes que llegan a un proveedor disponible.
- [ ] Response rate dentro del SLA.
- [ ] Conexiones útiles por proveedor activo.
- [ ] Demanda no atendida y búsquedas sin resultados.
- [ ] Concentración de demanda en los principales proveedores.
- [ ] Ratio entre oferta activa y demanda, siempre contextualizado por segmento.

### Calidad y confianza

- [ ] Completitud y frescura de las fichas.
- [ ] Porcentaje reclamado, verificado y con disponibilidad actualizada.
- [ ] Errores o correcciones informadas.
- [ ] Solicitudes irrelevantes, spam y contactos sin respuesta.
- [ ] Valoración de utilidad por ambas partes.
- [ ] Quejas, bloqueos, retiradas y problemas de privacidad.

### Monetización futura

- [ ] Proveedores elegibles para pago tras haber recibido valor.
- [ ] Visitas a pricing y conversión por plan.
- [ ] MRR, ARPPU, altas, bajas, expansión y contracción.
- [ ] Churn de proveedor y motivos.
- [ ] Ingresos por proveedor activo y por conexión útil.
- [ ] Coste de captación y recuperación, solo cuando existan datos de gasto fiables.
- [ ] No utilizar como prueba de valor el pago sin comprobar antes la calidad y continuidad de las oportunidades.

## Dashboards recomendados

- [ ] **Dirección / NSM:** conexiones útiles, solicitudes, respuesta, cobertura, oferta activa y principales riesgos.
- [ ] **Adquisición:** canales, campañas, búsquedas, landing de proveedores y coste cuando exista inversión.
- [ ] **Familias:** búsqueda, comparación, contacto, respuesta, utilidad y resultado.
- [ ] **Proveedores:** outreach, reclamación, completitud, publicación, primera solicitud, respuesta, actividad y abandono.
- [ ] **Liquidez:** oferta y demanda por categoría/municipio, cobertura, tiempos y concentración.
- [ ] **Ficha del proveedor:** visibilidad, impresiones, aperturas, guardados, solicitudes, respuesta y resultados, sin confundir tráfico con clientes.
- [ ] **Calidad y confianza:** frescura, verificación, incidencias, relevancia y privacidad.
- [ ] **Monetización:** pricing, activación del plan, ingresos y churn cuando exista producto de pago.

## Reglas para Looker Studio u otra herramienta

- [ ] Crear una capa de datos con nombres de campo estables y no depender de nombres visuales de GA4.
- [ ] Documentar para cada KPI: definición, fórmula, fuente, frecuencia, propietario y limitaciones.
- [ ] Mostrar intervalos comparables y filtros por categoría, municipio, estado de ficha, plan y canal.
- [ ] No comparar poblaciones distintas sin explicar la unidad.
- [ ] Diferenciar `0`, `sin dato` y `no aplicable`.
- [ ] Añadir notas cuando cambie una definición o implementación.
- [ ] Evitar rankings con muestras pequeñas.
- [ ] Establecer umbrales mínimos de privacidad antes de mostrar segmentos.
- [ ] Preparar exportación a BigQuery cuando el volumen o la unión GA4/backend lo justifique.

---

# Fase 4 — Loops y crecimiento después del núcleo

## P2. Loop del proveedor

`Demanda real -> reclamar ficha -> mejorar información -> recibir solicitudes relevantes -> responder -> percibir valor -> mantener ficha activa`

- [ ] Mostrar demanda real del segmento sin exagerarla.
- [ ] Crear informe periódico de presencia, interés, solicitudes, respuesta y resultado.
- [ ] Recomendar un máximo de tres mejoras conectadas con datos observados.
- [ ] Recordar actualizar disponibilidad y servicios.
- [ ] Reactivar proveedores solo cuando exista una oportunidad o razón útil.
- [ ] Medir cada paso del loop y detectar dónde se rompe.

## P2. Loop de la familia

`Necesidad -> opciones claras -> comparación -> contacto -> respuesta -> solución -> señal de calidad -> mejores decisiones futuras`

- [ ] Guardar búsqueda y shortlist.
- [ ] Facilitar retomar el contexto cuando reaparezca una necesidad.
- [ ] Solicitar feedback en el momento adecuado.
- [ ] Utilizar señales de calidad para mejorar la recomendación.
- [ ] No forzar recurrencia semanal en una necesidad episódica.

## P2. Loop de confianza

`Información actualizada y verificada -> confianza -> contactos informados -> interacciones de mayor calidad -> nuevas señales de confianza`

- [ ] Crear historial de actualización y señales verificables.
- [ ] Diseñar opiniones moderadas y vinculadas a interacciones reales cuando sea posible.
- [ ] Mostrar tiempos y calidad de respuesta sin castigar situaciones con muestras insuficientes.
- [ ] Impedir que el plan de pago compre el estado de verificación.

## P2. Loop de liquidez y expansión

- [ ] Calcular cobertura antes de captar más demanda.
- [ ] Identificar búsquedas sin oferta como input para captar proveedores.
- [ ] Abrir una nueva categoría o zona solo con criterio mínimo aprobado.
- [ ] Crear un playbook repetible de expansión.

## P3. Referral y comunidad

- [ ] Probar recomendación entre familias únicamente después de demostrar utilidad.
- [ ] Probar invitación de proveedores por otros proveedores sin crear incentivos al spam.
- [ ] Evaluar contenido local/SEO derivado de necesidades reales y datos verificados.
- [ ] Integrar comunidad solo si mejora una necesidad central y no dispersa el marketplace.

---

# Fase 5 — Monetización

No desarrollar el sistema completo de cobro antes de demostrar valor repetible.

## Decisiones

- [ ] Definir qué permanece gratuito para asegurar cobertura y confianza.
- [ ] Definir qué problema adicional resuelve el plan Pro.
- [ ] Elegir la primera hipótesis de monetización:
  - [ ] suscripción Pro;
  - [ ] pago por solicitud cualificada aceptada;
  - [ ] herramientas profesionales;
  - [ ] modelo híbrido.
- [ ] No utilizar `Verified` como producto de pago.
- [ ] Definir tratamiento de posiciones patrocinadas y etiquetado.
- [ ] Definir reembolso o disputa si se cobra por lead.
- [ ] Validar intención de pago con ofertas reales, no solo encuestas.

## Capacidades posteriores

- [ ] Página de planes ligada al valor observado por el proveedor.
- [ ] Checkout y facturación.
- [ ] Gestión de plan, renovación, cancelación y facturas.
- [ ] Analítica ampliada para el proveedor.
- [ ] Preferencias avanzadas de solicitudes.
- [ ] Herramientas de respuesta y seguimiento.
- [ ] Mayor presencia sin prometer contactos o contrataciones.
- [ ] Métricas de conversión, ingresos y churn.

---

# Experimentos del piloto

- [ ] Entrevistar a 5-10 proveedores del segmento inicial antes de cerrar el onboarding.
- [ ] Comparar invitación genérica frente a invitación basada en valor y ficha existente.
- [ ] Comparar reclamación con y sin registro inicial.
- [ ] Comparar onboarding completo frente a progresivo.
- [ ] Probar contacto directo frente a solicitud guiada.
- [ ] Probar contacto con un proveedor frente a selección asistida de hasta tres.
- [ ] Probar recordatorio de respuesta y recuperación con alternativas.
- [ ] Medir no solo conversión, sino relevancia, tiempo de respuesta y utilidad.
- [ ] Definir de antemano hipótesis, métrica primaria, protecciones y condición de decisión.
- [ ] Elegir duración por muestra necesaria, no por un número arbitrario de semanas.

---

# Riesgos que deben vigilarse

- [ ] Directorio grande pero inactivo.
- [ ] Captar familias sin capacidad de respuesta suficiente.
- [ ] Generar volumen de contactos irrelevantes.
- [ ] Cobrar antes de demostrar valor.
- [ ] Confundir fichas reclamadas con proveedores activos.
- [ ] Confundir contactos con soluciones.
- [ ] Utilizar cifras mock como prueba social.
- [ ] Expandir antes de alcanzar densidad.
- [ ] Concentrar demanda en pocos proveedores.
- [ ] Permitir que el pago determine confianza o ranking orgánico.
- [ ] No observar contrataciones que ocurren fuera de Tenlo.
- [ ] Recoger datos familiares o de menores innecesarios.
- [ ] Medir datos personales en GA4.
- [ ] Construir dashboards antes de estabilizar definiciones.

---

# Checklist de preparación para el primer contacto real

No iniciar contacto sistemático con proveedores hasta poder marcar:

- [ ] Segmento inicial decidido.
- [ ] Propuesta de valor y mensaje revisados.
- [ ] Dominio definitivo operativo.
- [ ] Dependencias críticas actualizadas.
- [ ] Build reproducible y variables documentadas.
- [ ] Fichas iniciales revisadas, con fuente y fecha.
- [ ] Flujo de reclamación probado de extremo a extremo.
- [ ] Cola de moderación operativa.
- [ ] Emails de confirmación y seguimiento funcionando.
- [ ] Política de privacidad y condiciones alineadas con los datos recogidos.
- [ ] Taxonomía de eventos P0 implantada y validada.
- [ ] Dashboard mínimo o consulta operativa para ver reclamaciones y estados.
- [ ] Proceso de corrección, retirada y soporte definido.
- [ ] Responsable del piloto y tiempos de respuesta definidos.

---

# Orden recomendado para los próximos días

1. Cerrar segmento, conexión útil, SLA y flujo de contacto.
2. Resolver dominio, dependencias, build y configuración de entornos.
3. Auditar y migrar un conjunto pequeño de fichas reales.
4. Simplificar y probar el flujo de reclamación.
5. Crear backoffice/operación manual para aprobar cambios.
6. Implantar IDs, eventos P0 y tabla persistente de actividad.
7. Crear el flujo mínimo de solicitud y respuesta.
8. Probar todo con cuentas de prueba y datos no personales.
9. Construir el dashboard mínimo de piloto.
10. Contactar a una primera cohorte pequeña, aprender y ajustar antes de ampliar.

## Decisiones pendientes — registro rápido

| Decisión | Estado | Elección | Fecha |
|---|---|---|---|
| Segmento inicial | Pendiente |  |  |
| Definición de conexión útil | Pendiente |  |  |
| SLA de respuesta | Pendiente |  |  |
| Reclamación con o sin cuenta | Pendiente |  |  |
| Contacto individual, múltiple o asistido | Pendiente |  |  |
| Criterios de verificación | Pendiente |  |  |
| Dominio canónico | Pendiente |  |  |
| Fuente de verdad de producto | Pendiente |  |  |
| Primera hipótesis de monetización | Pendiente |  |  |
| Herramienta inicial de dashboard | Pendiente |  |  |

