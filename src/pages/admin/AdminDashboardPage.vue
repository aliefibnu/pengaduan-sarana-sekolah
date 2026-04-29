<script setup>
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import DataTable from "@/components/DataTable.vue";
import { useComplaintStore } from "@/stores/complaintStore";
import { showError } from "@/utils/notifications";
import { formatDate } from "@/utils/format";
import {
  BarChart3,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  User,
  Calendar,
  Tag,
  Eye,
} from "lucide-vue-next";

const complaintStore = useComplaintStore();
const { items, loading, statusCount } = storeToRefs(complaintStore);

const latestComplaints = computed(() => items.value.slice(0, 10));

const statsColumns = [
  { key: "status", label: "Status", icon: BarChart3, sortable: false },
  { key: "count", label: "Jumlah", icon: null, sortable: true },
  { key: "percentage", label: "Persentase", icon: null, sortable: true },
];

const statsData = computed(() => [
  {
    id: "total",
    status: "Total Aduan",
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
  { key: "reporter_name", label: "Pelapor", icon: User, sortable: true },
  { key: "created_at", label: "Tanggal", icon: Calendar, sortable: true },
  { key: "category_name", label: "Kategori", icon: Tag, sortable: true },
  { key: "status", label: "Status", icon: AlertCircle, sortable: true },
  { key: "actions", label: "Aksi", icon: Eye, sortable: false },
];

onMounted(async () => {
  try {
    await complaintStore.loadAll({
      date: "",
      month: "",
      userId: "",
      category: "",
    });
  } catch (error) {
    showError(error.message);
  }
});
</script>

<template>
  <section class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="flex items-center gap-2 text-3xl font-bold text-slate-900">
        <BarChart3 :size="32" class="text-teal-600" />
        Dashboard Admin
      </h1>
      <p class="mt-1 text-slate-600">
        Ringkasan status aduan dan overview sistem
      </p>
    </div>

    <!-- Statistics Overview Table -->
    <article class="rounded-lg border border-slate-300 bg-white shadow-sm">
      <div
        class="border-b border-slate-200 bg-gradient-to-r from-teal-50 to-teal-100 px-6 py-4"
      >
        <h2 class="flex items-center gap-2 text-xl font-bold text-slate-900">
          <BarChart3 :size="24" class="text-teal-600" />
          Ringkasan Status
        </h2>
      </div>

      <div class="overflow-x-auto">
        <DataTable
          :columns="statsColumns"
          :items="statsData"
          :page-size="10"
          empty-title="Belum ada data"
          empty-message="Sistem belum memiliki data aduan"
        >
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
                  'text-teal-600': item.id === 'total',
                  'text-yellow-600': item.id === 'pending',
                  'text-blue-600': item.id === 'processing',
                  'text-green-600': item.id === 'completed',
                }"
              />
              <span class="font-semibold text-slate-900">{{
                item.status
              }}</span>
            </div>
          </template>

          <template #cell-count="{ item }">
            <span class="text-lg font-bold text-slate-900">{{
              item.count
            }}</span>
          </template>

          <template #cell-percentage="{ item }">
            <span class="text-slate-700">{{ item.percentage }}</span>
          </template>
        </DataTable>
      </div>
    </article>

    <!-- Latest Complaints Table -->
    <article class="rounded-lg border border-slate-300 bg-white shadow-sm">
      <div
        class="border-b border-slate-200 bg-gradient-to-r from-teal-50 to-teal-100 px-6 py-4"
      >
        <h2 class="flex items-center gap-2 text-xl font-bold text-slate-900">
          <FileText :size="24" class="text-teal-600" />
          Aduan Terbaru
        </h2>
      </div>

      <div class="overflow-x-auto">
        <DataTable
          v-if="!loading"
          :columns="complaintColumns"
          :items="latestComplaints"
          :page-size="10"
          empty-title="Belum ada aduan"
          empty-message="Tidak ada aduan dalam sistem saat ini"
        >
          <template #cell-id="{ rowNumber }">
            <span class="font-mono text-sm text-slate-600"
              >#{{ rowNumber }}</span
            >
          </template>

          <template #cell-title="{ item }">
            <span class="text-slate-900">{{ item.title }}</span>
          </template>

          <template #cell-reporter_name="{ item }">
            <div class="flex items-center gap-2">
              <User :size="16" class="text-slate-400" />
              <span class="text-slate-700">{{ item.reporter_name }}</span>
            </div>
          </template>

          <template #cell-created_at="{ item }">
            <span class="text-slate-700">{{
              formatDate(item.created_at)
            }}</span>
          </template>

          <template #cell-category_name="{ item }">
            <span
              class="inline-block rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800"
            >
              {{ item.category_name }}
            </span>
          </template>

          <template #cell-status="{ item }">
            <div class="flex items-center gap-2">
              <component
                :is="
                  item.status === 'pending'
                    ? AlertCircle
                    : item.status === 'processing'
                      ? Clock
                      : CheckCircle2
                "
                :size="18"
                :class="{
                  'text-yellow-600': item.status === 'pending',
                  'text-blue-600': item.status === 'processing',
                  'text-green-600': item.status === 'completed',
                }"
              />
              <span
                :class="{
                  'text-yellow-700': item.status === 'pending',
                  'text-blue-700': item.status === 'processing',
                  'text-green-700': item.status === 'completed',
                }"
              >
                {{
                  item.status === "pending"
                    ? "Menunggu"
                    : item.status === "processing"
                      ? "Diproses"
                      : "Selesai"
                }}
              </span>
            </div>
          </template>

          <template #cell-actions="{ item }">
            <router-link
              :to="`/admin/complaints/${item.id}`"
              class="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Eye :size="16" />
              Lihat
            </router-link>
          </template>
        </DataTable>

        <div v-else class="px-6 py-8 text-center">
          <p class="text-slate-500">Memuat data pengaduan...</p>
        </div>
      </div>
    </article>
  </section>
</template>
