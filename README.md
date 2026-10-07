# Tenlo

Web app de **Tenlo**, una plataforma para encontrar recursos alrededor del colegio por zona, centro y categoría.

Claim:

> Todo lo que necesitas alrededor del colegio, filtrado por tu zona y tu centro.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Datos mockeados en `src/lib/mock-data.ts`
- Esquema preparado para Supabase en `supabase/migrations/0001_tenlo_mvp.sql`

## Perfil y privacidad

- Registro para familias, profesionales locales, centros educativos y equipo interno.
- Sin subida de imagen de perfil en el MVP.
- Rol visible en publicaciones para diferenciar familias, servicios profesionales y centros.
- Sin perfiles, fotos, nombres, clase u horarios personales de menores.

## Ejecutar en local

```bash
npm install
npm run dev
```

Después abre `http://localhost:3000`.

## Despliegue recomendado

Tenlo está planteado como web app con rutas, filtros, formularios, roles, moderación y futuro backend. El despliegue recomendado es Vercel con el repositorio de GitHub conectado.

## Scripts

```bash
npm run typecheck
npm run lint
npm run build
```

## Plan de producto

- [Backlog de producto, proveedores y medición](docs/BACKLOG-PRODUCTO-Y-MEDICION.md)
- [Criterios de confianza de las fichas](docs/CRITERIOS-DE-CONFIANZA.md)
- [Diccionario inicial de eventos](docs/DICCIONARIO-DE-EVENTOS.md)
- [Implementación de analítica, consentimiento y dashboards](docs/IMPLEMENTACION-ANALITICA.md)
- [Correo operativo](docs/CORREO-OPERATIVO.md)
- [Configuración de entornos](docs/CONFIGURACION-DE-ENTORNOS.md)
- [Playbook del piloto de proveedores](docs/PLAYBOOK-PILOTO-PROVEEDORES.md)

## Rutas principales

- `/`
- `/buscar`
- `/zona/las-rozas`
- `/zona/majadahonda`
- `/zona/pozuelo`
- `/zona/boadilla`
- `/categoria/[slug-categoria]`
- `/centros`
- `/centros/[slug-centro]`
- `/proveedores`
- `/publicar`
- `/comunidad`
- `/login`
- `/aviso-legal`
- `/privacidad`
- `/cookies`
- `/normas-comunidad`
- `/contacto`

## Próximos pasos para Supabase

1. Crear proyecto Supabase.
2. Ejecutar `supabase/migrations/0001_tenlo_mvp.sql`.
3. Añadir variables `.env.local` con URL y publishable key.
4. Sustituir `src/lib/mock-data.ts` por un cliente de datos con funciones equivalentes.
5. Conectar Supabase Auth con email/password y Google.
6. Activar reglas RLS por rol: familia, profesional local, centro y admin.
