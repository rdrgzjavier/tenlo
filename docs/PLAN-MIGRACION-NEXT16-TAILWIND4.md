# Plan de migración a Next.js 16 y Tailwind CSS 4

> Preparado el 18 de octubre de 2026. No ejecutar con `npm audit fix --force` directamente.

## Motivo

La auditoría actual devuelve 11 avisos en dependencias transitivas: 8 altos y 3 moderados. Las correcciones propuestas por npm implican saltos mayores a Next.js 16 y Tailwind CSS 4. El proyecto compila correctamente con Next.js 15.5.27 y Tailwind 3, por lo que el cambio debe tratarse como una migración controlada, no como una actualización automática.

## Criterios de aceptación

- `npm audit` sin avisos altos conocidos que tengan una corrección compatible disponible.
- `typecheck`, `lint` y `build` correctos.
- Las rutas públicas y privadas conservan su comportamiento.
- Sin regresiones visuales en móvil y escritorio en Home, buscadores, listados, fichas, login, área personal y administración.
- El gestor propio, Consent Mode, GTM y los eventos P0 siguen respetando el consentimiento.
- Autenticación, callback, formularios y acceso a Supabase siguen funcionando.
- El despliegue de preview se valida antes de promover a producción.

## Secuencia

1. Crear una rama específica desde `main` y capturar una referencia visual de las rutas críticas.
2. Actualizar primero Next.js, React, `eslint-config-next` y los tipos compatibles; resolver cambios de configuración, runtimes y APIs.
3. Ejecutar pruebas estáticas y funcionales antes de tocar Tailwind.
4. Migrar Tailwind CSS 3 a 4 siguiendo la guía oficial, conservando tokens, breakpoints y estilos globales de Tenlo.
5. Comparar las rutas críticas en 390 px, 768 px y escritorio; revisar foco, contraste, zoom y objetivos táctiles.
6. Validar analítica y consentimiento en un preview aislado, sin contaminar GA4 de producción.
7. Repetir `npm audit`, `typecheck`, `lint`, `build` y la comprobación del seed del directorio.
8. Promover solo si no hay regresiones; mantener el despliegue anterior disponible para rollback.

## Pruebas mínimas

| Área | Comprobación |
| --- | --- |
| Navegación | Header, menú móvil, enlaces y redirecciones canónicas |
| Búsqueda | Texto, municipio, categoría, cero resultados y propuesta de ficha |
| Fichas | CTAs, teléfono, email, web, mapa, favoritos, corrección y retirada |
| Registro | feedback OK/KO, confirmación por email y callback |
| Privado | área personal, datos, favoritos, solicitudes y publicaciones |
| Administración | acceso por rol, colas, estados, historial y exportación |
| Analítica | denegación inicial, aceptación, eventos P0 y ausencia de PII |
| Rendimiento | Lighthouse móvil y tamaños de los bundles frente a la referencia |

## Riesgos y rollback

- Tailwind 4 puede cambiar el procesamiento de estilos, utilidades y configuración PostCSS.
- Next.js 16 puede cambiar requisitos de Node, caché, middleware y compatibilidad de librerías.
- No se mezclará esta migración con cambios de producto ni de esquema de Supabase.
- Si falla un criterio, se mantiene la rama sin promover y producción continúa en la última versión estable.
