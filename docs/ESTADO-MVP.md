# Estado del MVP de Tenlo

Fecha de corte: 22 de octubre de 2026.

## Progreso global

```text
MVP construido  [████████████████░░░░] 79 %
```

El porcentaje mide la capacidad necesaria para ejecutar un piloto pequeño en Madrid noroeste. No incluye monetización, comunidad, expansión geográfica, recomendaciones avanzadas ni automatizaciones propias de fases posteriores.

Una tarea solo puntúa como terminada cuando existe implementación o procedimiento verificable. El trabajo diseñado pero no probado recibe una fracción de su peso; una idea del backlog no suma progreso.

## Cálculo ponderado

| Bloque del MVP | Peso | Avance | Puntos | Evidencia actual | Principal brecha |
|---|---:|---:|---:|---|---|
| Segmento, valor y reglas del piloto | 10 % | 100 % | 10,0 | Ámbito, oferta, confianza, conexión útil, SLA y gratuidad inicial decididos | Validar los mensajes con la primera cohorte |
| Infraestructura, dominio y seguridad | 15 % | 90 % | 13,5 | Dominio, DNS, Vercel, CI, Auth, SMTP, RLS y políticas públicas operativas | Resolver dependencias mayores, protección de contraseñas filtradas y política de previews |
| Directorio real y calidad de oferta | 15 % | 85 % | 12,8 | Lote real auditado e importado, Supabase activo en producción, paridad de conteos/rutas y fallback reversible | Normalizar cobertura/taxonomía y completar la revisión individual de fichas |
| Reclamación y activación de proveedores | 15 % | 75 % | 11,3 | Reclamación, cola, aprobación, rechazo y petición de información disponibles | Onboarding progresivo, publicación efectiva y aviso asociado |
| Búsqueda, comparación y conexión familiar | 15 % | 80 % | 12,0 | Buscar, filtrar, proponer, ver ficha, mapa, guardar, comparar, solicitar y valorar resultado | Respuesta segura del proveedor, recordatorio y alternativa automatizados |
| Cuentas, consentimiento y privacidad | 15 % | 60 % | 9,0 | Registro, confirmación, acceso, perfil, recuperación, marketing opcional, exportación y solicitud de baja | Política legal completa, prueba de supresión, preferencias y actividad de cuenta |
| Medición e informes | 10 % | 70 % | 7,0 | Cookiebot, GTM, GA4, eventos, búsquedas persistentes, resumen operativo e informe de demanda | Confirmar recepción GA4 y persistir rendimiento histórico por ficha/vertical |
| Operación y recuperación del piloto | 5 % | 60 % | 3,0 | Responsable, SLA, playbook, backoffice, exportación y runbook de copias | Ejecutar restauración, preparar CRM/contactos y probar recorridos completos |
| **Total** | **100 %** |  | **78,6** |  |  |

El valor mostrado se redondea a **79 %**. Debe actualizarse solo cuando cambie la evidencia de alguno de los ocho bloques, no al añadir tareas futuras al backlog.

## Qué falta para considerar el MVP listo para el piloto

### Imprescindible

1. Probar con cuentas de prueba el recorrido completo de proveedor: reclamar, pedir información, aprobar, publicar, recibir solicitud y responder.
2. Probar el recorrido completo de familia: registro, confirmación, búsqueda, favorito, comparación, solicitud, respuesta y valoración de utilidad.
3. Completar la identidad del responsable y alinear privacidad, condiciones, consentimientos, retención y canal de derechos.
4. Confirmar en GA4 la recepción de eventos consentidos y contrastar las búsquedas con Supabase.
5. Ejecutar la primera copia lógica cifrada y una restauración en un destino aislado.
6. Preparar la base operativa de proveedores contactables con fuente, finalidad, estado y exclusiones.

### Puede seguir siendo manual durante el piloto

- Moderación y aprobación por Javier.
- Envío de alternativas cuando no responde el primer proveedor.
- Seguimiento de proveedores y registro de motivos de rechazo.
- Informes individuales antes de automatizar dashboards por proveedor.
- Supresión de cuentas con checklist y doble revisión.

### Fuera del MVP actual

- Suscripciones, pagos y posiciones patrocinadas.
- Opiniones públicas y rankings.
- Canguros particulares sin identidad profesional verificable.
- Recomendaciones entre familias, comunidad avanzada y expansión a nuevas zonas.
- MCP, API pública o superficies avanzadas para LLMs.

## Regla de cierre

El MVP no alcanza el 100 % por tener todas las pantallas, sino cuando Tenlo demuestra sin datos ficticios este recorrido completo:

`necesidad -> opción adecuada -> solicitud -> respuesta -> conexión útil -> aprendizaje operativo`

La primera cohorte real puede comenzar de forma controlada antes del 100 % únicamente cuando estén resueltos los seis puntos imprescindibles anteriores y no existan bloqueos de privacidad, seguridad o recuperación.
