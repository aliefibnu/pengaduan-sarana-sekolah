-- Seeder: sample data complaints with image paths
-- Jalankan setelah schema.sql dan disable-public-register-and-admin-user-crud.sql
--
-- Prasyarat:
-- 1) Sudah ada user role admin/siswa di public.users.
-- 2) Upload file gambar dari folder supabase/seeds/images ke bucket complaint-images
--    dengan path:
--    - seed/lab-komputer.svg
--    - seed/plafon-kelas.svg
--    - seed/toilet-putri.svg

-- Sinkronisasi ringan dari auth.users ke public.users (aman untuk dijalankan berulang)
insert into public.users (id, name, role)
select
  au.id,
  coalesce(au.raw_user_meta_data ->> 'name', split_part(au.email, '@', 1), 'Pengguna'),
  case
    when coalesce(au.raw_user_meta_data ->> 'role', au.raw_app_meta_data ->> 'role') = 'admin' then 'admin'
    else 'siswa'
  end as role
from auth.users au
on conflict (id) do update
set
  name = excluded.name,
  role = excluded.role;

-- Seed 30 complaint dengan gambar (idempotent)
with siswa_pool as (
  select
    array_agg(id order by created_at asc, id asc) as ids,
    count(*)::int as siswa_count
  from public.users
  where role = 'siswa'
),
seed_rows as (
  select
    (sp.ids[((g.n - 1) % sp.siswa_count) + 1])::uuid as user_id,
    case (g.n % 5)
      when 0 then 'Kursi Rusak di Ruang Kelas'
      when 1 then 'Lampu Mati di Koridor'
      when 2 then 'Proyektor Tidak Menyala'
      when 3 then 'Jendela Kelas Sulit Ditutup'
      else 'Keran Air Mengalir Terus'
    end::text as title,
    format(
      'Data seed #%s: laporan sarana membutuhkan tindak lanjut oleh tim fasilitas sekolah.',
      g.n
    )::text as description,
    case (g.n % 5)
      when 0 then 'Ruang Kelas'
      when 1 then 'Koridor'
      when 2 then 'Lab'
      when 3 then 'Ruang Kelas'
      else 'Toilet'
    end::text as category,
    case (g.n % 3)
      when 0 then 'done'
      when 1 then 'pending'
      else 'process'
    end::text as status,
    case (g.n % 3)
      when 0 then 'seed/toilet-putri.svg'
      when 1 then 'seed/lab-komputer.svg'
      else 'seed/plafon-kelas.svg'
    end::text as image_path,
    (now() - make_interval(hours => (31 - g.n) * 4))::timestamptz as created_at
  from generate_series(1, 30) as g(n)
  cross join siswa_pool sp
  where sp.siswa_count > 0
),
seed_rows_with_time as (
  select
    sr.user_id,
    sr.title,
    sr.description,
    sr.category,
    sr.status,
    sr.image_path,
    case
      when sr.status in ('process', 'done') then sr.created_at + interval '6 hour'
      else null
    end as first_response_at,
    case
      when sr.status = 'done' then sr.created_at + interval '18 hour'
      else null
    end as completed_at,
    sr.created_at
  from seed_rows sr
)
insert into public.complaints (
  user_id,
  title,
  description,
  category,
  status,
  image_path,
  first_response_at,
  completed_at,
  created_at
)
select
  srt.user_id,
  srt.title,
  srt.description,
  srt.category,
  srt.status,
  srt.image_path,
  srt.first_response_at,
  srt.completed_at,
  srt.created_at
from seed_rows_with_time srt
where not exists (
  select 1
  from public.complaints c
  where c.description = srt.description
);

-- Seed feedback untuk complaint seed yang berstatus process + done
insert into public.feedbacks (complaint_id, message, progress_percentage, created_at)
select
  c.id,
  case
    when c.status = 'done' then
      'Perbaikan selesai dan area sudah dibersihkan. Mohon dipantau kembali jika kendala muncul lagi.'
    else
      'Tim sarana sudah melakukan pengecekan awal dan proses perbaikan sedang berjalan.'
  end as message,
  case
    when c.status = 'done' then 100
    else 45
  end as progress_percentage,
  coalesce(c.first_response_at, c.created_at + interval '6 hour') as created_at
from public.complaints c
where c.description like 'Data seed #%: %'
  and c.status in ('process', 'done')
  and not exists (
    select 1
    from public.feedbacks f
    where f.complaint_id = c.id
  );
