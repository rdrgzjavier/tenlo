-- Cola segura para revisar las fichas profesionales creadas durante el alta.
-- La mutación de estado se concentra en un RPC administrativo para no conceder
-- UPDATE sobre columnas protegidas a todas las cuentas autenticadas.

alter table public.admin_queue_audit
  drop constraint if exists admin_queue_audit_queue_check;
alter table public.admin_queue_audit
  add constraint admin_queue_audit_queue_check
  check (queue in ('claim', 'connection', 'submission', 'feedback', 'business_profile'));

alter table public.admin_queue_notes
  drop constraint if exists admin_queue_notes_queue_check;
alter table public.admin_queue_notes
  add constraint admin_queue_notes_queue_check
  check (queue in ('claim', 'connection', 'submission', 'feedback', 'business_profile'));

create or replace function public.moderate_business_profile(
  target_id uuid,
  next_status public.moderation_status
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_tenlo_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if next_status not in ('pending_review', 'approved', 'rejected', 'archived') then
    raise exception 'Invalid moderation status' using errcode = '22023';
  end if;

  update public.business_profiles
  set status = next_status,
      last_reviewed = current_date
  where id = target_id;

  return found;
end;
$$;

revoke all on function public.moderate_business_profile(uuid, public.moderation_status) from public;
grant execute on function public.moderate_business_profile(uuid, public.moderation_status) to authenticated;

create or replace function public.resubmit_business_profile(target_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.business_profiles
  set status = 'pending_review',
      last_reviewed = null
  where id = target_id
    and owner_id = auth.uid()
    and status = 'rejected';

  return found;
end;
$$;

revoke all on function public.resubmit_business_profile(uuid) from public;
grant execute on function public.resubmit_business_profile(uuid) to authenticated;

drop trigger if exists audit_business_profile_status on public.business_profiles;
create trigger audit_business_profile_status
  after update of status on public.business_profiles
  for each row execute function public.audit_admin_queue_status('business_profile');
