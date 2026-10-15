-- Actualización restringida de la cola administrativa y trazabilidad del cambio.

create table if not exists public.admin_queue_audit (
  id uuid primary key default gen_random_uuid(),
  queue text not null check (queue in ('claim', 'connection', 'submission', 'feedback')),
  record_id uuid not null,
  previous_status text not null,
  new_status text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index if not exists admin_queue_audit_record_idx
  on public.admin_queue_audit (queue, record_id, changed_at desc);
create index if not exists admin_queue_audit_changed_by_idx
  on public.admin_queue_audit (changed_by);

alter table public.admin_queue_audit enable row level security;

create policy "Admins can read queue audit"
  on public.admin_queue_audit for select to authenticated
  using ((select public.is_tenlo_admin()));

create policy "Admins can update claim requests"
  on public.claim_requests for update to authenticated
  using ((select public.is_tenlo_admin())) with check ((select public.is_tenlo_admin()));

create policy "Admins can update connection requests"
  on public.connection_requests for update to authenticated
  using ((select public.is_tenlo_admin())) with check ((select public.is_tenlo_admin()));

create policy "Admins can update submissions"
  on public.submissions for update to authenticated
  using ((select public.is_tenlo_admin())) with check ((select public.is_tenlo_admin()));

create policy "Admins can update feedback requests"
  on public.feedback_requests for update to authenticated
  using ((select public.is_tenlo_admin())) with check ((select public.is_tenlo_admin()));

grant select on public.admin_queue_audit to authenticated;
grant update (status) on public.claim_requests, public.connection_requests, public.submissions, public.feedback_requests to authenticated;

create or replace function public.audit_admin_queue_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status::text is distinct from new.status::text then
    insert into public.admin_queue_audit (queue, record_id, previous_status, new_status, changed_by)
    values (tg_argv[0], new.id, old.status::text, new.status::text, auth.uid());
  end if;
  return new;
end;
$$;

revoke all on function public.audit_admin_queue_status() from public;

create trigger set_claim_requests_updated_at before update on public.claim_requests
  for each row execute function public.set_updated_at();
create trigger set_feedback_requests_updated_at before update on public.feedback_requests
  for each row execute function public.set_updated_at();

create trigger audit_claim_request_status after update of status on public.claim_requests
  for each row execute function public.audit_admin_queue_status('claim');
create trigger audit_connection_request_status after update of status on public.connection_requests
  for each row execute function public.audit_admin_queue_status('connection');
create trigger audit_submission_status after update of status on public.submissions
  for each row execute function public.audit_admin_queue_status('submission');
create trigger audit_feedback_request_status after update of status on public.feedback_requests
  for each row execute function public.audit_admin_queue_status('feedback');
