-- Acceso administrativo mínimo mediante la sesión autenticada y RLS.

create or replace function public.is_tenlo_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'tenlo_admin'
      and status = 'approved'
  );
$$;

revoke all on function public.is_tenlo_admin() from public;
grant execute on function public.is_tenlo_admin() to authenticated;

create policy "Admins can review claim requests"
  on public.claim_requests for select to authenticated
  using (public.is_tenlo_admin());

create policy "Admins can review connection requests"
  on public.connection_requests for select to authenticated
  using (public.is_tenlo_admin());

create policy "Admins can review submissions"
  on public.submissions for select to authenticated
  using (public.is_tenlo_admin());

create policy "Admins can review feedback requests"
  on public.feedback_requests for select to authenticated
  using (public.is_tenlo_admin());

grant select on public.claim_requests, public.connection_requests, public.submissions, public.feedback_requests to authenticated;
