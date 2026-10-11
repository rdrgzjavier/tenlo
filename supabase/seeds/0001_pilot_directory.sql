begin;



-- Centros educativos: publicados, pero inicialmente no verificados.

insert into public.centers (
  external_key, slug, name, municipality, center_type, religious_character,
  stages, languages, services, description, address, phone, email, website,
  source_name, source_url, last_reviewed, trust_level, tags, image_url, status, record_origin
) values (
  'el-cantizal', 'colegio-el-cantizal', 'Colegio El Cantizal', 'Las Rozas de Madrid',
  'publico', 'laico', array['Infantil', 'Primaria', 'ESO']::text[],
  array['Inglés']::text[], array['Comedor', 'Extraescolares', 'Orientación']::text[], 'CEIPSO público bilingüe en Las Rozas.',
  'Consultar dirección pública', '916 03 00 99', null, 'https://site.educa.madrid.org/cp.elcantizal.lasrozas/',
  'Web oficial del centro', 'https://site.educa.madrid.org/cp.elcantizal.lasrozas/', '2026-10-11',
  'collected', array['Público', 'Bilingüe']::text[], 'https://images.unsplash.com/photo-1577891729319-f4871c6ec217?auto=format&fit=crop&w=1200&q=80', 'approved', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  name = excluded.name,
  municipality = excluded.municipality,
  center_type = excluded.center_type,
  religious_character = excluded.religious_character,
  stages = excluded.stages,
  languages = excluded.languages,
  services = excluded.services,
  description = excluded.description,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  tags = excluded.tags,
  image_url = excluded.image_url,
  status = 'approved',
  record_origin = 'tenlo_curated';

insert into public.centers (
  external_key, slug, name, municipality, center_type, religious_character,
  stages, languages, services, description, address, phone, email, website,
  source_name, source_url, last_reviewed, trust_level, tags, image_url, status, record_origin
) values (
  'berriz-veracruz', 'colegio-berriz-veracruz', 'Fundación Colegio Bérriz', 'Las Rozas de Madrid',
  'concertado', 'catolico', array['Infantil', 'Primaria', 'ESO', 'Bachillerato']::text[],
  array['Inglés']::text[], array['Comedor', 'Extraescolares', 'Orientación']::text[], 'Centro bilingüe con etapas desde Infantil hasta Bachillerato.',
  'Consultar dirección pública', '916 30 37 33', null, 'https://colegioberriz.com/',
  'Web oficial del centro', 'https://colegioberriz.com/', '2026-10-11',
  'collected', array['Concertado', 'Católico']::text[], 'https://images.unsplash.com/photo-1577891729319-f4871c6ec217?auto=format&fit=crop&w=1200&q=80', 'approved', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  name = excluded.name,
  municipality = excluded.municipality,
  center_type = excluded.center_type,
  religious_character = excluded.religious_character,
  stages = excluded.stages,
  languages = excluded.languages,
  services = excluded.services,
  description = excluded.description,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  tags = excluded.tags,
  image_url = excluded.image_url,
  status = 'approved',
  record_origin = 'tenlo_curated';

insert into public.centers (
  external_key, slug, name, municipality, center_type, religious_character,
  stages, languages, services, description, address, phone, email, website,
  source_name, source_url, last_reviewed, trust_level, tags, image_url, status, record_origin
) values (
  'europeo-madrid', 'colegio-europeo-de-madrid', 'Colegio Europeo de Madrid', 'Las Rozas de Madrid',
  'privado', 'laico', array['Infantil', 'Primaria', 'ESO', 'Bachillerato']::text[],
  array['Inglés']::text[], array['Comedor', 'Extraescolares', 'Orientación']::text[], 'Colegio privado internacional con etapas de 0 a 18 años.',
  'Consultar dirección pública', '916 36 19 19', null, 'https://www.colegioeuropeodemadrid.com/',
  'Web oficial del centro', 'https://www.colegioeuropeodemadrid.com/', '2026-10-11',
  'collected', array['Privado', 'Bilingüe']::text[], 'https://images.unsplash.com/photo-1577891729319-f4871c6ec217?auto=format&fit=crop&w=1200&q=80', 'approved', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  name = excluded.name,
  municipality = excluded.municipality,
  center_type = excluded.center_type,
  religious_character = excluded.religious_character,
  stages = excluded.stages,
  languages = excluded.languages,
  services = excluded.services,
  description = excluded.description,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  tags = excluded.tags,
  image_url = excluded.image_url,
  status = 'approved',
  record_origin = 'tenlo_curated';

insert into public.centers (
  external_key, slug, name, municipality, center_type, religious_character,
  stages, languages, services, description, address, phone, email, website,
  source_name, source_url, last_reviewed, trust_level, tags, image_url, status, record_origin
) values (
  'boadilla-agora', 'ceip-agora-boadilla', 'CEIP Ágora', 'Boadilla del Monte',
  'publico', 'laico', array['Infantil', 'Primaria']::text[],
  array['Inglés']::text[], array['Comedor', 'Extraescolares', 'Orientación']::text[], 'Colegio público bilingüe de referencia en Boadilla.',
  'Consultar dirección pública', '916 33 11 47', null, 'https://site.educa.madrid.org/cp.agora.boadilla/',
  'Web oficial del centro', 'https://site.educa.madrid.org/cp.agora.boadilla/', '2026-10-11',
  'collected', array['Público', 'Bilingüe']::text[], 'https://images.unsplash.com/photo-1577891729319-f4871c6ec217?auto=format&fit=crop&w=1200&q=80', 'approved', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  name = excluded.name,
  municipality = excluded.municipality,
  center_type = excluded.center_type,
  religious_character = excluded.religious_character,
  stages = excluded.stages,
  languages = excluded.languages,
  services = excluded.services,
  description = excluded.description,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  tags = excluded.tags,
  image_url = excluded.image_url,
  status = 'approved',
  record_origin = 'tenlo_curated';

insert into public.centers (
  external_key, slug, name, municipality, center_type, religious_character,
  stages, languages, services, description, address, phone, email, website,
  source_name, source_url, last_reviewed, trust_level, tags, image_url, status, record_origin
) values (
  'boadilla-helade', 'colegio-helade-boadilla', 'Colegio Hélade', 'Boadilla del Monte',
  'concertado', 'laico', array['Infantil', 'Primaria', 'ESO', 'Bachillerato']::text[],
  array['Inglés']::text[], array['Comedor', 'Extraescolares', 'Orientación']::text[], 'Centro concertado con oferta desde Infantil hasta Bachillerato.',
  'Consultar dirección pública', '916 33 80 62', null, 'https://colegiohelade.es/',
  'Web oficial del centro', 'https://colegiohelade.es/', '2026-10-11',
  'collected', array['Concertado', 'Laico']::text[], 'https://images.unsplash.com/photo-1577891729319-f4871c6ec217?auto=format&fit=crop&w=1200&q=80', 'approved', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  name = excluded.name,
  municipality = excluded.municipality,
  center_type = excluded.center_type,
  religious_character = excluded.religious_character,
  stages = excluded.stages,
  languages = excluded.languages,
  services = excluded.services,
  description = excluded.description,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  tags = excluded.tags,
  image_url = excluded.image_url,
  status = 'approved',
  record_origin = 'tenlo_curated';

insert into public.centers (
  external_key, slug, name, municipality, center_type, religious_character,
  stages, languages, services, description, address, phone, email, website,
  source_name, source_url, last_reviewed, trust_level, tags, image_url, status, record_origin
) values (
  'boadilla-mirabal', 'mirabal-international-school', 'Mirabal International School', 'Boadilla del Monte',
  'privado', 'laico', array['Infantil', 'Primaria', 'ESO', 'Bachillerato']::text[],
  array['Inglés']::text[], array['Comedor', 'Extraescolares', 'Orientación']::text[], 'Colegio privado multilingüe con Bachillerato nacional e internacional.',
  'Consultar dirección pública', '916 33 17 11', null, 'https://www.colegiomirabal.com/',
  'Web oficial del centro', 'https://www.colegiomirabal.com/', '2026-10-11',
  'collected', array['Privado', 'Internacional']::text[], 'https://images.unsplash.com/photo-1577891729319-f4871c6ec217?auto=format&fit=crop&w=1200&q=80', 'approved', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  name = excluded.name,
  municipality = excluded.municipality,
  center_type = excluded.center_type,
  religious_character = excluded.religious_character,
  stages = excluded.stages,
  languages = excluded.languages,
  services = excluded.services,
  description = excluded.description,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  tags = excluded.tags,
  image_url = excluded.image_url,
  status = 'approved',
  record_origin = 'tenlo_curated';

insert into public.centers (
  external_key, slug, name, municipality, center_type, religious_character,
  stages, languages, services, description, address, phone, email, website,
  source_name, source_url, last_reviewed, trust_level, tags, image_url, status, record_origin
) values (
  'boadilla-quercus', 'colegio-quercus-boadilla', 'Colegio Quercus', 'Boadilla del Monte',
  'concertado', 'laico', array['Infantil', 'Primaria', 'ESO', 'Bachillerato']::text[],
  array['Inglés']::text[], array['Comedor', 'Extraescolares', 'Orientación']::text[], 'Centro con etapas de Infantil a Bachillerato y oferta de actividades extraescolares.',
  'Consultar dirección pública', '916 33 85 16', null, 'https://www.colegioquercus.com/',
  'Web oficial del centro', 'https://www.colegioquercus.com/', '2026-10-11',
  'collected', array['Concertado', 'Laico']::text[], 'https://images.unsplash.com/photo-1577891729319-f4871c6ec217?auto=format&fit=crop&w=1200&q=80', 'approved', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  name = excluded.name,
  municipality = excluded.municipality,
  center_type = excluded.center_type,
  religious_character = excluded.religious_character,
  stages = excluded.stages,
  languages = excluded.languages,
  services = excluded.services,
  description = excluded.description,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  tags = excluded.tags,
  image_url = excluded.image_url,
  status = 'approved',
  record_origin = 'tenlo_curated';

insert into public.centers (
  external_key, slug, name, municipality, center_type, religious_character,
  stages, languages, services, description, address, phone, email, website,
  source_name, source_url, last_reviewed, trust_level, tags, image_url, status, record_origin
) values (
  'boadilla-stmichaels', 'st-michaels-school-boadilla', 'St. Michael''s School', 'Boadilla del Monte',
  'privado', 'catolico', array['Infantil', 'Primaria', 'ESO', 'Bachillerato']::text[],
  array['Inglés']::text[], array['Comedor', 'Extraescolares', 'Orientación']::text[], 'Colegio privado bilingüe en Boadilla del Monte.',
  'Consultar dirección pública', '916 33 00 78', null, 'https://stmichaelsschool.es/',
  'Web oficial del centro', 'https://stmichaelsschool.es/', '2026-10-11',
  'collected', array['Privado', 'Bilingüe']::text[], 'https://images.unsplash.com/photo-1577891729319-f4871c6ec217?auto=format&fit=crop&w=1200&q=80', 'approved', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  name = excluded.name,
  municipality = excluded.municipality,
  center_type = excluded.center_type,
  religious_character = excluded.religious_character,
  stages = excluded.stages,
  languages = excluded.languages,
  services = excluded.services,
  description = excluded.description,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  tags = excluded.tags,
  image_url = excluded.image_url,
  status = 'approved',
  record_origin = 'tenlo_curated';

insert into public.centers (
  external_key, slug, name, municipality, center_type, religious_character,
  stages, languages, services, description, address, phone, email, website,
  source_name, source_url, last_reviewed, trust_level, tags, image_url, status, record_origin
) values (
  'pozuelo-everest', 'colegio-everest-pozuelo', 'Everest School Monteclaro', 'Pozuelo de Alarcón',
  'privado', 'catolico', array['Infantil', 'Primaria', 'ESO', 'Bachillerato']::text[],
  array['Inglés']::text[], array['Comedor', 'Extraescolares', 'Orientación']::text[], 'Colegio privado, católico y bilingüe en Pozuelo de Alarcón.',
  'Consultar dirección pública', null, null, 'https://www.everestschool.es/',
  'Web oficial del centro', 'https://www.everestschool.es/', '2026-10-11',
  'collected', array['Privado', 'Católico']::text[], 'https://images.unsplash.com/photo-1577891729319-f4871c6ec217?auto=format&fit=crop&w=1200&q=80', 'approved', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  name = excluded.name,
  municipality = excluded.municipality,
  center_type = excluded.center_type,
  religious_character = excluded.religious_character,
  stages = excluded.stages,
  languages = excluded.languages,
  services = excluded.services,
  description = excluded.description,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  tags = excluded.tags,
  image_url = excluded.image_url,
  status = 'approved',
  record_origin = 'tenlo_curated';

insert into public.centers (
  external_key, slug, name, municipality, center_type, religious_character,
  stages, languages, services, description, address, phone, email, website,
  source_name, source_url, last_reviewed, trust_level, tags, image_url, status, record_origin
) values (
  'pozuelo-kensington', 'colegio-kensington-pozuelo', 'Kensington School', 'Pozuelo de Alarcón',
  'privado', 'laico', array['Infantil', 'Primaria', 'ESO', 'Bachillerato']::text[],
  array['Inglés']::text[], array['Comedor', 'Extraescolares', 'Orientación']::text[], 'Colegio británico multilingüe en Pozuelo de Alarcón.',
  'Consultar dirección pública', '917 15 46 99', null, 'https://www.kensington-school.es/',
  'Web oficial del centro', 'https://www.kensington-school.es/', '2026-10-11',
  'collected', array['Privado', 'Británico']::text[], 'https://images.unsplash.com/photo-1577891729319-f4871c6ec217?auto=format&fit=crop&w=1200&q=80', 'approved', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  name = excluded.name,
  municipality = excluded.municipality,
  center_type = excluded.center_type,
  religious_character = excluded.religious_character,
  stages = excluded.stages,
  languages = excluded.languages,
  services = excluded.services,
  description = excluded.description,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  tags = excluded.tags,
  image_url = excluded.image_url,
  status = 'approved',
  record_origin = 'tenlo_curated';

insert into public.centers (
  external_key, slug, name, municipality, center_type, religious_character,
  stages, languages, services, description, address, phone, email, website,
  source_name, source_url, last_reviewed, trust_level, tags, image_url, status, record_origin
) values (
  'pozuelo-montetabor', 'colegio-monte-tabor-pozuelo', 'Colegio Monte Tabor', 'Pozuelo de Alarcón',
  'concertado', 'catolico', array['Infantil', 'Primaria', 'ESO', 'Bachillerato']::text[],
  array['Inglés']::text[], array['Comedor', 'Extraescolares', 'Orientación']::text[], 'Centro concertado con ideario católico.',
  'Consultar dirección pública', '915 12 21 38', null, 'https://www.colegiomontetabor.es/',
  'Web oficial del centro', 'https://www.colegiomontetabor.es/', '2026-10-11',
  'collected', array['Concertado', 'Católico']::text[], 'https://images.unsplash.com/photo-1577891729319-f4871c6ec217?auto=format&fit=crop&w=1200&q=80', 'approved', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  name = excluded.name,
  municipality = excluded.municipality,
  center_type = excluded.center_type,
  religious_character = excluded.religious_character,
  stages = excluded.stages,
  languages = excluded.languages,
  services = excluded.services,
  description = excluded.description,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  tags = excluded.tags,
  image_url = excluded.image_url,
  status = 'approved',
  record_origin = 'tenlo_curated';



-- Proveedores no reclamados: sin propietario ficticio.

insert into public.business_profiles (
  external_key, owner_id, business_name, website, municipality, service_area, category,
  trust_level, status, source_name, source_url, last_reviewed, claim_status,
  commercial_plan, description, phone, contact_email, tags, image_url, record_origin, details
) values (
  'boadilla-beone', null, 'BeOne Boadilla', 'https://beone.es/centros-deportivos/madrid/boadilla',
  'Boadilla del Monte', 'Boadilla del Monte y alrededores', 'Extraescolares',
  'collected', 'approved', 'Web oficial del proveedor', 'https://beone.es/centros-deportivos/madrid/boadilla',
  '2026-10-11', 'unclaimed', 'free', 'Centro deportivo con piscina, escuela de natación, actividades infantiles y ludoteca.',
  '916 32 73 61', null, array['Deporte', 'Natación', 'Fitness']::text[],
  'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated', '{}'::jsonb
) on conflict (external_key) where external_key is not null do update set
  business_name = excluded.business_name,
  website = excluded.website,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  category = excluded.category,
  trust_level = 'collected',
  status = 'approved',
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  claim_status = case when public.business_profiles.claim_status = 'unclaimed' then 'unclaimed' else public.business_profiles.claim_status end,
  description = excluded.description,
  phone = excluded.phone,
  contact_email = excluded.contact_email,
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.business_profiles.owner_id is null
  and public.business_profiles.record_origin = 'tenlo_curated';

insert into public.business_profiles (
  external_key, owner_id, business_name, website, municipality, service_area, category,
  trust_level, status, source_name, source_url, last_reviewed, claim_status,
  commercial_plan, description, phone, contact_email, tags, image_url, record_origin, details
) values (
  'pozuelo-kumon', null, 'Kumon Pozuelo - Estación', 'https://www.kumon.es/pozuelo-estacion',
  'Pozuelo de Alarcón', 'Pozuelo de Alarcón y alrededores', 'Extraescolares',
  'collected', 'approved', 'Web oficial del proveedor', 'https://www.kumon.es/pozuelo-estacion',
  '2026-10-11', 'unclaimed', 'free', 'Centro Kumon con programas de Matemáticas, Lectura e English, en modalidad presencial y online.',
  '913 51 81 81', null, array['Matemáticas', 'Lectura', 'Inglés']::text[],
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated', '{}'::jsonb
) on conflict (external_key) where external_key is not null do update set
  business_name = excluded.business_name,
  website = excluded.website,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  category = excluded.category,
  trust_level = 'collected',
  status = 'approved',
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  claim_status = case when public.business_profiles.claim_status = 'unclaimed' then 'unclaimed' else public.business_profiles.claim_status end,
  description = excluded.description,
  phone = excluded.phone,
  contact_email = excluded.contact_email,
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.business_profiles.owner_id is null
  and public.business_profiles.record_origin = 'tenlo_curated';

insert into public.business_profiles (
  external_key, owner_id, business_name, website, municipality, service_area, category,
  trust_level, status, source_name, source_url, last_reviewed, claim_status,
  commercial_plan, description, phone, contact_email, tags, image_url, record_origin, details
) values (
  'majadahonda-kidsus', null, 'Kids&Us Majadahonda', 'https://www.kidsandus.es/es/academias-ingles/majadahonda',
  'Majadahonda', 'Majadahonda y alrededores', 'Idiomas',
  'collected', 'approved', 'Web oficial del proveedor', 'https://www.kidsandus.es/es/academias-ingles/majadahonda',
  '2026-10-11', 'unclaimed', 'free', 'Academia de inglés para alumnado de 1 a 18 años con cursos adaptados por etapas.',
  '916 39 10 53', null, array['Inglés', 'Método propio']::text[],
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated', '{}'::jsonb
) on conflict (external_key) where external_key is not null do update set
  business_name = excluded.business_name,
  website = excluded.website,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  category = excluded.category,
  trust_level = 'collected',
  status = 'approved',
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  claim_status = case when public.business_profiles.claim_status = 'unclaimed' then 'unclaimed' else public.business_profiles.claim_status end,
  description = excluded.description,
  phone = excluded.phone,
  contact_email = excluded.contact_email,
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.business_profiles.owner_id is null
  and public.business_profiles.record_origin = 'tenlo_curated';

insert into public.business_profiles (
  external_key, owner_id, business_name, website, municipality, service_area, category,
  trust_level, status, source_name, source_url, last_reviewed, claim_status,
  commercial_plan, description, phone, contact_email, tags, image_url, record_origin, details
) values (
  'hanky-planet-las-rozas-sala-1', null, 'Hanky Planet Las Rozas - Sala 1', 'https://www.hankyplanet.com/celebracion-de-cumpleanos-en-las-rozas/',
  'Las Rozas de Madrid', 'Las Rozas de Madrid y alrededores', 'Salas multiusos',
  'collected', 'approved', 'Web oficial del proveedor', 'https://www.hankyplanet.com/celebracion-de-cumpleanos-en-las-rozas/',
  '2026-10-11', 'unclaimed', 'free', 'Sala equipada para cumpleaños, comuniones y fiestas familiares, con servicios opcionales de monitores, decoración y catering.',
  '666 222 269', 'lasrozas@hankyplanet.com', array['Cumpleaños', 'Salas multiusos']::text[],
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated', '{}'::jsonb
) on conflict (external_key) where external_key is not null do update set
  business_name = excluded.business_name,
  website = excluded.website,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  category = excluded.category,
  trust_level = 'collected',
  status = 'approved',
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  claim_status = case when public.business_profiles.claim_status = 'unclaimed' then 'unclaimed' else public.business_profiles.claim_status end,
  description = excluded.description,
  phone = excluded.phone,
  contact_email = excluded.contact_email,
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.business_profiles.owner_id is null
  and public.business_profiles.record_origin = 'tenlo_curated';

insert into public.business_profiles (
  external_key, owner_id, business_name, website, municipality, service_area, category,
  trust_level, status, source_name, source_url, last_reviewed, claim_status,
  commercial_plan, description, phone, contact_email, tags, image_url, record_origin, details
) values (
  'ilusiona-equinoccio-majadahonda', null, 'Ilusiona Equinoccio', 'https://ilusiona.com/equinoccio/',
  'Majadahonda', 'Majadahonda y alrededores', 'Ocio familiar',
  'collected', 'approved', 'Web oficial del proveedor', 'https://ilusiona.com/equinoccio/',
  '2026-10-11', 'unclaimed', 'free', 'Centro de ocio familiar en C.C. Equinoccio con actividades y reserva de cumpleaños.',
  '916 39 73 62', 'info@ilusiona.com', array['Cumpleaños', 'Actividades']::text[],
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated', '{}'::jsonb
) on conflict (external_key) where external_key is not null do update set
  business_name = excluded.business_name,
  website = excluded.website,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  category = excluded.category,
  trust_level = 'collected',
  status = 'approved',
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  claim_status = case when public.business_profiles.claim_status = 'unclaimed' then 'unclaimed' else public.business_profiles.claim_status end,
  description = excluded.description,
  phone = excluded.phone,
  contact_email = excluded.contact_email,
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.business_profiles.owner_id is null
  and public.business_profiles.record_origin = 'tenlo_curated';

insert into public.business_profiles (
  external_key, owner_id, business_name, website, municipality, service_area, category,
  trust_level, status, source_name, source_url, last_reviewed, claim_status,
  commercial_plan, description, phone, contact_email, tags, image_url, record_origin, details
) values (
  'piccoli-majadahonda', null, 'Piccoli Majadahonda', 'https://www.piccoli.es/',
  'Majadahonda', 'Majadahonda y alrededores', 'Talleres y campamentos',
  'collected', 'approved', 'Web oficial del proveedor', 'https://www.piccoli.es/',
  '2026-10-11', 'unclaimed', 'free', 'Centro que ofrece cumpleaños a medida con temática y taller, además de campamentos y días sin cole.',
  '693 74 15 10', 'Consultar en web', array['Cumpleaños', 'Talleres', 'Campamentos']::text[],
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated', '{}'::jsonb
) on conflict (external_key) where external_key is not null do update set
  business_name = excluded.business_name,
  website = excluded.website,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  category = excluded.category,
  trust_level = 'collected',
  status = 'approved',
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  claim_status = case when public.business_profiles.claim_status = 'unclaimed' then 'unclaimed' else public.business_profiles.claim_status end,
  description = excluded.description,
  phone = excluded.phone,
  contact_email = excluded.contact_email,
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.business_profiles.owner_id is null
  and public.business_profiles.record_origin = 'tenlo_curated';

insert into public.business_profiles (
  external_key, owner_id, business_name, website, municipality, service_area, category,
  trust_level, status, source_name, source_url, last_reviewed, claim_status,
  commercial_plan, description, phone, contact_email, tags, image_url, record_origin, details
) values (
  'centro-juvenil-principe-asturias', null, 'Centro Juvenil Príncipe de Asturias', 'https://juventud.majadahonda.org/información-general-horario-y-localización',
  'Majadahonda', 'Majadahonda y alrededores', 'Sala multiusos municipal',
  'collected', 'approved', 'Web oficial del proveedor', 'https://juventud.majadahonda.org/información-general-horario-y-localización',
  '2026-10-11', 'unclaimed', 'free', 'Recurso municipal con cesión de espacios, salas multiusos y actividades culturales, útil para familias que buscan espacios comunitarios sujetos a normativa municipal.',
  '916 34 91 20', 'centrojuvenil@majadahonda.org', array['Sala multiusos', 'Cesión de espacios', 'Juventud', 'Majadahonda']::text[],
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated', '{}'::jsonb
) on conflict (external_key) where external_key is not null do update set
  business_name = excluded.business_name,
  website = excluded.website,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  category = excluded.category,
  trust_level = 'collected',
  status = 'approved',
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  claim_status = case when public.business_profiles.claim_status = 'unclaimed' then 'unclaimed' else public.business_profiles.claim_status end,
  description = excluded.description,
  phone = excluded.phone,
  contact_email = excluded.contact_email,
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.business_profiles.owner_id is null
  and public.business_profiles.record_origin = 'tenlo_curated';

insert into public.business_profiles (
  external_key, owner_id, business_name, website, municipality, service_area, category,
  trust_level, status, source_name, source_url, last_reviewed, claim_status,
  commercial_plan, description, phone, contact_email, tags, image_url, record_origin, details
) values (
  'espacio-cultural-mira-pozuelo', null, 'Espacio Cultural MIRA', 'https://www.pozuelodealarcon.org/node/26355',
  'Pozuelo de Alarcón', 'Pozuelo de Alarcón y alrededores', 'Sala multiusos y cultura',
  'collected', 'approved', 'Web oficial del proveedor', 'https://www.pozuelodealarcon.org/node/26355',
  '2026-10-11', 'unclaimed', 'free', 'Centro cultural municipal con instalaciones amplias y programación familiar; las cesiones o usos de sala dependen de normativa y disponibilidad municipal.',
  '917 62 83 00', 'pmc@pozuelo.madrid', array['Centro cultural', 'Sala multiusos', 'Actividades familiares', 'Pozuelo']::text[],
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated', '{}'::jsonb
) on conflict (external_key) where external_key is not null do update set
  business_name = excluded.business_name,
  website = excluded.website,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  category = excluded.category,
  trust_level = 'collected',
  status = 'approved',
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  claim_status = case when public.business_profiles.claim_status = 'unclaimed' then 'unclaimed' else public.business_profiles.claim_status end,
  description = excluded.description,
  phone = excluded.phone,
  contact_email = excluded.contact_email,
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.business_profiles.owner_id is null
  and public.business_profiles.record_origin = 'tenlo_curated';

insert into public.business_profiles (
  external_key, owner_id, business_name, website, municipality, service_area, category,
  trust_level, status, source_name, source_url, last_reviewed, claim_status,
  commercial_plan, description, phone, contact_email, tags, image_url, record_origin, details
) values (
  'hop-galaxy-boadilla', null, 'Hop Galaxy Boadilla', 'https://www.hopgalaxy.com/boadilla',
  'Boadilla del Monte', 'Boadilla del Monte y alrededores', 'Parque infantil',
  'collected', 'approved', 'Web oficial del proveedor', 'https://www.hopgalaxy.com/boadilla',
  '2026-10-11', 'unclaimed', 'free', 'Centro de ocio infantil con atracciones y opción de fiesta privada.',
  '630 69 06 19', 'info@hopgalaxy.com', array['Cumpleaños', 'Parque infantil']::text[],
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated', '{}'::jsonb
) on conflict (external_key) where external_key is not null do update set
  business_name = excluded.business_name,
  website = excluded.website,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  category = excluded.category,
  trust_level = 'collected',
  status = 'approved',
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  claim_status = case when public.business_profiles.claim_status = 'unclaimed' then 'unclaimed' else public.business_profiles.claim_status end,
  description = excluded.description,
  phone = excluded.phone,
  contact_email = excluded.contact_email,
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.business_profiles.owner_id is null
  and public.business_profiles.record_origin = 'tenlo_curated';

insert into public.business_profiles (
  external_key, owner_id, business_name, website, municipality, service_area, category,
  trust_level, status, source_name, source_url, last_reviewed, claim_status,
  commercial_plan, description, phone, contact_email, tags, image_url, record_origin, details
) values (
  'el-miniclub-boadilla', null, 'El Miniclub', 'https://elminiclub.com/',
  'Boadilla del Monte', 'Boadilla del Monte y alrededores', 'Parque infantil',
  'collected', 'approved', 'Web oficial del proveedor', 'https://elminiclub.com/',
  '2026-10-11', 'unclaimed', 'free', 'Parque de ocio infantil en Boadilla con cumpleaños, monitores, cafetería para familias y actividades.',
  '916 33 68 80', 'info@elminiclub.com', array['Cumpleaños', 'Parque infantil']::text[],
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated', '{}'::jsonb
) on conflict (external_key) where external_key is not null do update set
  business_name = excluded.business_name,
  website = excluded.website,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  category = excluded.category,
  trust_level = 'collected',
  status = 'approved',
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  claim_status = case when public.business_profiles.claim_status = 'unclaimed' then 'unclaimed' else public.business_profiles.claim_status end,
  description = excluded.description,
  phone = excluded.phone,
  contact_email = excluded.contact_email,
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.business_profiles.owner_id is null
  and public.business_profiles.record_origin = 'tenlo_curated';

insert into public.business_profiles (
  external_key, owner_id, business_name, website, municipality, service_area, category,
  trust_level, status, source_name, source_url, last_reviewed, claim_status,
  commercial_plan, description, phone, contact_email, tags, image_url, record_origin, details
) values (
  'club-las-encinas-boadilla', null, 'Club Las Encinas de Boadilla', 'https://www.clublasencinas.es/Pages/108-cumpleanyos_y_celebraciones_infantiles_i_club_las_encinas_de_boadilla',
  'Boadilla del Monte', 'Boadilla del Monte y alrededores', 'Celebraciones familiares',
  'collected', 'approved', 'Web oficial del proveedor', 'https://www.clublasencinas.es/Pages/108-cumpleanyos_y_celebraciones_infantiles_i_club_las_encinas_de_boadilla',
  '2026-10-11', 'unclaimed', 'free', 'Club con instalaciones sociales, infantiles y deportivas en entorno natural para cumpleaños y celebraciones familiares.',
  '916 33 03 64', 'Consultar en web', array['Cumpleaños', 'Celebraciones familiares']::text[],
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated', '{}'::jsonb
) on conflict (external_key) where external_key is not null do update set
  business_name = excluded.business_name,
  website = excluded.website,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  category = excluded.category,
  trust_level = 'collected',
  status = 'approved',
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  claim_status = case when public.business_profiles.claim_status = 'unclaimed' then 'unclaimed' else public.business_profiles.claim_status end,
  description = excluded.description,
  phone = excluded.phone,
  contact_email = excluded.contact_email,
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.business_profiles.owner_id is null
  and public.business_profiles.record_origin = 'tenlo_curated';



-- Servicios y fichas navegables. Las relaciones se resuelven por claves estables.

insert into public.services (
  external_key, owner_id, business_profile_id, slug, title, category_id, municipality,
  service_area, description, age_min, age_max, price_label, availability, contact_email,
  phone, website, source_name, source_url, last_reviewed, trust_level, status, tags,
  image_url, record_origin
) values (
  'p-boadilla-beone', null,
  (select id from public.business_profiles where external_key = 'boadilla-beone'),
  'boadilla-beone', 'BeOne Boadilla', 'extraescolares',
  'Boadilla del Monte', 'Boadilla del Monte y alrededores', 'Centro deportivo con piscina, escuela de natación, actividades infantiles y ludoteca.',
  3, 16,
  'Consultar', 'Consultar programación infantil y disponibilidad con el centro.', null,
  '916 32 73 61', 'https://beone.es/centros-deportivos/madrid/boadilla',
  'Web oficial del proveedor', 'https://beone.es/centros-deportivos/madrid/boadilla', '2026-10-11',
  'collected', 'approved', array['Deporte', 'Natación', 'Fitness']::text[], 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  business_profile_id = excluded.business_profile_id,
  title = excluded.title,
  category_id = excluded.category_id,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  description = excluded.description,
  age_min = excluded.age_min,
  age_max = excluded.age_max,
  price_label = excluded.price_label,
  availability = excluded.availability,
  contact_email = excluded.contact_email,
  phone = excluded.phone,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  status = 'approved',
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.services.owner_id is null
  and public.services.record_origin = 'tenlo_curated';

insert into public.services (
  external_key, owner_id, business_profile_id, slug, title, category_id, municipality,
  service_area, description, age_min, age_max, price_label, availability, contact_email,
  phone, website, source_name, source_url, last_reviewed, trust_level, status, tags,
  image_url, record_origin
) values (
  'p-pozuelo-kumon', null,
  (select id from public.business_profiles where external_key = 'pozuelo-kumon'),
  'pozuelo-kumon', 'Kumon Pozuelo - Estación', 'extraescolares',
  'Pozuelo de Alarcón', 'Pozuelo de Alarcón y alrededores', 'Centro Kumon con programas de Matemáticas, Lectura e English, en modalidad presencial y online.',
  3, 16,
  'Consultar', 'Lunes a jueves de 16:30 a 19:00; confirmar turno y disponibilidad con el centro.', null,
  '913 51 81 81', 'https://www.kumon.es/pozuelo-estacion',
  'Web oficial del proveedor', 'https://www.kumon.es/pozuelo-estacion', '2026-10-11',
  'collected', 'approved', array['Matemáticas', 'Lectura', 'Inglés']::text[], 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  business_profile_id = excluded.business_profile_id,
  title = excluded.title,
  category_id = excluded.category_id,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  description = excluded.description,
  age_min = excluded.age_min,
  age_max = excluded.age_max,
  price_label = excluded.price_label,
  availability = excluded.availability,
  contact_email = excluded.contact_email,
  phone = excluded.phone,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  status = 'approved',
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.services.owner_id is null
  and public.services.record_origin = 'tenlo_curated';

insert into public.services (
  external_key, owner_id, business_profile_id, slug, title, category_id, municipality,
  service_area, description, age_min, age_max, price_label, availability, contact_email,
  phone, website, source_name, source_url, last_reviewed, trust_level, status, tags,
  image_url, record_origin
) values (
  'p-majadahonda-kidsus', null,
  (select id from public.business_profiles where external_key = 'majadahonda-kidsus'),
  'majadahonda-kidsus', 'Kids&Us Majadahonda', 'clases-particulares',
  'Majadahonda', 'Majadahonda y alrededores', 'Academia de inglés para alumnado de 1 a 18 años con cursos adaptados por etapas.',
  3, 16,
  'Consultar', 'Lunes a viernes de 12:00 a 20:30; confirmar grupos y disponibilidad con el centro.', null,
  '916 39 10 53', 'https://www.kidsandus.es/es/academias-ingles/majadahonda',
  'Web oficial del proveedor', 'https://www.kidsandus.es/es/academias-ingles/majadahonda', '2026-10-11',
  'collected', 'approved', array['Inglés', 'Método propio']::text[], 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  business_profile_id = excluded.business_profile_id,
  title = excluded.title,
  category_id = excluded.category_id,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  description = excluded.description,
  age_min = excluded.age_min,
  age_max = excluded.age_max,
  price_label = excluded.price_label,
  availability = excluded.availability,
  contact_email = excluded.contact_email,
  phone = excluded.phone,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  status = 'approved',
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.services.owner_id is null
  and public.services.record_origin = 'tenlo_curated';

insert into public.services (
  external_key, owner_id, business_profile_id, slug, title, category_id, municipality,
  service_area, description, age_min, age_max, price_label, availability, contact_email,
  phone, website, source_name, source_url, last_reviewed, trust_level, status, tags,
  image_url, record_origin
) values (
  'p-hanky-planet-las-rozas-sala-1', null,
  (select id from public.business_profiles where external_key = 'hanky-planet-las-rozas-sala-1'),
  'hanky-planet-las-rozas-sala-1', 'Hanky Planet Las Rozas - Sala 1', 'extraescolares',
  'Las Rozas de Madrid', 'Las Rozas de Madrid y alrededores', 'Sala equipada para cumpleaños, comuniones y fiestas familiares, con servicios opcionales de monitores, decoración y catering.',
  3, 16,
  'Consultar', 'Turnos publicados: mañana 10:00-14:30, comida 12:00-18:00, tarde 16:30-21:00, cena 20:00-01:00 y noche 22:00-02:00.', 'lasrozas@hankyplanet.com',
  '666 222 269', 'https://www.hankyplanet.com/celebracion-de-cumpleanos-en-las-rozas/',
  'Web oficial del proveedor', 'https://www.hankyplanet.com/celebracion-de-cumpleanos-en-las-rozas/', '2026-10-11',
  'collected', 'approved', array['Cumpleaños', 'Salas multiusos']::text[], 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  business_profile_id = excluded.business_profile_id,
  title = excluded.title,
  category_id = excluded.category_id,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  description = excluded.description,
  age_min = excluded.age_min,
  age_max = excluded.age_max,
  price_label = excluded.price_label,
  availability = excluded.availability,
  contact_email = excluded.contact_email,
  phone = excluded.phone,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  status = 'approved',
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.services.owner_id is null
  and public.services.record_origin = 'tenlo_curated';

insert into public.services (
  external_key, owner_id, business_profile_id, slug, title, category_id, municipality,
  service_area, description, age_min, age_max, price_label, availability, contact_email,
  phone, website, source_name, source_url, last_reviewed, trust_level, status, tags,
  image_url, record_origin
) values (
  'p-hanky-planet-las-rozas-sala-2', null,
  (select id from public.business_profiles where external_key = 'hanky-planet-las-rozas-sala-1'),
  'hanky-planet-las-rozas-sala-2', 'Hanky Planet Las Rozas - Sala 2', 'extraescolares',
  'Las Rozas de Madrid', 'Las Rozas de Madrid y alrededores', 'Sala para fiestas privadas con configuración útil para cumpleaños y celebraciones familiares.',
  3, 16,
  'Consultar', 'Turnos publicados: mañana 10:00-14:30, comida 12:00-18:00, tarde 16:30-21:00, cena 19:30-01:00 y noche 22:00-00:00.', 'lasrozas@hankyplanet.com',
  '666 222 269', 'https://fiestalasrozas.com/',
  'Web oficial del proveedor', 'https://www.hankyplanet.com/celebracion-de-cumpleanos-en-las-rozas/', '2026-10-11',
  'collected', 'approved', array['Cumpleaños', 'Salas multiusos']::text[], 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  business_profile_id = excluded.business_profile_id,
  title = excluded.title,
  category_id = excluded.category_id,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  description = excluded.description,
  age_min = excluded.age_min,
  age_max = excluded.age_max,
  price_label = excluded.price_label,
  availability = excluded.availability,
  contact_email = excluded.contact_email,
  phone = excluded.phone,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  status = 'approved',
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.services.owner_id is null
  and public.services.record_origin = 'tenlo_curated';

insert into public.services (
  external_key, owner_id, business_profile_id, slug, title, category_id, municipality,
  service_area, description, age_min, age_max, price_label, availability, contact_email,
  phone, website, source_name, source_url, last_reviewed, trust_level, status, tags,
  image_url, record_origin
) values (
  'p-hanky-planet-las-rozas-sala-3', null,
  (select id from public.business_profiles where external_key = 'hanky-planet-las-rozas-sala-1'),
  'hanky-planet-las-rozas-sala-3', 'Hanky Planet Las Rozas - Sala 3', 'extraescolares',
  'Las Rozas de Madrid', 'Las Rozas de Madrid y alrededores', 'Sala de uso exclusivo para cumpleaños familiares con equipamiento de ocio y cocina de apoyo.',
  3, 16,
  'Consultar', 'Turnos publicados: mañana 10:00-15:00, tarde 16:00-21:00 y noche 22:00-02:00.', 'lasrozas@hankyplanet.com',
  '666 222 269', 'https://www.salasdeocio.com/salas/1244-hanky-planet-las-rozas-i',
  'Web oficial del proveedor', 'https://www.hankyplanet.com/celebracion-de-cumpleanos-en-las-rozas/', '2026-10-11',
  'collected', 'approved', array['Cumpleaños', 'Salas multiusos']::text[], 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  business_profile_id = excluded.business_profile_id,
  title = excluded.title,
  category_id = excluded.category_id,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  description = excluded.description,
  age_min = excluded.age_min,
  age_max = excluded.age_max,
  price_label = excluded.price_label,
  availability = excluded.availability,
  contact_email = excluded.contact_email,
  phone = excluded.phone,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  status = 'approved',
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.services.owner_id is null
  and public.services.record_origin = 'tenlo_curated';

insert into public.services (
  external_key, owner_id, business_profile_id, slug, title, category_id, municipality,
  service_area, description, age_min, age_max, price_label, availability, contact_email,
  phone, website, source_name, source_url, last_reviewed, trust_level, status, tags,
  image_url, record_origin
) values (
  'p-ilusiona-equinoccio-majadahonda', null,
  (select id from public.business_profiles where external_key = 'ilusiona-equinoccio-majadahonda'),
  'ilusiona-equinoccio-majadahonda', 'Ilusiona Equinoccio', 'extraescolares',
  'Majadahonda', 'Majadahonda y alrededores', 'Centro de ocio familiar en C.C. Equinoccio con actividades y reserva de cumpleaños.',
  3, 16,
  'Consultar', 'Centro de ocio: lun-jue 16:00-00:00, vie 16:00-01:00, sáb 11:00-01:00, dom 11:00-00:00.', 'info@ilusiona.com',
  '916 39 73 62', 'https://ilusiona.com/equinoccio/',
  'Web oficial del proveedor', 'https://ilusiona.com/equinoccio/', '2026-10-11',
  'collected', 'approved', array['Cumpleaños', 'Actividades']::text[], 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  business_profile_id = excluded.business_profile_id,
  title = excluded.title,
  category_id = excluded.category_id,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  description = excluded.description,
  age_min = excluded.age_min,
  age_max = excluded.age_max,
  price_label = excluded.price_label,
  availability = excluded.availability,
  contact_email = excluded.contact_email,
  phone = excluded.phone,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  status = 'approved',
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.services.owner_id is null
  and public.services.record_origin = 'tenlo_curated';

insert into public.services (
  external_key, owner_id, business_profile_id, slug, title, category_id, municipality,
  service_area, description, age_min, age_max, price_label, availability, contact_email,
  phone, website, source_name, source_url, last_reviewed, trust_level, status, tags,
  image_url, record_origin
) values (
  'p-piccoli-majadahonda', null,
  (select id from public.business_profiles where external_key = 'piccoli-majadahonda'),
  'piccoli-majadahonda', 'Piccoli Majadahonda', 'campamentos',
  'Majadahonda', 'Majadahonda y alrededores', 'Centro que ofrece cumpleaños a medida con temática y taller, además de campamentos y días sin cole.',
  3, 16,
  'Consultar', 'Horario no publicado de forma estable en la web; conviene confirmar disponibilidad al reservar.', 'Consultar en web',
  '693 74 15 10', 'https://www.piccoli.es/',
  'Web oficial del proveedor', 'https://www.piccoli.es/', '2026-10-11',
  'collected', 'approved', array['Cumpleaños', 'Talleres', 'Campamentos']::text[], 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  business_profile_id = excluded.business_profile_id,
  title = excluded.title,
  category_id = excluded.category_id,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  description = excluded.description,
  age_min = excluded.age_min,
  age_max = excluded.age_max,
  price_label = excluded.price_label,
  availability = excluded.availability,
  contact_email = excluded.contact_email,
  phone = excluded.phone,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  status = 'approved',
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.services.owner_id is null
  and public.services.record_origin = 'tenlo_curated';

insert into public.services (
  external_key, owner_id, business_profile_id, slug, title, category_id, municipality,
  service_area, description, age_min, age_max, price_label, availability, contact_email,
  phone, website, source_name, source_url, last_reviewed, trust_level, status, tags,
  image_url, record_origin
) values (
  'p-centro-juvenil-principe-asturias', null,
  (select id from public.business_profiles where external_key = 'centro-juvenil-principe-asturias'),
  'centro-juvenil-principe-asturias', 'Centro Juvenil Príncipe de Asturias', 'extraescolares',
  'Majadahonda', 'Majadahonda y alrededores', 'Recurso municipal con cesión de espacios, salas multiusos y actividades culturales, útil para familias que buscan espacios comunitarios sujetos a normativa municipal.',
  3, 16,
  'Consultar', 'Lun-vie 8:15-21:15, sáb 9:45-14:15 y 16:45-21:15, dom 9:45-14:15.', 'centrojuvenil@majadahonda.org',
  '916 34 91 20', 'https://juventud.majadahonda.org/información-general-horario-y-localización',
  'Web oficial del proveedor', 'https://juventud.majadahonda.org/información-general-horario-y-localización', '2026-10-11',
  'collected', 'approved', array['Sala multiusos', 'Cesión de espacios', 'Juventud', 'Majadahonda']::text[], 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  business_profile_id = excluded.business_profile_id,
  title = excluded.title,
  category_id = excluded.category_id,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  description = excluded.description,
  age_min = excluded.age_min,
  age_max = excluded.age_max,
  price_label = excluded.price_label,
  availability = excluded.availability,
  contact_email = excluded.contact_email,
  phone = excluded.phone,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  status = 'approved',
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.services.owner_id is null
  and public.services.record_origin = 'tenlo_curated';

insert into public.services (
  external_key, owner_id, business_profile_id, slug, title, category_id, municipality,
  service_area, description, age_min, age_max, price_label, availability, contact_email,
  phone, website, source_name, source_url, last_reviewed, trust_level, status, tags,
  image_url, record_origin
) values (
  'p-espacio-cultural-mira-pozuelo', null,
  (select id from public.business_profiles where external_key = 'espacio-cultural-mira-pozuelo'),
  'espacio-cultural-mira-pozuelo', 'Espacio Cultural MIRA', 'extraescolares',
  'Pozuelo de Alarcón', 'Pozuelo de Alarcón y alrededores', 'Centro cultural municipal con instalaciones amplias y programación familiar; las cesiones o usos de sala dependen de normativa y disponibilidad municipal.',
  3, 16,
  'Consultar', 'Instalaciones: 8:00-22:00. Secretaría: lun-vie 10:00-12:00 y mar-jue 14:30-18:00.', 'pmc@pozuelo.madrid',
  '917 62 83 00', 'https://www.pozuelodealarcon.org/node/26355',
  'Web oficial del proveedor', 'https://www.pozuelodealarcon.org/node/26355', '2026-10-11',
  'collected', 'approved', array['Centro cultural', 'Sala multiusos', 'Actividades familiares', 'Pozuelo']::text[], 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  business_profile_id = excluded.business_profile_id,
  title = excluded.title,
  category_id = excluded.category_id,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  description = excluded.description,
  age_min = excluded.age_min,
  age_max = excluded.age_max,
  price_label = excluded.price_label,
  availability = excluded.availability,
  contact_email = excluded.contact_email,
  phone = excluded.phone,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  status = 'approved',
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.services.owner_id is null
  and public.services.record_origin = 'tenlo_curated';

insert into public.services (
  external_key, owner_id, business_profile_id, slug, title, category_id, municipality,
  service_area, description, age_min, age_max, price_label, availability, contact_email,
  phone, website, source_name, source_url, last_reviewed, trust_level, status, tags,
  image_url, record_origin
) values (
  'p-hop-galaxy-boadilla', null,
  (select id from public.business_profiles where external_key = 'hop-galaxy-boadilla'),
  'hop-galaxy-boadilla', 'Hop Galaxy Boadilla', 'extraescolares',
  'Boadilla del Monte', 'Boadilla del Monte y alrededores', 'Centro de ocio infantil con atracciones y opción de fiesta privada.',
  3, 16,
  'Consultar', 'Lun-jue 17:00-21:00, vie 11:00-15:00 y 17:00-22:00, sáb 11:00-22:00, dom 11:00-21:00.', 'info@hopgalaxy.com',
  '630 69 06 19', 'https://www.hopgalaxy.com/boadilla',
  'Web oficial del proveedor', 'https://www.hopgalaxy.com/boadilla', '2026-10-11',
  'collected', 'approved', array['Cumpleaños', 'Parque infantil']::text[], 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  business_profile_id = excluded.business_profile_id,
  title = excluded.title,
  category_id = excluded.category_id,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  description = excluded.description,
  age_min = excluded.age_min,
  age_max = excluded.age_max,
  price_label = excluded.price_label,
  availability = excluded.availability,
  contact_email = excluded.contact_email,
  phone = excluded.phone,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  status = 'approved',
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.services.owner_id is null
  and public.services.record_origin = 'tenlo_curated';

insert into public.services (
  external_key, owner_id, business_profile_id, slug, title, category_id, municipality,
  service_area, description, age_min, age_max, price_label, availability, contact_email,
  phone, website, source_name, source_url, last_reviewed, trust_level, status, tags,
  image_url, record_origin
) values (
  'p-el-miniclub-boadilla', null,
  (select id from public.business_profiles where external_key = 'el-miniclub-boadilla'),
  'el-miniclub-boadilla', 'El Miniclub', 'extraescolares',
  'Boadilla del Monte', 'Boadilla del Monte y alrededores', 'Parque de ocio infantil en Boadilla con cumpleaños, monitores, cafetería para familias y actividades.',
  3, 16,
  'Consultar', 'Mié-vie 17:00-20:30; sáb-dom 11:00-14:00 y 17:00-20:30; lunes y martes cerrado salvo cumpleaños.', 'info@elminiclub.com',
  '916 33 68 80', 'https://elminiclub.com/',
  'Web oficial del proveedor', 'https://elminiclub.com/', '2026-10-11',
  'collected', 'approved', array['Cumpleaños', 'Parque infantil']::text[], 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  business_profile_id = excluded.business_profile_id,
  title = excluded.title,
  category_id = excluded.category_id,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  description = excluded.description,
  age_min = excluded.age_min,
  age_max = excluded.age_max,
  price_label = excluded.price_label,
  availability = excluded.availability,
  contact_email = excluded.contact_email,
  phone = excluded.phone,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  status = 'approved',
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.services.owner_id is null
  and public.services.record_origin = 'tenlo_curated';

insert into public.services (
  external_key, owner_id, business_profile_id, slug, title, category_id, municipality,
  service_area, description, age_min, age_max, price_label, availability, contact_email,
  phone, website, source_name, source_url, last_reviewed, trust_level, status, tags,
  image_url, record_origin
) values (
  'p-club-las-encinas-boadilla', null,
  (select id from public.business_profiles where external_key = 'club-las-encinas-boadilla'),
  'club-las-encinas-boadilla', 'Club Las Encinas de Boadilla', 'extraescolares',
  'Boadilla del Monte', 'Boadilla del Monte y alrededores', 'Club con instalaciones sociales, infantiles y deportivas en entorno natural para cumpleaños y celebraciones familiares.',
  3, 16,
  'Consultar', 'Horario y disponibilidad de cumpleaños sujetos a reserva y calendario del club; confirmar con el centro.', 'Consultar en web',
  '916 33 03 64', 'https://www.clublasencinas.es/Pages/108-cumpleanyos_y_celebraciones_infantiles_i_club_las_encinas_de_boadilla',
  'Web oficial del proveedor', 'https://www.clublasencinas.es/Pages/108-cumpleanyos_y_celebraciones_infantiles_i_club_las_encinas_de_boadilla', '2026-10-11',
  'collected', 'approved', array['Cumpleaños', 'Celebraciones familiares']::text[], 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 'tenlo_curated'
) on conflict (slug) do update set
  external_key = excluded.external_key,
  business_profile_id = excluded.business_profile_id,
  title = excluded.title,
  category_id = excluded.category_id,
  municipality = excluded.municipality,
  service_area = excluded.service_area,
  description = excluded.description,
  age_min = excluded.age_min,
  age_max = excluded.age_max,
  price_label = excluded.price_label,
  availability = excluded.availability,
  contact_email = excluded.contact_email,
  phone = excluded.phone,
  website = excluded.website,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  last_reviewed = excluded.last_reviewed,
  trust_level = 'collected',
  status = 'approved',
  tags = excluded.tags,
  image_url = excluded.image_url,
  record_origin = 'tenlo_curated'
where public.services.owner_id is null
  and public.services.record_origin = 'tenlo_curated';



-- Comprobaciones esperadas para este lote: 11 centros, 11 proveedores y 13 servicios.

select record_origin, count(*) from public.centers group by record_origin order by record_origin;

select record_origin, claim_status, count(*) from public.business_profiles group by record_origin, claim_status order by record_origin, claim_status;

select record_origin, status, count(*) from public.services group by record_origin, status order by record_origin, status;

select count(*) as services_without_provider from public.services where record_origin = 'tenlo_curated' and business_profile_id is null;



commit;
