-- Evita reevaluar auth.uid() para cada fila. La semántica y los roles de las
-- políticas no cambian; solo se convierte la llamada en un init plan estable.

alter policy "Users can read own profile" on public.profiles
  using ((select auth.uid()) = id);
alter policy "Users can update own profile" on public.profiles
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
alter policy "Users can propose centers" on public.centers
  with check ((select auth.uid()) = created_by);
alter policy "Users can manage own favorites" on public.favorites
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
alter policy "Authenticated users can insert contact events" on public.contact_events
  with check ((select auth.uid()) = user_id or user_id is null);
alter policy "Users can reserve own username" on public.profile_usernames
  with check ((select auth.uid()) = profile_id);
alter policy "Users can update own username" on public.profile_usernames
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);
alter policy "Users can delete own username" on public.profile_usernames
  using ((select auth.uid()) = profile_id);
alter policy "Users can create claim requests" on public.claim_requests
  with check ((select auth.uid()) = user_id);
alter policy "Users can read own claim requests" on public.claim_requests
  using ((select auth.uid()) = user_id);
alter policy "Users can read own feedback requests" on public.feedback_requests
  using ((select auth.uid()) = user_id);
alter policy "Anyone can record privacy-safe search events" on public.search_events
  with check (user_id is null or (select auth.uid()) = user_id);
alter policy "Families can create connection requests" on public.connection_requests
  with check ((select auth.uid()) = family_id);
alter policy "Families can read own connection requests" on public.connection_requests
  using ((select auth.uid()) = family_id);
alter policy "Anyone can create feedback requests" on public.feedback_requests
  with check (
    (user_id is null or (select auth.uid()) = user_id)
    and char_length(message) between 10 and 5000
    and (context is null or char_length(context) between 1 and 80)
    and (item_id is null or char_length(item_id) <= 140)
    and (name is null or char_length(name) <= 120)
    and (
      email is null
      or (
        char_length(email) between 5 and 180
        and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
      )
    )
    and status = 'pending_review'::public.moderation_status
  );
