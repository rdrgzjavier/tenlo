# Supabase para el MVP de Tenlo

Supabase encaja para el MVP porque permite empezar con Auth, PostgreSQL y reglas de seguridad sin montar backend propio. El plan gratuito sirve para validar Tenlo, siempre que controlemos el volumen de datos y no activemos subida libre de archivos.

Referencia: https://supabase.com/pricing

## Criterio de coste

- Empezar con base de datos y autenticacion.
- No habilitar Storage para fotos de familias en el MVP.
- No permitir imagen de perfil subida por usuarios.
- Revisar consumo antes de importar grandes volumenes de fichas o imagenes.

## Autenticacion

Flujo recomendado para la primera version:

1. Email y contrasena.
2. Google como proveedor social.
3. Apple en una fase posterior, porque requiere configuracion adicional de Apple Developer.

Todas las cuentas no familiares deben quedar en `pending_review` hasta que Tenlo revise los datos por email o telefono.

## Datos principales

- `profiles`: usuario logado y rol declarado.
- `business_profiles`: datos de negocio, centro o profesional.
- `centers`: centros educativos y guarderias.
- `services`: servicios profesionales y empresas.
- `listings`: publicaciones de familias, centros o proveedores.
- `community_posts`: iniciativas, eventos, ONGs y recursos comunitarios.
- `favorites`: favoritos del usuario logado.
- `saved_searches`: criterios estructurados y ruta interna que cada usuario decide conservar.
- `provider_suggestions`: propuestas estructuradas pendientes de contraste y conversión administrativa.
- `directory_events`: señales agregables del directorio, registradas solo con consentimiento estadístico; los proveedores acceden únicamente a un resumen de sus propias fichas mediante `get_provider_private_performance`.
- `submissions`: propuestas pendientes de revision.
- `contact_events`: trazabilidad de CTAs de contacto.
- `newsletter_subscribers`: altas de newsletter con consentimiento.

## Seguridad y privacidad

- RLS activo en todas las tablas publicas.
- Las fichas publicas se leen solo cuando estan aprobadas, salvo centros, que parten de informacion publica.
- Cada usuario solo gestiona sus propios favoritos, búsquedas guardadas, publicaciones y perfil.
- La función `get_provider_private_performance` no expone eventos ni sesiones: devuelve conteos agregados de las fichas aprobadas cuyo `owner_id` coincide con el usuario autenticado. La migración `0039` se aplicó y verificó el 28/10/2026 con ejecución anónima denegada, ejecución autenticada permitida, `security definer` y `search_path` vacío.
- `provider_reminded_at`, incorporado mediante `0040` el 28/10/2026, permite registrar un único recordatorio operativo por solicitud; el endpoint administrativo exige rol `tenlo_admin`, aviso inicial, 48 horas de espera y estado pendiente.
- La `service_role` solo puede usarse en servidor y nunca debe tener prefijo `NEXT_PUBLIC`.
- No se guardan perfiles, fotos, horarios personales ni datos identificativos de menores.

## Puesta en marcha

1. Crear proyecto en Supabase.
2. Copiar las variables en Vercel y en `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

3. Ejecutar el SQL de `supabase/migrations/0001_tenlo_mvp.sql` desde el SQL Editor de Supabase o convertirlo en migracion CLI.
4. Ejecutar el SQL de `supabase/migrations/0002_data_api_grants.sql` para que la API pueda usar las tablas con RLS.
5. Activar Auth por email y Google.
6. Conectar `/login`, `/area-personal`, `/favoritos` y `/publicar` a las tablas reales.

## Google Auth

En Supabase:

1. `Authentication > Sign In / Providers`.
2. Activar Google.
3. Pegar Client ID y Client Secret de Google Cloud.
4. Revisar que la URL de callback indicada por Supabase este dada de alta en Google Cloud.

En Google Cloud:

1. Crear credenciales OAuth para aplicacion web.
2. Añadir como origen autorizado `https://tenlo.es` y conservar temporalmente la URL de preview que se utilice para pruebas.
3. Anadir como redirect autorizado la URL que muestra Supabase para Google.

## Pendiente de fase 2

- Middleware de sesion para proteger `/publicar` y `/area-personal`.
- Acciones de servidor para registro, alta de negocio y publicacion.
- Panel interno de moderacion.
- Migracion progresiva desde `src/lib/mock-data.ts` hacia queries SSR.
- Politicas de administracion con backend privado o `service_role` en rutas de servidor.
