-- =====================================================================
-- BLOOD STRIKE CLAN HUB — DATABASE SCHEMA (Supabase Postgres)
-- Run this in your Supabase SQL Editor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. USER PROFILES & ADMIN ROLE
-- ---------------------------------------------------------------------
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "user_profiles_select_self" on public.user_profiles;
create policy "user_profiles_select_self" on public.user_profiles
  for select using (auth.uid() = id);

drop policy if exists "user_profiles_admin_select" on public.user_profiles;
create policy "user_profiles_admin_select" on public.user_profiles
  for select using (
    exists (
      select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Trigger to auto-create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2. SETTINGS
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  id text primary key default 'singleton',
  clan_name text not null default 'Blood Strike Clan',
  clan_logo text,
  clan_description text not null default 'A competitive Blood Strike clan.',
  recruitment_status text not null default 'open' check (recruitment_status in ('open','closed','limited')),
  clan_requirements text not null default '',
  whatsapp_contact text not null default '',
  whatsapp_group text,
  social_links jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

drop policy if exists "settings_select_public" on public.settings;
create policy "settings_select_public" on public.settings for select using (true);

drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write" on public.settings for all using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

insert into public.settings (id, clan_name, clan_description, whatsapp_contact, social_links)
values (
  'singleton',
  'Crimson Strike',
  'Crimson Strike is a competitive Blood Strike clan focused on squad dominance, tournament wins, and growing a tight community of skilled players.',
  'https://wa.me/1234567890',
  '{"Instagram":"","Twitter":""}'::jsonb
) on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 3. MEMBERS
-- ---------------------------------------------------------------------
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  username text not null,
  blood_strike_uid text not null,
  role text not null default 'member' check (role in ('owner','admin','moderator','member','trial')),
  avatar_url text,
  preferred_mode text not null default 'BR',
  join_date date not null default current_date,
  bio text,
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;

drop policy if exists "members_select_public" on public.members;
create policy "members_select_public" on public.members for select using (true);

drop policy if exists "members_admin_write" on public.members;
create policy "members_admin_write" on public.members for all using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

-- Seed some sample members
insert into public.members (username, blood_strike_uid, role, preferred_mode, join_date, bio) values
  ('Commander', 'BS100001', 'owner',    'BR Custom Room', current_date - interval '120 days', 'Founder and IGL.'),
  ('Shadow',    'BS100002', 'admin',    'Squad Fight',    current_date - interval '90 days',  'Sniper specialist.'),
  ('Blitz',     'BS100003', 'moderator','Team Deathmatch',current_date - interval '60 days',  'Rifler & coach.'),
  ('Viper',     'BS100004', 'member',   'BR Custom Room', current_date - interval '30 days',  'Assault main.'),
  ('Recruit01', 'BS100005', 'trial',    'Squad Fight',    current_date - interval '7 days',   'In trial period.')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- 4. ANNOUNCEMENTS
-- ---------------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  cover_image text,
  published_at timestamptz not null default now(),
  match_id uuid references public.matches on delete set null,
  event_id uuid references public.events on delete set null,
  external_link text,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

drop policy if exists "announcements_select_public" on public.announcements;
create policy "announcements_select_public" on public.announcements for select using (true);

drop policy if exists "announcements_admin_write" on public.announcements;
create policy "announcements_admin_write" on public.announcements for all using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

-- ---------------------------------------------------------------------
-- 5. MATCHES
-- ---------------------------------------------------------------------
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  game_mode text not null,
  match_date date not null,
  start_time text not null default '20:00',
  registration_deadline date not null,
  player_limit int not null default 20,
  rules text not null default '',
  prize text not null default '',
  status text not null default 'upcoming' check (status in ('registration_open','full','upcoming','completed','cancelled')),
  room_password text,
  room_id text,
  room_published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.matches enable row level security;

drop policy if exists "matches_select_public" on public.matches;
create policy "matches_select_public" on public.matches for select using (true);

drop policy if exists "matches_admin_write" on public.matches;
create policy "matches_admin_write" on public.matches for all using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

-- Seed matches
insert into public.matches (title, game_mode, match_date, start_time, registration_deadline, player_limit, rules, prize, status)
values
  ('Weekly Showdown #12', 'BR Custom Room',    current_date + interval '3 days',  '20:30', current_date + interval '2 days', 24, 'No cheaters. Room ID/PW published 10 min before.', '5,000 Diamonds', 'registration_open'),
  ('Squad Clash Cup',     'Squad Fight',       current_date + interval '7 days',  '19:00', current_date + interval '6 days', 32, '4-man squads only.', 'Top 3 get prizes',   'registration_open'),
  ('TDM Throwback',       'Team Deathmatch',   current_date + interval '1 day',   '22:00', current_date,                     16, 'Classic TDM rules.', 'Clan bragging rights','upcoming')
on conflict do nothing;

insert into public.announcements (title, description, published_at)
values (
  'Welcome to Crimson Strike Hub 🔥',
  'The new clan hub is live! Browse matches, sign up for events and apply to join the family. More updates coming soon.',
  now()
) on conflict do nothing;

-- ---------------------------------------------------------------------
-- 6. EVENTS
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  event_type text not null check (event_type in ('tournament','scrim','giveaway','training','clan_event')),
  event_date date not null,
  start_time text not null default '20:00',
  registration_deadline date not null,
  rules text not null default '',
  prize text not null default '',
  participant_limit int not null default 50,
  status text not null default 'upcoming' check (status in ('registration_open','full','upcoming','completed','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

drop policy if exists "events_select_public" on public.events;
create policy "events_select_public" on public.events for select using (true);

drop policy if exists "events_admin_write" on public.events;
create policy "events_admin_write" on public.events for all using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

insert into public.events (title, description, event_type, event_date, start_time, registration_deadline, participant_limit, prize, status)
values
  ('Summer Championship',       '3-day bracket tournament for all members and guests.',     'tournament', current_date + interval '14 days', '19:00', current_date + interval '10 days', 64, '20,000 Diamonds + skins', 'registration_open'),
  ('Weekly Scrim Night',        'Practice scrims against other top clans.',                'scrim',      current_date + interval '4 days',  '21:00', current_date + interval '3 days',  24, 'Experience only',         'registration_open'),
  ('Diamond Giveaway',          'Monthly giveaway for active members.',                     'giveaway',   current_date + interval '10 days', '20:00', current_date + interval '9 days',  100, '5,000 Diamonds x2',       'upcoming'),
  ('Aim & Movement Training',   'Coaching session for newer members.',                      'training',   current_date + interval '2 days',  '18:00', current_date + interval '1 day',   20, 'Free coaching',           'upcoming')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- 7. MATCH REGISTRATIONS
-- ---------------------------------------------------------------------
create table if not exists public.match_registrations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  bs_uid text not null,
  registered_at timestamptz not null default now(),
  unique (match_id, user_id)
);

alter table public.match_registrations enable row level security;

drop policy if exists "match_reg_select_own" on public.match_registrations;
create policy "match_reg_select_own" on public.match_registrations for select using (auth.uid() = user_id);

drop policy if exists "match_reg_select_admin" on public.match_registrations;
create policy "match_reg_select_admin" on public.match_registrations for select using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "match_reg_insert_own" on public.match_registrations;
create policy "match_reg_insert_own" on public.match_registrations
  for insert with check (auth.uid() = user_id);

drop policy if exists "match_reg_delete_admin" on public.match_registrations;
create policy "match_reg_delete_admin" on public.match_registrations
  for delete using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

-- ---------------------------------------------------------------------
-- 8. EVENT REGISTRATIONS
-- ---------------------------------------------------------------------
create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  registered_at timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table public.event_registrations enable row level security;

drop policy if exists "event_reg_select_own" on public.event_registrations;
create policy "event_reg_select_own" on public.event_registrations for select using (auth.uid() = user_id);

drop policy if exists "event_reg_select_admin" on public.event_registrations;
create policy "event_reg_select_admin" on public.event_registrations for select using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "event_reg_insert_own" on public.event_registrations;
create policy "event_reg_insert_own" on public.event_registrations
  for insert with check (auth.uid() = user_id);

drop policy if exists "event_reg_delete_admin" on public.event_registrations;
create policy "event_reg_delete_admin" on public.event_registrations
  for delete using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

-- ---------------------------------------------------------------------
-- 9. APPLICATIONS (Tryouts)
-- Phone numbers are stored but NEVER selected publicly.
-- Admin-only policy for the sensitive whatsapp_number field.
-- ---------------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  bs_username text not null,
  bs_uid text not null,
  preferred_mode text not null,
  current_rank text not null,
  previous_clan text,
  experience text not null,
  why_join text not null,
  whatsapp_number text not null,
  social_username text,
  gameplay_link text,
  status text not null default 'pending' check (status in ('pending','reviewing','tryout','accepted','rejected')),
  admin_note text,
  submitted_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null
);

alter table public.applications enable row level security;

drop policy if exists "applications_insert_anon" on public.applications;
create policy "applications_insert_anon" on public.applications for insert with check (true);

drop policy if exists "applications_admin_all" on public.applications;
create policy "applications_admin_all" on public.applications for all using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

-- Public/submitter can see their own application — but NOT the whatsapp_number
-- We enforce this at the application layer with a dedicated view/query.
create or replace view public.applications_public as
  select id, nickname, bs_username, bs_uid, preferred_mode, current_rank,
         previous_clan, experience, why_join, social_username, gameplay_link,
         status, submitted_at, user_id
  from public.applications;

grant select on public.applications_public to anon, authenticated;
