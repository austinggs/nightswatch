# Night's Watch — Clan Hub (MVP)

A modern, mobile-first clan hub web app for **Night's Watch**, a Blood Strike gaming clan.

## Stack
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS — neomorphic dark UI, palette drawn from the clan crest
- **Backend:** Supabase (Postgres + Auth + RLS)
- **Validation:** Zod

## Setup

### 1. Create a Supabase project
Create a new Supabase project at https://supabase.com and copy the Project URL + anon key.

### 2. Apply the database schema
Run these two files, **in order**, in the Supabase SQL Editor:

1. `supabase/migrations/0001_init_schema.sql` — creates:
   - `user_profiles` with admin/user roles
   - `settings` (clan-wide config)
   - `members`, `announcements`, `matches`, `events`
   - `applications` (tryouts — phone numbers are admin-only)
   - `match_registrations`, `event_registrations`
   - Row Level Security (RLS) policies for every table
   - Sample seed data
2. `supabase/migrations/0002_fix_admin_rls_and_rebrand.sql` — **required fix**, do not skip:
   - Fixes an infinite-recursion bug in the original `user_profiles` admin RLS policy
     (Postgres error: `infinite recursion detected in policy for relation "user_profiles"`).
     This bug silently broke every client-side admin check, which is why the Admin link/page
     could fail to appear even for a real admin account.
   - Rebrands the seed `settings` row to Night's Watch.

### 3. Create the first admin user
There's no self-service way to become the *first* admin (by design). Do this once:
1. Sign up normally via `/auth/sign-up` (this creates a `user`-role account).
2. In the Supabase SQL Editor, promote yourself:
   ```sql
   update public.user_profiles set role = 'admin' where email = 'YOUR@EMAIL.COM';
   ```
3. From then on, use **Admin → Access** inside the app to promote or demote any further admins —
   no more SQL needed.

> ⚠️ **Common mix-up:** the "Role" dropdown on the Admin → Members page (Owner / Admin / Moderator /
> Member / Trial) is just a **public roster rank** — it does not grant dashboard access. Site-admin
> access is only controlled from **Admin → Access**.

### 4. Configure environment
Copy `.env.local.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```
The service role key is required for admin pages/routes — if it's missing, `/admin` will now throw
a visible server error instead of silently redirecting you back to sign-in.

### 5. Run locally
```bash
npm install
npm run dev
```
Then visit http://localhost:3000.

## Feature Summary

### Public Pages (anyone)
- **Home** — Clan branding, recruitment status, next match/event, latest announcement, quick CTAs.
- **Matches** — Browse upcoming/recent matches with statuses (Open / Full / Upcoming / Completed / Cancelled).
- **Match detail** — Rules, prize, registration form, room ID/password (only visible to registered users when admin publishes them).
- **Events** — Tournaments / Scrims / Giveaways / Trainings / Clan Events with registration.
- **Event detail** — Description, rules, prize, registration form.
- **Tryouts** — Requirements, 4-step recruitment process, full application form.
- **Members** — Public roster (role badges, UIDs, join dates, preferred mode).
- **Announcements** — Clan-wide news.
- **Auth** — Sign in / Sign up (required for registrations and applications).

### WhatsApp CTAs
- "WhatsApp Admin" in the footer and on match/event detail pages.
- "Ask About Tryouts" on tryouts page and hero CTA.
- "Contact Match Host" / "Contact Event Host".
- "Contact on WhatsApp" direct buttons in admin application manager.
- Configurable from Admin → Settings (accepts numbers or wa.me links).

### Admin Dashboard (role=admin only)
- **Overview** — 4 stats cards + snapshots of pending apps, upcoming matches/events, announcements and roster.
- **Matches** — Create / Edit / Delete, mark upcoming/complete/cancel, view & remove registrations, manage room info + publish toggle.
- **Events** — Full CRUD, status changes, participant management.
- **Applications** — Filter by status (Pending/Reviewing/Tryout/Accepted/Rejected), view full details (WhatsApp number visible **only to admins**), update status + admin note, "Contact on WhatsApp", one-click "Add as Member" for accepted/tryout applications.
- **Members** — Table view, quick clan-rank dropdown, add/edit/remove.
- **Access** — Grant or revoke *site-admin* access (separate from clan rank). Protected so the last remaining admin can't be removed.
- **Announcements** — Post/edit/delete announcements with optional cover image, match/event link, external link.
- **Settings** — Clan name/logo/description, recruitment status, requirements, WhatsApp contact + group links, custom social links key/value.

### Security
- RLS on every table, using a non-recursive `is_admin()` helper function (see migration 0002).
- Applications.whatsapp_number is never exposed via public SELECT (only admins via service role / RLS policy).
- Duplicate registration prevention (unique (match, user) + (event, user)).
- Form validation on every mutation using Zod schemas.
- Admin routes protected server-side via `requireAdmin()` redirect.
- Site-admin promotion/demotion guards against removing the last remaining admin.
- Deletions require confirmation dialogs.

## Design
Colors are drawn from the physical Night's Watch crest (icy blue `#cddfe9`, near-black charcoal
`#090c11`, cold steel `#1e2b33`, weathered bronze `#655d51`), paired with Blood Strike's signature
red as the single "hot" accent for calls-to-action — torchlight against the frost. Components use a
neomorphic (soft-UI) treatment: embossed cards, inset form fields, and pressed button states.

## Build phases (as originally requested)
- **Phase 1 (Foundation):** ✅ App structure, db schema, auth, role-based admin guard, responsive layout/nav.
- **Phase 2 (Core content):** ✅ Home, Matches, Events, Announcements, Members.
- **Phase 3 (User actions):** ✅ Match+Event registration, clan application.
- **Phase 4 (Admin mgmt):** ✅ All 8 admin sections (Overview, Matches, Events, Applications, Members, Access, Announcements, Settings).

