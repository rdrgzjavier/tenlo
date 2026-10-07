# Backlog de producto, proveedores y medición de Tenlo

> Documento vivo para decidir, construir y comprobar el MVP de Tenlo.
>
> Última revisión: 7 de octubre de 2026.

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

## Decisiones cerradas para el piloto

- Ámbito geográfico: Madrid noroeste, inicialmente Las Rozas, Majadahonda, Pozuelo de Alarcón y Boadilla del Monte.
- Oferta inicial: actividades extraescolares, academias, deporte, clases particulares, apoyo escolar, tecnología, arte, música, idiomas, campamentos y días sin cole.
- Oferta complementaria relevante para familias: centros de salud mental infantil/familiar, clínicas dentales y otros servicios familiares verificables.
- Se priorizan empresas, centros, asociaciones y profesionales autónomos con presencia profesional verificable.
- Las fichas iniciales pueden crearse con información pública, indicando fuente, fecha y que todavía no están gestionadas por el proveedor.
- Cada tipo de servicio tendrá una plantilla propia, pero todas las fichas del mismo tipo mostrarán los mismos campos y estados pendientes cuando falte información.
- Las familias podrán solicitar información desde Tenlo, visitar la web oficial y llamar desde móvil cuando exista teléfono público.
- La solicitud se dirige primero al proveedor elegido; si no puede atenderla o no responde, la familia puede pedir alternativas a Tenlo.
- Una conexión útil inicial es una solicitud relevante respondida en un máximo de 48 horas con disponibilidad, alternativa o siguiente paso.
- La participación de proveedores será gratuita durante el piloto y la suscripción se planteará después de demostrar valor recurrente.
- Etiquetas de confianza: `No verificada`, `Gestionada`, `Verificada` y `Oficial`. Se evita `Pública` para no confundir el estado de confianza con la titularidad pública, concertada o privada de un centro.
- La reclamación puede iniciarse sin cuenta; Tenlo verificará el email y la relación con la ficha antes de aprobar cambios.
- Fuente de verdad analítica: GA4 para adquisición/comportamiento y Supabase para operaciones/resultados; visualización inicial en Looker Studio.
- Dominio canónico aprobado: `https://tenlo.es`, con DNS gestionado entre DonDominio y Cloudflare y despliegue en Vercel.
- Correo operativo aprobado: `solicitudes@tenlo.es`, reenviado inicialmente a `tenlocerca@gmail.com` y respaldado por la bandeja administrativa.
- Objetivo operativo inicial: identificar 40-60 proveedores, contactar 20-30 y conseguir 10-15 fichas reclamadas, completas y activas.

---

## Estado auditado

### GitHub

- Repositorio: `rdrgzjavier/tenlo`.
- Rama de producción: `main`.
- Último commit revisado: `89f0e78` (`Aclara confianza y mejora busquedas sin resultados`).
- Aplicación en Next.js 14, React 18, TypeScript y Tailwind.
- `typecheck` y `lint` pasan correctamente.
- El contenido público continúa dependiendo de `src/lib/mock-data.ts`.
- Existen siete migraciones de Supabase. Las migraciones `0006` y `0007` se aplicaron en producción el 5 de octubre de 2026 y se verificaron mediante consulta: `search_events` y `connection_requests` existen, tienen RLS activa y los permisos de inserción previstos.
- Hay autenticación y algunas páginas conectadas a Supabase, pero no una fuente de datos real unificada para el directorio.
- La reclamación de ficha ya puede iniciarse sin cuenta; la aprobación y los cambios siguen sujetos a verificación posterior.
- El formulario de registro ya solicita tipo de usuario, nombre público, email, teléfono, contraseña, municipio y centro opcional. Para proveedores también muestra tipología, web, descripción, zona, modalidad, edades, disponibilidad, credenciales y otros campos.
- El esquema ya incluye centro relacionado, intereses y consentimiento específico de marketing, pero el formulario de registro aún debe conectarlos al guardado y conservar la evidencia del consentimiento.
- No existe aún una bandeja administrativa operativa: hay una ruta de revisión de borradores y avisos por email, pero no un centro de solicitudes, alternativas y notificaciones.
- Los CTAs de contacto no siguen un único flujo: algunos abren web, email o teléfono y el de canguros no crea aún una solicitud operativa.
- Favoritos mezcla una señal local de sesión con datos de Supabase y todavía no representa un flujo completo.
- La aplicación ya prepara GTM por entorno, Consent Mode con estado inicial denegado, sincronización con Cookiebot y una taxonomía versionada de eventos. La migración analítica `0009` se aplicó y verificó el 07/10/2026; la vista agregada no es legible por `anon` ni `authenticated`. El código ignora identificadores de Cookiebot de ejemplo para no simular un consentimiento activo. Falta crear/configurar Cookiebot y el contenedor real de GTM, enlazar GA4, validar el consentimiento en producción y completar la medición persistente del resultado de cada conexión.
- `typecheck`, `lint` y `build` pasan en local; las rutas privadas ya no bloquean el prerender cuando faltan variables de Supabase.
- La auditoría de dependencias detecta avisos de seguridad altos/críticos en la rama actual de Next.js y dependencias transitivas. Debe actualizarse y volver a auditarse antes de captar usuarios reales.

### Vercel y dominio

- El despliegue de producción de Vercel correspondiente al commit `3e78a23` está en estado `Ready` y fue redesplegado el 6 de octubre de 2026 con la configuración actualizada.
- El alias heredado `https://kiryco.vercel.app` continúa respondiendo, pero el dominio canónico público es `https://tenlo.es`.
- El código utiliza `https://tenlo.es` como dominio canónico por defecto y permite configurarlo por entorno mediante `NEXT_PUBLIC_SITE_URL`.
- `tenlo.es` y `www.tenlo.es` están conectados a Vercel: la raíz responde en producción y `www` redirige permanentemente (`308`) a `tenlo.es`.
- La matriz de Vercel fue revisada de nuevo el 7 de octubre de 2026: Supabase está configurado para producción y preview; `ADMIN_EMAIL` y `NEXT_PUBLIC_SITE_URL=https://tenlo.es` están configuradas. `NEXT_PUBLIC_COOKIEBOT_ID` contiene todavía el valor de ejemplo `tu-id-de-cookiebot`, que el código ya bloquea, y debe sustituirse por un ID real. Siguen pendientes `NEXT_PUBLIC_GTM_ID`, `RESEND_API_KEY` y `MAIL_FROM`; `SUPABASE_SERVICE_ROLE_KEY` no se añadirá hasta que una función administrativa la necesite.
- La zona gratuita `tenlo.es` está activa en Cloudflare con la raíz `A 216.198.79.1` y `www CNAME 4b8f150f986f3ce8.vercel-dns-017.com`, ambos en modo Solo DNS. La resolución pública utiliza `david.ns.cloudflare.com` y `norah.ns.cloudflare.com` desde el 06/10/2026.
- DonDominio no tiene creada aún ninguna cuenta ni alias de correo para `tenlo.es`.

---

# Fase 0 — Decisiones de producto que desbloquean el MVP

Estas decisiones deben cerrarse antes de construir más superficie.

## Segmento inicial y propuesta de valor

- [x] Elegir el ámbito inicial: actividades y servicios familiares verificables en Las Rozas, Majadahonda, Pozuelo y Boadilla.
- [ ] Ordenar las subcategorías para que el piloto no intente activar todas al mismo tiempo.
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
- [x] Mantener separados el nivel de confianza y el plan comercial.
  - `Verified`: confianza comprobable.
  - `Pro`: plan comercial con herramientas o beneficios adicionales.
- [x] Decidir si la reclamación de ficha requiere cuenta desde el principio.
  - Recomendación para el piloto: permitir una solicitud inicial sin registro y verificar la identidad después, para reducir fricción.
- [ ] Decidir si la familia contacta a un proveedor, a varios o pide a Tenlo una selección asistida.

---

# Fase 1 — Imprescindible antes de contactar proveedores

## P0. Infraestructura, seguridad y despliegue

- [ ] Actualizar Next.js y dependencias a versiones soportadas sin avisos críticos conocidos.
- [ ] Repetir `npm audit`, `typecheck`, `lint` y `build` tras la actualización.
- [x] Evitar que las páginas privadas conectadas a Supabase se ejecuten durante el prerender del build.
- [ ] Hacer que las rutas privadas muestren un mensaje operativo claro cuando falten variables de Supabase en tiempo de ejecución. El directorio y cabecera públicos ya degradan sin bloquearse.
- [x] Crear `.env.example` sin secretos con todas las variables requeridas y su finalidad.
- [x] Documentar variables por entorno: local, preview y production, incluyendo exposición, comportamiento cuando faltan y comprobaciones previas al despliegue.
- [x] Auditar en Vercel la presencia de Supabase, Resend, Cookiebot, URL pública y correo administrativo por entorno.
- [ ] Añadir las variables ausentes detectadas en la auditoría y volver a desplegar. `NEXT_PUBLIC_SITE_URL` ya está añadida en producción y el redespliegue se verificó el 06/10/2026; GTM y correo transaccional siguen pendientes de configurar.
- [x] Completar la conexión de `tenlo.es` y `www.tenlo.es` a Vercel: raíz en producción y redirección `308` de `www` verificadas.
- [x] Definir dominio canónico y redirección única: raíz `tenlo.es`; `www` redirige con `308` a la raíz.
- [x] Cambiar los nameservers en DonDominio a los asignados por Cloudflare.
- [x] Verificar que Cloudflare marque la zona como activa y que la resolución pública use `david.ns.cloudflare.com` y `norah.ns.cloudflare.com`.
- [x] Sustituir `kiryco.vercel.app` en configuración, metadata, emails, sitemap y enlaces absolutos.
- [x] Verificar SSL, sitemap, robots, canonical y Open Graph en el dominio definitivo: HTTPS y HSTS activos, rutas públicas con respuesta `200` y metadata generada desde `https://tenlo.es`.
- [ ] Añadir una comprobación automática en GitHub para `typecheck`, `lint` y `build` en cada cambio. El workflow está preparado localmente, pero la credencial actual de GitHub no dispone del permiso `workflow` para publicarlo.
- [ ] Decidir si los previews deben permanecer protegidos y mantener producción pública.

## P0. Veracidad y confianza del contenido actual

- [x] Eliminar cifras por defecto que puedan parecer reales, como las `100` familias registradas.
- [x] Revisar el mensaje `100% moderado y seguro`; sustituirlo por una afirmación demostrable.
- [ ] Revisar cada ficha mock antes de hacerla pública como ficha real.
- [ ] No considerar una web oficial como verificación suficiente por sí sola.
- [x] Definir los niveles visibles de confianza: `No verificada`, `Gestionada`, `Verificada` y `Oficial`, independientes del plan comercial y de la titularidad del centro.
- [ ] Mostrar en cada ficha la fuente, fecha de última revisión y estado de control por el proveedor cuando corresponda.
- [x] Utilizar etiquetas breves y comprensibles para el estado de confianza: `No verificada`, `Gestionada`, `Verificada`, `Oficial`.
- [ ] Crear un mecanismo sencillo para solicitar corrección, retirada o actualización.
- [ ] Revisar derechos de uso de imágenes remotas y evitar presentar imágenes genéricas como si fueran del proveedor.
- [x] Revisar la promesa principal de reserva: la portada comunica ahora búsqueda, comparación y contacto. Las menciones restantes describen condiciones o información publicada por terceros, no una reserva dentro de Tenlo.

## P0. Modelo de datos real

- [x] Elegir Supabase como fuente de verdad definitiva para autenticación, perfiles y operación del marketplace.
- [x] Aplicar y verificar las migraciones de reclamación anónima, perfiles ampliados, búsquedas y solicitudes de conexión.
- [ ] Eliminar la dependencia del directorio de `mock-data.ts` mediante una capa de acceso a datos.
- [ ] Crear una migración/importación controlada para las fichas iniciales.
- [ ] Normalizar proveedores, servicios, categorías, municipios y zonas de cobertura.
- [x] Definir plantillas iniciales por vertical manteniendo una estructura estable dentro de cada tipo:
  - [x] actividades y extraescolares;
  - [x] deporte;
  - [x] clases particulares y apoyo escolar;
  - [x] campamentos y días sin cole;
  - [x] salud mental y bienestar familiar;
  - [x] clínicas dentales y servicios sanitarios;
  - [x] plantilla genérica para otros servicios familiares.
- [x] Mostrar todos los campos de la plantilla correspondiente aunque no estén informados, usando `Pendiente de verificar` y sin inventar valores.
- [ ] Añadir a proveedor/ficha:
  - [x] preparar en el esquema estado de reclamación;
  - [ ] estado de publicación;
  - [x] preparar en el esquema nivel de confianza;
  - [x] preparar en el esquema plan comercial independiente;
  - [ ] fecha de última revisión;
  - [ ] fuente y URL de la fuente;
  - [x] preparar en el esquema porcentaje de ficha completa;
  - [x] preparar en el esquema disponibilidad para recibir solicitudes;
  - [ ] categorías y zonas aceptadas;
  - [x] preparar en el esquema preferencias de contacto;
  - [x] preparar en el esquema motivo de inactividad o rechazo.
- [ ] Añadir historial de cambios y responsable de cada modificación.
- [ ] Definir reglas RLS y permisos para proveedor, familia, moderación y administración.
- [ ] Crear copias de seguridad y procedimiento de recuperación.

## P0. Flujo para reclamar y enriquecer una ficha

- [x] Crear una landing específica para proveedores que explique valor antes de pedir esfuerzo.
- [x] Cambiar el CTA principal de `Validar ficha` a una opción más clara según el estado: `¿Es tu negocio?` o `Gestionar esta ficha`.
- [x] Permitir localizar la ficha desde la landing del proveedor mediante el CTA `Buscar mi ficha` hacia el directorio de servicios.
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
- [x] Definir estados de outreach: identificado, preparado, contactado, abierto, interesado, reclamado, publicado, activo, descartado.
- [x] Preparar email inicial, recordatorio y cierre sin urgencia artificial.
- [ ] Utilizar demanda real únicamente; no afirmar que hay familias esperando si no se ha observado.
- [x] Preparar guion de entrevista de 20 minutos para proveedores.
- [x] Preparar checklist manual de verificación y publicación.
- [x] Definir responsable y tiempo máximo de moderación: Javier será el responsable operativo inicial; reclamaciones, correcciones y retiradas tendrán un plazo máximo de 4 días laborables.
- [x] Registrar motivos de no participación para mejorar la propuesta.

---

# Fase 2 — Flujo mínimo de familias y conexión útil

## P1. Búsqueda y comparación

- [x] Incorporar en `/buscar` un módulo visible de búsqueda por palabra, zona y categoría, también en móvil.
- [x] Añadir `Ver mapa y cómo llegar` para centros y negocios mediante una búsqueda externa sin coste de API, sin mostrar ubicaciones exactas de profesionales particulares.
- [ ] Incorporar dirección profesional pública y coordenadas verificadas al modelo de datos; permitir al proveedor confirmarlas o corregirlas al reclamar su ficha.
- [ ] Sustituir la búsqueda aproximada por un mapa embebido solo cuando existan coordenadas verificadas, consentimiento/cookies y una estimación de coste aceptada.
- [ ] Sustituir filtros genéricos por los atributos que realmente permiten decidir en el segmento inicial.
- [x] Mostrar el número de resultados sin sugerir que más siempre es mejor.
- [x] Registrar visualmente búsquedas sin resultados y crear una salida útil para limpiar filtros o pedir ayuda a Tenlo.
- [x] Permitir proponer desde una búsqueda sin resultados un proveedor con nombre, web, ubicación y servicio; conservarlo pendiente de revisión antes de crear una ficha `No verificada`.
- [ ] Crear el flujo administrativo que convierta una propuesta revisada en ficha `No verificada`, evitando la publicación automática de datos aportados por usuarios.
- [ ] Permitir comparar un número pequeño de opciones con campos homogéneos.
- [ ] Hacer visibles cobertura, disponibilidad, actualización y confianza.
- [ ] Revisar el orden de resultados y definir criterios transparentes de ranking.
- [ ] Separar claramente resultados orgánicos de posiciones patrocinadas.

## P1. Solicitud de contacto

- [x] Activar los CTAs visibles de contacto y reporte de las fichas mediante formularios internos contextuales como solución operativa provisional.
- [x] Activar `Guardar favorito` para dirigir a registro/inicio de sesión o al área de favoritos según el estado local de sesión.
- [x] Persistir el guardado real de favoritos por usuario en Supabase y permitir añadir/quitar una ficha desde el propio CTA y desde `/favoritos`.
- [x] Diseñar un único flujo de solicitud dentro de Tenlo para el piloto, con formulario asociado a la ficha y consulta posterior en `Mis solicitudes`.
- [ ] Mantener en la ficha tres vías diferenciadas cuando estén disponibles:
  - [x] `Solicitar información` dentro de Tenlo;
  - [x] `Llamar`, con icono y enlace `tel:` mobile first en fichas canónicas con teléfono público;
  - [x] `Visitar web oficial` en fichas canónicas con URL pública;
- [ ] Medir por separado el inicio y resultado observable de cada vía; una llamada o salida externa no equivale automáticamente a una conexión útil.
- [x] Recoger solo la información necesaria para que el proveedor decida si puede ayudar.
- [x] Evitar datos identificativos o sensibles de menores mediante instrucciones explícitas y confirmación de persona adulta.
- [x] Preparar entidad `connection_requests` con ID, familia, proveedor, categoría, zona, estado y marcas de tiempo.
- [x] Confirmar a la familia que la solicitud ha sido enviada y comunicar el objetivo operativo de respuesta o alternativa en un máximo de 48 horas.
- [ ] Notificar al proveedor con un enlace seguro para responder.
- [ ] Permitir responder, rechazar, indicar falta de disponibilidad o pedir aclaración.
- [ ] Registrar tiempo de primera respuesta y motivo de rechazo.
- [ ] Si no hay respuesta, recordar al proveedor y ofrecer alternativas a la familia.
- [ ] Guardar la petición de alternativas en Supabase como estado o tarea operativa, no solo como email.
- [ ] Crear una bandeja administrativa con avisos de solicitudes sin respuesta, alternativas pendientes y conversaciones que requieren intervención.
- [ ] Enviar además una notificación al correo operativo configurable mediante `ADMIN_EMAIL`. Dirección propuesta cuando el dominio esté activo: `solicitudes@tenlo.es`.
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
- [x] Eliminar el ID de GTM hardcodeado y moverlo a configuración por entorno.
- [x] Implementar en código Consent Mode con almacenamiento analítico/publicitario denegado por defecto y sincronización con las decisiones de Cookiebot.
- [ ] Verificar en producción, con Cookiebot y GTM Preview, que ninguna etiqueta analítica escribe cookies antes del consentimiento y que aceptar/rechazar actualiza el estado esperado.
- [ ] Prohibir el envío a GA4 de nombre, email, teléfono, texto libre, direcciones precisas o información de menores.
- [x] Crear el diccionario inicial y la taxonomía `1.0` de eventos; mantenerla versionada conforme se implementen los flujos.
- [ ] Definir identificadores estables no personales:
  - `provider_id`;
  - `profile_id`;
  - `request_id`;
  - `category_id`;
  - `municipality_id`;
  - `search_id`;
  - `experiment_id` y `variant_id` cuando corresponda.
- [ ] Definir qué eventos se envían desde cliente, cuáles desde servidor y cuáles desde ambos con deduplicación.
- [x] Añadir en el cliente `event_id`, timestamp ISO y versión del esquema a los eventos enviados al `dataLayer`.
- [ ] Añadir timestamp de servidor, versión de esquema y deduplicación a los eventos críticos persistidos o emitidos desde backend.
- [ ] Crear entornos de prueba y reglas para excluir tráfico interno.
- [ ] Preparar un procedimiento de QA con GTM Preview, GA4 DebugView y validación en Supabase.
- [ ] Definir retención, acceso, borrado y anonimización de datos.

## P0. Informes de búsquedas, fichas y verticales

Tenlo debe poder explicar qué buscan las familias y qué rendimiento obtiene cada ficha o vertical. No basta con medir páginas vistas agregadas.

### Qué se busca en Tenlo

- [x] Preparar entidad `search_events` con ID anónimo, consulta normalizada, filtros y número de resultados.
- [x] Registrar en Supabase término saneado, categoría, municipio, filtros, número de resultados y momento de la búsqueda, tanto para personas anónimas como autenticadas.
- [ ] Clasificar las búsquedas en verticales: colegios, guarderías, servicios, actividades, centros y las que se incorporen después.
- [ ] Registrar reformulaciones: qué cambia la persona cuando la primera búsqueda no le sirve.
- [ ] Registrar búsquedas sin resultados, con pocos resultados o sin proveedores disponibles.
- [ ] Registrar qué resultados se mostraron y en qué posición.
- [ ] Relacionar búsqueda con ficha vista, guardado, contacto, respuesta y conexión útil.
- [ ] Sanear o clasificar el texto libre antes de enviarlo a herramientas analíticas; una búsqueda puede contener datos personales o información sensible.
- [ ] Crear un informe de demanda con:
  - [ ] términos e intenciones más buscados;
  - [ ] categorías y verticales con más demanda;
  - [ ] demanda por municipio y periodo;
  - [ ] búsquedas emergentes;
  - [ ] búsquedas sin oferta suficiente;
  - [ ] búsquedas que terminan en contacto, respuesta y conexión útil;
  - [ ] términos con tráfico pero poca utilidad;
  - [ ] oportunidades para captar nuevos proveedores o crear nuevas fichas.

### Tráfico y rendimiento de cada ficha

- [ ] Medir impresiones de la ficha en listados y resultados.
- [ ] Medir posición en la que apareció, tipo de listado y búsqueda que originó la impresión.
- [ ] Medir visitas únicas y sesiones de la ficha, evitando inflarlas con recargas.
- [ ] Medir fuente/medio/campaña, entrada SEO, navegación interna y tráfico directo.
- [ ] Medir scroll o consumo de secciones relevantes solo si ayuda a tomar una decisión de producto.
- [ ] Medir guardados, compartidos, clics externos, inicios de contacto y solicitudes completadas.
- [ ] Relacionar solicitudes con respuesta, tiempo de respuesta, utilidad y resultado.
- [ ] Calcular por ficha:
  - [ ] impresiones;
  - [ ] visitas únicas;
  - [ ] CTR desde resultados;
  - [ ] tasa de visita a contacto;
  - [ ] tasa de contacto completado;
  - [ ] tasa de respuesta dentro del SLA;
  - [ ] conexiones útiles;
  - [ ] datos de calidad y frescura de la ficha.
- [ ] No mostrar tasas o rankings cuando la muestra sea demasiado pequeña.

### Rendimiento por vertical

- [ ] Aplicar a cada ficha una dimensión estable `vertical_id` además de categoría y tipo de proveedor.
- [ ] Crear informes comparables para colegios, guarderías, servicios, actividades y futuras verticales.
- [ ] Comparar volumen de demanda, cobertura de oferta, engagement, contacto, respuesta y resultado por vertical.
- [ ] Poder desglosar por municipio, categoría, estado de reclamación, confianza, plan y periodo.
- [ ] No comparar verticales como si tuvieran la misma frecuencia natural o intención de uso.
- [ ] Utilizar GA4 para análisis agregado y la base de datos para el histórico por ficha; un `provider_id` de alta cardinalidad no debe depender exclusivamente de dimensiones personalizadas de GA4.

## P0. Base de usuarios, consentimiento y futura activación de marketing

Supabase, ya integrado en el proyecto, debe ser la fuente de verdad para autenticación y perfiles. GA4 y Looker Studio no son una base de datos de usuarios ni deben contener información personal identificable.

Para el MVP se puede comenzar con un nivel gratuito compatible con el volumen del piloto, pero antes de abrir el registro hay que comprobar límites, copias de seguridad, región, retención y costes de crecimiento del plan vigente.

### Datos de cuenta y perfil

- [ ] Definir un modelo de perfil separado de `auth.users` y unido mediante un UUID interno.
- [ ] Revisar y completar los campos del registro:
  - [ ] nombre de usuario o nombre público;
  - [ ] email verificado;
  - [ ] tipo de usuario: familia, proveedor, centro u otro;
  - [ ] municipio o zona general;
  - [ ] centro o centros relacionados, siempre opcionales;
  - [ ] categorías o necesidades de interés, opcionales;
  - [ ] idioma y preferencias de comunicación;
  - [ ] fecha y canal de registro;
  - [ ] fuente, medio, campaña y landing de adquisición;
  - [ ] estado de onboarding;
  - [ ] fecha de última actividad significativa;
  - [ ] estado de cuenta, baja y solicitud de eliminación.
- [ ] Permitir que la persona consulte, corrija y elimine sus datos.
- [ ] Evitar recoger nombres de menores, clase, horarios, fecha de nacimiento, colegio asociado a un menor concreto u otros datos sensibles salvo necesidad real y revisión específica.
- [ ] No hacer público el centro, email, municipio o intereses de una familia por defecto.
- [ ] No duplicar contraseñas, tokens o datos gestionados por Supabase Auth en tablas propias.

### Consentimientos

- [ ] Separar aceptación de condiciones, privacidad, comunicaciones operativas y marketing.
- [ ] Añadir consentimiento de marketing explícito, opcional y no premarcado.
- [ ] Guardar para cada consentimiento: finalidad, versión del texto, fecha, origen y estado actual.
- [ ] Permitir retirar el consentimiento con facilidad y conservar prueba de la retirada.
- [ ] No enviar campañas comerciales a personas que solo aceptaron comunicaciones necesarias para prestar el servicio.
- [ ] Definir finalidades concretas antes de añadir nuevos campos al registro.

### Seguridad y gobierno del dato

- [ ] Mantener los datos personales en tablas protegidas con RLS y acceso mínimo por rol.
- [ ] Resolver las advertencias del Security Advisor: fijar `search_path` de `set_updated_at`, retirar la ejecución pública de `rls_auto_enable()` y documentar las políticas públicas deliberadas de newsletter y feedback.
- [ ] Activar la protección de contraseñas filtradas en Supabase Auth antes de abrir el registro real.
- [ ] No exponer claves de servicio de Supabase en el cliente.
- [ ] Separar PII de tablas de eventos y utilizar IDs internos seudónimos para análisis.
- [ ] Restringir exportaciones y accesos administrativos; registrar quién puede ver o descargar datos.
- [ ] Definir política de retención para cuentas inactivas, solicitudes, búsquedas y consentimientos.
- [ ] Definir procedimientos de acceso, rectificación, portabilidad y eliminación.
- [ ] Preparar copias de seguridad y restauración antes de almacenar información real.
- [ ] Revisar privacidad y seguridad antes de incorporar un CRM, plataforma de emailing o nuevo conector.

### CRM y campañas futuras

- [ ] Decidir si el primer CRM será una vista operativa sobre Supabase o una herramienta externa.
- [ ] Mantener Supabase como fuente maestra y sincronizar al CRM solo los campos necesarios.
- [ ] Sincronizar únicamente contactos con base válida para la finalidad correspondiente.
- [ ] Crear segmentos útiles, no sensibles:
  - [ ] familias por municipio e intereses declarados;
  - [ ] usuarios con búsquedas guardadas;
  - [ ] proveedores por vertical, zona y estado de activación;
  - [ ] proveedores con ficha incompleta o desactualizada;
  - [ ] proveedores que han recibido valor antes de presentar Pro;
  - [ ] usuarios con consentimiento de marketing activo.
- [ ] Registrar campañas con UTMs y relacionarlas con registro, activación y conexión útil.
- [ ] Medir entrega, apertura y clic en la plataforma de envío, pero utilizar resultados de producto para valorar la campaña.
- [ ] Diseñar exclusiones: bajas, rebotes, quejas, cuentas eliminadas y usuarios sin consentimiento.

## Taxonomía mínima de eventos

### Descubrimiento y búsqueda

- [ ] `search_started`
- [ ] `search_submitted`
- [ ] `search_results_viewed`
- [ ] `search_zero_results`
- [ ] `filter_applied`
- [ ] `provider_impression`
- [x] `provider_profile_viewed`
- [ ] `provider_compared`
- [x] `provider_saved`
- [x] `provider_unsaved`
- [ ] `provider_shared`
- [ ] `provider_suggestion_started`
- [ ] `provider_suggestion_submitted`
- [ ] `map_directions_clicked`

Propiedades recomendadas: `search_id`, categoría, municipio, zona, número de resultados, filtros, posición del proveedor, fuente/medio/campaña y tipo de dispositivo.

### Contacto y resultado familiar

- [x] `contact_started`
- [x] `contact_form_completed`
- [x] `request_created`
- [x] `request_failed`
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
- [ ] **Demanda y buscador:** términos, intenciones, verticales, municipios, cero resultados, reformulaciones y conversión hasta conexión útil.
- [ ] **Rendimiento de fichas y verticales:** impresiones, visitas, CTR, contactos, respuestas y conexiones útiles por proveedor, categoría y vertical.
- [ ] **Usuarios y consentimiento:** registros, activación, perfiles completos, centros/intereses declarados, origen de adquisición y base activable para marketing.

## Reglas para Looker Studio u otra herramienta

- [x] Crear una primera capa de datos estable: taxonomía `dataLayer` versionada y migración `0009` con dimensiones de búsqueda y vista agregada diaria sin PII.
- [x] Aplicar y verificar la migración `0009_analytics_foundations.sql` en Supabase antes de desplegar el código que escribe sus nuevas columnas.
- [x] Documentar para cada KPI: definición, fórmula, fuente, frecuencia, propietario y limitaciones en `CATALOGO-DE-KPIS-Y-REPORTING.md`.
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
- [ ] Preparar más adelante superficies legibles por LLMs: datos estructurados, Schema.org, Markdown/`llms.txt`, APIs y posibles herramientas MCP, sin exponer datos privados ni saltarse permisos.

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
- [ ] Informe de búsquedas y rendimiento por ficha validado con datos de prueba.
- [ ] Base de perfiles con RLS, consentimiento de marketing y proceso de baja probados.
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
| Segmento inicial | Decidido | Actividades y servicios familiares en Madrid noroeste | 2026-10-05 |
| Definición de conexión útil | Decidido | Solicitud relevante con respuesta útil o siguiente paso | 2026-10-05 |
| SLA de respuesta | Decidido | 48 horas | 2026-10-05 |
| Reclamación con o sin cuenta | Decidido | Inicio sin cuenta; verificación posterior por email | 2026-10-05 |
| Contacto individual, múltiple o asistido | Decidido | Individual; alternativas asistidas cuando no haya respuesta o disponibilidad | 2026-10-05 |
| Criterios de verificación | Decidido | No verificada, Gestionada, Verificada y Oficial | 2026-10-05 |
| Dominio canónico | Decidido | https://tenlo.es; Cloudflare + DonDominio + Vercel | 2026-10-05 |
| Fuente de verdad de producto | Decidido | Supabase | 2026-10-05 |
| Primera hipótesis de monetización | Parcial | Gratuito durante piloto; suscripción tras demostrar valor recurrente | 2026-10-05 |
| Herramienta inicial de dashboard | Decidido | Looker Studio; GA4 + Supabase como fuentes | 2026-10-05 |
| Correo operativo de solicitudes | Decidido | solicitudes@tenlo.es reenviado a tenlocerca@gmail.com | 2026-10-05 |
| Etiquetas definitivas de confianza | Decidido | No verificada, Gestionada, Verificada, Oficial | 2026-10-05 |
| Responsable operativo inicial | Decidido | Javier | 2026-10-05 |
| Plazo de moderación operativa | Decidido | Máximo de 4 días laborables para reclamaciones, correcciones y retiradas | 2026-10-05 |
