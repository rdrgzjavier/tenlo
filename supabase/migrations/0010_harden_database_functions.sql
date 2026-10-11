-- Resuelve avisos del Security Advisor sin cambiar el comportamiento funcional.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- La función auxiliar puede existir solo en algunos entornos. Retiramos la
-- ejecución pública de cualquier sobrecarga presente sin romper instalaciones
-- nuevas donde no se haya creado.
do $$
declare
  function_signature text;
begin
  for function_signature in
    select format(
      '%I.%I(%s)',
      namespace.nspname,
      procedure.proname,
      pg_get_function_identity_arguments(procedure.oid)
    )
    from pg_proc as procedure
    join pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'rls_auto_enable'
  loop
    execute format('revoke execute on function %s from public', function_signature);
  end loop;
end;
$$;
