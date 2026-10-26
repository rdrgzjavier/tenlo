-- Verificación post-despliegue de la relevancia declarada por proveedores.
-- Ejecutar en el SQL Editor después de aplicar 0035_provider_lead_relevance.sql.

select jsonb_pretty(jsonb_build_object(
  'read_v2_authenticated', has_function_privilege(
    'authenticated',
    'public.get_provider_connection_requests_v2()',
    'execute'
  ),
  'read_v2_anon', has_function_privilege(
    'anon',
    'public.get_provider_connection_requests_v2()',
    'execute'
  ),
  'respond_v2_authenticated', has_function_privilege(
    'authenticated',
    'public.respond_to_connection_request_v2(uuid,text,text,text)',
    'execute'
  ),
  'respond_v2_anon', has_function_privilege(
    'anon',
    'public.respond_to_connection_request_v2(uuid,text,text,text)',
    'execute'
  ),
  'read_v2_config', (
    select procedure.proconfig
    from pg_proc as procedure
    join pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'get_provider_connection_requests_v2'
    limit 1
  ),
  'respond_v2_config', (
    select procedure.proconfig
    from pg_proc as procedure
    join pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'respond_to_connection_request_v2'
    limit 1
  ),
  'relevance_values_valid', not exists (
    select 1
    from public.connection_requests
    where relevance is not null
      and relevance not in ('relevant', 'irrelevant')
  ),
  'rated_requests', (
    select count(*)
    from public.connection_requests
    where relevance is not null
  )
)) as verification;
