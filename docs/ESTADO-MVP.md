# Estado del MVP de Tenlo

Fecha de corte: 28 de octubre de 2026.

## Progreso global

```text
MVP construido  [█████████████████░░░] 86 %
```

El porcentaje mide la capacidad necesaria para ejecutar un piloto pequeño en Madrid noroeste. No incluye monetización, comunidad, expansión geográfica, recomendaciones avanzadas ni automatizaciones propias de fases posteriores.

Una tarea solo puntúa como terminada cuando existe implementación o procedimiento verificable. El trabajo diseñado pero no probado recibe una fracción de su peso; una idea del backlog no suma progreso.

## Cálculo ponderado

| Bloque del MVP | Peso | Avance | Puntos | Evidencia actual | Principal brecha |
|---|---:|---:|---:|---|---|
| Segmento, valor y reglas del piloto | 10 % | 100 % | 10,0 | Ámbito, oferta, confianza, conexión útil, SLA y gratuidad inicial decididos | Validar los mensajes con la primera cohorte |
| Infraestructura, dominio y seguridad | 15 % | 96 % | 14,4 | Dominio, DNS, Vercel, CI sobre Node 24, Auth, SMTP, migraciones `0024`–`0039` y Cloudflare Turnstile en acceso, registro y recuperación verificados; CI comprueba contratos de interfaz y seguridad de migraciones; superficie pública, campos protegidos, rutas privadas y aislamiento de datos de prueba comprobados | Completar la prueba cruzada de familia y proveedor, revisar dependencias mayores, resolver el riesgo de contraseñas filtradas y definir la política de previews |
| Directorio real y calidad de oferta | 15 % | 89 % | 13,4 | Lote real auditado, Supabase activo, 21 centros, 14 proveedores y 16 servicios servidos mediante RPC públicos acotados; las nuevas propuestas quedan estructuradas y solo se publican tras revisión administrativa explícita | Normalizar cobertura/taxonomía y completar la revisión individual de fichas |
| Reclamación y activación de proveedores | 15 % | 84 % | 12,6 | Reclamación, onboarding progresivo, ficha privada persistente, cola, moderación, petición de información y reenvío disponibles; cuenta proveedora controlada invitada y aislada; activación de invitaciones con contraseña y feedback implementada | Revalidar un enlace de invitación nuevo y probar publicación, aviso y respuesta de extremo a extremo |
| Búsqueda, comparación y conexión familiar | 15 % | 84 % | 12,6 | Buscar, filtrar, proponer, ver ficha, mapa, guardar favoritos y búsquedas, recuperar criterios, comparar, solicitar, responder de forma protegida y valorar resultado | Probar la respuesta segura con cuentas reales y automatizar recordatorio y alternativa |
| Cuentas, consentimiento y privacidad | 15 % | 74 % | 11,1 | Registro, confirmación, perfil persistente, recuperación, atribución saneada, historial de consentimiento, actividad significativa, exportación y solicitud de baja; acceso erróneo localizado y medido sin exponer credenciales | Política legal completa, prueba de supresión y preferencias de comunicación |
| Medición e informes | 10 % | 90 % | 9,0 | Cookiebot, GTM, GA4, búsquedas y eventos propios persistentes; embudos privados, North Star, actividad de usuarios, relevancia, oferta por segmento e informe privado del proveedor con visibilidad, guardados, contacto y comparación de 30 días | Confirmar recepción GA4 y validar informes con actividad real del piloto |
| Operación y recuperación del piloto | 5 % | 65 % | 3,3 | Responsable, SLA, playbook, backoffice, exportación, incidencias accionables y runbook de copias; panel privado y filtros comprobados con cuenta administradora | Ejecutar restauración, preparar CRM/contactos y probar recorridos completos |
| **Total** | **100 %** |  | **86,3** |  |  |

El valor mostrado se redondea a **86 %**. Debe actualizarse solo cuando cambie la evidencia de alguno de los ocho bloques, no al añadir tareas futuras al backlog.

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
