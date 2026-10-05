-- Permite iniciar la reclamación sin cuenta. La identidad se verifica después
-- por email y la aprobación continúa siendo un proceso administrativo.

drop policy if exists "Anyone can start an unassigned claim request" on public.claim_requests;

create policy "Anyone can start an unassigned claim request"
  on public.claim_requests
  for insert
  to anon
  with check (user_id is null and status = 'pending_review');

grant insert on public.claim_requests to anon;
