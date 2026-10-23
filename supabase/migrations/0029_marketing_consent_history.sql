-- Historial inmutable de la preferencia de marketing.
-- No guarda IP, user-agent, contenido libre ni datos de menores.

create table if not exists public.consent_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  purpose text not null check (purpose = 'marketing_email'),
  decision text not null check (decision in ('granted', 'withdrawn', 'not_granted')),
  text_version text not null check (char_length(text_version) between 2 and 80),
  source text not null check (char_length(source) between 2 and 80),
  recorded_at timestamptz not null default now()
);

create index if not exists consent_history_user_purpose_idx
  on public.consent_history (user_id, purpose, recorded_at desc);

alter table public.consent_history enable row level security;

-- El historial lo escribe únicamente el trigger con privilegios elevados.
-- Una cuenta autenticada puede leer sus propias filas mediante RLS, pero no
-- reconstruir, modificar ni borrar evidencias de consentimiento.
revoke all on public.consent_history from anon, authenticated;

create policy "Users can read own consent history"
  on public.consent_history for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Admins can read consent history"
  on public.consent_history for select to authenticated
  using ((select public.is_tenlo_admin()));

grant select on public.consent_history to authenticated;

-- La portabilidad de cuenta incluye las búsquedas asociadas a esa cuenta sin
-- abrir el histórico de otras personas.
create policy "Users can read own search history"
  on public.search_events for select to authenticated
  using ((select auth.uid()) = user_id);
grant select on public.search_events to authenticated;

create or replace function public.record_marketing_consent_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_decision text;
  next_source text;
begin
  if tg_op = 'UPDATE' then
    if old.marketing_consent is not distinct from new.marketing_consent then
      return new;
    end if;
    next_decision := case when new.marketing_consent then 'granted' else 'withdrawn' end;
  else
    next_decision := case when new.marketing_consent then 'granted' else 'not_granted' end;
  end if;
  next_source := coalesce(nullif(new.marketing_consent_source, ''), 'registration_or_default');

  insert into public.consent_history (
    user_id,
    purpose,
    decision,
    text_version,
    source,
    recorded_at
  ) values (
    new.id,
    'marketing_email',
    next_decision,
    'marketing-email-v1',
    next_source,
    case
      when next_decision = 'granted' then coalesce(new.marketing_consent_at, now())
      when next_decision = 'withdrawn' then coalesce(new.marketing_consent_withdrawn_at, now())
      else now()
    end
  );

  return new;
end;
$$;

revoke all on function public.record_marketing_consent_change() from public;

drop trigger if exists record_profile_marketing_consent on public.profiles;
create trigger record_profile_marketing_consent
  after insert or update of marketing_consent on public.profiles
  for each row execute function public.record_marketing_consent_change();

comment on table public.consent_history is
  'Historial de la preferencia de marketing por finalidad, version del texto, origen y fecha; sin identificadores de navegacion.';
