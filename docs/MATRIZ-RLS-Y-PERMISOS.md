# Matriz RLS y permisos de Tenlo

## Propósito

Inventario estático de las políticas versionadas en `supabase/migrations`. Sirve para revisar quién puede leer o modificar cada grupo de datos antes de activar Supabase como fuente pública del directorio.

Una migración presente en Git no demuestra por sí sola que esté aplicada en producción. La comprobación final debe hacerse en Supabase y con pruebas de usuario anónimo, familia, proveedor y `tenlo_admin`.

## Principios

- Denegar por defecto y conceder la operación mínima necesaria.
- Separar datos públicos del directorio, datos privados de cuenta y datos operativos.
- No confiar solo en que la aplicación seleccione pocas columnas: el permiso de la Data API debe impedir consultar columnas privadas.
- Limitar filas públicas a estados aprobados.
- Mantener texto libre y PII fuera de vistas agregadas y de GA4.
- Evaluar conjuntamente privilegios SQL y políticas RLS: disponer de uno sin el otro no concede acceso, pero ambos deben ser mínimos.

Referencia: [Row Level Security de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Matriz actual

| Entidad | Anónimo | Usuario autenticado | Titular | `tenlo_admin` | Estado / observación |
|---|---|---|---|---|---|
| `profiles` | Sin acceso | Lee su fila; inserta solo rol público y estado inicial válido; actualiza solo columnas de cuenta autorizadas | Igual | Lectura mediante `0022` | `0026` protege rol y estado. `0033` permite registrar solo la actividad significativa propia mediante un RPC acotado; no expone perfiles ajenos. |
| `profile_usernames` | Sin lectura; solo RPC booleano | Lee solo el alias propio | Gestiona la propia | Sin excepción necesaria | Aplicado en `0023`; el cliente no puede enumerar alias ni UUID. |
| `business_profiles` | RPC público seguro | Lee las propias y edita solo contenido permitido | Gestiona las propias | Lectura administrativa | El alta profesional crea una ficha privada pendiente tras confirmar el email. `0025` y `0027` aplicadas: la superficie pública es explícita y confianza, moderación, origen, plan, reclamación y titularidad están protegidos. |
| `centers` | RPC público seguro | Lee propuestas propias | — | Lectura administrativa | `0025` aplicada: el RPC público omite `created_by`, origen y campos internos; la tabla base no tiene lectura anónima. |
| `services` | RPC público seguro | Lee los propios y edita solo contenido permitido | Gestiona los propios | Lectura administrativa | `0025` y `0027` aplicadas: relaciones internas, moderación, confianza y origen no son modificables por el titular. |
| `listings` | Retirada directa prevista | Lee los propios y edita solo contenido permitido | Gestiona los propios | Sin excepción específica | `0025` retira la lectura pública y `0027` protege moderación, confianza y procedencia. Antes de reactivar publicaciones públicas se necesita un RPC seguro equivalente. |
| `community_posts` | Retirada directa prevista | Lee los propios y edita solo contenido permitido | Gestiona los propios | Sin excepción específica | `0025` retira la lectura pública y `0027` reserva moderación y procedencia. La comunidad actual seguirá siendo editorial hasta disponer de un RPC seguro equivalente. |
| `favorites` | Sin acceso | Solo filas propias | Solo filas propias | Sin lectura global | Correcto para el producto actual. |
| `saved_searches` | Sin acceso | Lee, crea, actualiza y elimina solo filas propias | Solo filas propias | Sin lectura global | `0037` conserva únicamente nombre, ruta interna y criterios estructurados; no admite URLs externas ni datos de otras cuentas. |
| `provider_suggestions` | Solo inserción acotada | Solo inserción acotada | — | Lectura y conversión mediante RPC restringido | `0038` separa la propuesta de las incidencias. La conversión exige revisión administrativa, evita duplicados simples y crea una ficha `collected`, sin titular ni solicitudes activas. |
| `submissions` | Sin acceso | Inserta y lee las propias; no las modifica tras enviarlas | Solo las propias | Lee y cambia solo `status` | `0027` y `0032` aplicadas: `payload` y `review_notes` son inmutables; el permiso de estado queda sometido a la política `tenlo_admin`. |
| `contact_events` | Sin acceso | Solo inserción vinculada a sí mismo o sin usuario | — | Sin lectura definida | Tabla residual: confirmar si se conserva o se sustituye por eventos operativos mejor definidos. |
| `newsletter_subscribers` | Solo inserción acotada | Solo inserción acotada | — | Sin lectura desde cliente | Correcto para captación; la explotación debe hacerse desde un entorno administrativo/servidor autorizado. |
| `claim_requests` | Inserta una fila no asignada y pendiente | Inserta y lee las propias | Lee las propias | Lee y cambia estado | Correcto tras las restricciones de `0011`; revisar que toda decisión y comunicación quede auditada. |
| `feedback_requests` | Inserta contenido acotado | Inserta y lee lo propio | Lee lo propio | Lee y cambia estado | Correcto para soporte moderado; requiere protección adicional frente a abuso por volumen. |
| `search_events` | Solo inserción | Solo inserción | — | La vista agregada no tiene concesión pública | Aceptable si el cliente conserva la sanitización; añadir límites de forma/tamaño a `filters` y un mecanismo antiabuso si aparece spam. |
| `directory_events` | Solo inserción de eventos acotados | Solo inserción de eventos acotados | — | Lectura e informe privado | `0024` aplicada y verificada en catálogo: inserción pública, sin lectura, actualización ni borrado públicos. Falta validar eventos reales del recorrido. |
| `connection_requests` | Sin acceso | La familia inserta y lee las propias | Familia: propias | Lee y actualiza campos operativos permitidos | Correcto para el piloto; falta un rol/cuenta de proveedor ligado a la ficha para respuesta segura. |
| `admin_queue_audit` | Sin acceso | Sin acceso salvo admin | — | Solo lectura | Correcto. El trigger registra cambios de estado. |
| `admin_queue_notes` | Sin acceso | Sin acceso salvo admin | — | Lee e inserta | Correcto; nunca se muestra a familias o proveedores. |
| `connection_feedback` | Sin acceso | La familia lee, crea y actualiza el resultado de su solicitud | Familia: propio | Solo lectura | Correcto; falta feedback equivalente del proveedor cuando exista identidad vinculada. |
| `data_export_audit` | Sin acceso | Inserta un registro con su propio UUID | Propio al insertar | Lee todos | Correcto para trazabilidad mínima; no almacena el contenido exportado. |
| `consent_history` | Sin acceso | Lee solo su historial; no escribe directamente | Igual | Lectura administrativa | `0029` aplicada: historial automático e inmutable por finalidad, versión, origen y fecha. Falta validar una concesión y retirada reales. |

## Estado de los cambios obligatorios

Las migraciones `0022` y `0023` se aplicaron en producción el 22 de octubre de 2026. La consulta de control confirmó la existencia de las cinco políticas, ejecución anónima de la comprobación booleana de alias y ausencia de permiso anónimo de lectura sobre `profile_usernames`.

Las migraciones `0024` a `0033` se aplicaron y verificaron en producción el 23 de octubre de 2026. La consulta de catálogo confirmó RPC públicos con 21 centros, 14 proveedores y 16 servicios, tablas base sin lectura anónima, campos de moderación protegidos, historial de consentimiento sin escritura directa, funciones administrativas con `search_path` vacío, nueve campos de atribución, propuestas con contenido inmutable y registro acotado de la actividad propia. El procedimiento y la evidencia esperada están en `APLICACION-MIGRACIONES-0024-0031.md`.

La migración `0037` se aplicó y verificó en producción el 28 de octubre de 2026. La consulta de catálogo confirmó RLS activo, cuatro políticas por propietario, ausencia de lectura para `anon` y CRUD para `authenticated` sometido a esas políticas.

La migración `0038` se aplicó y verificó en producción el 28 de octubre de 2026. La consulta confirmó RLS activo, dos políticas, inserción anónima sin lectura, lectura administrativa y ejecución del RPC de conversión solo para usuarios autenticados; la propia función vuelve a exigir un administrador aprobado.

### Prueba cruzada de producción — 28 de octubre de 2026

Se ejecutaron consultas de solo lectura dentro de transacciones con `SET LOCAL ROLE` y claims de cuentas controladas. Cada transacción terminó con `ROLLBACK`; no se copiaron UUID ni datos personales a este documento.

| Rol probado | Resultado |
|---|---|
| `anon` | Sin privilegio de lectura sobre perfiles, favoritos, solicitudes ni notas. Los RPC públicos devolvieron únicamente las 14 fichas profesionales y 16 servicios aprobados. |
| Familia aprobada | Solo una fila de perfil visible y perteneciente a la sesión; favoritos, búsquedas, solicitudes y consentimientos limitados al propio UUID; cero notas y propuestas administrativas visibles. |
| Proveedor aprobado | Solo su perfil, fichas y servicios vinculados; cero notas administrativas; titularidad, confianza, plan comercial y moderación sin permiso de actualización. |
| `tenlo_admin` aprobado | `is_tenlo_admin()` verdadero; lectura de perfiles y colas administrativas; propuestas y auditoría disponibles; el RPC de recordatorio rechazó correctamente un identificador inexistente. |

Security Advisor se volvió a ejecutar después de las migraciones `0037`–`0040`: **0 errores**, **21 advertencias** y **0 sugerencias informativas**. Las advertencias visibles pertenecen a la categoría genérica de funciones `SECURITY DEFINER` ejecutables por los roles a los que sirven. Se conservan intencionadamente porque:

- los RPC públicos solo devuelven columnas explícitas de fichas aprobadas o un booleano de disponibilidad de alias;
- los RPC del proveedor vuelven a comprobar `auth.uid()` y la titularidad;
- los RPC administrativos vuelven a exigir `is_tenlo_admin()`;
- todas las funciones privilegiadas fijan `search_path` vacío y el verificador de migraciones comprueba revocaciones y concesiones explícitas.

No se observó una advertencia corregible que permita ampliar acceso sin control. Cualquier nueva función privilegiada deberá repetir esta revisión.

Performance Advisor mostró inicialmente **0 errores** y 26 advertencias de planificación RLS relacionadas con llamadas directas a `auth.uid()` en 15 políticas históricas. La migración `0041`, aplicada el 28/10/2026, sustituyó esas llamadas por `(select auth.uid())` sin cambiar las condiciones de acceso. Después de volver a ejecutar el linter quedaron **0 errores**, **11 advertencias** y **23 sugerencias**. Las pruebas de aislamiento de familia y proveedor se repitieron y conservaron todos los resultados esperados.

Las 11 advertencias restantes corresponden a políticas permisivas múltiples creadas para separar propietario, administración e inserción pública. Combinarlas puede alterar la semántica y no se hará como cambio mecánico; se revisarán tabla por tabla cuando el volumen o los planes de consulta lo justifiquen. Las sugerencias informativas se tratarán del mismo modo para no eliminar índices antes de contar con uso representativo del piloto.

1. [x] Permitir que solo un perfil aprobado `tenlo_admin` lea en el backoffice los contactos necesarios para gestionar solicitudes.
2. [x] Hacer que la comprobación de alias devuelva solo `true/false`, limitar los centros públicos a aprobados y permitir leer proveedores aprobados desde el directorio.
3. [x] Aplicar y validar las funciones de directorio con columnas expresamente públicas y retirar lectura directa anónima de las tablas base (`0025`).
4. Evitar añadir a las tablas públicas campos que no deban quedar disponibles mediante la Data API; separar PII nueva en tablas privadas.
5. Probar que los borradores y estados rechazados no aparecen en centros, servicios, fichas ni comunidad. El SQL de control de `0024` y `0025` está en `supabase/verification/0024_0025_directory_controls.sql`.
6. [x] Probar que una familia no puede leer perfiles, favoritos, solicitudes, feedback, notas o exportaciones de otra.
7. [x] Probar que un proveedor no puede autoconcederse rol, estado aprobado, confianza o plan comercial.
8. [x] Ejecutar Security Advisor después de aplicar las migraciones. Performance Advisor se mantiene como revisión de rendimiento separada.

## Casos de prueba mínimos

### Usuario anónimo

- Puede consultar solo fichas aprobadas mediante la superficie pública.
- No puede enumerar UUID de cuentas o alias reservados.
- No puede leer emails, teléfonos familiares, solicitudes, reclamaciones, favoritos o notas.
- Solo puede insertar newsletter, feedback y reclamación dentro de los límites definidos.

### Familia autenticada

- Lee y corrige únicamente su perfil.
- Gestiona solo sus favoritos, búsquedas guardadas, publicaciones, solicitudes y feedback.
- No puede consultar el perfil ni la actividad de otra familia.
- No puede llamar rutas administrativas ni cambiar estados operativos.

### Proveedor autenticado

- Gestiona únicamente los perfiles y servicios vinculados a su cuenta.
- No cambia por sí mismo verificación, plan, moderación o titularidad.
- No accede a una solicitud familiar hasta que exista una relación de proveedor verificada y una política específica.

### Administrador

- El acceso depende simultáneamente de sesión válida, `role = 'tenlo_admin'` y `status = 'approved'`.
- Lee colas, contactos imprescindibles, auditoría y notas.
- Solo actualiza las columnas operativas expresamente concedidas.
- Cada cambio de estado conserva responsable y fecha.

## Criterio de cierre

El punto de backlog de RLS solo podrá marcarse como completado cuando:

- todas las migraciones necesarias estén aplicadas;
- la superficie pública use únicamente vistas/columnas seguras;
- los cuatro perfiles de prueba superen los casos anteriores;
- Security Advisor no muestre advertencias corregibles del esquema propio;
- la evidencia y fecha de la prueba queden añadidas a este documento.

**Criterio cumplido el 28 de octubre de 2026.**
