-- Verificacion post-despliegue del aislamiento de datos de prueba.
-- Ejecutar en el SQL Editor despues de aplicar 0036_test_account_isolation.sql.

select jsonb_pretty(jsonb_build_object(
  'profiles_is_test', exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'is_test'
  ),
  'business_profiles_is_test', exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'business_profiles' and column_name = 'is_test'
  ),
  'connection_requests_is_test', exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'connection_requests' and column_name = 'is_test'
  ),
  'public_test_profiles', (
    select count(*)
    from public.get_public_business_profiles() as profile
    join public.business_profiles as source
      on coalesce(source.external_key, source.id::text) = profile.public_id
    where source.is_test
  ),
  'public_rpc_anon', has_function_privilege(
    'anon',
    'public.get_public_business_profiles()',
    'execute'
  ),
  'public_rpc_config', (
    select coalesce(procedure.proconfig, '{}')
    from pg_proc as procedure
    join pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'get_public_business_profiles'
      and pg_get_function_identity_arguments(procedure.oid) = ''
  )
)) as verification;

