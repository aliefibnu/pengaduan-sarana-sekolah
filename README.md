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
  - Registrasi dan login
  - Buat pengaduan (judul, deskripsi, kategori, foto opsional)
  - Lihat status aduan (pending, process, done)
  - Lihat riwayat dan feedback admin
- Admin:
  - Dashboard ringkasan pengaduan
  - Kelola semua aduan
  - Filter berdasarkan tanggal, bulan, user, kategori
  - Update status aduan
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

3. Jalankan SQL skema dan seed:

- Buka Supabase SQL Editor
- Jalankan isi file `supabase/schema.sql`

4. Jalankan aplikasi:

```bash
npm run dev
```

## Catatan Auth & Role

- Role dibaca dari JWT metadata Supabase (`role: admin | siswa`).
- Saat register dari UI, role default adalah `siswa`.
- Untuk akun admin, set metadata role `admin` dari Supabase Dashboard.
- Jika admin mendapat data kosong saat fetch complaint, pastikan policy RLS membaca `user_metadata.role` atau `app_metadata.role` dan bukan claim `role` mentah.

## Build Produksi

```bash
npm run build
```

## Verifikasi Manual

1. Login siswa dan pastikan redirect masuk ke dashboard siswa.
2. Register siswa baru dan pastikan tidak muncul alur verifikasi email di UI.
3. Buat pengaduan dengan dan tanpa gambar, lalu cek status muncul di riwayat.
4. Login admin, cek tabel pengaduan, filter, search, pagination, dan export CSV.
5. Ubah status pengaduan dari pending ke process lalu ke done, pastikan konfirmasi tampil.
6. Coba turunkan status dari done dan pastikan ada konfirmasi ekstra.
7. Tambah feedback dari halaman detail admin, lalu pastikan timeline feedback ikut terbarui.
8. Hapus atau kosongkan env Supabase dan pastikan aplikasi menampilkan error konfigurasi yang jelas.

## Catatan Troubleshooting

- Jika login/registrasi gagal dengan error konfigurasi, cek ulang file `.env` dan restart dev server.
- Jika data admin kosong, pastikan akun Auth punya metadata role `admin` dan tabel `users` sudah terisi.
