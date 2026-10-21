# Copias de seguridad y recuperación de Tenlo

## Objetivo y estado actual

Este procedimiento protege la base de datos de producción de Tenlo sin guardar datos personales, contraseñas ni copias de producción dentro del repositorio Git.

Tenlo utiliza actualmente Supabase Free. En este plan no debe asumirse que existe una copia diaria descargable o una restauración puntual administrada. Supabase recomienda realizar exportaciones lógicas periódicas con su CLI y conservarlas fuera de la plataforma. Las copias de base de datos tampoco incluyen los archivos de Storage, solo sus metadatos.

Documentación oficial de referencia:

- [Database Backups](https://supabase.com/docs/guides/platform/backups)
- [Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
- [Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)

## Responsable, frecuencia y objetivos

- Responsable inicial: Javier.
- Copia lógica: diaria mientras existan altas, solicitudes o cambios reales.
- Copia adicional: inmediatamente antes de una migración, importación masiva o cambio destructivo.
- Conservación propuesta: 7 copias diarias, 4 semanales y 3 mensuales.
- RPO inicial: como máximo 24 horas de datos.
- RTO inicial: recuperar una operación básica en menos de 4 horas desde que se decide restaurar.
- Prueba de restauración: mensual y siempre sobre un proyecto nuevo o un entorno local, nunca directamente sobre producción.

La frecuencia y retención deben revisarse cuando crezcan el volumen, la criticidad o las obligaciones legales.

## Qué debe conservarse

1. `roles.sql`: roles de Postgres.
2. `schema.sql`: estructura, políticas RLS, funciones y triggers incluidos por la CLI.
3. `data.sql`: datos de las tablas.
4. `supabase/migrations/`: historial versionado en Git, sin secretos.
5. Inventario separado de configuración: Auth, SMTP, URLs, variables de Vercel, extensiones y políticas que no formen parte del volcado.
6. Exportación separada de objetos de Supabase Storage si Tenlo empieza a alojar imágenes o documentos. Un volcado de base de datos no recupera esos archivos.

## Dónde guardar las copias

- Carpeta local cifrada fuera del repositorio.
- Segunda copia cifrada en una ubicación controlada por Javier y distinta del equipo principal.
- Acceso limitado al responsable operativo.
- Nunca subir `roles.sql`, `schema.sql` o `data.sql` al repositorio, adjuntarlos a incidencias ni enviarlos por email.

Nombre recomendado para cada carpeta:

```text
tenlo-supabase-AAAA-MM-DD-HHMM/
  roles.sql
  schema.sql
  data.sql
  SHA256SUMS.txt
  control.txt
```

`control.txt` debe contener fecha, responsable, proyecto de origen, versión de la CLI, resultado y observaciones, pero nunca la URL de conexión ni una contraseña.

## Crear una copia lógica

Requisitos: Docker Desktop, Supabase CLI y la cadena **Session pooler** obtenida desde `Connect` en Supabase. La contraseña no se escribe en documentación ni se guarda en el repositorio.

En una consola PowerShell fuera del historial compartido:

```powershell
$env:TENLO_DB_URL = "postgresql://postgres.PROJECT_REF:PASSWORD@POOLER:5432/postgres"
supabase db dump --db-url "$env:TENLO_DB_URL" -f roles.sql --role-only
supabase db dump --db-url "$env:TENLO_DB_URL" -f schema.sql
supabase db dump --db-url "$env:TENLO_DB_URL" -f data.sql --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes"
Get-FileHash roles.sql, schema.sql, data.sql -Algorithm SHA256 | Format-Table -AutoSize
Remove-Item Env:TENLO_DB_URL
```

Comprobaciones obligatorias:

- Los tres comandos terminan sin error.
- Los tres archivos existen y no están vacíos.
- Se guardan los hashes SHA-256 en `SHA256SUMS.txt`.
- La carpeta se cifra y se copia a la segunda ubicación.
- La variable temporal se elimina al terminar.

## Restaurar sin poner en riesgo producción

1. Declarar el incidente y detener escrituras si continuar puede empeorar la pérdida.
2. Identificar la última copia válida anterior al incidente y verificar sus hashes.
3. Crear un proyecto Supabase nuevo o un entorno local aislado. Crear un proyecto externo o de pago requiere aprobación previa.
4. Reproducir extensiones y configuración necesarias.
5. Restaurar con `psql` dentro de una única transacción:

```powershell
$env:TENLO_RESTORE_DB_URL = "postgresql://postgres.PROJECT_REF:PASSWORD@POOLER:5432/postgres"
psql --single-transaction --variable ON_ERROR_STOP=1 --file roles.sql --file schema.sql --command "SET session_replication_role = replica" --file data.sql --dbname "$env:TENLO_RESTORE_DB_URL"
Remove-Item Env:TENLO_RESTORE_DB_URL
```

6. Verificar tablas, recuentos, acceso, RLS, autenticación, fichas, favoritos, reclamaciones, solicitudes y colas administrativas.
7. Reconfigurar Auth, SMTP, API keys, URLs, extensiones, Realtime y Storage que no se restauran íntegramente desde el volcado.
8. Solo después de validar, decidir si se cambia la aplicación al proyecto recuperado. Este cambio de producción requiere aprobación explícita.
9. Documentar datos perdidos desde el RPO, causa, acciones y controles para evitar recurrencia.

## Prueba mensual de restauración

La copia no se considera recuperable hasta completar una prueba.

- Restaurar en un destino aislado.
- Confirmar que las migraciones aplicadas y el esquema coinciden.
- Comparar recuentos por tabla sin copiar PII a hojas de cálculo.
- Probar un usuario de prueba, no una cuenta real de familia.
- Verificar que una cuenta normal no puede leer perfiles, solicitudes o notas ajenas.
- Registrar fecha, duración, incidencias y resultado.
- Destruir de forma segura el entorno temporal cuando termine la validación.

## Criterio para subir de plan

Reevaluar Supabase Pro o PITR antes de abrir el piloto a volumen relevante si cualquiera de estas condiciones se cumple:

- un RPO de 24 horas deja de ser aceptable;
- la restauración manual supera el RTO acordado;
- hay operación diaria que Javier no puede respaldar manualmente;
- existen archivos críticos en Storage;
- una interrupción o pérdida tendría impacto legal, reputacional o económico relevante.

La mejora de plan no sustituye la copia externa ni la prueba de restauración.
