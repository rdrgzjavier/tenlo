# Auditoría del primer lote de proveedores

> Revisión: 11 de octubre de 2026.
>
> Objetivo: decidir qué fichas pueden prepararse como `No verificada` a partir de información pública sin convertir datos didácticos o ficticios en datos reales.

## Criterio aplicado

Una ficha solo puede entrar en el lote cuando:

- representa una organización o negocio, no una persona particular;
- tiene una página pública específica y accesible;
- el nombre, municipio y servicio principal se pueden sostener con esa fuente;
- no duplica otra ficha del mismo proveedor;
- se importa con `trust_level = collected`, `claim_status = unclaimed` y origen `tenlo_curated`;
- los campos no comprobados quedan vacíos o pendientes, nunca se completan por inferencia.

La presencia de una web no equivale a verificación ni autoriza a usar imágenes o textos protegidos. La ficha seguirá mostrando `No verificada` hasta que el proveedor la gestione o Tenlo aplique el proceso de verificación correspondiente.

## Candidatos admitidos para preparación

| Proveedor | Municipio | Fuente revisada | Decisión | Observación |
|---|---|---|---|---|
| Hanky Planet Las Rozas | Las Rozas | https://www.hankyplanet.com/celebracion-de-cumpleanos-en-las-rozas/ | Preparar | Debe existir como un proveedor con varias salas/servicios, no como tres proveedores. |
| Ilusiona Equinoccio | Majadahonda | https://ilusiona.com/equinoccio/ | Preparar | Página específica del centro. Mantener horarios y tarifas como datos sujetos a cambio. |
| Piccoli | Majadahonda | https://www.piccoli.es/ | Preparar | La web identifica cumpleaños, campamentos, talleres y el negocio responsable. |
| Centro Juvenil Príncipe de Asturias | Majadahonda | https://juventud.majadahonda.org/información-general-horario-y-localización | Preparar | Fuente municipal específica con dirección, teléfono, correo y horario. |
| Espacio Cultural MIRA | Pozuelo | https://www.pozuelodealarcon.org/node/26355 | Preparar | Fuente municipal específica con contacto, horario, dirección y coordenadas. |
| Hop Galaxy Boadilla | Boadilla | https://www.hopgalaxy.com/boadilla | Preparar | Página específica con actividad, dirección, contacto y horario. |
| El Miniclub | Boadilla | https://elminiclub.com/ | Preparar | Web oficial accesible; revisar los campos concretos antes de ejecutar el lote. |
| Club Las Encinas de Boadilla | Boadilla | https://www.clublasencinas.es/Pages/108-cumpleanyos_y_celebraciones_infantiles_i_club_las_encinas_de_boadilla | Preparar | Página específica de cumpleaños y celebraciones infantiles. |

## Candidatos retenidos

| Registro actual | Motivo | Siguiente acción |
|---|---|---|
| Hanky Planet Sala 2 | Duplicaría al proveedor Hanky Planet. | Modelarla como servicio asociado al mismo proveedor. |
| Hanky Planet Sala 3 | Duplicaría al proveedor y la fuente actual es un directorio externo. | Usar la fuente oficial y modelarla como servicio. |
| The Magic Forest | La fuente disponible es un directorio secundario y puede estar desactualizada. | Localizar y comprobar una fuente oficial vigente. |
| Centro Cultural Volturno | La URL guardada apunta a la portada municipal, no a una ficha específica. | Localizar una página municipal específica antes de importar. |

## Resultado del control

- Inventario actual: 24 centros, 27 proveedores y 51 fichas generadas desde datos mock.
- Lote preparado por criterio: 0 centros, 8 proveedores y 8 servicios.
- Pendiente: normalizar las tres salas de Hanky Planet como servicios de un solo proveedor y completar el modelo de direcciones/coordenadas verificadas.
- No se activa todavía `DIRECTORY_DATA_SOURCE=supabase` ni se modifica la web pública.

## Comprobaciones antes de ejecutar el lote

- Revisar nuevamente cada fuente el mismo día de la carga.
- Comparar nombre, municipio, dirección, teléfono, email, web y servicio.
- Dejar fuera horarios, precios o disponibilidad que no estén vigentes o sean variables.
- Confirmar que la ejecución repetida no duplica proveedores ni servicios.
- Confirmar que ninguna ficha importada aparece como `Verificada`, `Gestionada` u `Oficial`.
- Comparar el resultado de Supabase con el lote esperado y mantener el fallback hasta superar QA.
