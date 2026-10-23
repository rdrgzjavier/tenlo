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
| `profiles` | Sin acceso | Lee e inserta/actualiza su fila | Igual | Lectura prevista por `0022` | Correcto para cuenta; `0022` debe aplicarse antes de desplegar la vista de contactos del backoffice. |
| `profile_usernames` | Sin lectura; solo RPC booleano | Lee solo el alias propio | Gestiona la propia | Sin excepción necesaria | Aplicado en `0023`; el cliente no puede enumerar alias ni UUID. |
| `business_profiles` | RPC público seguro previsto | Solo filas propias cuando se active la gestión | Gestiona las propias | Lectura administrativa | `0025` está preparada para limitar el directorio a columnas públicas y filas aprobadas, sin `owner_id`, nombre legal ni `details`; falta aplicarla. |
| `centers` | RPC público seguro previsto | Lee propuestas propias | — | Lectura administrativa | `0025` está preparada para ocultar `created_by`, origen y campos internos; falta aplicarla. |
| `services` | RPC público seguro previsto | Gestiona los propios | Gestiona los propios | Lectura administrativa | `0025` está preparada para ocultar `owner_id` y el UUID interno de relación; falta aplicarla. |
| `listings` | Retirada directa prevista | Gestiona los propios | Gestiona los propios | Sin excepción específica | `0025` retirará la lectura pública directa. Antes de reactivar publicaciones públicas se necesita un RPC seguro equivalente. |
| `community_posts` | Retirada directa prevista | Gestiona los propios | Gestiona los propios | Sin excepción específica | `0025` retirará la lectura pública directa. La comunidad actual seguirá siendo editorial hasta disponer de un RPC seguro equivalente. |
| `favorites` | Sin acceso | Solo filas propias | Solo filas propias | Sin lectura global | Correcto para el producto actual. |
| `submissions` | Sin acceso | Inserta/lee/actualiza las propias | Solo las propias | Lee y cambia estado | Correcto; el payload sigue siendo privado. |
| `contact_events` | Sin acceso | Solo inserción vinculada a sí mismo o sin usuario | — | Sin lectura definida | Tabla residual: confirmar si se conserva o se sustituye por eventos operativos mejor definidos. |
| `newsletter_subscribers` | Solo inserción acotada | Solo inserción acotada | — | Sin lectura desde cliente | Correcto para captación; la explotación debe hacerse desde un entorno administrativo/servidor autorizado. |
| `claim_requests` | Inserta una fila no asignada y pendiente | Inserta y lee las propias | Lee las propias | Lee y cambia estado | Correcto tras las restricciones de `0011`; revisar que toda decisión y comunicación quede auditada. |
| `feedback_requests` | Inserta contenido acotado | Inserta y lee lo propio | Lee lo propio | Lee y cambia estado | Correcto para soporte moderado; requiere protección adicional frente a abuso por volumen. |
| `search_events` | Solo inserción | Solo inserción | — | La vista agregada no tiene concesión pública | Aceptable si el cliente conserva la sanitización; añadir límites de forma/tamaño a `filters` y un mecanismo antiabuso si aparece spam. |
| `directory_events` | Solo inserción de eventos acotados | Solo inserción de eventos acotados | — | Lectura e informe privado | Diseño preparado en `0024`, sin PII, texto libre ni cuenta; falta aplicar la migración y validar el flujo. |
| `connection_requests` | Sin acceso | La familia inserta y lee las propias | Familia: propias | Lee y actualiza campos operativos permitidos | Correcto para el piloto; falta un rol/cuenta de proveedor ligado a la ficha para respuesta segura. |
| `admin_queue_audit` | Sin acceso | Sin acceso salvo admin | — | Solo lectura | Correcto. El trigger registra cambios de estado. |
| `admin_queue_notes` | Sin acceso | Sin acceso salvo admin | — | Lee e inserta | Correcto; nunca se muestra a familias o proveedores. |
| `connection_feedback` | Sin acceso | La familia lee, crea y actualiza el resultado de su solicitud | Familia: propio | Solo lectura | Correcto; falta feedback equivalente del proveedor cuando exista identidad vinculada. |
| `data_export_audit` | Sin acceso | Inserta un registro con su propio UUID | Propio al insertar | Lee todos | Correcto para trazabilidad mínima; no almacena el contenido exportado. |

## Estado de los cambios obligatorios

Las migraciones `0022` y `0023` se aplicaron en producción el 22 de octubre de 2026. La consulta de control confirmó la existencia de las cinco políticas, ejecución anónima de la comprobación booleana de alias y ausencia de permiso anónimo de lectura sobre `profile_usernames`.

Las migraciones `0024` y `0025` están preparadas y comprobadas en código, pero no se consideran aplicadas hasta ejecutar y verificar el SQL en Supabase.

1. [x] Permitir que solo un perfil aprobado `tenlo_admin` lea en el backoffice los contactos necesarios para gestionar solicitudes.
2. [x] Hacer que la comprobación de alias devuelva solo `true/false`, limitar los centros públicos a aprobados y permitir leer proveedores aprobados desde el directorio.
3. Aplicar y validar las funciones de directorio con columnas expresamente públicas y retirar lectura directa anónima de las tablas base (`0025`).
4. Evitar añadir a las tablas públicas campos que no deban quedar disponibles mediante la Data API; separar PII nueva en tablas privadas.
5. Probar que los borradores y estados rechazados no aparecen en centros, servicios, fichas ni comunidad. El SQL de control de `0024` y `0025` está en `supabase/verification/0024_0025_directory_controls.sql`.
6. Probar que una familia no puede leer perfiles, favoritos, solicitudes, feedback, notas o exportaciones de otra.
7. Probar que un proveedor no puede autoconcederse rol, estado aprobado, confianza o plan comercial.
8. Ejecutar Security Advisor y Performance Advisor después de aplicar las migraciones.

## Casos de prueba mínimos

### Usuario anónimo

- Puede consultar solo fichas aprobadas mediante la superficie pública.
- No puede enumerar UUID de cuentas o alias reservados.
- No puede leer emails, teléfonos familiares, solicitudes, reclamaciones, favoritos o notas.
- Solo puede insertar newsletter, feedback y reclamación dentro de los límites definidos.

### Familia autenticada

- Lee y corrige únicamente su perfil.
- Gestiona solo sus favoritos, publicaciones, solicitudes y feedback.
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
