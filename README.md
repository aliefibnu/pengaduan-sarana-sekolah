# Aplikasi Pengaduan Sarana Sekolah

MVP aplikasi pengaduan fasilitas sekolah berbasis Vue 3 + Pinia + Supabase.

## Stack

- Vue 3 + Vite (SPA)
- Vue Router
- Pinia
- Supabase (Auth + PostgreSQL + Storage)
- TailwindCSS
- Notiflix
- lucide-vue-next

## Fitur Utama

- Siswa:
  - Login menggunakan NISN
  - Buat pengaduan (judul, deskripsi, kategori, foto opsional)
  - Lihat status aduan (pending, process, done)
  - Lihat riwayat dan feedback admin
- Admin:
  - Dashboard ringkasan pengaduan
  - Kelola semua aduan
  - CRUD user siswa (buat, ubah nama, hapus akun)
  - Filter berdasarkan tanggal, bulan, user, kategori
  - Kirim feedback

## Setup Lokal

1. Install dependency:

```bash
npm install
```

2. Buat file `.env` dari `.env.example` lalu isi nilai Supabase:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

3. Jalankan SQL skema dan migrasi:

- Buka Supabase SQL Editor
- Jalankan isi file `supabase/schema.sql`
- Jalankan isi file `supabase/disable-public-register-and-admin-user-crud.sql`

4. (Opsional) Jalankan seeder sample + gambar:

- Upload file gambar dari folder `supabase/seeds/images` ke bucket `complaint-images` dengan path:
  - `seed/lab-komputer.svg`
  - `seed/plafon-kelas.svg`
  - `seed/toilet-putri.svg`
- Jalankan file `supabase/seed-with-images.sql` di Supabase SQL Editor

5. Deploy Edge Function untuk CRUD user admin:

```bash
supabase functions deploy admin-user-crud
```

6. Jalankan aplikasi:

```bash
npm run dev
```

## Catatan Auth & Role

- Role dibaca dari JWT metadata Supabase (`role: admin | siswa`).
- Register publik dari UI dinonaktifkan (login-only).
- Saat login, siswa memakai NISN dan admin memakai username.
- Di Supabase, aplikasi tetap memakai email alias dengan format `{identitas}@skaju.smk`.
- Akun siswa dibuat oleh admin dari halaman Manajemen User.
- Untuk akun admin, set metadata role `admin` dari Supabase Dashboard atau backend yang aman.
- Jika admin mendapat data kosong saat fetch complaint, pastikan policy RLS membaca `user_metadata.role` atau `app_metadata.role` dan bukan claim `role` mentah.

## Build Produksi

```bash
npm run build
```

## Verifikasi Manual

1. Login siswa dan pastikan redirect masuk ke dashboard siswa.
2. Pastikan tidak ada tombol/route register publik.
3. Buat pengaduan dengan dan tanpa gambar, lalu cek status muncul di riwayat.
4. Login admin, cek tabel pengaduan, filter, search, pagination, dan export CSV.
5. Masuk ke halaman Manajemen User admin, buat akun siswa baru, lalu uji login akun tersebut.
6. Ubah nama siswa dari halaman Manajemen User, lalu pastikan tersimpan.
7. Hapus akun siswa dari halaman Manajemen User, lalu pastikan akun tidak bisa login lagi.
8. Tambah feedback dari halaman detail admin, lalu pastikan timeline feedback ikut terbarui.
9. Hapus atau kosongkan env Supabase dan pastikan aplikasi menampilkan error konfigurasi yang jelas.

## Catatan Troubleshooting

- Jika login atau invoke edge function gagal dengan error konfigurasi, cek ulang file `.env` dan restart dev server.
- Jika data admin kosong, pastikan akun Auth punya metadata role `admin` dan tabel `users` sudah terisi.
