# Configuración de entornos de Tenlo

Referencia para mantener separados el desarrollo local, las previews de Vercel y producción. Los valores reales y secretos se almacenan en `.env.local`, Vercel, Supabase o el proveedor correspondiente; nunca en GitHub.

## Principios

- Producción usa datos y servicios reales de Tenlo.
- Preview se utiliza para comprobar cambios antes de publicarlos y no debe enviar comunicaciones reales ni contaminar las métricas de producción.
- Local se utiliza para desarrollo y pruebas con datos no personales.
- Toda variable que empiece por `NEXT_PUBLIC_` puede quedar incluida en el navegador; nunca debe contener secretos.
- `SUPABASE_SERVICE_ROLE_KEY` y `RESEND_API_KEY` son secretos exclusivamente de servidor.
- Después de cambiar variables en Vercel es necesario crear un nuevo despliegue.

## Matriz de variables

| Variable | Local | Preview | Producción | Secreta | Función y comportamiento si falta |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Requerida para probar cuenta y formularios | Requerida | Requerida | No | URL del proyecto Supabase. Las funciones conectadas no pueden operar si falta. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Requerida para probar Supabase | Requerida | Requerida | No | Clave pública preferida para navegador y servidor con RLS. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Opcional | Opcional | Opcional | No | Compatibilidad temporal si no se utiliza la publishable key. No configurar ambas sin necesidad. |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | URL estable de pruebas si se habilita | `https://tenlo.es` | No | Base de metadata, enlaces absolutos y emails. Si falta, el código usa `https://tenlo.es`. |
| `NEXT_PUBLIC_GTM_ID` | Vacía salvo pruebas específicas | Contenedor de pruebas o vacía | Contenedor de Tenlo | No | Activa GTM. Si falta, no se carga GTM. Nunca reutilizar producción en preview sin filtros. |
| `NEXT_PUBLIC_COOKIEBOT_ID` | Vacía normalmente | ID de pruebas o de Tenlo según dominio autorizado | ID de Tenlo | No | Activa Cookiebot. Si falta, no se carga el gestor de consentimiento. |
| `ADMIN_EMAIL` | Email de pruebas | Email de pruebas | `solicitudes@tenlo.es` | No | Destino de avisos operativos. Si falta, el código usa temporalmente `tenlocerca@gmail.com`. |
| `RESEND_API_KEY` | Clave de pruebas opcional | Clave restringida de pruebas o vacía | Clave de producción | Sí | Permite enviar emails. Si falta, la operación continúa pero el email no se envía. |
| `MAIL_FROM` | Remitente de pruebas | Remitente verificado de pruebas | Remitente verificado `@tenlo.es` | No | Identidad remitente. No usar `solicitudes@tenlo.es` hasta verificar el dominio de envío. |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo si una tarea de servidor la necesita | Solo si una tarea de servidor la necesita | Solo cuando exista una función administrativa que la requiera | Sí | Acceso privilegiado que omite RLS. Actualmente no debe exponerse ni añadirse por prevención. |

## Configuración recomendada ahora

### Local

- Copiar `.env.example` a `.env.local` sin añadir este último a Git.
- Usar el proyecto de Supabase únicamente con datos de prueba no personales.
- Mantener GTM, Cookiebot y Resend desactivados salvo que se esté verificando específicamente su integración.
- Usar `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

### Preview de Vercel

- Mantener las variables públicas de Supabase necesarias para probar autenticación y formularios.
- No configurar `RESEND_API_KEY` de producción hasta disponer de destinatarios de prueba y una protección explícita contra envíos reales.
- Mantener GTM vacío o utilizar un contenedor de pruebas separado.
- Si se define `NEXT_PUBLIC_SITE_URL`, utilizar una URL estable y controlada de preview; no fijar una URL efímera que cambie en cada despliegue.
- Decidir antes del piloto si las previews quedarán protegidas por autenticación de Vercel.

### Producción

- `NEXT_PUBLIC_SITE_URL=https://tenlo.es`.
- Supabase URL y publishable key de producción.
- `ADMIN_EMAIL=solicitudes@tenlo.es` cuando el reenvío esté verificado.
- GTM y Cookiebot solo después de validar consentimiento y tráfico real.
- Resend y `MAIL_FROM` solo después de verificar SPF, DKIM, DMARC y el dominio remitente.
- `SUPABASE_SERVICE_ROLE_KEY` únicamente cuando una ruta de servidor implementada la necesite.

## Estado auditado el 5 de octubre de 2026

| Variable | Producción | Preview | Acción pendiente |
| --- | --- | --- | --- |
| Supabase URL y clave pública | Presente | Presente | Mantener y probar flujos reales con cuentas de prueba. |
| `ADMIN_EMAIL` | Presente | Presente | Cambiar a `solicitudes@tenlo.es` cuando el correo esté operativo. |
| `NEXT_PUBLIC_COOKIEBOT_ID` | Presente | Presente | Validar consentimiento en el dominio definitivo. |
| `NEXT_PUBLIC_SITE_URL` | Presente (`https://tenlo.es`) | Ausente | Producción configurada el 06/10/2026; decidir estrategia de preview. |
| `NEXT_PUBLIC_GTM_ID` | Ausente | Ausente | Crear/configurar GTM antes de activar analítica. |
| `SUPABASE_SERVICE_ROLE_KEY` | Ausente | Ausente | No añadir hasta que una función administrativa la necesite. |
| `RESEND_API_KEY` | Ausente | Ausente | Configurar cuando el dominio remitente esté verificado. |
| `MAIL_FROM` | Ausente | Ausente | Configurar junto con Resend y la autenticación del dominio. |

## Comprobación antes de cada despliegue

- [ ] No hay secretos en variables `NEXT_PUBLIC_`.
- [ ] Preview no envía emails a proveedores o familias reales.
- [ ] Producción usa `https://tenlo.es` como URL canónica.
- [ ] Supabase corresponde al entorno esperado.
- [ ] Consentimiento y analítica están desactivados o configurados según el entorno.
- [ ] El remitente de email está verificado antes de enviar.
- [ ] Se ejecutan `npm run typecheck`, `npm run lint` y `npm run build`.
- [ ] Se prueba una ruta pública y una ruta autenticada con datos no personales.

## Rotación y respuesta ante exposición

Si un secreto aparece en GitHub, logs o una captura compartida, no basta con borrarlo del archivo: debe revocarse o rotarse en el proveedor, actualizarse en Vercel y volver a desplegar. Después se comprobarán los registros de acceso y el alcance de la exposición.
