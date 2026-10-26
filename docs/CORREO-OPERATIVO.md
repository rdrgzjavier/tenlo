# Correo operativo de Tenlo

## Configuración inicial sin buzón adicional

Durante el piloto, `solicitudes@tenlo.es` será una dirección de entrada y una identidad operativa, no un buzón independiente.

1. [x] Crear en Cloudflare Email Routing el reenvío `solicitudes@tenlo.es` hacia `tenlocerca@gmail.com`; no requiere un buzón adicional en DonDominio.
2. [x] Configurar `ADMIN_EMAIL=solicitudes@tenlo.es` en Vercel.
3. [x] Mantener las solicitudes y sus estados en Supabase y en el backoffice. Gmail actúa como aviso y canal de respuesta manual.
4. [x] Verificar recepción, SPF, DKIM y DMARC antes de utilizar la dirección con proveedores reales.

## Envío

El reenvío no proporciona por sí mismo un servidor SMTP. Para enviar emails automáticos con el dominio se utilizará el proveedor transaccional configurado mediante `RESEND_API_KEY` y `MAIL_FROM`.

La dirección `solicitudes@tenlo.es` no debe configurarse como remitente visible en Gmail hasta disponer de un método de envío autorizado para el dominio. Si DonDominio no ofrece SMTP dentro del servicio contratado, las respuestas manuales pueden salir temporalmente desde `tenlocerca@gmail.com`, con una firma clara de Tenlo, mientras los avisos automáticos salen por el proveedor transaccional.

No se almacenarán contraseñas de Gmail, DonDominio, Cloudflare, Supabase ni Vercel en el repositorio.

## Emails de autenticación

Supabase exige SMTP propio para editar las plantillas de autenticación en proyectos gratuitos nuevos. La opción recomendada para el piloto es Resend con un subdominio dedicado, por ejemplo `notificaciones.tenlo.es`, y remitente visible `Tenlo <acceso@notificaciones.tenlo.es>`.

Las seis plantillas de autenticación de Supabase deben utilizar la identidad visual de Tenlo, lenguaje claro en español y el remitente `Tenlo <acceso@notificaciones.tenlo.es>`. Las comunicaciones transaccionales enviadas directamente por la aplicación utilizan la misma cabecera, posicionamiento y pie mediante `tenloEmailShell`.

Los enlaces de un solo uso no deben apuntar directamente a `{{ .ConfirmationURL }}` ni ejecutar la validación al recibir un `GET`: los sistemas antispam pueden abrirlos antes que la persona y consumirlos. Tenlo construye los enlaces con `{{ .TokenHash }}` y los envía primero a `/auth/confirmar`; la validación solo se ejecuta cuando la persona pulsa el botón de esa página.

| Plantilla | Asunto | Tipo | Destino tras confirmar |
|---|---|---|---|
| Confirm sign up | `Confirma tu cuenta de Tenlo` | `email` | `/area-personal` |
| Invite user | `Tu invitación a Tenlo` | `invite` | `/completar-invitacion` |
| Magic link or OTP | `Tu acceso seguro a Tenlo` | `magiclink` | `/area-personal` |
| Change email address | `Confirma tu nuevo email de Tenlo` | `email_change` | `/area-personal` |
| Reset password | `Crea una nueva contraseña de Tenlo` | `recovery` | `/restablecer-contrasena` |
| Reauthentication | `Tu código de seguridad de Tenlo` | OTP `{{ .Token }}` | flujo que lo solicite |

Las siete notificaciones de seguridad de Supabase (cambios de contraseña, email, teléfono, métodos de acceso y MFA) permanecen desactivadas. No se activarán hasta revisar su contenido, el volumen esperado y el procedimiento de respuesta ante cambios no reconocidos; mientras estén desactivadas no generan comunicaciones sin personalizar.

La plantilla de referencia para confirmación está en `docs/PLANTILLA-EMAIL-CONFIRMACION.html`. El enlace de los correos con acción usa esta estructura:

```text
{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=<tipo>&next=<ruta-interna>
```

Antes de activarla:

1. [x] Crear la cuenta de Resend de Tenlo y registrar `notificaciones.tenlo.es`.
2. [x] Añadir en Cloudflare los registros DKIM y SPF/CNAME indicados por Resend, todos en modo `Solo DNS`, y una política DMARC inicial de monitorización (`p=none`). Registros publicados y resueltos públicamente el 16/10/2026.
3. [x] Verificar el dominio en Resend y mantener desactivado el seguimiento de enlaces para no alterar el enlace de confirmación de Supabase. Dominio verificado el 16/10/2026.
4. [x] Configurar en Supabase Authentication > Emails > SMTP Settings el host, puerto, usuario, contraseña y remitente de Resend. Supabase confirmó el guardado el 16/10/2026.
5. [x] Pegar las plantillas de alta e invitación y realizar un alta de prueba.
6. [ ] Sincronizar las seis plantillas con el recorrido `/auth/confirmar`, verificar remitente, asunto, logotipo, CTA y redirección final, y repetir una recuperación real. Mantener la revisión móvil y de spam dentro de las pruebas periódicas.

La credencial de producción debe tener solo permiso de envío y quedar restringida a `notificaciones.tenlo.es`. No se guardará en el repositorio. `RESEND_API_KEY` se configura como secreto de Production y `MAIL_FROM=Tenlo <acceso@notificaciones.tenlo.es>` como configuración de Production en Vercel.

La credencial de producción se rotó el 16/10/2026 después de completar la configuración. La clave final tiene únicamente permiso de envío para `notificaciones.tenlo.es`, quedó instalada en Supabase y Vercel, y el despliegue de Production `CsH3pxef5` terminó en estado `Ready`. Las credenciales anteriores fueron revocadas en Resend y el repositorio no contiene el secreto.
