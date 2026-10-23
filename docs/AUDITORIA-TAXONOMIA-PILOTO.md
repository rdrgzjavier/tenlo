# Auditoría de taxonomía del piloto

Fecha: 23 de octubre de 2026.

## Resultado del lote publicado

El lote de producción contiene:

- 21 centros educativos;
- 14 proveedores organizativos;
- 16 servicios;
- 4 municipios canónicos;
- 3 categorías de servicio actualmente pobladas.

Los municipios son exactamente `Las Rozas de Madrid`, `Majadahonda`, `Pozuelo de Alarcón` y `Boadilla del Monte`. No se han detectado variantes ortográficas en el lote importado.

Las categorías canónicas de los servicios publicados son `extraescolares`, `clases-particulares` y `campamentos`. Todas existen en el catálogo de categorías de Tenlo y se traducen a una vertical estable mediante `verticalIdForCategory`.

## Distinción necesaria

`services.category_id` es la dimensión canónica para filtros, URLs, medición e informes comparables.

`business_profiles.category` es una descripción visible de la especialidad del proveedor, por ejemplo `Idiomas`, `Parque infantil` o `Centro cultural`. No debe utilizarse como identificador analítico ni compararse como si fuera la misma taxonomía que `category_id`.

La migración pública devuelve ambos conceptos sin mezclarlos, y el histórico por ficha utiliza `category_id` y `vertical_id`.

## Cobertura

Las áreas de servicio del lote siguen el patrón `<municipio> y alrededores`. Es una descripción editorial, no una geometría ni una promesa de desplazamiento. Antes de habilitar filtros de cobertura se necesita que cada proveedor confirme:

- municipios atendidos;
- modalidad presencial, online o a domicilio;
- ubicación exacta, aproximada, solo zona o no visible;
- fecha de actualización.

Hasta entonces, `service_area` se muestra como orientación y `municipality` es la única dimensión territorial comparable.

## Pendiente para cerrar la normalización

- validar con proveedores los municipios reales de cobertura;
- poblar `service_municipalities` y `location_visibility` durante la reclamación;
- decidir la categoría primaria cuando un proveedor ofrece servicios de más de una categoría;
- crear nuevas categorías solo cuando exista oferta revisada, evitando filtros vacíos;
- mantener salud y bienestar como vertical prevista, pero no simular oferta mientras no haya fichas contrastadas.
