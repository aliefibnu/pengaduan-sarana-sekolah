<script setup>
import { computed, onMounted, reactive } from "vue";
import { RouterLink } from "vue-router";
import Select from "primevue/select";
import {
  ArrowRight,
  ArrowUp,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Megaphone,
  FileText,
  Tag,
  Calendar,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-vue-next";
import { useCategoryStore } from "@/stores/categoryStore";
import { useComplaintStore } from "@/stores/complaintStore";
import { formatDate } from "@/utils/format";
import { showError } from "@/utils/notifications";

const complaintStore = useComplaintStore();
const categoryStore = useCategoryStore();

const localFilters = reactive({
  status: "",
  category: "",
});

const statusOptions = [
  { label: "Semua status", value: "" },
  { label: "Menunggu", value: "pending" },
  { label: "Diproses", value: "process" },
  { label: "Selesai", value: "done" },
];

const categoryOptions = computed(() => [
  { label: "Semua kategori", value: "" },
  ...categoryStore.options,
]);

function statusLabel(status) {
  if (status === "pending") return "Menunggu";
  if (status === "process") return "Diproses";
  if (status === "done") return "Selesai";
  return status;
}

function statusIcon(status) {
  if (status === "done") return CheckCircle2;
  if (status === "process") return Clock;
  return AlertCircle;
}

const heroStyle = {
  backgroundImage:
    'linear-gradient(135deg, rgba(9,9,11,0.68), rgba(9,9,11,0.36)), url("/bg-image.webp")',
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
};

const filteredItems = computed(() => {
  return complaintStore.items.filter((item) => {
    if (localFilters.status && item.status !== localFilters.status) {
      return false;
    }

    if (localFilters.category && item.category !== localFilters.category) {
      return false;
    }

    return true;
  });
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(async () => {
  try {
    await Promise.all([complaintStore.loadAll(), categoryStore.loadAll()]);
  } catch (error) {
    showError(error.message);
  }
});

const highlights = [
  {
    icon: ShieldCheck,
    title: "Akses terstruktur",
    description:
      "Siswa masuk dengan NIS 8 digit, admin dengan username, tetap aman di belakang layar lewat Supabase.",
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
  <main class="overflow-hidden bg-white text-slate-900">
    <section id="hero" class="relative isolate min-h-[82vh]" :style="heroStyle">
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.04),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.02),transparent_34%)]"
      ></div>
      <div class="absolute inset-x-0 top-0 h-28 bg-black/40"></div>

      <div
        class="relative mx-auto flex min-h-[82vh] max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8"
      >
        <header
          class="sticky top-2 z-20 mb-4 rounded-3xl border border-slate-200 bg-white px-4 py-2 shadow-lg shadow-slate-200/50 backdrop-blur-xl md:px-5"
        >
          <div class="flex flex-wrap items-center justify-between gap-4">
            <RouterLink to="/" class="group flex items-center gap-3">
              <div
                class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/10 transition group-hover:scale-105"
              >
                <Megaphone class="h-5 w-5" />
              </div>
              <div>
                <p
                  class="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-700"
                >
                  Pengaduan Sarana Sekolah
                </p>
                <h1 class="text-lg font-black text-slate-900 sm:text-xl">
                  Lapor cepat, tindak lanjut jelas
                </h1>
              </div>
            </RouterLink>

            <nav
              class="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700"
            >
              <a
                href="#hero"
                class="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900"
                >Beranda</a
              >
              <a
                href="#aduan"
                class="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900"
                >Aduan</a
              >
              <a
                href="#info"
                class="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900"
                >Info</a
              >
              <RouterLink
                to="/login"
                class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
              >
                Masuk
                <ArrowRight class="h-4 w-4" />
              </RouterLink>
            </nav>
          </div>
        </header>

        <div
          class="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16"
        >
          <section class="space-y-8">
            <div
              class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50/80 px-4 py-2 text-sm text-slate-700 backdrop-blur"
            >
              <Sparkles class="h-4 w-4" />
              Simple, minimalis, dan mudah dipakai
            </div>

            <div class="space-y-5">
              <h2
                class="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                Laporkan fasilitas bermasalah, pantau perbaikan, dan jaga
                sekolah tetap nyaman.
              </h2>
              <p
                class="max-w-2xl text-base leading-8 text-slate-200 sm:text-lg"
              >
                Platform ini dirancang simpel dan mudah dipakai untuk siswa
                maupun admin, supaya pengaduan sarana sekolah bisa dikirim,
                diproses, dan dipantau tanpa alur yang berbelit.
              </p>
            </div>

            <div class="flex flex-wrap gap-3">
              <RouterLink
                to="/login"
                class="inline-flex items-center gap-2 rounded-full bg-slate-900/90 backdrop-blur px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Login admin / siswa
              </RouterLink>
              <a
                href="#aduan"
                class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50/80 backdrop-blur px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Lihat aduan terbaru
              </a>
            </div>

            <dl class="grid gap-4 sm:grid-cols-3">
              <div
                v-for="item in stats"
                :key="item.label"
                class="rounded-2xl border border-slate-200/50 bg-slate-50/70 p-4 backdrop-blur"
              >
                <dt class="text-sm text-slate-700">{{ item.label }}</dt>
                <dd class="mt-2 text-3xl font-black text-slate-900">
                  {{ item.value }}
                </dd>
                <p class="mt-1 text-sm text-slate-600">{{ item.detail }}</p>
              </div>
            </dl>
          </section>

          <section
            class="grid gap-4 rounded-4xl border border-slate-200/50 bg-slate-50/70 p-5 shadow-lg shadow-slate-200/50 backdrop-blur md:p-7"
          >
            <article class="rounded-2xl border border-slate-200/50 bg-white/90 p-5 backdrop-blur">
              <p
                class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700"
              >
                Kenapa penting
              </p>
              <h3 class="mt-2 text-2xl font-bold text-slate-900">
                Satu pintu untuk keluhan sarana
              </h3>
              <p class="mt-3 text-sm leading-7 text-slate-600">
                Laporan terpusat membuat tindak lanjut lebih mudah dilacak,
                meminimalkan pesan tercecer, dan memberi transparansi kepada
                siswa.
              </p>
            </article>

            <div class="grid gap-4 md:grid-cols-2">
              <article
                v-for="item in highlights"
                :key="item.title"
                class="rounded-2xl border border-slate-200/50 bg-white/90 p-5 backdrop-blur"
              >
                <component :is="item.icon" class="h-5 w-5 text-slate-700" />
                <h4 class="mt-3 text-base font-semibold text-slate-900">
                  {{ item.title }}
                </h4>
                <p class="mt-2 text-sm leading-6 text-slate-600">
                  {{ item.description }}
                </p>
              </article>
            </div>
          </section>
        </div>
      </div>
    </section>

    <section class="bg-slate-100">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section
          id="info"
          class="grid gap-4 border-t border-slate-300 py-8 text-sm text-slate-700 md:grid-cols-3"
        >
          <p>
            <span class="font-semibold text-slate-900">Siswa:</span> kirim aduan
            dengan NIS 8 digit sebagai identitas login.
          </p>
          <p>
            <span class="font-semibold text-slate-900">Admin:</span> login
            dengan username untuk memproses laporan.
          </p>
          <p>
            <span class="font-semibold text-slate-900">Transparan:</span> status
            dan feedback dapat dipantau dari dashboard.
          </p>
        </section>

        <section id="aduan" class="space-y-4 border-t border-slate-300 py-8">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-2xl font-bold text-slate-900">Aduan Terbaru</h2>
              <p class="mt-1 text-sm text-slate-600">
                Guest dapat melihat seluruh aduan secara read-only.
              </p>
            </div>
            <RouterLink
              to="/login"
              class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100"
            >
              Login untuk mengirim aduan
              <ArrowRight class="h-3.5 w-3.5" />
            </RouterLink>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <label class="space-y-1 text-sm">
              <span class="text-slate-900">Status</span>
              <Select
                v-model="localFilters.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                placeholder="Semua status"
                filter
                filter-placeholder="Cari status"
                class="w-full"
              />
            </label>

            <label class="space-y-1 text-sm">
              <span class="text-slate-900">Kategori</span>
              <Select
                v-model="localFilters.category"
                :options="categoryOptions"
                option-label="label"
                option-value="value"
                placeholder="Semua kategori"
                filter
                filter-placeholder="Cari kategori"
                class="w-full"
              />
            </label>
          </div>

          <p v-if="complaintStore.loading" class="text-sm text-slate-700">
            Memuat aduan publik...
          </p>

          <div v-else-if="filteredItems.length" class="overflow-x-auto">
            <table
              class="min-w-full border-separate border-spacing-0 overflow-hidden rounded-3xl border border-slate-200 bg-white text-left"
            >
              <thead>
                <tr
                  class="bg-slate-200 text-xs uppercase tracking-[0.18em] text-slate-900"
                >
                  <th
                    class="whitespace-nowrap border-b border-slate-300 px-4 py-4 font-bold"
                  >
                    ID
                  </th>
                  <th class="border-b border-slate-300 px-4 py-4 font-bold">
                    Judul
                  </th>
                  <th
                    class="whitespace-nowrap border-b border-slate-300 px-4 py-4 font-bold"
                  >
                    Kategori
                  </th>
                  <th
                    class="whitespace-nowrap border-b border-slate-300 px-4 py-4 font-bold"
                  >
                    Status
                  </th>
                  <th
                    class="whitespace-nowrap border-b border-slate-300 px-4 py-4 font-bold"
                  >
                    Dibuat
                  </th>
                  <th
                    class="whitespace-nowrap border-b border-slate-300 px-4 py-4 font-bold"
                  >
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in filteredItems"
                  :key="item.id"
                  class="border-b border-slate-200 transition hover:bg-slate-50"
                >
                  <td
                    class="whitespace-nowrap px-4 py-4 font-mono text-xs font-semibold text-slate-900"
                  >
                    #{{ index + 1 }}
                  </td>
                  <td class="px-4 py-4 align-top">
                    <div class="space-y-1">
                      <p class="font-semibold text-slate-900">
                        {{ item.title }}
                      </p>
                      <p class="max-w-2xl text-xs leading-5 text-slate-600">
                        {{ item.description }}
                      </p>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-4 py-4 align-top">
                    <span
                      class="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                    >
                      {{ item.category }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-4 py-4 align-top">
                    <span
                      class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      <component :is="statusIcon(item.status)" :size="13" />
                      {{ statusLabel(item.status) }}
                    </span>
                  </td>
                  <td
                    class="whitespace-nowrap px-4 py-4 align-top text-sm text-slate-700"
                  >
                    {{ formatDate(item.created_at) }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-4 align-top">
                    <RouterLink
                      :to="`/complaints/${item.id}`"
                      class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                    >
                      Lihat
                      <Eye class="h-3.5 w-3.5" />
                    </RouterLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-else class="text-sm text-slate-700">
            Belum ada aduan yang cocok dengan filter.
          </p>
        </section>
      </div>
    </section>

    <button
      @click="scrollToTop"
      class="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition hover:bg-slate-800 hover:scale-110"
      aria-label="Kembali ke atas"
      title="Kembali ke atas"
    >
      <ArrowUp class="h-5 w-5" />
    </button>
  </main>
</template>
