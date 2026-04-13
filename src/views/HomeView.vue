<script setup>
import { RouterLink } from "vue-router";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Megaphone,
} from "lucide-vue-next";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Akses terstruktur",
    description:
      "Siswa masuk dengan NISN, admin dengan username, tetap aman di belakang layar lewat Supabase.",
  },
  {
    icon: BarChart3,
    title: "Pantau progres",
    description:
      "Status pengaduan bisa dipantau dari pending sampai done secara transparan.",
  },
  {
    icon: Megaphone,
    title: "Feedback admin",
    description:
      "Admin dapat memberi tanggapan langsung agar tindak lanjut lebih cepat.",
  },
];

const stats = [
  {
    value: "3",
    label: "alur utama",
    detail: "login, pengaduan, tindak lanjut",
  },
  { value: "2", label: "peran pengguna", detail: "siswa dan admin" },
  {
    value: "1",
    label: "sumber data",
    detail: "Supabase Auth, DB, dan Storage",
  },
];
</script>

<template>
  <main class="overflow-hidden bg-slate-950 text-slate-100">
    <section class="relative isolate min-h-screen">
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.18),transparent_30%)]"
      ></div>
      <div
        class="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl"
      ></div>

      <div
        class="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8"
      >
        <header
          class="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur"
        >
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80"
            >
              Aplikasi Pengaduan Sarana Sekolah
            </p>
            <h1 class="mt-1 text-xl font-bold text-white sm:text-2xl">
              Sarana sekolah yang lebih cepat ditangani
            </h1>
          </div>
          <div class="flex flex-wrap gap-3">
            <RouterLink
              to="/login"
              class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Masuk
              <ArrowRight class="h-4 w-4" />
            </RouterLink>
            <RouterLink
              to="/register"
              class="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Daftar Siswa
            </RouterLink>
          </div>
        </header>

        <div
          class="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16"
        >
          <section class="space-y-8">
            <div
              class="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100"
            >
              <Sparkles class="h-4 w-4" />
              Alur pelaporan cepat untuk siswa dan admin
            </div>

            <div class="space-y-5">
              <h2
                class="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                Laporkan fasilitas bermasalah, pantau perbaikan, dan jaga
                sekolah tetap nyaman.
              </h2>
              <p
                class="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
              >
                Platform ini membantu siswa mengirim pengaduan sarana sekolah
                secara terpusat, sementara admin bisa memproses laporan,
                mengubah status, dan memberikan feedback tanpa alur yang
                berbelit.
              </p>
            </div>

            <div class="flex flex-wrap gap-3">
              <RouterLink
                to="/register"
                class="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Mulai dari NISN
                <ArrowRight class="h-4 w-4" />
              </RouterLink>
              <RouterLink
                to="/login"
                class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Login admin / siswa
              </RouterLink>
            </div>

            <dl class="grid gap-4 sm:grid-cols-3">
              <div
                v-for="item in stats"
                :key="item.label"
                class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <dt class="text-sm text-slate-300">{{ item.label }}</dt>
                <dd class="mt-2 text-3xl font-black text-white">
                  {{ item.value }}
                </dd>
                <p class="mt-1 text-sm text-slate-400">{{ item.detail }}</p>
              </div>
            </dl>
          </section>

          <section
            class="grid gap-4 rounded-4xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur md:p-7"
          >
            <article
              class="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
            >
              <p
                class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/80"
              >
                Kenapa penting
              </p>
              <h3 class="mt-2 text-2xl font-bold text-white">
                Satu pintu untuk keluhan sarana
              </h3>
              <p class="mt-3 text-sm leading-7 text-slate-300">
                Laporan terpusat membuat tindak lanjut lebih mudah dilacak,
                meminimalkan pesan tercecer, dan memberi transparansi kepada
                siswa.
              </p>
            </article>

            <div class="grid gap-4 md:grid-cols-2">
              <article
                v-for="item in highlights"
                :key="item.title"
                class="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
              >
                <component :is="item.icon" class="h-5 w-5 text-cyan-300" />
                <h4 class="mt-3 text-base font-semibold text-white">
                  {{ item.title }}
                </h4>
                <p class="mt-2 text-sm leading-6 text-slate-300">
                  {{ item.description }}
                </p>
              </article>
            </div>
          </section>
        </div>

        <section
          class="grid gap-4 border-t border-white/10 py-8 text-sm text-slate-300 md:grid-cols-3"
        >
          <p>
            <span class="font-semibold text-white">Siswa:</span> kirim aduan
            dengan NISN sebagai identitas login.
          </p>
          <p>
            <span class="font-semibold text-white">Admin:</span> login dengan
            username untuk memproses laporan.
          </p>
          <p>
            <span class="font-semibold text-white">Transparan:</span> status dan
            feedback dapat dipantau dari dashboard.
          </p>
        </section>
      </div>
    </section>
  </main>
</template>
