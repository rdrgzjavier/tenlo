-- Cierra los dos search_path heredados que todavía dependían del esquema
-- public. Todas las referencias usadas por estas funciones ya están
-- cualificadas, por lo que el comportamiento no cambia.

alter function public.is_tenlo_admin() set search_path = '';
alter function public.audit_admin_queue_status() set search_path = '';

revoke all on function public.is_tenlo_admin() from public;
revoke all on function public.audit_admin_queue_status() from public;
grant execute on function public.is_tenlo_admin() to authenticated;
