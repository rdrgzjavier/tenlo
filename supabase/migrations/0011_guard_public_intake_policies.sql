-- Mantiene los formularios públicos, pero limita qué filas pueden insertarse.

alter policy "Anyone can join newsletter"
  on public.newsletter_subscribers
  with check (
    email = lower(email)
    and char_length(email) between 5 and 180
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    and source = 'home_newsletter'
  );

alter policy "Anyone can create feedback requests"
  on public.feedback_requests
  with check (
    (user_id is null or auth.uid() = user_id)
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
    and status = 'pending_review'
  );
