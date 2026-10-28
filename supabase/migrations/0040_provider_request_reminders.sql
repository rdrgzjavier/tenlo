-- Un único recordatorio operativo por solicitud. Durante el piloto se dispara
-- manualmente desde el backoffice y queda auditado en la propia solicitud.

alter table public.connection_requests
  add column if not exists provider_reminded_at timestamptz;

revoke update (provider_reminded_at) on public.connection_requests from anon, authenticated;

create or replace function public.record_provider_request_reminder(target_request_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_rows integer;
begin
  if not (select public.is_tenlo_admin()) then
    return false;
  end if;
  update public.connection_requests
  set provider_reminded_at = now(), updated_at = now()
  where id = target_request_id
    and provider_reminded_at is null
    and provider_notified_at <= now() - interval '48 hours'
    and status in ('delivered', 'viewed');
  get diagnostics affected_rows = row_count;
  return affected_rows = 1;
end;
$$;

revoke all on function public.record_provider_request_reminder(uuid) from public, anon, authenticated;
grant execute on function public.record_provider_request_reminder(uuid) to authenticated;

comment on column public.connection_requests.provider_reminded_at is
  'Fecha del único recordatorio operativo enviado al proveedor tras el aviso inicial.';
