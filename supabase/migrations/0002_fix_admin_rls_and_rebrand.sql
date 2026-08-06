-- =====================================================================
-- MIGRATION 0002 — Fix admin RLS recursion + rebrand to Night's Watch
-- Run this AFTER 0001_init_schema.sql in the Supabase SQL Editor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. FIX: infinite recursion in user_profiles RLS
--
-- The original "user_profiles_admin_select" policy queried
-- public.user_profiles from *within its own policy* to check the
-- caller's role. Postgres has to re-apply RLS to that inner query too,
-- which re-triggers the same policy forever — Postgres detects this and
-- throws "infinite recursion detected in policy for relation
-- user_profiles". In practice this meant any browser-side (anon/auth key)
-- read of a user's role silently failed, so the app always fell back to
-- role = "user" — which is why the Admin link/page never appeared even
-- for a real admin account.
--
-- The fix: a SECURITY DEFINER helper function. Because it's owned by the
-- migration-running role (which has BYPASSRLS in Supabase), the query
-- inside the function does not re-trigger RLS on user_profiles, breaking
-- the recursive loop.
-- ---------------------------------------------------------------------

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.user_profiles
    where id = uid and role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to anon, authenticated;

-- Replace the recursive policy with one that calls the helper instead.
drop policy if exists "user_profiles_admin_select" on public.user_profiles;
create policy "user_profiles_admin_select" on public.user_profiles
  for select using (public.is_admin(auth.uid()));

-- Also let admins update other users' roles from the client if ever
-- needed (the app itself uses the service role for this, but this keeps
-- the table's policies internally consistent and future-proof).
drop policy if exists "user_profiles_admin_update" on public.user_profiles;
create policy "user_profiles_admin_update" on public.user_profiles
  for update using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------
-- 2. Swap every other admin-write policy over to the same helper.
-- These weren't recursive (different tables), but they ran the same
-- "select ... from user_profiles" subquery, which was itself subject to
-- user_profiles' own (broken) RLS — so they were silently affected too.
-- Using is_admin() everywhere is both the fix and the best practice.
-- ---------------------------------------------------------------------

drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write" on public.settings for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "members_admin_write" on public.members;
create policy "members_admin_write" on public.members for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "announcements_admin_write" on public.announcements;
create policy "announcements_admin_write" on public.announcements for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "matches_admin_write" on public.matches;
create policy "matches_admin_write" on public.matches for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "events_admin_write" on public.events;
create policy "events_admin_write" on public.events for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "match_reg_select_admin" on public.match_registrations;
create policy "match_reg_select_admin" on public.match_registrations for select
  using (public.is_admin(auth.uid()));

drop policy if exists "match_reg_delete_admin" on public.match_registrations;
create policy "match_reg_delete_admin" on public.match_registrations for delete
  using (public.is_admin(auth.uid()));

drop policy if exists "event_reg_select_admin" on public.event_registrations;
create policy "event_reg_select_admin" on public.event_registrations for select
  using (public.is_admin(auth.uid()));

drop policy if exists "event_reg_delete_admin" on public.event_registrations;
create policy "event_reg_delete_admin" on public.event_registrations for delete
  using (public.is_admin(auth.uid()));

drop policy if exists "applications_admin_all" on public.applications;
create policy "applications_admin_all" on public.applications for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------
-- 3. Rebrand seed data to Night's Watch.
-- Only touches the singleton settings row's branding fields — leaves
-- everything else (matches, events, applications, members) untouched.
-- ---------------------------------------------------------------------

update public.settings
set
  clan_name = 'Night''s Watch',
  clan_description = 'Night''s Watch is a competitive Blood Strike clan. We hold the Wall against every squad that thinks they can take our diamonds. Discipline, loyalty, and clean kills — that is the oath.',
  clan_requirements = coalesce(nullif(clan_requirements, ''), E'- Active and communicative on WhatsApp\n- Willingness to learn and attend trainings\n- Respectful attitude toward teammates and opponents\n- No history of cheating or toxicity'),
  updated_at = now()
where id = 'singleton';

-- ---------------------------------------------------------------------
-- 4. NOTE — bootstrapping your first admin
--
-- This app has no "self-service" way to become the first admin (by
-- design — anyone able to grant admin from inside the app would be a
-- security hole). Sign up normally at /auth/sign-up, then run:
--
--   update public.user_profiles set role = 'admin' where email = 'YOUR@EMAIL.COM';
--
-- After that, use the in-app Admin → Access page to promote/demote any
-- further admins without touching SQL again.
-- ---------------------------------------------------------------------
