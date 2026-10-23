# Aplicación segura de las migraciones 0024–0030

Procedimiento para activar medición propia, directorio público acotado, permisos por rol, moderación de altas profesionales e historial de consentimiento. Preparado el 23 de octubre de 2026.

## Regla de despliegue

No publicar los commits de aplicación que consumen estas estructuras antes de aplicar y verificar las siete migraciones. El código nuevo depende de `directory_events`, los RPC públicos, `moderate_business_profile`, `resubmit_business_profile` y `consent_history`.

## Antes de empezar

1. Confirmar que el proyecto abierto es `khwymwnswbemgtpggvpg` y que corresponde a producción de Tenlo.
2. Comprobar que las migraciones 0001–0023 ya están aplicadas.
3. Ejecutar localmente `npm run verify:migrations`.
4. Guardar una copia lógica o exportación recuperable antes de cambiar permisos. Si no se puede obtener, registrar expresamente que la restauración sigue pendiente y no considerar cerrado el bloque de recuperación.
5. Mantener una pestaña con el historial de consultas de Supabase para conservar la evidencia de cada ejecución.

## Orden obligatorio

Ejecutar cada archivo completo y esperar confirmación antes de pasar al siguiente:

1. `0024_directory_performance_events.sql`
2. `0025_public_directory_rpc.sql`
3. `0026_profile_role_hardening.sql`
4. `0027_owner_moderation_hardening.sql`
5. `0028_business_profile_review_queue.sql`
6. `0029_marketing_consent_history.sql`
7. `0030_harden_admin_function_search_paths.sql`

No agruparlos en una edición manual ni cambiar su orden. Si una ejecución falla, detenerse, guardar el error exacto y no publicar la aplicación.

## Verificación en base de datos

Después de aplicar las siete migraciones, ejecutar completo `supabase/verification/0024_0025_directory_controls.sql`.

Resultados esperados:

- `directory_events_exists`, sus tres RPC públicos y `admin_directory_reporting_policy`: `true`.
- El rol anónimo puede insertar en `directory_events`, pero no leer, actualizar ni borrar.
- El rol anónimo no puede leer directamente `centers`, `business_profiles` ni `services`.
- Conteos de referencia del lote auditado: 21 centros, 14 proveedores y 16 servicios. Una diferencia obliga a revisar datos, no a cambiar el valor esperado sin explicación.
- Una cuenta autenticada puede actualizar `display_name`, pero no `role` ni `status`.
- Los campos de contenido autorizados devuelven `true`; estado, confianza, plan y demás campos protegidos devuelven `false`.
- `authenticated_can_update_submissions`: `false`.
- Los RPC de moderación y reenvío profesional: `true` en disponibilidad de ejecución. Su autorización real se decide dentro de cada función.
- `consent_history_exists` y las dos políticas propias: `true`.
- Lectura anónima y escritura directa autenticada en `consent_history`: `false`.
- `proconfig` de `is_tenlo_admin` y `audit_admin_queue_status` contiene un `search_path` vacío.

## Pruebas funcionales antes de publicar

Con cuentas de prueba y sin datos personales reales:

1. Familia: registro, confirmación, acceso, cambio y retirada de consentimiento, exportación de cuenta.
2. Proveedor: registro, confirmación y creación de una única ficha `pending_review` privada.
3. Proveedor: edición de borrador o rechazo y reenvío a revisión.
4. Administrador: lectura de la ficha, nota interna, solicitud de información, aprobación y rechazo.
5. Visitante: solo ve fichas aprobadas y no recibe columnas internas.
6. Analítica: con consentimiento estadístico se guarda un evento permitido; sin consentimiento no se persiste.

## Publicación y comprobación final

1. Publicar los commits pendientes en `main`.
2. Esperar CI y despliegue de Vercel.
3. Ejecutar `npm run verify:production`.
4. Probar en `tenlo.es` las rutas `/admin`, `/admin/rendimiento`, `/mi-ficha-profesional` y una ficha pública.
5. Revisar Security Advisor de Supabase y conservar los avisos que requieran plan de pago o decisión posterior como pendientes documentados.
6. Solo entonces actualizar el porcentaje de `ESTADO-MVP.md` y marcar como terminadas las tareas correspondientes.

## Si algo falla

- No intentar arreglar producción concediendo acceso general a tablas ni usando la clave `service_role` en el navegador.
- No borrar tablas o históricos para repetir una migración.
- Mantener el código sin publicar y diagnosticar la sentencia exacta.
- Si una migración terminó parcialmente, comprobar el catálogo antes de reejecutarla. Las sentencias idempotentes se pueden repetir, pero los cambios de permisos y restricciones deben revisarse uno a uno.
- Si una prueba de privacidad devuelve más acceso del esperado, tratarlo como bloqueo de publicación.
