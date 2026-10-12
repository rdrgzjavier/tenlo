# Auditoría de la migración progresiva del directorio

> Revisión: 12 de octubre de 2026.
>
> Objetivo: preparar un primer bloque seguro mientras se amplía la migración al mayor número posible de entidades reales del piloto, sin convertir datos didácticos o ficticios en datos reales.

El primer bloque importado contiene once centros y once proveedores. El seed reproducible ya se ha ampliado a dieciocho centros con fuente revisada y mantiene los once proveedores iniciales. El inventario total contiene 24 centros y 22 proveedores organizativos únicos; los tres perfiles personales ficticios quedan excluidos. Cada entidad pendiente se incorporará en cuanto exista una fuente pública suficiente y sus campos hayan sido contrastados.

## Criterio aplicado

Una ficha solo puede entrar en el lote cuando:

- representa una organización o negocio, no una persona particular;
- tiene una página pública específica y accesible;
- el nombre, municipio y servicio principal se pueden sostener con esa fuente;
- no duplica otra ficha del mismo proveedor;
- se importa con `trust_level = collected`, `claim_status = unclaimed` y origen `tenlo_curated`;
- los campos no comprobados quedan vacíos o pendientes, nunca se completan por inferencia.

La presencia de una web no equivale a verificación ni autoriza a usar imágenes o textos protegidos. La ficha seguirá mostrando `No verificada` hasta que el proveedor la gestione o Tenlo aplique el proceso de verificación correspondiente.

## Bloque 1 admitido para preparación

| Proveedor | Municipio | Fuente revisada | Decisión | Observación |
|---|---|---|---|---|
| BeOne Boadilla | Boadilla | https://beone.es/centros-deportivos/madrid/boadilla | Preparar | Fuente oficial específica con dirección, teléfono, horarios e instalaciones familiares. |
| Kumon Pozuelo - Estación | Pozuelo | https://www.kumon.es/pozuelo-estacion | Preparar | Fuente oficial específica con programas, dirección, teléfono, modalidad y horarios. |
| Kids&Us Majadahonda | Majadahonda | https://www.kidsandus.es/es/academias-ingles/majadahonda | Preparar | Fuente oficial específica con edades, dirección, teléfono y horario. |
| Hanky Planet Las Rozas | Las Rozas | https://www.hankyplanet.com/celebracion-de-cumpleanos-en-las-rozas/ | Preparar | Debe existir como un proveedor con varias salas/servicios, no como tres proveedores. |
| Ilusiona Equinoccio | Majadahonda | https://ilusiona.com/equinoccio/ | Preparar | Página específica del centro. Mantener horarios y tarifas como datos sujetos a cambio. |
| Piccoli | Majadahonda | https://www.piccoli.es/ | Preparar | La web identifica cumpleaños, campamentos, talleres y el negocio responsable. |
| Centro Juvenil Príncipe de Asturias | Majadahonda | https://juventud.majadahonda.org/información-general-horario-y-localización | Preparar | Fuente municipal específica con dirección, teléfono, correo y horario. |
| Espacio Cultural MIRA | Pozuelo | https://www.pozuelodealarcon.org/node/26355 | Preparar | Fuente municipal específica con contacto, horario, dirección y coordenadas. |
| Hop Galaxy Boadilla | Boadilla | https://www.hopgalaxy.com/boadilla | Preparar | Página específica con actividad, dirección, contacto y horario. |
| El Miniclub | Boadilla | https://elminiclub.com/ | Preparar | Web oficial accesible; revisar los campos concretos antes de ejecutar el lote. |
| Club Las Encinas de Boadilla | Boadilla | https://www.clublasencinas.es/Pages/108-cumpleanyos_y_celebraciones_infantiles_i_club_las_encinas_de_boadilla | Preparar | Página específica de cumpleaños y celebraciones infantiles. |

## Centros admitidos para preparación

| Centro | Municipio | Fuente revisada | Observación |
|---|---|---|---|
| CEIP Ágora | Boadilla | https://site.educa.madrid.org/cp.agora.boadilla/ | Fuente oficial educativa con ubicación y contacto. |
| Colegio Hélade | Boadilla | https://colegiohelade.es/ | Web oficial con etapas, servicios y contacto. |
| Mirabal International School | Boadilla | https://www.colegiomirabal.com/ | Web oficial con etapas y propuesta educativa. |
| Colegio Quercus | Boadilla | https://www.colegioquercus.com/ | Web oficial con etapas, servicios y contacto. |
| CEIPSO El Cantizal | Las Rozas | https://site.educa.madrid.org/cp.elcantizal.lasrozas/ | Fuente oficial EducaMadrid con etapas y contacto. |
| Fundación Colegio Bérriz | Las Rozas | https://colegioberriz.com/ | Web oficial con etapas, servicios y contacto. |
| Colegio Europeo de Madrid | Las Rozas | https://www.colegioeuropeodemadrid.com/ | Web oficial con etapas, propuesta internacional y contacto. |
| St. Michael's School | Boadilla | https://stmichaelsschool.es/ | Web oficial con ubicación, contacto y propuesta bilingüe. |
| Everest School Monteclaro | Pozuelo | https://www.everestschool.es/ | Web oficial con etapas y propuesta educativa; teléfono pendiente de contraste. |
| Kensington School | Pozuelo | https://www.kensington-school.es/ | Web oficial y aviso legal con etapas y contacto. |
| Colegio Monte Tabor | Pozuelo | https://www.colegiomontetabor.es/ | Web oficial con etapas, servicios y contacto. |
| E.I. Romanillos | Boadilla | https://site.educa.madrid.org/eei.romanillos.boadilla/ | Fuente oficial EducaMadrid; teléfono y etapa corregidos respecto al dato inicial. |
| CEIP San José Obrero | Pozuelo | https://www.educa2.madrid.org/web/centro.cp.sanjoseobrero.pozuelodealarcon/inicio | Fuente oficial EducaMadrid con actividad reciente, etapas y contacto. |
| The British School - El Colegio Británico | Pozuelo | https://www.thebritishschool.org/en | Web oficial actual; nombre y teléfono actualizados respecto a la antigua denominación British Council School. |
| Colegio Caude | Majadahonda | https://colegiocaude.com/ | Web oficial con etapas, ubicación y contacto. |
| Colegio San Jaime | Majadahonda | https://colegiosanjaime.es/ | Web oficial con etapas, ideario y contacto. |
| CEIP Benito Pérez Galdós | Majadahonda | https://www.educa2.madrid.org/web/centro.cp.perezgaldos.majadahonda/inicio | Fuente oficial EducaMadrid con etapas y contacto. |
| E.I. Tamaral | Majadahonda | https://www.educa.madrid.org/eei.tamaral.majadahonda | Ficha oficial de la Comunidad de Madrid para el curso 2026/2027. |

## Candidatos retenidos

| Registro actual | Motivo | Siguiente acción |
|---|---|---|
| The Magic Forest | La fuente disponible es un directorio secundario y puede estar desactualizada. | Localizar y comprobar una fuente oficial vigente. |
| Centro Cultural Volturno | La URL guardada apunta a la portada municipal, no a una ficha específica. | Localizar una página municipal específica antes de importar. |
| Centro Deportivo Huerta Vieja | La fuente municipal indica cierre temporal por obras. | Revisar su reapertura antes de incorporarlo como oferta disponible. |
| Polideportivo Carlos Ruiz | La fuente municipal informa de obras y renovación en curso. | Confirmar qué instalaciones y actividades están operativas antes de importar. |

## Resultado del control

- Inventario actual: 24 centros, 27 proveedores y 51 fichas generadas desde datos mock.
- Inventario útil para el piloto: 24 centros y 22 proveedores organizativos únicos, antes de contrastar fuentes. Los tres perfiles personales ficticios no se migrarán.
- Bloque 1 importado en Supabase: 11 centros, 11 proveedores y 13 servicios. Las tres salas de Hanky Planet quedan asociadas a un único proveedor.
- Ampliación preparada en el seed: 18 centros, 11 proveedores y 13 servicios. La importación y verificación de los siete centros nuevos sigue pendiente.
- Verificación posterior: 0 servicios huérfanos, 0 proveedores con propietario, 0 fichas reclamadas, 0 niveles de confianza elevados y 0 claves duplicadas. La segunda ejecución mantuvo los mismos recuentos.
- Pendiente de fuente o normalización: 6 centros y 11 proveedores organizativos únicos; los campos dudosos se dejarán vacíos.
- No se activa todavía `DIRECTORY_DATA_SOURCE=supabase` ni se modifica la web pública.

## Comprobaciones antes de ejecutar el lote

- Revisar nuevamente cada fuente el mismo día de la carga.
- Comparar nombre, municipio, dirección, teléfono, email, web y servicio.
- Dejar fuera horarios, precios o disponibilidad que no estén vigentes o sean variables.
- Confirmar que la ejecución repetida no duplica proveedores ni servicios.
- Confirmar que ninguna ficha importada aparece como `Verificada`, `Gestionada` u `Oficial`.
- Comparar el resultado de Supabase con el lote esperado y mantener el fallback hasta superar QA.
