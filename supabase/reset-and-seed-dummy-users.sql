-- Reset data aplikasi + seed data presentasi yang realistis
--
-- Kebutuhan yang dipenuhi:
-- 1) Tidak menghapus data auth.users lama.
-- 2) Mengosongkan dan isi ulang tabel aplikasi: public.users, public.categories,
--    public.complaints, public.feedbacks.
-- 3) Membuat akun baru dengan email format NISN 8 digit: <nisn>@skaju.smk
-- 4) Password default akun baru: user1234
-- 5) Role disimpan di user_metadata.role (raw_user_meta_data->>'role').
-- 6) Tidak menyentuh bucket maupun storage.objects.
--
-- Jalankan di Supabase SQL Editor.

create extension if not exists pgcrypto;

begin;

-- Kosongkan seluruh data tabel aplikasi (tanpa menyentuh auth.users / storage)
truncate table public.feedbacks, public.complaints, public.categories, public.users restart identity cascade;

do $$
declare
  v_now timestamptz := now();
  v_password text := 'user1234';

  v_admin_id uuid;
  v_admin_nisn text;
  v_admin_email text;

  v_siswa_id uuid;
  v_siswa_nisn text;
  v_siswa_email text;

  v_siswa_ids uuid[] := '{}';
  v_siswa_names text[] := array[
    'Raka Pratama',
    'Naufal Hidayat',
    'Dimas Saputra',
    'Aulia Ramadhan',
    'M. Farhan Rizky',
    'Rizky Aditya',
    'Bagas Maulana',
    'Fikri Maulana',
    'Nabila Putri',
    'Siti Aisyah',
    'Nadya Maharani',
    'Putri Anindita'
  ];

  v_name text;
  v_idx int := 0;
begin
  -- ADMIN (akun baru)
  loop
    v_admin_nisn := lpad((floor(random() * 100000000))::int::text, 8, '0');
    v_admin_email := v_admin_nisn || '@skaju.smk';
    exit when not exists (select 1 from auth.users where email = v_admin_email);
  end loop;

  v_admin_id := gen_random_uuid();

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    v_admin_id,
    'authenticated',
    'authenticated',
    v_admin_email,
    crypt(v_password, gen_salt('bf')),
    v_now,
    v_now,
    null,
    null,
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('name', 'Aditya Nugraha', 'role', 'admin', 'nisn', v_admin_nisn),
    v_now,
    v_now,
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(),
    v_admin_id,
    jsonb_build_object('sub', v_admin_id::text, 'email', v_admin_email),
    'email',
    v_admin_email,
    null,
    v_now,
    v_now
  );

  insert into public.users (id, name, role, created_at)
  values (v_admin_id, 'Aditya Nugraha', 'admin', v_now);

  -- SISWA (akun baru, nama realistis)
  foreach v_name in array v_siswa_names loop
    v_idx := v_idx + 1;

    loop
      v_siswa_nisn := lpad((floor(random() * 100000000))::int::text, 8, '0');
      v_siswa_email := v_siswa_nisn || '@skaju.smk';
      exit when not exists (select 1 from auth.users where email = v_siswa_email);
    end loop;

    v_siswa_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_sent_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      v_siswa_id,
      'authenticated',
      'authenticated',
      v_siswa_email,
      crypt(v_password, gen_salt('bf')),
      v_now,
      v_now,
      null,
      null,
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object('name', v_name, 'role', 'siswa', 'nisn', v_siswa_nisn),
      v_now,
      v_now,
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      gen_random_uuid(),
      v_siswa_id,
      jsonb_build_object('sub', v_siswa_id::text, 'email', v_siswa_email),
      'email',
      v_siswa_email,
      null,
      v_now,
      v_now
    );

    insert into public.users (id, name, role, created_at)
    values (v_siswa_id, v_name, 'siswa', v_now);

    v_siswa_ids := array_append(v_siswa_ids, v_siswa_id);
  end loop;

  -- Kategori realistis
  insert into public.categories (name, created_by, created_at)
  values
    ('Toilet', v_admin_id, v_now - interval '20 days'),
    ('Ruang Kelas', v_admin_id, v_now - interval '20 days'),
    ('Laboratorium', v_admin_id, v_now - interval '20 days'),
    ('Perpustakaan', v_admin_id, v_now - interval '19 days'),
    ('Lapangan', v_admin_id, v_now - interval '18 days'),
    ('Listrik', v_admin_id, v_now - interval '18 days'),
    ('Air Bersih', v_admin_id, v_now - interval '17 days'),
    ('Kebersihan', v_admin_id, v_now - interval '17 days');

  -- Aduan realistis
  insert into public.complaints (
    user_id,
    title,
    description,
    category,
    image_path,
    status,
    first_response_at,
    completed_at,
    created_at
  )
  select
    v_siswa_ids[((g.n - 1) % array_length(v_siswa_ids, 1)) + 1] as user_id,
    case (g.n % 12)
      when 0 then 'Lampu Koridor Lantai 2 Mati'
      when 1 then 'Kran Wastafel Toilet Putra Bocor'
      when 2 then 'Proyektor Kelas XI RPL 1 Tidak Menyala'
      when 3 then 'Pintu Toilet Tidak Bisa Dikunci'
      when 4 then 'AC Laboratorium Komputer Kurang Dingin'
      when 5 then 'Kursi Siswa Rusak di Kelas XII TKJ'
      when 6 then 'Atap Koridor Bocor Saat Hujan'
      when 7 then 'Stop Kontak Perpustakaan Longgar'
      when 8 then 'Rumput Lapangan Perlu Perbaikan'
      when 9 then 'Tempat Sampah Belakang Gedung Penuh'
      when 10 then 'Kipas Angin Kelas XI Akuntansi Mati'
      else 'Saluran Air Depan Kantin Tersumbat'
    end as title,
    case (g.n % 12)
      when 0 then 'Sejak kemarin sore lampu koridor lantai 2 padam total sehingga area menjadi gelap saat jam pulang.'
      when 1 then 'Air terus menetes dari kran wastafel toilet putra dan menggenangi area sekitar wastafel.'
      when 2 then 'Proyektor di kelas XI RPL 1 tidak menampilkan gambar meskipun kabel HDMI sudah terpasang dengan benar.'
      when 3 then 'Daun pintu toilet sebelah timur tidak dapat dikunci dari dalam sehingga mengganggu privasi.'
      when 4 then 'Suhu di laboratorium komputer cukup panas walaupun AC menyala dari pagi.'
      when 5 then 'Beberapa kursi di kelas XII TKJ kaki kursinya goyang dan berpotensi membahayakan siswa.'
      when 6 then 'Air menetes dari sambungan atap koridor saat hujan deras dan membuat lantai licin.'
      when 7 then 'Stop kontak dekat meja baca perpustakaan longgar sehingga colokan sering lepas.'
      when 8 then 'Permukaan rumput sintetis lapangan di sisi utara terangkat dan berisiko membuat siswa tersandung.'
      when 9 then 'Tempat sampah belakang gedung sudah penuh sejak dua hari lalu dan menimbulkan bau tidak sedap.'
      when 10 then 'Kipas angin di sudut belakang kelas XI Akuntansi tidak berputar saat dinyalakan.'
      else 'Aliran air di selokan depan kantin lambat karena diduga tersumbat sampah plastik.'
    end as description,
    case (g.n % 8)
      when 0 then 'Listrik'
      when 1 then 'Toilet'
      when 2 then 'Laboratorium'
      when 3 then 'Toilet'
      when 4 then 'Laboratorium'
      when 5 then 'Ruang Kelas'
      when 6 then 'Ruang Kelas'
      else 'Kebersihan'
    end as category,
    case (g.n % 3)
      when 0 then 'seed/lab-komputer.svg'
      when 1 then 'seed/toilet-putri.svg'
      else 'seed/plafon-kelas.svg'
    end as image_path,
    case (g.n % 3)
      when 0 then 'done'
      when 1 then 'process'
      else 'pending'
    end as status,
    case
      when (g.n % 3) in (0, 1) then (v_now - ((g.n + 2) * interval '8 hours')) + interval '3 hours'
      else null
    end as first_response_at,
    case
      when (g.n % 3) = 0 then (v_now - ((g.n + 2) * interval '8 hours')) + interval '10 hours'
      else null
    end as completed_at,
    (v_now - ((g.n + 2) * interval '8 hours')) as created_at
  from generate_series(1, 30) as g(n);

  -- Feedback untuk aduan process + done
  insert into public.feedbacks (complaint_id, message, progress_percentage, created_at)
  select
    c.id,
    case
      when c.status = 'done' then
        'Perbaikan sudah diselesaikan oleh tim sarana. Mohon dicek kembali, dan laporkan jika kendala muncul lagi.'
      else
        'Laporan sudah diterima, tim sarana sedang melakukan penanganan bertahap di lokasi.'
    end as message,
    case
      when c.status = 'done' then 100
      else 55
    end as progress_percentage,
    coalesce(c.first_response_at, c.created_at + interval '3 hours') as created_at
  from public.complaints c
  where c.status in ('process', 'done');
end $$;

commit;

-- Verifikasi cepat
-- select role, count(*) from public.users group by role;
-- select status, count(*) from public.complaints group by status;
-- select count(*) as total_categories from public.categories;
-- select count(*) as total_feedbacks from public.feedbacks;
