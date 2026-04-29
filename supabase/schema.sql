-- School Facility Complaint App schema
-- Jalankan di Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('admin', 'siswa')),
  created_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  image_path text,
  status text not null default 'pending' check (status in ('pending', 'process', 'done')),
  first_response_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  message text not null,
  progress_percentage integer check (progress_percentage >= 0 and progress_percentage <= 100),
  created_at timestamptz not null default now()
);

create index if not exists complaints_user_id_idx on public.complaints(user_id);
create index if not exists complaints_status_idx on public.complaints(status);
create index if not exists complaints_category_idx on public.complaints(category);
create index if not exists complaints_created_at_idx on public.complaints(created_at desc);
create index if not exists feedbacks_complaint_id_idx on public.feedbacks(complaint_id);
create unique index if not exists categories_name_unique_idx on public.categories(lower(name));
create index if not exists categories_created_at_idx on public.categories(created_at desc);

insert into storage.buckets (id, name, public)
values ('complaint-images', 'complaint-images', true)
on conflict (id) do nothing;

alter table public.users enable row level security;
alter table public.complaints enable row level security;
alter table public.feedbacks enable row level security;
alter table public.categories enable row level security;

create or replace function public.jwt_role()
returns text
language sql
stable
as $$
  select coalesce(
    auth.jwt() -> 'user_metadata' ->> 'role',
    auth.jwt() -> 'app_metadata' ->> 'role',
    'siswa'
  );
$$;

drop policy if exists users_select_self_or_admin on public.users;
create policy users_select_self_or_admin
on public.users
for select
using (auth.uid() = id or public.jwt_role() = 'admin');

drop policy if exists users_upsert_self_or_admin on public.users;
drop policy if exists users_insert_admin_only on public.users;
create policy users_insert_admin_only
on public.users
for insert
with check (public.jwt_role() = 'admin');

drop policy if exists users_update_self_or_admin on public.users;
create policy users_update_self_or_admin
on public.users
for update
using (auth.uid() = id or public.jwt_role() = 'admin')
with check (auth.uid() = id or public.jwt_role() = 'admin');

drop policy if exists complaints_select_own_or_admin on public.complaints;
drop policy if exists complaints_select_public on public.complaints;
create policy complaints_select_own_or_admin
on public.complaints
for select
using (auth.uid() = user_id or public.jwt_role() = 'admin');

create policy complaints_select_public
on public.complaints
for select
to public
using (true);

drop policy if exists complaints_insert_own_or_admin on public.complaints;
create policy complaints_insert_own_or_admin
on public.complaints
for insert
with check (auth.uid() = user_id or public.jwt_role() = 'admin');

drop policy if exists complaints_update_admin_only on public.complaints;
drop policy if exists complaints_update_admin_or_owner_pending_no_feedback on public.complaints;
create policy complaints_update_admin_or_owner_pending_no_feedback
on public.complaints
for update
using (
  public.jwt_role() = 'admin'
  or (
    auth.uid() = user_id
    and status = 'pending'
    and not exists (
      select 1
      from public.feedbacks f
      where f.complaint_id = complaints.id
    )
  )
)
with check (
  public.jwt_role() = 'admin'
  or (
    auth.uid() = user_id
    and status = 'pending'
    and not exists (
      select 1
      from public.feedbacks f
      where f.complaint_id = complaints.id
    )
  )
);

drop policy if exists complaints_delete_owner_pending_no_feedback on public.complaints;
create policy complaints_delete_owner_pending_no_feedback
on public.complaints
for delete
using (
  auth.uid() = user_id
  and status = 'pending'
  and not exists (
    select 1
    from public.feedbacks f
    where f.complaint_id = complaints.id
  )
);

drop policy if exists feedbacks_select_own_or_admin on public.feedbacks;
drop policy if exists feedbacks_select_public on public.feedbacks;
create policy feedbacks_select_own_or_admin
on public.feedbacks
for select
using (
  public.jwt_role() = 'admin'
  or exists (
    select 1
    from public.complaints c
    where c.id = feedbacks.complaint_id
      and c.user_id = auth.uid()
  )
);

create policy feedbacks_select_public
on public.feedbacks
for select
to public
using (true);

drop policy if exists feedbacks_insert_admin_only on public.feedbacks;
create policy feedbacks_insert_admin_only
on public.feedbacks
for insert
with check (public.jwt_role() = 'admin');

drop policy if exists categories_select_public on public.categories;
create policy categories_select_public
on public.categories
for select
to public
using (true);

drop policy if exists categories_insert_authenticated on public.categories;
create policy categories_insert_authenticated
on public.categories
for insert
to authenticated
with check (
  name is not null
  and char_length(trim(name)) > 0
  and created_by = auth.uid()
);

drop policy if exists categories_update_admin_only on public.categories;
create policy categories_update_admin_only
on public.categories
for update
to authenticated
using (public.jwt_role() = 'admin')
with check (public.jwt_role() = 'admin');

drop policy if exists categories_delete_admin_only on public.categories;
create policy categories_delete_admin_only
on public.categories
for delete
to authenticated
using (public.jwt_role() = 'admin');

-- Storage policies
drop policy if exists "Public read complaint images" on storage.objects;
create policy "Public read complaint images"
on storage.objects
for select
to public
using (bucket_id = 'complaint-images');

drop policy if exists "Authenticated upload complaint images" on storage.objects;
create policy "Authenticated upload complaint images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'complaint-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owner or admin delete complaint images" on storage.objects;
create policy "Owner or admin delete complaint images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'complaint-images'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.jwt_role() = 'admin'
  )
);

-- Seed data (jalankan setelah membuat akun di Supabase Auth)
-- 1) Buat akun: admin@sekolah.local dan siswa@sekolah.local via Supabase Auth.
-- 2) Set user metadata role: admin / siswa.
insert into public.users (id, name, role)
select id, 'Admin Sekolah', 'admin' from auth.users where email = 'admin@sekolah.local'
on conflict (id) do update set name = excluded.name, role = excluded.role;

insert into public.users (id, name, role)
select id, 'Siswa Contoh', 'siswa' from auth.users where email = 'siswa@sekolah.local'
on conflict (id) do update set name = excluded.name, role = excluded.role;

insert into public.categories (name)
values
  ('Kelas'),
  ('Toilet'),
  ('Laboratorium'),
  ('Perpustakaan'),
  ('Lapangan'),
  ('Lainnya')
on conflict do nothing;

with siswa as (
  select id from public.users where role = 'siswa' order by created_at asc limit 1
)
insert into public.complaints (user_id, title, description, category, status)
select siswa.id, 'Kran Toilet Bocor', 'Kran toilet lantai 2 bocor sejak 2 hari lalu.', 'Toilet', 'process'
from siswa
where not exists (select 1 from public.complaints limit 1);

insert into public.feedbacks (complaint_id, message)
select c.id, 'Tim sarana sudah melakukan pengecekan, perbaikan selesai besok.'
from public.complaints c
where not exists (select 1 from public.feedbacks limit 1)
limit 1;
