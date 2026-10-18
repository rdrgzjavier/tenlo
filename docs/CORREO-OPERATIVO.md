# Correo operativo de Tenlo

## Configuración inicial sin buzón adicional

Durante el piloto, `solicitudes@tenlo.es` será una dirección de entrada y una identidad operativa, no un buzón independiente.

1. Crear en DonDominio el reenvío `solicitudes@tenlo.es` hacia `tenlocerca@gmail.com`.
2. Configurar `ADMIN_EMAIL=solicitudes@tenlo.es` en Vercel.
3. Mantener las solicitudes y sus estados en Supabase y en el futuro backoffice. Gmail solo actúa como aviso y canal de respuesta.
4. Verificar recepción, respuesta, SPF, DKIM y DMARC antes de utilizar la dirección con proveedores reales.

## Envío

El reenvío no proporciona por sí mismo un servidor SMTP. Para enviar emails automáticos con el dominio se utilizará el proveedor transaccional configurado mediante `RESEND_API_KEY` y `MAIL_FROM`.

La dirección `solicitudes@tenlo.es` no debe configurarse como remitente visible en Gmail hasta disponer de un método de envío autorizado para el dominio. Si DonDominio no ofrece SMTP dentro del servicio contratado, las respuestas manuales pueden salir temporalmente desde `tenlocerca@gmail.com`, con una firma clara de Tenlo, mientras los avisos automáticos salen por el proveedor transaccional.

No se almacenarán contraseñas de Gmail, DonDominio, Cloudflare, Supabase ni Vercel en el repositorio.

## Emails de autenticación

Supabase exige SMTP propio para editar las plantillas de autenticación en proyectos gratuitos nuevos. La opción recomendada para el piloto es Resend con un subdominio dedicado, por ejemplo `notificaciones.tenlo.es`, y remitente visible `Tenlo <acceso@notificaciones.tenlo.es>`.

La plantilla preparada para **Confirm sign up** está en `docs/PLANTILLA-EMAIL-CONFIRMACION.html` y utiliza exclusivamente la variable oficial `{{ .ConfirmationURL }}`. Asunto recomendado: `Confirma tu cuenta de Tenlo`.

Antes de activarla:

1. [x] Crear la cuenta de Resend de Tenlo y registrar `notificaciones.tenlo.es`.
2. [x] Añadir en Cloudflare los registros DKIM y SPF/CNAME indicados por Resend, todos en modo `Solo DNS`, y una política DMARC inicial de monitorización (`p=none`). Registros publicados y resueltos públicamente el 16/10/2026.
3. [x] Verificar el dominio en Resend y mantener desactivado el seguimiento de enlaces para no alterar el enlace de confirmación de Supabase. Dominio verificado el 16/10/2026.
4. [x] Configurar en Supabase Authentication > Emails > SMTP Settings el host, puerto, usuario, contraseña y remitente de Resend. Supabase confirmó el guardado el 16/10/2026.
5. [ ] Pegar la plantilla, guardar y realizar un alta de prueba en una dirección distinta. La plantilla y el asunto se guardaron el 16/10/2026; falta el alta de prueba.
6. Verificar remitente, asunto, logotipo, CTA, enlace, versión móvil, carpeta de spam y redirección final.

La credencial de producción debe tener solo permiso de envío y quedar restringida a `notificaciones.tenlo.es`. No se guardará en el repositorio. `RESEND_API_KEY` se configura como secreto de Production y `MAIL_FROM=Tenlo <acceso@notificaciones.tenlo.es>` como configuración de Production en Vercel.

La credencial de producción se rotó el 16/10/2026 después de completar la configuración. La clave final tiene únicamente permiso de envío para `notificaciones.tenlo.es`, quedó instalada en Supabase y Vercel, y el despliegue de Production `CsH3pxef5` terminó en estado `Ready`. Las credenciales anteriores fueron revocadas en Resend y el repositorio no contiene el secreto.
