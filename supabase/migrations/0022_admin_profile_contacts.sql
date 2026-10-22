-- Permite al único rol operativo aprobado consultar los datos de cuenta necesarios
-- para gestionar solicitudes, manteniendo el acceso bloqueado para el resto.

drop policy if exists "Admins can review profiles" on public.profiles;
create policy "Admins can review profiles"
  on public.profiles for select to authenticated
  using ((select public.is_tenlo_admin()));
