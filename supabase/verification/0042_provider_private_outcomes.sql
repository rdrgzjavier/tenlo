select
  has_function_privilege('anon', 'public.get_provider_private_outcomes(integer,integer)', 'execute') as anon_can_execute,
  has_function_privilege('authenticated', 'public.get_provider_private_outcomes(integer,integer)', 'execute') as authenticated_can_execute,
  coalesce(array_to_string(proconfig, ','), '') = 'search_path=""' as empty_search_path,
  prosecdef as security_definer
from pg_proc
where oid = 'public.get_provider_private_outcomes(integer,integer)'::regprocedure;
