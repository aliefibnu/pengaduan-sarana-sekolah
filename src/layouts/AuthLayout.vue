<template>
  <main class="relative min-h-screen overflow-hidden px-4 py-10">
    <div
      class="absolute inset-0 bg-[url('/bg-login.webp')] bg-cover bg-center bg-fixed"
    />
    <div class="absolute inset-0 bg-black/40" />

    <div
      class="relative z-10 mx-auto max-w-5xl rounded-3xl border border-transparent bg-white/85 p-6 shadow-lg lg:p-10 backdrop-blur"
      style="min-height: calc(100vh - 80px)"
    >
      <div class="grid h-full gap-6 lg:grid-cols-2">
        <section class="flex flex-col justify-center gap-4 rounded-2xl p-6">
          <div class="flex items-center gap-3">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L15 8H9L12 2Z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-700"
              >
                Pengaduan Sarana
              </p>
              <h1 class="mt-1 text-3xl font-bold text-slate-900">
                Sekolah Cepat Tanggap
              </h1>
            </div>
          </div>

          <p class="mt-2 text-slate-700">
            Kirim aspirasi, pantau progres perbaikan, dan pastikan setiap
            keluhan ditindaklanjuti dengan transparan. Sistem ringan, aman, dan
            mudah diakses oleh siswa dan admin.
          </p>

          <ul class="mt-4 space-y-2">
            <li class="flex items-start gap-3">
              <span
                class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"
                >✓</span
              >
              <span class="text-slate-700"
                >Login cepat dengan NIS / username</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-700"
                >⚡</span
              >
              <span class="text-slate-700"
                >Pantau status pengaduan secara real-time</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-700"
                >🔒</span
              >
              <span class="text-slate-700"
                >Data tersimpan aman di Supabase</span
              >
            </li>
          </ul>

          <p class="mt-4 text-sm text-slate-600">
            Jika ada masalah login, hubungi admin sekolah untuk bantuan.
          </p>
          
          <!-- Moved: Informasi Login -->
          <div class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p class="text-sm text-blue-800">
              <strong>💡 Informasi Login:</strong>
            </p>
            <ul class="mt-2 space-y-1 text-xs text-blue-700">
              <li>• Siswa: Gunakan NIS 8 digit sebagai username</li>
              <li>• Admin: Gunakan username yang telah ditetapkan</li>
              <li>• Hubungi admin jika lupa password</li>
            </ul>
          </div>
        </section>

        <section
          class="flex items-center justify-center rounded-2xl bg-white p-6"
        >
          <div class="w-full max-w-md">
            <RouterView />
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
import { RouterView } from "vue-router";
</script>
