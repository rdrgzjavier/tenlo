# Backlog de producto, proveedores y medición de Tenlo

> Documento vivo para decidir, construir y comprobar el MVP de Tenlo.
>
> Última revisión: 26 de octubre de 2026. El avance ponderado y sus criterios están en [`ESTADO-MVP.md`](./ESTADO-MVP.md).

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
- Commit funcional previo de referencia: `793398b` (`Add protected provider request workflow`), validado y desplegado correctamente; cada cambio posterior debe volver a superar las mismas comprobaciones.
- Aplicación en Next.js 15, React 18, TypeScript y Tailwind 3.
- `typecheck` y `lint` pasan correctamente.
- Home, buscadores, listados, fichas, reclamaciones, solicitudes, favoritos, comparación, categorías, zonas y sitemap ya consumen una capa de acceso capaz de usar Supabase con retorno seguro a `mock-data.ts`. El cambio de fuente no se activará hasta validar paridad y reversibilidad en producción.
- Existen treinta y seis migraciones de Supabase. Las migraciones `0024`–`0036` están aplicadas y verificadas: medición propia del directorio, RPC públicos explícitos, privilegios mínimos de perfil y contenido, moderación profesional, historial de consentimiento, funciones administrativas endurecidas, atribución de registro, propuestas inmutables, actividad significativa, bandeja protegida para proveedores, relevancia declarada de cada solicitud y aislamiento de cuentas/datos de prueba. La comprobación de catálogo devolvió 21 centros, 14 proveedores y 16 servicios públicos.
- Supabase está activo como fuente del directorio público con RPC de columnas explícitas y fallback editorial. El lote publicado se auditó y los conteos, relaciones y contenido se compararon antes de activarlo.
- La reclamación de ficha ya puede iniciarse sin cuenta; la aprobación y los cambios siguen sujetos a verificación posterior.
- El formulario de registro ya solicita tipo de usuario, nombre público, email, teléfono, contraseña, municipio y centro opcional. Para proveedores también muestra tipología, web, descripción, zona, modalidad, edades, disponibilidad, credenciales y otros campos.
- El esquema ya incluye centro relacionado, intereses y consentimiento específico de marketing, pero el formulario de registro aún debe conectarlos al guardado y conservar la evidencia del consentimiento.
- Existe una bandeja administrativa restringida para reclamaciones, solicitudes, publicaciones, bajas, incidencias, notas, estados, alternativas, vencimientos y exportación; incluye un informe agregado de demanda de 90 días.
- Los CTAs distinguen llamada, email, web y solicitud protegida; todavía falta que el proveedor responda desde un enlace o área propia y automatizar recordatorios y alternativas.
- Favoritos se guarda por cuenta en Supabase y permite comparar entre dos y tres fichas compatibles.
- La aplicación carga Cookiebot y Consent Mode con analítica denegada por defecto, y solo descarga GTM tras consentimiento estadístico. Cookiebot, la propiedad GA4 y el contenedor GTM de Tenlo ya están configurados y publicados. La migración analítica `0009` se aplicó y verificó el 07/10/2026; la vista agregada no es legible por `anon` ni `authenticated`. Queda validar la recepción de eventos y parámetros en GA4 y completar la medición persistente del resultado de cada conexión.
- `typecheck`, `lint` y `build` pasan en local; las rutas privadas ya no bloquean el prerender cuando faltan variables de Supabase.
- La actualización a Next.js 15 eliminó los avisos críticos conocidos. La auditoría repetida el 18/10/2026 devuelve 0 críticos, 8 altos y 3 moderados; los avisos restantes proceden de dependencias transitivas de Next.js, ESLint y Tailwind y requieren migraciones mayores a Next.js 16 y Tailwind 4. Deben abordarse con pruebas visuales y funcionales antes de captar usuarios reales.

### Vercel y dominio

- El despliegue de producción de Vercel correspondiente al commit `e946003` está en estado `Ready` desde el 18 de octubre de 2026.
- El alias heredado `https://kiryco.vercel.app` continúa respondiendo, pero el dominio canónico público es `https://tenlo.es`.
- El código utiliza `https://tenlo.es` como dominio canónico por defecto y permite configurarlo por entorno mediante `NEXT_PUBLIC_SITE_URL`.
- `tenlo.es` y `www.tenlo.es` están conectados a Vercel: la raíz responde en producción y `www` redirige permanentemente (`308`) a `tenlo.es`.
- La matriz de Vercel fue revisada de nuevo el 16 de octubre de 2026: Supabase está configurado para producción y preview; `ADMIN_EMAIL` y `NEXT_PUBLIC_SITE_URL=https://tenlo.es` están configuradas. `NEXT_PUBLIC_COOKIEBOT_ID` usa el grupo real de Tenlo y `NEXT_PUBLIC_GTM_ID=GTM-KT8CKRPK` está configurada solo en producción. `RESEND_API_KEY` y `MAIL_FROM` ya están configuradas solo en Production. La credencial de Resend se rotó, quedó restringida al envío desde `notificaciones.tenlo.es`, se sustituyó en Supabase y Vercel, y las claves anteriores fueron revocadas. `SUPABASE_SERVICE_ROLE_KEY` no se añadirá hasta que una función administrativa la necesite. `notificaciones.tenlo.es` está verificado en Resend con DKIM, SPF/CNAME y DMARC publicados. La invitación de prueba se envió a `tenloediciones@gmail.com` el 26/10/2026 y su perfil profesional interno quedó aislado. Al aceptar se detectó que la plantilla de invitación seguía por defecto y enviaba a la Home sin alta de contraseña; se añadió el recorrido `/auth/callback` → `/completar-invitacion` → área profesional, con feedback claro y eventos `invitation_setup_completed`/`invitation_setup_failed`. Una recuperación posterior reveló que la plantilla seguía por defecto en inglés y que el enlace podía consumirse antes de crear la sesión. El paso `/auth/confirmar` valida mediante `POST`, las seis plantillas de Supabase quedaron sincronizadas el 27/10/2026 con `TokenHash`, identidad Tenlo y contenido íntegramente en español, y la solicitud, el éxito y el fallo están medidos. La recuperación real se completó en móvil el 27/10/2026: recepción, confirmación segura, creación de contraseña, feedback de éxito y acceso posterior funcionaron correctamente.
- La zona gratuita `tenlo.es` está activa en Cloudflare con la raíz `A 216.198.79.1` y `www CNAME 4b8f150f986f3ce8.vercel-dns-017.com`, ambos en modo Solo DNS. La resolución pública utiliza `david.ns.cloudflare.com` y `norah.ns.cloudflare.com` desde el 06/10/2026.
- DonDominio no necesita un buzón adicional para el piloto: Cloudflare Email Routing reenvía `solicitudes@tenlo.es` a `tenlocerca@gmail.com`, mientras Resend gestiona el envío transaccional desde `notificaciones.tenlo.es`.

---

# Fase 0 — Decisiones de producto que desbloquean el MVP

Estas decisiones deben cerrarse antes de construir más superficie.

## Segmento inicial y propuesta de valor

- [x] Elegir el ámbito inicial: actividades y servicios familiares verificables en Las Rozas, Majadahonda, Pozuelo y Boadilla.
- [x] Ordenar las subcategorías para que el piloto no intente activar todas al mismo tiempo (`DEFINICIONES-OPERATIVAS-PILOTO.md`).
- [x] Definir la necesidad concreta que Tenlo ayuda a resolver en ese segmento.
- [x] Definir qué significa una opción adecuada para esa necesidad.
- [x] Definir la propuesta de valor para la familia en una frase.
- [x] Definir la propuesta de valor para el proveedor en una frase.
- [x] Fijar el mínimo inicial en 10 proveedores activos, al menos dos categorías prioritarias y dos municipios.
- [x] Dejar fuera de la activación inicial canguros particulares, intercambio entre familias, transporte y oferta sin identidad profesional verificable.

## Definiciones operativas

- [x] Definir **conexión útil**: solicitud relevante entregada, respondida en 48 horas con disponibilidad, alternativa o siguiente paso y utilidad confirmada al menos por una parte.
- [x] Definir cuándo un proveedor está **reclamado**, **completo**, **verificado**, **publicado**, **activo** e **inactivo**.
- [x] Fijar un SLA inicial de primera respuesta de 48 horas naturales desde la entrega efectiva.
- [x] Definir qué constituye una solicitud relevante: el proveedor puede marcarla con motivo estructurado y Javier resuelve discrepancias.
- [x] Medir por separado respuesta, conversación, propuesta, reserva y contratación; los últimos resultados serán autodeclarados durante el piloto.
- [x] Mantener separados el nivel de confianza y el plan comercial.
  - `Verified`: confianza comprobable.
  - `Pro`: plan comercial con herramientas o beneficios adicionales.
- [x] Decidir si la reclamación de ficha requiere cuenta desde el principio.
  - Recomendación para el piloto: permitir una solicitud inicial sin registro y verificar la identidad después, para reducir fricción.
- [x] Contacto inicial a un único proveedor; selección asistida por Tenlo si no hay disponibilidad o respuesta dentro del SLA.

---

# Fase 1 — Imprescindible antes de contactar proveedores

## P0. Infraestructura, seguridad y despliegue

- [x] Actualizar Next.js y dependencias a versiones soportadas sin avisos críticos conocidos.
- [x] Repetir `npm audit`, `typecheck`, `lint` y `build` tras la actualización. Resultado del 10/10/2026: 0 críticos, 8 altos y 3 moderados; tipado, lint y build correctos.
- [ ] Planificar y validar la migración a Next.js 16 y Tailwind CSS 4 para eliminar los avisos restantes sin regresiones visuales ni funcionales. El plan, criterios, pruebas y rollback están definidos en `PLAN-MIGRACION-NEXT16-TAILWIND4.md`; falta ejecutar la migración en una rama y validar el preview.
- [x] Evitar que las páginas privadas conectadas a Supabase se ejecuten durante el prerender del build.
- [x] Hacer que las rutas privadas muestren un mensaje operativo claro cuando falten variables de Supabase en tiempo de ejecución. El área personal, datos de cuenta, favoritos, publicaciones, solicitudes y publicación degradan a un estado seguro sin exponer errores técnicos.
- [x] Crear `.env.example` sin secretos con todas las variables requeridas y su finalidad.
- [x] Documentar variables por entorno: local, preview y production, incluyendo exposición, comportamiento cuando faltan y comprobaciones previas al despliegue.
- [x] Auditar en Vercel la presencia de Supabase, Resend, Cookiebot, URL pública y correo administrativo por entorno.
- [x] Añadir las variables ausentes detectadas en la auditoría y volver a desplegar. `NEXT_PUBLIC_SITE_URL`, Cookiebot, GTM, `RESEND_API_KEY` y `MAIL_FROM` están configurados en sus entornos previstos. El redespliegue de Production `6DVC2TZvP` terminó en estado `Ready` el 16/10/2026.
- [x] Corregir en Supabase Auth la `Site URL` a `https://tenlo.es` y añadir `https://tenlo.es/auth/callback` a la lista permitida. Configuración aplicada y redirect OAuth verificado el 16/10/2026; se mantienen temporalmente Kiryco y localhost por compatibilidad.
- [x] Completar la conexión de `tenlo.es` y `www.tenlo.es` a Vercel: raíz en producción y redirección `308` de `www` verificadas.
- [x] Definir dominio canónico y redirección única: raíz `tenlo.es`; `www` redirige con `308` a la raíz.
- [x] Cambiar los nameservers en DonDominio a los asignados por Cloudflare.
- [x] Verificar que Cloudflare marque la zona como activa y que la resolución pública use `david.ns.cloudflare.com` y `norah.ns.cloudflare.com`.
- [x] Sustituir `kiryco.vercel.app` en configuración, metadata, emails, sitemap y enlaces absolutos.
- [x] Verificar SSL, sitemap, robots, canonical y Open Graph en el dominio definitivo: HTTPS y HSTS activos, rutas públicas con respuesta `200` y metadata generada desde `https://tenlo.es`.
- [x] Añadir una comprobación automática en GitHub para `typecheck`, `lint` y `build` en cada cambio mediante `.github/workflows/quality.yml`, con permisos de solo lectura y cancelación de ejecuciones obsoletas.
- [ ] Decidir si los previews deben permanecer protegidos y mantener producción pública.

## P0. Veracidad y confianza del contenido actual

- [x] Eliminar cifras por defecto que puedan parecer reales, como las `100` familias registradas.
- [x] Revisar el mensaje `100% moderado y seguro`; sustituirlo por una afirmación demostrable.
- [x] Retirar del directorio público los perfiles personales y proveedores de ejemplo sin identidad ni fuente verificable; las futuras fichas de particulares solo se publicarán tras un alta real y revisión.
- [ ] Revisar cada ficha mock antes de hacerla pública como ficha real.
- [ ] No considerar una web oficial como verificación suficiente por sí sola.
- [x] Definir los niveles visibles de confianza: `No verificada`, `Gestionada`, `Verificada` y `Oficial`, independientes del plan comercial y de la titularidad del centro.
- [x] Mostrar en cada ficha la fuente, fecha de última revisión y estado de control por el proveedor cuando corresponda. Los campos pendientes se muestran de forma explícita y las fuentes oficiales enlazan a su origen.
- [x] Utilizar etiquetas breves y comprensibles para el estado de confianza: `No verificada`, `Gestionada`, `Verificada`, `Oficial`.
- [x] Crear un mecanismo sencillo para solicitar corrección, retirada o actualización desde cada ficha, con motivo estructurado, contexto de la ficha y plazo máximo visible de 4 días laborables.
- [x] Identificar visual y semánticamente las imágenes genéricas como `Imagen ilustrativa` para no presentarlas como fotografías oficiales del proveedor o centro.
- [x] Documentar para cada imagen remota su fuente, licencia y fecha de revisión (`INVENTARIO-IMAGENES.md`); sustituirla por material oficial cuando el titular lo aporte y autorice.
- [x] Revisar la promesa principal de reserva: la portada comunica ahora búsqueda, comparación y contacto. Las menciones restantes describen condiciones o información publicada por terceros, no una reserva dentro de Tenlo.

## P0. Modelo de datos real

- [x] Elegir Supabase como fuente de verdad definitiva para autenticación, perfiles y operación del marketplace.
- [x] Aplicar y verificar las migraciones de reclamación anónima, perfiles ampliados, búsquedas y solicitudes de conexión.
- [x] Crear una capa de acceso a datos para Supabase con retorno seguro a `mock-data.ts` mientras se valida la migración.
- [x] Activar la capa de Supabase en las páginas públicas y validar paridad y reversibilidad. Production usa `DIRECTORY_DATA_SOURCE=supabase`; el despliegue público reproduce 21 centros, 14 proveedores y 16 servicios, sirve las rutas nuevas y mantiene un fallback editorial si la consulta falla. Comunidad y alguna taxonomía estática siguen siendo contenido editorial por diseño.
- [x] Crear una migración y un generador de importación idempotente para fichas editoriales no reclamadas, sin inventar propietarios ni elevar su confianza por defecto.
- [x] Auditar el inventario inicial completo y migrar a Supabase todo lo útil del piloto: de 24 centros y 22 proveedores organizativos únicos se admiten 21 centros y 14 proveedores con 16 servicios contrastados; el resto queda clasificado y fuera de publicación hasta disponer de evidencia suficiente. Las tres salas de Hanky Planet pertenecen a un único proveedor y los tres perfiles personales ficticios quedan fuera. Véase `docs/AUDITORIA-LOTE-PROVEEDORES.md`.
  - [x] Importar y verificar el bloque 1 en Supabase: 11 centros, 11 proveedores no reclamados y 13 servicios; cero huérfanos, propietarios ficticios, duplicados o niveles de confianza elevados. Seed repetido sin alterar recuentos el 11-10-2026.
  - [x] Contrastar y preparar siete centros adicionales con fuentes oficiales; corregir nombre y teléfono cuando el dato inicial estaba desactualizado.
  - [x] Importar y verificar en Supabase los siete centros adicionales: 18 centros totales; cero servicios huérfanos, propietarios ficticios, fichas reclamadas o niveles de confianza elevados el 13-10-2026.
  - [x] Contrastar e importar tres centros adicionales con fuente oficial: E.I. Los Álamos, CEIP Francisco de Quevedo y E.I. Talín. Resultado: 21 centros; 0 servicios huérfanos, propietarios asignados o fichas reclamadas el 13-10-2026.
  - [x] Retener fuera de Supabase tres centros sin correspondencia oficial suficiente en el municipio indicado: E.I. Juan de Austria, E.I. El Principito y Colegio Engage.
  - [x] Contrastar y preparar Pulso Música, The Magic Forest y Centro Cultural Volturno con fuentes oficiales específicas.
  - [x] Importar y verificar el lote de Pulso Música, The Magic Forest y Centro Cultural Volturno: 14 proveedores y 16 servicios; segunda ejecución sin duplicados y contadores de integridad a cero el 13-10-2026.
  - [x] Contrastar los 8 proveedores organizativos restantes: seis registros didácticos o no sostenibles excluidos y dos polideportivos retenidos mientras continúan en obras.
- [ ] Normalizar proveedores, servicios, categorías, municipios y zonas de cobertura. Los cuatro municipios y las tres categorías pobladas están auditados y son canónicos; `business_profiles.category` queda documentado como especialidad visible, no como dimensión analítica. Falta que los proveedores confirmen cobertura y poblar `service_municipalities`; véase `AUDITORIA-TAXONOMIA-PILOTO.md`.
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
  - [x] estado de publicación en el esquema, reglas de lectura y área personal;
  - [x] preparar en el esquema nivel de confianza;
  - [x] preparar en el esquema plan comercial independiente;
  - [x] fecha de última revisión visible en la trazabilidad de centros, proveedores y anuncios;
  - [x] fuente y URL de la fuente visibles y enlazadas cuando existe una fuente pública;
  - [x] preparar en el esquema porcentaje de ficha completa; `0027` lo recalcula en servidor al crear o editar una ficha sin conceder esa columna al titular;
  - [x] preparar en el esquema disponibilidad para recibir solicitudes;
  - [ ] categorías y zonas aceptadas; el área profesional ya permite confirmar municipio principal, varios municipios de servicio y zona libre, pero el modelo de categorías múltiples sigue pendiente de estabilizar;
  - [x] preparar en el esquema preferencias de contacto;
  - [x] preparar en el esquema motivo de inactividad o rechazo.
- [x] Añadir historial de cambios y responsable de cada modificación. La migración `0017_admin_queue_status_history.sql` registra automáticamente cada cambio; el 16/10/2026 se validaron dos transiciones reversibles con responsable y fecha en `/admin`.
- [ ] Definir reglas RLS y permisos para proveedor, familia, moderación y administración. Las migraciones `0025`–`0030` y `0032` ya están aplicadas; la verificación de catálogo confirma RPC públicos acotados, tablas base sin lectura anónima, campos de moderación protegidos, funciones administrativas con `search_path` vacío y propuestas inmutables. Falta completar la prueba cruzada de anónimo, familia, proveedor y `tenlo_admin` en producción para cerrar la tarea.
- [ ] Crear copias de seguridad y procedimiento de recuperación. El procedimiento, frecuencia, retención, prueba y criterios de escalado están definidos en `COPIAS-Y-RECUPERACION.md`; falta ejecutar la primera copia y una restauración aislada.

## P0. Flujo para reclamar y enriquecer una ficha

- [x] Crear una landing específica para proveedores que explique valor antes de pedir esfuerzo.
- [x] Cambiar el CTA principal de `Validar ficha` a una opción más clara según el estado: `¿Es tu negocio?` o `Gestionar esta ficha`.
- [x] Permitir localizar la ficha desde la landing del proveedor mediante el CTA `Buscar mi ficha` hacia el directorio de servicios.
- [x] Diseñar onboarding progresivo, implementado en `/mi-ficha-profesional` como seis bloques guiados con completitud visible, datos opcionales y validaciones antes del envío:
  1. confirmar relación con el negocio;
  2. corregir datos esenciales;
  3. definir servicios y zona;
  4. indicar disponibilidad y solicitudes deseadas;
  5. aportar evidencias de verificación;
  6. revisar y enviar.
- [x] Permitir que una cuenta profesional complete y reenvíe su ficha pendiente o rechazada desde `/mi-ficha-profesional`. Los cambios de una ficha ya aprobada quedan bloqueados y vuelven al flujo de corrección revisada para evitar publicaciones sin moderación.
- [x] Evitar pedir todos los datos antes de mostrar la ficha actual y el beneficio de actualizarla mediante un primer paso de confirmación y contexto.
- [x] Confirmar por email la recepción y explicar el siguiente paso y plazo.
- [x] Conservar los datos profesionales introducidos durante el alta. Tras confirmar el email se crea, una sola vez, una ficha privada `pending_review` y `No verificada`; web, descripción, zona, modalidad, disponibilidad y evidencias declaradas dejan de ser campos de formulario sin persistencia.
- [x] Completar acciones para aprobar, pedir información o rechazar reclamaciones. La petición de información se envía por email y queda registrada como nota interna; las decisiones evitan envíos duplicados y muestran si el aviso falló.
- [ ] Notificar al proveedor cuando la ficha se publique o necesite cambios. Las reclamaciones y las nuevas fichas profesionales aprobadas o rechazadas generan un email de estado; la cola permite solicitar información concreta por email y conserva el texto como nota interna. La cola, el historial y sus permisos de `0028` ya están aplicados; falta validar un envío real de aprobación, petición de información y rechazo.
- [x] Permitir que el proveedor solicite baja o retirada mediante el formulario contextual de mantenimiento, siempre sujeto a revisión administrativa.
- [x] Registrar cada estado y tiempo del flujo para poder medirlo mediante `created_at`, `updated_at` y el historial privado de cambios de estado.

## P0. Operación manual del piloto

- [ ] Preparar una hoja/CRM inicial de proveedores contactables, con base jurídica y origen del dato. La exportación administrativa ya incorpora fichas profesionales, contacto, estado, confianza, plan, origen y fuente; falta validar y registrar la base jurídica antes de utilizarla para prospección.
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
- [x] Aplicar y verificar en Supabase el modelo de dirección profesional, coordenadas verificadas, visibilidad de ubicación y municipios de servicio mediante la migración `0014`, distinguiendo negocios físicos de profesionales móviles.
- [ ] Permitir al proveedor confirmar o corregir dirección, coordenadas, visibilidad y municipios al reclamar su ficha. El área profesional ya permite dirección, varios municipios y nivel de visibilidad; las coordenadas existentes se muestran al administrador y solo habilitan ubicación exacta si fueron verificadas, pero falta un flujo seguro de corrección/geocodificación.
- [ ] Sustituir la búsqueda aproximada por un mapa embebido solo cuando existan coordenadas verificadas, consentimiento/cookies y una estimación de coste aceptada.
- [ ] Sustituir filtros genéricos por los atributos que realmente permiten decidir en el segmento inicial. Los filtros visibles de confianza, precio y disponibilidad ya aplican valores reales y no aproximaciones silenciosas; falta validar con familias qué atributos por vertical cambian una decisión.
- [x] Mostrar el número de resultados sin sugerir que más siempre es mejor.
- [x] Registrar visualmente búsquedas sin resultados y crear una salida útil para limpiar filtros o pedir ayuda a Tenlo.
- [x] Permitir proponer desde una búsqueda sin resultados un proveedor con nombre, web, ubicación y servicio; conservarlo pendiente de revisión antes de crear una ficha `No verificada`.
- [ ] Crear el flujo administrativo que convierta una propuesta revisada en ficha `No verificada`, evitando la publicación automática de datos aportados por usuarios.
- [x] Permitir comparar un número pequeño de opciones con campos homogéneos. Favoritos permite elegir entre dos y tres fichas y contrasta categoría, municipio, cobertura, edad, precio, disponibilidad, confianza y revisión sin ocultar campos pendientes.
- [x] Hacer visibles cobertura, disponibilidad, actualización y confianza. Las fichas muestran zona o ubicación según el tipo de proveedor, campos homogéneos de disponibilidad, nivel de confianza y un bloque de origen, última revisión y control de la ficha; los datos ausentes se declaran pendientes.
- [x] Revisar el orden de resultados y definir criterios transparentes de ranking. El buscador prioriza coincidencias en el nombre cuando hay texto y después usa orden alfabético; la explicación está visible junto al recuento.
- [x] Separar claramente resultados orgánicos de posiciones patrocinadas. En el piloto no existen posiciones patrocinadas y el buscador declara que ni el plan comercial ni la confianza compran una mejor posición; cualquier producto futuro deberá etiquetarse y mantenerse separado.

## P1. Solicitud de contacto

- [x] Activar los CTAs visibles de contacto y reporte de las fichas mediante formularios internos contextuales como solución operativa provisional.
- [x] Activar `Guardar favorito` para dirigir a registro/inicio de sesión o al área de favoritos según el estado local de sesión.
- [x] Persistir el guardado real de favoritos por usuario en Supabase y permitir añadir/quitar una ficha desde el propio CTA y desde `/favoritos`.
- [x] Diseñar un único flujo de solicitud dentro de Tenlo para el piloto, con formulario asociado a la ficha y consulta posterior en `Mis solicitudes`.
- [x] Mantener en la ficha tres vías diferenciadas cuando estén disponibles:
  - [x] `Solicitar información` dentro de Tenlo;
  - [x] `Llamar`, con icono y enlace `tel:` mobile first en fichas canónicas con teléfono público;
  - [x] `Visitar web oficial` en fichas canónicas con URL pública;
- [x] Medir por separado el inicio de contacto interno, llamada, email y web; la conexión útil solo se confirma mediante feedback posterior de la familia.
- [x] Recoger solo la información necesaria para que el proveedor decida si puede ayudar.
- [x] Evitar datos identificativos o sensibles de menores mediante instrucciones explícitas y confirmación de persona adulta.
- [x] Preparar entidad `connection_requests` con ID, familia, proveedor, categoría, zona, estado y marcas de tiempo.
- [x] Confirmar a la familia que la solicitud ha sido enviada y comunicar el objetivo operativo de respuesta o alternativa en un máximo de 48 horas.
- [ ] Notificar al proveedor con un enlace seguro para responder. El backoffice ya sustituye la antigua casilla manual por un envío real al titular, enlaza `/solicitudes-profesionales` y solo registra el aviso tras aceptar el email. `0034` se aplicó y verificó el 25/10/2026; la cuenta controlada `tenloediciones@gmail.com` está invitada y aislada, pero falta confirmar su email y validar el primer envío.
- [x] Permitir registrar respuesta, rechazo, falta de disponibilidad y una actualización visible para la familia desde el backoffice.
- [ ] Permitir que el titular responda desde una bandeja profesional sin ver la identidad ni los datos de contacto de la familia. `/solicitudes-profesionales`, los RPC restringidos y la asignación automática están implementados; `0034_provider_connection_flow.sql` se aplicó y verificó el 25/10/2026 con ejecución anónima denegada. Falta confirmar la cuenta proveedora controlada y completar el recorrido extremo a extremo.
- [x] Permitir que el proveedor declare por separado si una solicitud encaja con su oferta, aunque no tenga disponibilidad. `0035_provider_lead_relevance.sql` se aplicó y verificó el 26/10/2026; la bandeja individual y el informe administrativo muestran volumen, respuesta, tiempo mediano y relevancia sin exponer datos de la familia.
- [x] Registrar aviso al proveedor, primera respuesta, cierre y última actualización comunicada a la familia. Falta estructurar los motivos de rechazo cuando haya volumen suficiente.
- [ ] Si no hay respuesta, recordar al proveedor y ofrecer alternativas a la familia.
- [x] Guardar la petición y la alternativa ofrecida en Supabase como estado y seguimiento operativo, no solo como email.
- [x] Crear una bandeja administrativa con avisos de solicitudes sin respuesta, alternativas pendientes y conversaciones que requieren intervención.
- [x] Enviar además una notificación al correo operativo configurable mediante `ADMIN_EMAIL`, junto con confirmación operativa a la familia cuando haya email de cuenta. Dirección prevista: `solicitudes@tenlo.es`.
- [x] Preguntar a la familia si la conexión fue útil cuando ya existe respuesta, alternativa o cierre. Falta habilitar la valoración equivalente del proveedor.
- [x] Preguntar a la familia si avanzó a información, conversación, propuesta, reserva o contratación.
- [ ] Evitar que email, teléfono y web externos sean la única fuente de contacto si se necesita medir resultados.

## P1. Backoffice mínimo

- [x] Completar la vista administrativa con fichas y resultados. La bandeja privada reúne reclamaciones, solicitudes, publicaciones/bajas e incidencias; muestra contactos, referencias, notas internas, seguimiento, resultados útiles y métricas básicas del piloto.
- [x] Permitir corregir estados sin editar directamente la base de datos. Interfaz, API restringida e historial validados de extremo a extremo el 16/10/2026; el registro usado en la prueba recuperó su estado original.
- [x] Crear alertas para reclamaciones pendientes, solicitudes sin respuesta y fichas desactualizadas. `/admin` destaca solicitudes abiertas durante más de 48 horas, moderaciones pendientes durante más de cuatro días laborables y fichas sin revisar durante 180 días.
- [x] Registrar notas operativas sin exponerlas al proveedor o a la familia. Las notas quedan protegidas por RLS, solo se muestran a `tenlo_admin` y conservan autor y fecha.
- [x] Exportar datos básicos para seguimiento manual durante el piloto mediante un CSV privado, limitado a `tenlo_admin`, sin textos libres y protegido frente a fórmulas de hoja de cálculo.

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

- [x] Crear la cuenta y propiedad GA4 de Tenlo y el flujo web de producción para `tenlo.es`. El entorno de pruebas queda pendiente hasta que el volumen lo justifique.
- [x] Crear un contenedor GTM separado para Tenlo bajo la cuenta gestionada por Javier y publicar su primera versión.
- [x] Eliminar el ID de GTM hardcodeado y moverlo a configuración por entorno.
- [x] Implementar en código Consent Mode con almacenamiento analítico/publicitario denegado por defecto y sincronización con las decisiones de Cookiebot.
- [ ] Completar la verificación de consentimiento: rechazo y carga posterior a la aceptación estadística comprobados en producción. El 08/10/2026 se corrigió el orden de arranque para fijar el consentimiento denegado antes de Cookiebot; Tag Assistant confirmó el nuevo orden, `provider_profile_viewed`, `analytics_storage=granted` y la etiqueta genérica de GA4 completada. Falta confirmar la recepción en GA4 desde un navegador externo y revisar los parámetros finales.
- [x] Crear el informe base `Tenlo - adquisición, búsqueda y conexiones` en Looker Studio y conectarlo a la propiedad GA4 de Tenlo.
- [ ] Construir las páginas y gráficos de Looker Studio cuando GA4 confirme recepción de datos; no presentar ceros iniciales como rendimiento real.
- [ ] Revisar Cookiebot antes de que venza la prueba Premium de 14 días y confirmar el plan gratuito aplicable, sin activar una suscripción de pago.
- [x] Prohibir técnicamente el envío a GA4 de nombre, email, teléfono, texto libre, direcciones precisas o información de menores mediante un filtro central aplicado antes del `dataLayer` y de los atributos de medición.
- [x] Crear el diccionario inicial y la taxonomía `1.0` de eventos; mantenerla versionada conforme se implementen los flujos.
- [x] Definir identificadores estables no personales y derivarlos centralmente cuando existan los datos de origen:
  - `provider_id`;
  - `profile_id`;
  - `request_id`;
  - `category_id`;
  - `municipality_id`;
  - `search_id`;
  - `experiment_id` y `variant_id` se incorporarán cuando se active el primer experimento, no antes.
- [x] Definir qué eventos se envían desde cliente, cuáles desde servidor y cuáles desde ambos con deduplicación en `QA-ANALITICA.md`.
- [x] Añadir en el cliente `event_id`, timestamp ISO y versión del esquema a los eventos enviados al `dataLayer`.
- [x] Añadir timestamp de servidor, versión de esquema y `event_id` único a solicitudes y reclamaciones mediante la migración `0015`, reutilizando el mismo ID en el evento de cliente.
- [ ] Crear entornos de prueba y reglas para excluir tráfico interno.
- [x] Aislar cuentas, fichas y solicitudes controladas mediante `is_test`; `0036_test_account_isolation.sql` impide que las fichas de prueba aparezcan en el directorio público y los informes excluyen sus cuentas y solicitudes.
- [x] Preparar un procedimiento de QA con GTM Preview, GA4 DebugView y validación en Supabase (`QA-ANALITICA.md`).
- [ ] Definir retención, acceso, borrado y anonimización de datos. La matriz operativa, el flujo de supresión y los requisitos técnicos están documentados en `RETENCION-Y-SUPRESION.md`; faltan validar los plazos jurídicamente, completar la identidad del responsable y probar una baja real con una cuenta de prueba.

## P0. Informes de búsquedas, fichas y verticales

Tenlo debe poder explicar qué buscan las familias y qué rendimiento obtiene cada ficha o vertical. No basta con medir páginas vistas agregadas.

### Qué se busca en Tenlo

- [x] Preparar entidad `search_events` con ID anónimo, consulta normalizada, filtros y número de resultados.
- [x] Registrar en Supabase término saneado, categoría, municipio, filtros, número de resultados y momento de la búsqueda, tanto para personas anónimas como autenticadas.
- [x] Clasificar búsquedas con categoría en verticales estables (`education`, `education_support`, `activities`, `care`, `school_goods`); falta clasificar por intención las búsquedas de texto sin categoría.
- [x] Registrar reformulaciones enlazadas durante 30 minutos mediante `previous_search_id` y `search_id`, sin guardar ni enviar a GA4 el texto o su firma local.
- [x] Registrar búsquedas sin resultados y permitir identificar búsquedas con pocos resultados mediante `results_count`.
- [x] Distinguir cuándo existen fichas de proveedor pero ninguna ha confirmado que acepta solicitudes, tanto en interfaz como en GA4 y en los filtros persistidos de `search_events`.
- [x] Registrar qué resultados se renderizaron y en qué posición, vinculados mediante `search_id`.
- [x] Relacionar búsqueda con ficha vista, guardado, compartido y contacto mediante un `search_id` anónimo activo durante 30 minutos. Respuesta y conexión útil se incorporarán cuando exista el flujo del proveedor.
- [x] Sanear el texto libre antes de persistirlo, descartar posibles emails o teléfonos y no enviarlo a GA4.
- [ ] Crear un informe de demanda. La vista interna `/admin/demanda` permite comparar 30, 90 y 180 días, filtrar por categoría y municipio, detectar tendencias y seguir el recorrido consentido hasta respuesta y conexión útil; faltan clasificación de intención y utilidad por término:
  - [ ] términos e intenciones más buscados; ya muestra términos saneados, falta clasificar intención;
  - [x] categorías y verticales con más demanda;
  - [x] demanda por municipio y periodos comparables de 30, 90 y 180 días;
  - [x] búsquedas emergentes frente al periodo anterior equivalente, con un umbral mínimo de tres búsquedas actuales;
  - [x] búsquedas sin oferta suficiente;
  - [x] búsquedas que terminan en contacto, respuesta o alternativa y conexión útil, enlazadas con un `event_id` técnico sin mostrar identidad;
  - [ ] términos con tráfico pero poca utilidad;
  - [x] oportunidades para captar nuevos proveedores o crear nuevas fichas.

### Tráfico y rendimiento de cada ficha

La persistencia propia, la migración `0024` y el informe privado están desplegados y documentados en `MEDICION-RENDIMIENTO-FICHAS.md`. El informe permite comparar 30, 90 y 180 días y filtrar visibilidad y detalle por categoría y municipio; falta validar volumen suficiente de eventos consentidos reales antes de cerrar todas las métricas.

- [x] Medir impresiones renderizadas de la ficha en resultados de búsqueda.
- [x] Medir posición y búsqueda de origen mediante un `search_id` compartido; falta extenderlo a otros tipos de listado.
- [x] Medir la primera vista de cada ficha por sesión del navegador con `view_scope=session_unique`, evitando inflarla con recargas; mantener `page_view` separado para el tráfico general.
- [x] Medir fuente/medio/campaña, entrada orgánica, referencia, navegación interna y tráfico directo sin guardar la URL completa de referencia ni UTMs que parezcan datos personales.
- [ ] Medir scroll o consumo de secciones relevantes solo si ayuda a tomar una decisión de producto.
- [x] Medir guardados, compartidos, clics externos, inicios de contacto y solicitudes completadas, con categoría, vertical, municipio y ficha estables cuando estén disponibles.
- [x] Relacionar solicitudes con respuesta, tiempo de respuesta, utilidad y resultado mediante `connection_requests` y `connection_feedback`.
- [ ] Calcular por ficha:
  - [x] impresiones;
  - [x] visitas únicas por sesión del navegador;
  - [x] CTR desde resultados;
  - [x] tasa de visita a contacto;
  - [x] tasa de contacto completado como solicitud sobre intención de contacto;
  - [x] tasa de respuesta dentro del SLA de 48 horas, oculta con menos de cinco solicitudes;
  - [x] conexiones útiles atribuidas a la ficha desde el feedback familiar;
  - [x] datos de calidad y frescura mediante nivel de confianza y fecha de última revisión, separados del plan comercial.
- [x] No mostrar tasas o rankings cuando la muestra sea demasiado pequeña: las tasas comparativas por ficha se ocultan con menos de 20 impresiones y los rankings de texto libre requieren al menos tres búsquedas.

### Rendimiento por vertical

- [x] Aplicar a vistas, impresiones, guardados, compartidos y contactos de cada ficha una dimensión estable `vertical_id` además de categoría y tipo de proveedor, normalizada centralmente antes de `dataLayer`.
- [ ] Crear informes comparables para colegios, guarderías, servicios, actividades y futuras verticales.
- [ ] Comparar volumen de demanda, cobertura de oferta, engagement, contacto, respuesta y resultado por vertical.
- [ ] Poder desglosar por municipio, categoría, estado de reclamación, confianza, plan y periodo.
- [ ] No comparar verticales como si tuvieran la misma frecuencia natural o intención de uso.
- [ ] Utilizar GA4 para análisis agregado y la base de datos para el histórico por ficha; un `provider_id` de alta cardinalidad no debe depender exclusivamente de dimensiones personalizadas de GA4.

## P0. Base de usuarios, consentimiento y futura activación de marketing

Supabase, ya integrado en el proyecto, debe ser la fuente de verdad para autenticación y perfiles. GA4 y Looker Studio no son una base de datos de usuarios ni deben contener información personal identificable.

Para el MVP se puede comenzar con un nivel gratuito compatible con el volumen del piloto, pero antes de abrir el registro hay que comprobar límites, copias de seguridad, región, retención y costes de crecimiento del plan vigente.

### Datos de cuenta y perfil

- [x] Permitir recuperar una contraseña olvidada mediante enlace seguro de Supabase Auth y establecer una nueva contraseña sin intervención manual.
- [x] Completar las invitaciones de proveedor en una pantalla propia: validar el token en servidor, crear contraseña, confirmar el resultado y dirigir a la ficha profesional. Los enlaces inválidos o consumidos ofrecen recuperación sin mostrar detalles técnicos.
- [x] Mantener un modelo `profiles` separado de `auth.users` y unido mediante el UUID de la cuenta.
- [x] Conservar teléfono, municipio, centro relacionado y consentimiento al materializar el perfil después de confirmar el email; antes se perdían en el recorrido de confirmación.
- [ ] Revisar y completar los campos del registro:
  - [x] nombre de usuario o nombre público;
  - [x] email verificado mediante Supabase Auth;
  - [x] tipo de usuario: familia, proveedor, centro u otro;
  - [x] municipio o zona general;
  - [x] centro relacionado opcional;
  - [ ] categorías o necesidades de interés, opcionales;
  - [ ] idioma y preferencias de comunicación;
  - [x] fecha y canal de registro; `created_at` conserva la fecha y `0031` añade canal de email, Google o desconocido;
  - [x] fuente, medio, campaña y landing de adquisición; `0031` los persiste desde valores saneados, sin query string, término buscado ni referrer completo;
  - [x] estado de onboarding; `0031` separa activación operativa de la moderación de la cuenta;
  - [x] fecha de última actividad significativa; `0033` la actualiza sin conceder escritura directa al guardar una ficha profesional, gestionar favoritos, enviar una publicación o solicitar contacto;
  - [ ] estado de cuenta, baja y solicitud de eliminación.
- [x] Permitir que la persona consulte sus datos, corrija municipio, contraseña y consentimiento, descargue una copia privada en JSON y solicite su eliminación. La exportación `1.1` incluye perfil, fichas profesionales, favoritos, publicaciones, solicitudes, reclamaciones, historial de consentimiento y búsquedas asociadas a la cuenta. La ejecución administrativa de borrado/anonimización sigue el procedimiento pendiente de gobierno del dato.
- [x] Evitar recoger nombres de menores, clase, horarios, fecha de nacimiento u otros datos sensibles en el registro.
- [x] No hacer público el centro, email, municipio o intereses de una familia por defecto; `profiles` solo es legible por su titular.
- [x] No duplicar contraseñas, tokens o datos gestionados por Supabase Auth en tablas propias.
- [x] Mostrar en el informe privado de usuarios las cuentas con actividad significativa en los últimos 30 días, sin exponer identidades ni textos libres.

### Consentimientos

- [ ] Separar aceptación de condiciones, privacidad, comunicaciones operativas y marketing.
- [x] Añadir consentimiento de marketing explícito, opcional y no premarcado en newsletter y registro; falta ampliar preferencias si se crean finalidades comerciales distintas.
- [ ] Guardar para cada consentimiento: finalidad, versión del texto, fecha, origen y estado actual. La migración `0029` ya está aplicada y crea el historial inmutable de marketing sin IP ni datos de navegación; falta comprobar una concesión y retirada reales antes de cerrar la tarea.
- [x] Permitir retirar el consentimiento desde Datos de cuenta y conservar la fecha de retirada mediante la migración `0012`.
- [ ] No enviar campañas comerciales a personas que solo aceptaron comunicaciones necesarias para prestar el servicio.
- [ ] Definir finalidades concretas antes de añadir nuevos campos al registro.

### Seguridad y gobierno del dato

- [x] Mantener los datos personales de perfil en tablas protegidas con RLS y acceso del titular.
- [x] Resolver las advertencias del Security Advisor sobre funciones y políticas públicas; newsletter y feedback siguen abiertos, pero solo admiten filas acotadas y válidas.
  - [x] Aplicar y verificar `0010_harden_database_functions.sql`; ambos avisos de funciones han desaparecido del Security Advisor.
  - [x] Aplicar `0011_guard_public_intake_policies.sql`, probar ambas inserciones bajo rol `anon` dentro de una transacción revertida y volver a ejecutar el Security Advisor.
- [ ] Activar la protección de contraseñas filtradas antes de abrir el registro real. Supabase la limita al plan Pro o superior; en el plan gratuito actual debe asumirse como riesgo pendiente o cubrirse con otra estrategia antes del lanzamiento.
- [x] No exponer claves de servicio de Supabase en el cliente.
- [x] Separar PII de tablas de eventos y utilizar IDs internos seudónimos para análisis.
- [x] Restringir exportaciones y accesos administrativos; registrar quién descarga datos, el ámbito, la fecha y el número de registros, sin duplicar el contenido exportado en el historial.
- [x] Retirar endpoints públicos de correo sin consumidores (`/api/register` y `/api/contact`) para evitar abuso del proveedor de email; el registro usa Supabase Auth y el soporte utiliza la cola moderada de feedback o el correo oficial.
- [ ] Añadir protección antiabuso al registro antes de captar usuarios: el 26/10/2026 se observaron varias cuentas no verificadas con nombres y direcciones aparentemente automatizados. Revisar límites de Auth, protección de bots/CAPTCHA y registro de intentos sin bloquear altas legítimas.
- [x] Unificar el envío de publicaciones en una ruta autenticada con validación en servidor, alta en la cola, aviso operativo y confirmación a la cuenta; retirar el endpoint de email público que no estaba conectado al formulario.
- [ ] Definir política de retención para cuentas inactivas, solicitudes, búsquedas y consentimientos. Existe una propuesta concreta en `RETENCION-Y-SUPRESION.md`, pendiente de validación jurídica y de implementar las fechas y automatizaciones necesarias.
- [ ] Completar el procedimiento administrativo de acceso, rectificación y eliminación. La portabilidad básica ya está disponible mediante una exportación JSON privada; la baja se registra una sola vez como solicitud revisable y genera aviso operativo y confirmación. Falta ejecutar y documentar el cierre efectivo de una baja real.
- [ ] Preparar copias de seguridad y restauración antes de almacenar información real. El runbook está documentado en `COPIAS-Y-RECUPERACION.md`; falta generar la primera copia cifrada y demostrar su restauración en un destino aislado.
- [ ] Revisar privacidad y seguridad antes de incorporar un CRM, plataforma de emailing o nuevo conector.

### CRM y campañas futuras

- [x] Decidir si el primer CRM será una vista operativa sobre Supabase o una herramienta externa. Para el piloto se usará el backoffice de Tenlo y su CSV controlado; una herramienta externa solo se evaluará cuando el volumen justifique sincronización y gobierno adicional.
- [x] Mantener Supabase como fuente maestra y sincronizar al CRM solo los campos necesarios. No existe todavía sincronización externa; la exportación administrativa es manual, privada, trazada y contiene únicamente campos operativos definidos.
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

- [x] `search_started`: se emite al enviar una búsqueda válida desde Home o `/buscar`, sin incluir el texto buscado.
- [x] `search_submitted`
- [x] `search_results_viewed`
- [x] `search_zero_results`
- [x] `filter_applied`: se emite al aplicar filtros válidos y registra solo categoría, municipio, cantidad de filtros y presencia de palabra clave.
- [x] `provider_impression`
- [x] `provider_profile_viewed`
- [x] `provider_compared`: se emite al abrir una comparación de dos o tres favoritos y registra solo el número de opciones, no el contenido de la selección.
- [x] `provider_saved`
- [x] `provider_unsaved`
- [x] `provider_shared`: disponible en fichas de centro, servicio y anuncio; registra menú nativo completado o copia de enlace, nunca una cancelación.
- [x] `provider_suggestion_started`
- [x] `provider_suggestion_submitted`
- [x] `map_directions_clicked`

Propiedades recomendadas: `search_id`, categoría, municipio, zona, número de resultados, filtros, posición del proveedor, fuente/medio/campaña y tipo de dispositivo.

### Contacto y resultado familiar

- [x] `contact_started`
- [x] `contact_form_completed`
- [x] `request_created`
- [x] `request_failed`
- [x] `provider_notified` (marca de primera notificación inmutable en backend).
- [x] `provider_response_received` (primera respuesta inmutable y estado auditable en backend).
- [x] `family_viewed_response` (una vez por solicitud y sesión al entrar la respuesta en viewport; el ID se usa solo en `sessionStorage` y no se envía a GA4).
- [x] `connection_marked_useful`
- [x] `outcome_reported`

Propiedades recomendadas: `request_id`, proveedor, categoría, municipio, posición de origen, tipo de solicitud, resultado, motivo de no avance y bucket de tiempo de respuesta. Los textos libres permanecen en backend y no se envían a GA4.

### Activación y ciclo del proveedor

- [x] `provider_landing_viewed`
- [x] `claim_started`
- [x] `claim_submitted`
- [x] `claim_approved` (derivado del historial administrativo de estados, sin enviarlo a GA4).
- [x] `claim_rejected` (derivado del historial administrativo de estados, sin enviarlo a GA4).
- [x] `profile_edit_started`
- [x] `profile_section_completed`
- [x] `profile_submitted`
- [ ] `profile_published`
- [x] `verification_requested` (equivalente al envío trazable de `claim_submitted`).
- [ ] `verification_approved`
- [ ] `provider_request_viewed` (instrumentado y con `0034` aplicada; pendiente de validar el recorrido real).
- [ ] `provider_request_responded` (instrumentado y con `0034` aplicada; pendiente de validar el recorrido real).
- [ ] `provider_request_declined` (instrumentado y con `0034` aplicada; pendiente de validar el recorrido real).
- [x] `lead_relevance_reported` (persistido como señal operativa y emitido a GA4 solo con consentimiento; pendiente de obtener la primera muestra real).
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

- [x] **Conexiones útiles mensuales**: solicitudes respondidas o con alternativa que la familia valora como útiles; se conserva además el resultado declarado. La relevancia del proveedor y el cumplimiento de SLA se muestran como dimensiones separadas hasta disponer de muestra suficiente.
- [x] Mostrar por separado volumen, porcentaje y tiempo; el informe privado de rendimiento separa solicitudes, tasa de respuesta o alternativa, tiempo mediano, resultados confirmados y conexiones útiles, sin combinarlos en una puntuación.

### Funnel de familias

- [ ] Búsquedas iniciadas y completadas. El informe privado ya muestra búsquedas completadas persistidas; falta confirmar en GA4 los inicios consentidos para comparar ambas poblaciones.
- [x] Porcentaje de búsquedas con resultados, con volumen y denominador visibles en el informe privado de demanda.
- [x] Resultados medios y fichas vistas por búsqueda, enlazados mediante `search_id` anónimo y sin contar tráfico directo.
- [x] Tasa de ficha vista a contacto iniciado, calculada sobre búsquedas únicas con ficha vista.
- [x] Tasa de contacto iniciado a solicitud enviada, calculada sobre búsquedas únicas con intención de contacto.
- [x] Tasa de solicitudes con respuesta o alternativa, calculada sobre solicitudes creadas en el periodo de 90 días.
- [ ] Mediana y percentiles de tiempo de respuesta. La mediana ya se muestra en el informe privado; faltan percentiles cuando haya muestra suficiente.
- [x] Volumen y tasa de conexiones útiles sobre el feedback familiar recibido; la North Star se muestra además en ventana de 30 días.
- [x] Tasa de resultado confirmado sobre el feedback recibido, manteniendo el denominador visible.
- [ ] Recuperación de búsquedas guardadas y retorno cuando reaparece una necesidad.

### Funnel de proveedores

- [ ] Proveedores identificados, contactados y que visitan la landing.
- [ ] Tasa de inicio y envío de reclamación.
- [x] Tiempo hasta aprobación, calculado como mediana desde la creación de la ficha hasta el cambio administrativo a `approved` dentro del periodo seleccionado.
- [x] Tasa de perfil suficientemente completo, con umbral operativo del 75 % y desglose por categoría y municipio en `/admin/proveedores`.
- [x] Tiempo hasta publicación, equivalente en el piloto a la aprobación que incorpora la ficha al directorio público; se muestra sin inventar valor cuando no hay muestra.
- [x] Tiempo hasta primera solicitud, calculado por ficha desde su creación hasta la primera solicitud histórica asignable.
- [x] Tasa de primera respuesta y mediana de tiempo sobre las solicitudes asignables del periodo, manteniendo visible el denominador.
- [x] Proveedores activos a 7, 30 y 90 días según `last_significant_activity_at`, sin confundir aprobación con actividad.
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
- [ ] **Proveedores:** `/admin/proveedores` ya agrega oferta actual, altas, reclamaciones, completitud, aprobaciones, tiempos hasta publicación y primera solicitud, solicitudes, respuesta, relevancia declarada y actividad a 7/30/90 días, con periodos 30/90/180 y filtros de categoría y municipio; faltan outreach, visitas a la landing y motivos de abandono.
- [ ] **Liquidez:** oferta y demanda por categoría/municipio, cobertura, tiempos y concentración.
- [ ] **Ficha del proveedor:** visibilidad, impresiones, aperturas, guardados, solicitudes, respuesta y resultados, sin confundir tráfico con clientes.
- [ ] **Calidad y confianza:** frescura, verificación, incidencias, relevancia y privacidad.
- [ ] **Monetización:** pricing, activación del plan, ingresos y churn cuando exista producto de pago.
- [ ] **Demanda y buscador:** términos, intenciones, verticales, municipios, cero resultados, reformulaciones y conversión hasta conexión útil.
- [ ] **Rendimiento de fichas y verticales:** impresiones, visitas, CTR, contactos, respuestas y conexiones útiles por proveedor, categoría y vertical.
- [ ] **Usuarios y consentimiento:** registros, activación, perfiles completos, centros/intereses declarados, origen de adquisición y base activable para marketing. `/admin/usuarios` ya presenta altas, roles, onboarding, canal, municipio, campaña y consentimiento de forma agregada; `0031` está aplicada y faltan datos reales de prueba e intereses cuando exista una finalidad definida.

## Reglas para Looker Studio u otra herramienta

- [x] Crear una primera capa de datos estable: taxonomía `dataLayer` versionada y migración `0009` con dimensiones de búsqueda y vista agregada diaria sin PII.
- [x] Aplicar y verificar la migración `0009_analytics_foundations.sql` en Supabase antes de desplegar el código que escribe sus nuevas columnas.
- [x] Documentar para cada KPI: definición, fórmula, fuente, frecuencia, propietario y limitaciones en `CATALOGO-DE-KPIS-Y-REPORTING.md`.
- [ ] Mostrar intervalos comparables y filtros por categoría, municipio, estado de ficha, plan y canal. Demanda y rendimiento ya permiten filtrar por categoría y municipio, y demanda, rendimiento, usuarios y consentimiento comparan ventanas comunes de 30, 90 y 180 días; faltan estado de ficha, plan y canal donde sean aplicables.
- [ ] No comparar poblaciones distintas sin explicar la unidad.
- [ ] Diferenciar `0`, `sin dato` y `no aplicable`.
- [ ] Añadir notas cuando cambie una definición o implementación.
- [x] Evitar rankings con muestras pequeñas: consultas y oportunidades exigen tres búsquedas; las tasas de rendimiento por ficha exigen 20 impresiones.
- [ ] Establecer umbrales mínimos de privacidad antes de mostrar segmentos. Ya se aplican tres búsquedas para texto libre y 20 impresiones para tasas por ficha; falta validar jurídicamente y extender la regla a futuros informes exportables.
- [ ] Preparar exportación a BigQuery cuando el volumen o la unión GA4/backend lo justifique.

---

# Fase 4 — Loops y crecimiento después del núcleo

## P2. Loop del proveedor

`Demanda real -> reclamar ficha -> mejorar información -> recibir solicitudes relevantes -> responder -> percibir valor -> mantener ficha activa`

- [ ] Mostrar demanda real del segmento sin exagerarla.
- [ ] Crear informe periódico de presencia, interés, solicitudes, respuesta y resultado. `/admin/proveedores` ofrece el agregado interno y `/solicitudes-profesionales` ya muestra a cada titular volumen, tasa de respuesta, tiempo mediano y relevancia; faltan visibilidad, guardados, resultados, comparación temporal y un formato periódico compartible.
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
- [ ] Completar superficies legibles por LLMs sin exponer datos privados ni saltarse permisos. Base implementada: HTML semántico, Schema.org, `robots.txt`, sitemap, `llms.txt` y relación `describedby`; criterios documentados en `DESCUBRIBILIDAD-IA-Y-LLMS.md`. Pendiente: decidir la política específica de GPTBot, validar plantillas con datos estructurados y evaluar Markdown por ficha, API o MCP solo después del MVP.

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

- [x] Segmento inicial decidido.
- [x] Propuesta de valor y mensaje revisados.
- [x] Dominio definitivo operativo.
- [x] Dependencias críticas actualizadas; no quedan avisos críticos conocidos, aunque las migraciones mayores siguen planificadas.
- [x] Build reproducible y variables documentadas.
- [x] Lote inicial admisible revisado, con fuente y fecha; las fichas sin evidencia suficiente permanecen fuera.
- [ ] Flujo de reclamación probado de extremo a extremo.
- [x] Cola de moderación operativa con acceso restringido a `tenlo_admin` y exportación básica para seguimiento manual.
- [x] Emails de autenticación funcionando de extremo a extremo en los recorridos probados de alta, invitación y recuperación. `notificaciones.tenlo.es`, DKIM, SPF/CNAME, DMARC y SMTP están activos; las seis plantillas están sincronizadas con el paso seguro `/auth/confirmar` y la recuperación real se validó en móvil el 27/10/2026. Los flujos de cambio de email, acceso mágico y reautenticación se probarán cuando se habiliten en producto.
- [ ] Política de privacidad y condiciones alineadas con los datos recogidos.
- [ ] Taxonomía de eventos P0 implantada y validada.
- [x] Dashboard mínimo en administración para ver colas, vencimientos, solicitudes gestionadas, conexiones útiles y mediana de primera respuesta. Las exportaciones incluyen además el seguimiento y el resultado declarado por la familia.
- [ ] Informe de búsquedas y rendimiento por ficha validado con datos de prueba.
- [ ] Base de perfiles con RLS, consentimiento de marketing y proceso de baja probados.
- [x] Proceso de corrección, retirada y soporte definido.
- [x] Responsable del piloto y tiempos de respuesta definidos.

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
