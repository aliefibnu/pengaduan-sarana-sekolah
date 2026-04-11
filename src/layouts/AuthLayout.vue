<template>
  <main class="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
    <div
      class="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl backdrop-blur lg:p-10"
    >
      <div class="grid gap-6 lg:grid-cols-2">
        <section
          class="rounded-2xl bg-linear-to-br from-blue-600 to-cyan-400 p-6 text-white"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.2em]">
            Aplikasi Pengaduan Sarana
          </p>
          <h1 class="mt-3 text-3xl font-black leading-tight">
            Sekolah Cepat Tanggap, Fasilitas Lebih Baik
          </h1>
          <p class="mt-4 text-sm text-blue-100">
            Kirim aspirasi, pantau progres perbaikan, dan pastikan setiap
            keluhan ditindaklanjuti dengan transparan.
          </p>
        </section>

        <section class="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <RouterView />
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
import { RouterView } from "vue-router";
</script>
