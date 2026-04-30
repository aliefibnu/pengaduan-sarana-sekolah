<script setup>
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import DataTable from "@/components/DataTable.vue";
import { useAuthStore } from "@/stores/authStore";
import { useComplaintStore } from "@/stores/complaintStore";
import { showError } from "@/utils/notifications";
import { formatDate } from "@/utils/format";
import {
  BarChart3,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  Plus,
  Eye,
} from "lucide-vue-next";

const authStore = useAuthStore();
const complaintStore = useComplaintStore();
const { items, statusCount, loading } = storeToRefs(complaintStore);

const latestComplaints = computed(() => items.value.slice(0, 10));

const statsColumns = [
  { key: "status", label: "Status", icon: BarChart3, sortable: false },
  { key: "count", label: "Jumlah", icon: null, sortable: true },
  { key: "percentage", label: "Persentase", icon: null, sortable: true },
];

const statsData = computed(() => [
  {
    id: "total",
    status: "Total Laporan",
    count: statusCount.value.total,
    percentage: "100%",
  },
  {
    id: "pending",
    status: "Menunggu",
    count: statusCount.value.pending,
    percentage:
      statusCount.value.total > 0
        ? Math.round(
            (statusCount.value.pending / statusCount.value.total) * 100,
          ) + "%"
        : "0%",
  },
  {
    id: "processing",
    status: "Diproses",
    count: statusCount.value.process,
    percentage:
      statusCount.value.total > 0
        ? Math.round(
            (statusCount.value.process / statusCount.value.total) * 100,
          ) + "%"
        : "0%",
  },
  {
    id: "completed",
    status: "Selesai",
    count: statusCount.value.done,
    percentage:
      statusCount.value.total > 0
        ? Math.round((statusCount.value.done / statusCount.value.total) * 100) +
          "%"
        : "0%",
  },
]);

const complaintColumns = [
  { key: "id", label: "ID", icon: FileText, sortable: true },
  { key: "title", label: "Judul", icon: FileText, sortable: true },
  { key: "created_at", label: "Dibuat", icon: null, sortable: true },
  { key: "category", label: "Kategori", icon: null, sortable: true },
  { key: "status", label: "Status", icon: AlertCircle, sortable: true },
  { key: "actions", label: "Aksi", icon: Eye, sortable: false },
];

onMounted(async () => {
  if (!authStore.user?.id) return;

  try {
    await complaintStore.loadMine(authStore.user.id);
  } catch (error) {
    showError(error.message);
  }
});
</script>

<template>
  <section class="space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
    >
      <div class="space-y-1">
        <h1 class="flex items-center gap-3 text-3xl font-bold text-slate-900">
          <BarChart3 :size="28" class="text-slate-700" />
          Dashboard Siswa
        </h1>
        <p class="text-sm text-slate-600">Ringkasan laporan pengaduan Anda</p>
      </div>
      <RouterLink to="/siswa/new">
        <Button
          label="Buat Pengaduan"
          :icon="Plus"
          class="bg-slate-900 text-white hover:bg-slate-800"
        />
      </RouterLink>
    </div>

    <!-- Stats Table -->
    <div
      class="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm"
    >
      <DataTable :columns="statsColumns" :items="statsData">
        <template #cell-status="{ item }">
          <div class="flex items-center gap-2">
            <component
              :is="
                item.id === 'total'
                  ? BarChart3
                  : item.id === 'pending'
                    ? AlertCircle
                    : item.id === 'processing'
                      ? Clock
                      : CheckCircle2
              "
              :size="18"
              :class="{
                'text-slate-600': item.id === 'total',
                'text-slate-600': item.id === 'pending',
                'text-slate-700': item.id === 'processing',
                'text-slate-800': item.id === 'completed',
              }"
            />
            <span class="font-semibold text-slate-900">{{ item.status }}</span>
          </div>
        </template>

        <template #cell-count="{ item }">
          <span class="font-bold text-slate-900">{{ item.count }}</span>
        </template>

        <template #cell-percentage="{ item }">
          <span class="text-slate-700">{{ item.percentage }}</span>
        </template>
      </DataTable>
    </div>

    <!-- Recent Complaints -->
    <div
      class="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm"
    >
      <div
        class="border-b border-slate-200 bg-gradient-to-r from-teal-50 to-teal-100 px-6 py-4"
      >
        <h2 class="flex items-center gap-2 text-xl font-bold text-slate-900">
          <FileText :size="24" class="text-slate-700" />
          Laporan Terbaru
        </h2>
      </div>

      <div class="overflow-x-auto">
        <DataTable
          :columns="complaintColumns"
          :items="latestComplaints"
          :loading="loading"
          :page-size="10"
        >
          <template #cell-id="{ rowNumber }">
            <span class="font-mono text-sm text-slate-700">{{
              rowNumber
            }}</span>
          </template>

          <template #cell-title="{ item }">
            <RouterLink
              :to="`/siswa/detail/${item.id}`"
              class="line-clamp-1 text-sm text-slate-700 hover:underline"
            >
              {{ item.title }}
            </RouterLink>
          </template>

          <template #cell-created_at="{ item }">
            <span class="text-sm text-slate-700">{{
              formatDate(item.created_at)
            }}</span>
          </template>

          <template #cell-category="{ item }">
            <span
              class="inline-block rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
            >
              {{ item.category }}
            </span>
          </template>

          <template #cell-status="{ item }">
            <span
              class="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold"
              :class="{
                'border-slate-300 bg-slate-50 text-slate-700':
                  item.status === 'pending',
                'border-slate-300 bg-slate-50 text-slate-700':
                  item.status === 'processing',
                'border-slate-300 bg-slate-50 text-slate-700':
                  item.status === 'done',
              }"
            >
              <component
                :is="
                  item.status === 'done'
                    ? CheckCircle2
                    : item.status === 'process'
                      ? Clock
                      : AlertCircle
                "
                :size="14"
              />
              {{
                item.status === "pending"
                  ? "Menunggu"
                  : item.status === "process"
                    ? "Diproses"
                    : "Selesai"
              }}
            </span>
          </template>

          <template #cell-actions="{ item }">
            <RouterLink :to="`/siswa/detail/${item.id}`">
              <button
                class="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Eye :size="16" />
                Lihat
              </button>
            </RouterLink>
          </template>
        </DataTable>
      </div>
    </div>
  </section>
</template>
