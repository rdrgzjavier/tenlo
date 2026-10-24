-- Actualiza actividad y onboarding sin conceder UPDATE directo sobre estos
-- campos analíticos. La cuenta solo puede actuar sobre su propio perfil.

create or replace function public.record_profile_activity(next_onboarding_status text default null)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_rows integer;
begin
  if (select auth.uid()) is null then
    return false;
  end if;

  if next_onboarding_status is not null
     and next_onboarding_status not in ('profile_started', 'profile_complete') then
    return false;
  end if;

  update public.profiles
  set
    onboarding_status = case
      when next_onboarding_status is null then onboarding_status
      when array_position(array['registered', 'email_confirmed', 'profile_started', 'profile_complete', 'active'], onboarding_status)
           < array_position(array['registered', 'email_confirmed', 'profile_started', 'profile_complete', 'active'], next_onboarding_status)
        then next_onboarding_status
      else onboarding_status
    end,
    last_significant_activity_at = now()
  where id = (select auth.uid());

  get diagnostics affected_rows = row_count;
  return affected_rows = 1;
end;
$$;

revoke all on function public.record_profile_activity(text) from public;
grant execute on function public.record_profile_activity(text) to authenticated;

comment on function public.record_profile_activity(text) is
  'Registra actividad significativa propia y permite avanzar, nunca retroceder, hasta profile_complete.';
