-- Verificación post-despliegue de la bandeja privada para proveedores.
-- Ejecutar en el SQL Editor después de aplicar 0034_provider_connection_flow.sql.

select jsonb_pretty(jsonb_build_object(
  'trigger_exists', exists (
    select 1
    from pg_trigger
    where tgname = 'assign_connection_request_provider'
      and not tgisinternal
  ),
  'provider_index', to_regclass('public.connection_requests_provider_created_idx') is not null,
  'read_authenticated', has_function_privilege(
    'authenticated',
    'public.get_provider_connection_requests()',
    'execute'
  ),
  'read_anon', has_function_privilege(
    'anon',
    'public.get_provider_connection_requests()',
    'execute'
  ),
  'respond_authenticated', has_function_privilege(
    'authenticated',
    'public.respond_to_connection_request(uuid,text,text)',
    'execute'
  ),
  'respond_anon', has_function_privilege(
    'anon',
    'public.respond_to_connection_request(uuid,text,text)',
    'execute'
  ),
  'view_authenticated', has_function_privilege(
    'authenticated',
    'public.mark_provider_request_viewed(uuid)',
    'execute'
  ),
  'view_anon', has_function_privilege(
    'anon',
    'public.mark_provider_request_viewed(uuid)',
    'execute'
  ),
  'assigned_requests', (
    select count(*)
    from public.connection_requests
    where provider_id is not null
  ),
  'read_config', (
    select procedure.proconfig
    from pg_proc as procedure
    join pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'get_provider_connection_requests'
    limit 1
  ),
  'respond_config', (
    select procedure.proconfig
    from pg_proc as procedure
    join pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'respond_to_connection_request'
    limit 1
  )
)) as verification;
