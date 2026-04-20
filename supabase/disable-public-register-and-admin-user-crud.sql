-- Migration: disable public self-register flow and support admin CRUD user
-- Jalankan di Supabase SQL Editor.

-- 1) users INSERT hanya admin (self register via client ditutup)
drop policy if exists users_upsert_self_or_admin on public.users;
drop policy if exists users_insert_admin_only on public.users;
create policy users_insert_admin_only
on public.users
for insert
with check (public.jwt_role() = 'admin');

-- 2) users UPDATE tetap untuk self/admin agar sinkron profile saat login tetap berjalan
drop policy if exists users_update_self_or_admin on public.users;
create policy users_update_self_or_admin
on public.users
for update
using (auth.uid() = id or public.jwt_role() = 'admin')
with check (auth.uid() = id or public.jwt_role() = 'admin');

-- 3) users SELECT tetap self/admin
drop policy if exists users_select_self_or_admin on public.users;
create policy users_select_self_or_admin
on public.users
for select
using (auth.uid() = id or public.jwt_role() = 'admin');
