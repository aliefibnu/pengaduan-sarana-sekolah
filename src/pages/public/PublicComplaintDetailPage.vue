<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import DataTable from "@/components/DataTable.vue";
import { fetchComplaintById } from "@/services/complaintService";
import { fetchFeedbackByComplaintId } from "@/services/feedbackService";
import { formatDate } from "@/utils/format";
import { showError } from "@/utils/notifications";
import {
  ArrowLeft,
  AlertCircle,
  MessageSquare,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
} from "lucide-vue-next";

const route = useRoute();
const loading = ref(false);
const complaint = ref(null);
const feedbacks = ref([]);
const imagePreviewVisible = ref(false);

const feedbackColumns = [
  { key: "message", label: "Pesan", icon: MessageSquare, sortable: false },
  {
    key: "progress_percentage",
    label: "Progres",
    icon: TrendingUp,
    sortable: false,
  },
  { key: "created_at", label: "Tanggal", icon: Calendar, sortable: false },
];

const timelineItems = computed(() => {
  return [...feedbacks.value].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );
});

async function loadData() {
  loading.value = true;
  try {
    const [complaintData, feedbackData] = await Promise.all([
      fetchComplaintById(route.params.id),
      fetchFeedbackByComplaintId(route.params.id),
    ]);

    complaint.value = complaintData;
    feedbacks.value = feedbackData;
  } catch (error) {
    showError(error.message);
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <main class="min-h-screen bg-white px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
    <section class="mx-auto max-w-4xl space-y-6">
      <!-- Back Button -->
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-900/50"
      >
        <ArrowLeft :size="18" />
        Kembali ke Beranda
      </RouterLink>

      <!-- Complaint Detail Card -->
      <article
        class="rounded-lg border border-slate-700 bg-slate-900/30 backdrop-blur"
      >
        <div
          class="border-b border-slate-700 bg-linear-to-r from-slate-800 to-slate-900 px-6 py-4"
        >
          <h1 class="flex items-center gap-2 text-2xl font-bold text-white">
            <AlertCircle :size="24" class="text-slate-500" />
            {{ complaint?.title || "Loading..." }}
          </h1>
        </div>

        <div v-if="loading" class="px-6 py-8 text-center text-slate-400">
          Memuat detail pengaduan...
        </div>

        <div v-else-if="complaint" class="space-y-4 px-6 py-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="space-y-1">
              <p class="text-xs text-slate-400">
                <strong>Dibuat:</strong> {{ formatDate(complaint.created_at) }}
              </p>
              <p class="text-xs text-slate-400">
                <strong>Kategori:</strong> {{ complaint.category || "-" }}
              </p>
            </div>
            <div>
              <span
                class="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-semibold"
                :class="{
                  'border-slate-300 bg-slate-50 text-slate-700':
                    complaint.status === 'pending',
                  'border-blue-500/50 bg-blue-500/20 text-blue-100':
                    complaint.status === 'process',
                  'border-green-500/50 bg-green-500/20 text-green-100':
                    complaint.status === 'done',
                }"
              >
                <component
                  :is="
                    complaint.status === 'done'
                      ? CheckCircle2
                      : complaint.status === 'process'
                        ? Clock
                        : AlertCircle
                  "
                  :size="18"
                />
                {{
                  complaint.status === "pending"
                    ? "Menunggu"
                    : complaint.status === "process"
                      ? "Diproses"
                      : "Selesai"
                }}
              </span>
            </div>
          </div>

          <div class="border-t border-slate-700 pt-4">
            <p class="text-sm leading-relaxed text-slate-300">
              {{ complaint.description }}
            </p>
          </div>

          <button
            v-if="complaint.image_url"
            @click="imagePreviewVisible = true"
            class="group w-full overflow-hidden rounded-lg border border-slate-700 transition hover:border-slate-600"
          >
            <img
              :src="complaint.image_url"
              alt="Bukti"
              class="max-h-64 w-full rounded-lg object-cover"
            />
            <div
              class="flex items-center justify-between bg-slate-800/40 px-4 py-2"
            >
              <span
                class="flex items-center gap-2 text-sm font-medium text-slate-200"
              >
                <ImageIcon :size="16" />
                Bukti Pengaduan
              </span>
              <span class="text-xs text-slate-400">Klik untuk perbesar</span>
            </div>
          </button>

          <Dialog
            v-model:visible="imagePreviewVisible"
            modal
            header="Preview Bukti Pengaduan"
            :style="{ width: 'min(64rem, 96vw)' }"
          >
            <img
              v-if="complaint?.image_url"
              :src="complaint.image_url"
              alt="Bukti pengaduan"
              class="max-h-[78vh] w-full rounded-xl object-contain"
            />
          </Dialog>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
              <p class="text-xs text-slate-400">
                <strong>Direspon Pertama:</strong>
              </p>
              <p class="text-sm font-semibold text-slate-100">
                {{
                  complaint.first_response_at
                    ? formatDate(complaint.first_response_at)
                    : "-"
                }}
              </p>
            </div>
            <div class="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
              <p class="text-xs text-slate-400">
                <strong>Ditandai Selesai:</strong>
              </p>
              <p class="text-sm font-semibold text-slate-100">
                {{
                  complaint.completed_at
                    ? formatDate(complaint.completed_at)
                    : "-"
                }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="px-6 py-8 text-center">
          <p class="text-sm text-slate-600">
            ⚠️ Detail pengaduan tidak ditemukan atau tidak bisa diakses.
          </p>
        </div>
      </article>

      <!-- Timeline Table -->
      <article
        class="rounded-lg border border-slate-700 bg-slate-900/30 backdrop-blur"
      >
        <div
          class="border-b border-slate-700 bg-linear-to-r from-slate-800 to-slate-900 px-6 py-4"
        >
          <h2 class="flex items-center gap-2 text-xl font-bold text-white">
            <MessageSquare :size="24" class="text-slate-600" />
            Riwayat Penanganan
          </h2>
          <p class="mt-1 text-xs text-slate-400">Bersifat publik - read-only</p>
        </div>

        <div class="overflow-x-auto">
          <DataTable
            :columns="feedbackColumns"
            :items="timelineItems"
            :page-size="10"
            empty-title="Belum ada riwayat"
            empty-message="Belum ada feedback dari admin mengenai pengaduan ini"
          >
            <template #cell-message="{ item }">
              <p class="text-sm text-slate-300">{{ item.message }}</p>
            </template>

            <template #cell-progress_percentage="{ item }">
              <div
                v-if="item.progress_percentage !== null"
                class="flex items-center gap-2"
              >
                <div class="w-16 rounded-full bg-slate-700">
                  <div
                    class="h-1.5 rounded-full bg-slate-600"
                    :style="{ width: `${item.progress_percentage}%` }"
                  />
                </div>
                <span
                  class="whitespace-nowrap rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-300"
                >
                  {{ item.progress_percentage }}%
                </span>
              </div>
              <span v-else class="text-xs text-slate-500">-</span>
            </template>

            <template #cell-created_at="{ item }">
              <span class="text-sm text-slate-400">{{
                formatDate(item.created_at)
              }}</span>
            </template>
          </DataTable>
        </div>
      </article>

      <!-- Info Banner -->
      <div
        class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100"
      >
        <p>
          ℹ️ Halaman ini hanya untuk melihat data pengaduan. Aksi create, edit,
          dan delete membutuhkan autentikasi sesuai role.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Dark theme table overrides */
:deep(.data-table) {
  --table-header-bg: rgba(15, 23, 42, 0.8);
  --table-row-hover: rgba(30, 41, 59, 0.5);
  --table-border: rgb(71, 85, 105);
  --text-primary: rgb(226, 232, 240);
  --text-secondary: rgb(148, 163, 184);
}

:deep(.data-table thead) {
  background: linear-gradient(
    to right,
    rgba(30, 41, 59, 0.8),
    rgba(15, 23, 42, 0.8)
  );
  border-bottom: 1px solid rgb(71, 85, 105);
}

:deep(.data-table thead th) {
  color: rgb(226, 232, 240);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
}

:deep(.data-table tbody tr) {
  border-bottom: 1px solid rgb(51, 65, 85);
  transition: background-color 0.2s;
}

:deep(.data-table tbody tr:hover) {
  background-color: rgba(30, 41, 59, 0.5);
}

:deep(.data-table td) {
  color: rgb(226, 232, 240);
  padding: 1rem;
}

:deep(.status-badge) {
  background-color: rgba(59, 130, 246, 0.2);
  border-color: rgb(96, 165, 250);
  color: rgb(191, 219, 254);
}

:deep(.empty-state) {
  color: rgb(148, 163, 184);
}
</style>
