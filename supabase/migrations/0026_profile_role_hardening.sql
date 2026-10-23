-- Impide que una cuenta se conceda por Data API rol administrativo,
-- aprobación o cualquier otro campo de moderación de su propio perfil.

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can create safe own profile"
  on public.profiles for insert to authenticated
  with check (
    (select auth.uid()) = id
    and role <> 'tenlo_admin'
    and (
      (role = 'family' and status = 'approved')
      or (role <> 'family' and status = 'pending_review')
    )
  );

revoke update on public.profiles from authenticated;
grant update (
  display_name,
  contact_email,
  phone,
  municipality,
  related_center_name,
  marketing_consent,
  marketing_consent_at,
  marketing_consent_source,
  marketing_consent_withdrawn_at,
  interests,
  public_name
) on public.profiles to authenticated;

comment on policy "Users can create safe own profile" on public.profiles is
  'Familias nacen aprobadas; proveedores quedan pendientes; ninguna cuenta puede autoconcederse tenlo_admin.';
