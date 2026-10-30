# Retención, supresión y anonimización de datos en Tenlo

## Objetivo y alcance

Este procedimiento convierte el principio de conservar solo lo necesario en tareas operativas para el piloto. Cubre cuentas, consentimientos, búsquedas, solicitudes, reclamaciones, propuestas, incidencias, auditoría y copias de seguridad.

No sustituye una revisión jurídica de la política de privacidad ni fija por sí solo plazos obligatorios. Los plazos siguientes son la configuración operativa inicial propuesta para Tenlo; antes de ejecutar el primer borrado masivo deben validarse con la identidad fiscal del responsable, las obligaciones aplicables y las posibles necesidades de defensa ante reclamaciones.

Referencias públicas:

- [Principios de protección de datos de la AEPD](https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/principios)
- [Derecho de supresión de la AEPD](https://www.aepd.es/preguntas-frecuentes/1-tus-derechos/2-tus-derechos-de-proteccion-de-datos/FAQ-0111-que-es-el-derecho-de-supresion-derecho-al-olvido)
- [Protección de datos por defecto de la AEPD](https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/medidas-de-cumplimiento/proteccion-de-datos-por-defecto)

## Criterios de Tenlo

1. Supabase es la fuente maestra de cuentas, consentimientos y actividad operativa.
2. GA4 y Looker Studio reciben datos agregados o identificadores internos, nunca nombre, email, teléfono, texto libre, dirección precisa ni datos de menores.
3. El borrado de una cuenta no debe borrar fichas editoriales públicas que Tenlo pueda conservar legítimamente; sí debe eliminar la relación con la persona o sustituirla por un propietario nulo cuando corresponda.
4. La anonimización debe ser irreversible. Sustituir un email por otro código reversible no equivale a anonimizar.
5. Una excepción por obligación legal, fraude, seguridad o reclamación debe documentar finalidad, alcance, responsable y fecha de revisión. No permite conservar toda la cuenta por defecto.
6. Las copias de seguridad no se editan registro a registro. Un dato suprimido puede permanecer en una copia cifrada hasta que esta rote, pero no debe reintroducirse en producción durante una restauración.

## Matriz operativa inicial

| Conjunto | Finalidad | Regla inicial | Acción al vencer | Excepción o revisión |
|---|---|---|---|---|
| Cuenta y perfil activo | Prestar el servicio | Mientras la cuenta esté activa | No aplica | Revisión anual de campos y permisos |
| Cuenta sin actividad | Evitar perfiles personales olvidados | Revisar tras 24 meses sin actividad significativa | Avisar al titular y, si no reactiva en 30 días, cerrar y aplicar el flujo de supresión | No automatizar hasta registrar `last_meaningful_activity_at` |
| Solicitud de borrado | Atender el derecho y cerrar la cuenta | Resolver con prioridad operativa y dejar constancia de las actuaciones | Eliminar Auth y datos de perfil; anonimizar relaciones que deban conservarse | Escalar si existe una reclamación, fraude o conservación legal documentada |
| Consentimiento de marketing | Probar alta, baja y exclusión | Mientras esté activo; al retirarlo cesa el uso comercial inmediatamente | Mantener solo la evidencia mínima de alta y retirada durante el plazo validado jurídicamente | La evidencia no autoriza nuevos envíos |
| Búsquedas saneadas | Analizar demanda y cobertura | 14 meses de eventos detallados | Conservar únicamente agregados sin usuario ni sesión, si siguen siendo útiles | Revisar antes si aparece texto personal pese al saneamiento |
| Eventos GA4 | Producto y adquisición agregados | Ajustar la retención de GA4 a la mínima que permita comparar el piloto | Expiración gestionada por GA4 | No exportar PII ni URLs con parámetros personales |
| Solicitudes de contacto | Gestionar conexión y medir resultado | 12 meses desde el cierre | Eliminar mensaje y referencias personales; conservar métricas agregadas | Ampliación solo por incidencia o reclamación documentada |
| Reclamaciones de ficha | Verificar representación y cambios | 24 meses desde la resolución | Eliminar contacto y documentos; conservar estado, fecha y cambios no personales | Revisar documentación con obligaciones específicas antes de borrar |
| Propuestas de fichas | Moderar y alimentar el directorio | 12 meses desde la resolución | Eliminar datos del remitente; conservar la ficha editorial aprobada sin vínculo personal | El contenido rechazado se elimina antes si carece de utilidad |
| Avisos e incidencias | Corregir contenido, seguridad y privacidad | 24 meses desde el cierre | Anonimizar o eliminar contacto y texto libre; conservar categoría y resolución agregadas | Incidencias de seguridad siguen su expediente específico |
| Notas y auditoría administrativa | Trazabilidad y control de acceso | 24 meses, con revisión anual | Eliminar notas libres; conservar solo hechos mínimos necesarios | No copiar PII del expediente a la nota |
| Newsletter sin cuenta | Enviar comunicaciones consentidas | Hasta baja, rebote definitivo o retirada | Bloquear envíos y conservar solo la exclusión mínima necesaria | No reactivar sin un consentimiento nuevo |
| Copias de seguridad | Recuperación | Según `COPIAS-Y-RECUPERACION.md` | Rotación cifrada | Tras restaurar, repetir supresiones posteriores a la fecha de la copia |

## Flujo administrativo de una solicitud de supresión

1. La persona solicita la baja desde `Datos de cuenta` o por el canal publicado.
2. Tenlo crea una única tarea administrativa y envía acuse de recibo, sin ejecutar un borrado irreversible desde el navegador.
   La persona puede consultar el estado desde `Datos de cuenta`; mientras esté pendiente no puede duplicar la solicitud.
3. El administrador verifica que la solicitud corresponde a la cuenta autenticada. Si llegó por email, pide la mínima verificación necesaria.
4. Se revisan relaciones: favoritos, publicaciones, proveedores reclamados, solicitudes de contacto, feedback, notas, consentimientos y posibles expedientes abiertos.
5. Se decide por conjunto de datos entre:
   - eliminar;
   - anonimizar de forma irreversible;
   - conservar de manera bloqueada por una excepción documentada.
6. Se elimina la cuenta de Auth al final, después de desvincular o anonimizar las relaciones que lo requieran.
7. Se registra en la auditoría únicamente: solicitud, responsable, fecha, conjuntos tratados, resultado y excepciones. No se copia el contenido eliminado.
8. Se confirma la finalización a la persona y se cierra la tarea.
   En el backoffice, `Baja completada` se selecciona solo después de ejecutar los pasos anteriores; el cambio no elimina datos por sí mismo y envía el email de cierre. `No procede` también genera un aviso para poder revisar el caso.
9. Si se restaura una copia anterior, se consulta el registro de supresiones y se repiten las eliminaciones antes de reabrir el servicio.

## Requisitos técnicos antes de automatizar

- `last_significant_activity_at` ya registra la actividad operativa. Antes de automatizar, añadir fechas específicas `deletion_requested_at` y `deletion_completed_at` y un estado de ciclo de vida separado del estado de moderación.
- Crear un registro de supresión separado, sin contenido original, accesible solo a `tenlo_admin`.
- Definir una función o tarea programada que seleccione candidatos, pero que no elimine cuentas con expedientes abiertos.
- Eliminar primero PII y texto libre; ejecutar los agregados estadísticos antes de borrar el detalle.
- Probar el proceso con una cuenta de prueba y verificar RLS, portabilidad, Auth, favoritos, solicitudes y auditoría.
- Añadir una comprobación a la prueba de restauración para impedir la reaparición de cuentas ya suprimidas.

## Revisión mensual del responsable

- Solicitudes de baja abiertas y fecha de recepción.
- Consentimientos retirados que aún aparezcan en listas de envío.
- Registros que superen su regla operativa.
- Notas administrativas con datos personales innecesarios.
- Exportaciones descargadas y necesidad de destruirlas.
- Copias de seguridad vencidas o sin prueba de restauración.
- Excepciones abiertas, motivo y próxima fecha de revisión.

## Decisiones necesarias antes del piloto con usuarios reales

- Completar la identidad y domicilio del responsable en la política de privacidad.
- Validar jurídicamente los plazos propuestos y las bases de legitimación por finalidad.
- Determinar el canal único para derechos y el sustituto si `hola@tenlo.es` no está atendido.
- Aprobar qué actividad cuenta como `actividad significativa`.
- Decidir si la ejecución de bajas seguirá siendo manual durante el piloto o si se programa una tarea con doble confirmación.
