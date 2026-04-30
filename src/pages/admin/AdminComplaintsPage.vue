<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import DatePicker from "primevue/datepicker";
import Select from "primevue/select";
import DataTable from "@/components/DataTable.vue";
import { useComplaintStore } from "@/stores/complaintStore";
import { useCategoryStore } from "@/stores/categoryStore";
import {
  closeLoading,
  openLoading,
  showError,
  showSuccess,
} from "@/utils/notifications";
import { formatDate } from "@/utils/format";
import {
  Search,
  FileText,
  User,
  Tag,
  Calendar,
  Eye,
  Download,
  RefreshCw,
} from "lucide-vue-next";

const complaintStore = useComplaintStore();
const categoryStore = useCategoryStore();
const { items, loading } = storeToRefs(complaintStore);

const filterDialogVisible = ref(false);
const keyword = ref("");

const filters = reactive({
  startDate: null,
  endDate: null,
  category: "",
  status: "",
});

const statusOptions = [
  { label: "Semua status", value: "" },
  { label: "Menunggu", value: "pending" },
  { label: "Diproses", value: "process" },
  { label: "Selesai", value: "done" },
];

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const keywordMatch =
      !keyword.value ||
      item.title.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.description.toLowerCase().includes(keyword.value.toLowerCase());

    const categoryMatch =
      !filters.category || item.category === filters.category;
    const statusMatch = !filters.status || item.status === filters.status;

    let dateMatch = true;
    if (filters.startDate || filters.endDate) {
      const itemDate = new Date(item.created_at);
      if (filters.startDate && itemDate < new Date(filters.startDate))
        dateMatch = false;
      if (filters.endDate && itemDate > new Date(filters.endDate))
        dateMatch = false;
    }

    return keywordMatch && categoryMatch && statusMatch && dateMatch;
  });
});

const columns = [
  { key: "id", label: "ID", icon: FileText, sortable: true },
  { key: "title", label: "Judul", icon: FileText, sortable: true },
  { key: "reporter_name", label: "Pelapor", icon: User, sortable: true },
  { key: "category", label: "Kategori", icon: Tag, sortable: true },
  { key: "status", label: "Status", icon: null, sortable: true },
  { key: "created_at", label: "Dibuat", icon: Calendar, sortable: true },
  { key: "first_response_at", label: "Direspon", icon: null, sortable: true },
  { key: "completed_at", label: "Selesai", icon: null, sortable: true },
  { key: "actions", label: "Aksi", icon: Eye, sortable: false },
];

async function handleExportCSV() {
  openLoading("Mengekspor data...");
  try {
    const headers = [
      "ID",
      "Judul",
      "Pelapor",
      "Kategori",
      "Status",
      "Dibuat",
      "Direspon",
      "Selesai",
    ];
    const rows = filteredItems.value.map((item) => [
      item.id,
      item.title,
      item.reporter_name,
      item.category,
      item.status,
      formatDate(item.created_at),
      item.first_response_at ? formatDate(item.first_response_at) : "-",
      item.completed_at ? formatDate(item.completed_at) : "-",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-pengaduan-${Date.now()}.csv`;
    link.click();
    showSuccess("Data berhasil diekspor");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}

onMounted(async () => {
  try {
    await Promise.all([complaintStore.loadAll(), categoryStore.loadAll()]);
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
          <FileText :size="28" class="text-teal-600" />
          Daftar Pengaduan
        </h1>
        <p class="text-sm text-slate-600">
          Kelola dan pantau semua pengaduan dari siswa
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button
          label="Ekspor CSV"
          icon="pi pi-download"
          severity="secondary"
          @click="handleExportCSV"
        />
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          @click="complaintStore.loadAll()"
        />
      </div>
    </div>

    <!-- Search Bar -->
    <div>
      <div
        class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2"
      >
        <Search :size="20" class="text-slate-500" />
        <input
          v-model="keyword"
          type="text"
          placeholder="🔍 Cari judul, deskripsi, atau pelapor..."
          class="flex-1 border-0 bg-transparent outline-none"
        />
      </div>
    </div>

    <!-- Filter Section -->
    <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div class="flex items-center justify-between">
        <h3 class="flex items-center gap-2 font-semibold text-slate-900">
          <FileText :size="18" class="text-teal-600" />
          Filter Lanjutan
        </h3>
        <Button
          text
          icon="pi pi-sliders-v"
          label="Buka"
          @click="filterDialogVisible = true"
        />
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        <span
          v-if="filters.category"
          class="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-100 px-3 py-1 text-sm text-teal-800"
        >
          Kategori: {{ filters.category }}
        </span>
        <span
          v-if="filters.status"
          class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-sm text-blue-800"
        >
          Status: {{ filters.status }}
        </span>
        <span
          v-if="filters.startDate || filters.endDate"
          class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-200 px-3 py-1 text-sm text-slate-700"
        >
          Tanggal:
          {{ filters.startDate ? formatDate(filters.startDate) : "?" }} -
          {{ filters.endDate ? formatDate(filters.endDate) : "?" }}
        </span>
      </div>
    </div>

    <!-- Data Table -->
    <div
      class="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm"
    >
      <div class="overflow-x-auto">
        <DataTable
          :columns="columns"
          :items="filteredItems"
          :loading="loading"
          :page-size="10"
        >
          <template #cell-id="{ rowNumber }">
            <span class="font-mono text-sm text-slate-700"
              >#{{ rowNumber }}</span
            >
          </template>

          <template #cell-title="{ item }">
            <div class="max-w-xs">
              <p class="font-semibold text-slate-900">{{ item.title }}</p>
              <p class="line-clamp-1 text-xs text-slate-600">
                {{ item.description }}
              </p>
            </div>
          </template>

          <template #cell-reporter_name="{ item }">
            <div class="flex items-center gap-2">
              <User :size="16" class="text-slate-500" />
              <span class="text-sm text-slate-700">{{
                item.reporter_name
              }}</span>
            </div>
          </template>

          <template #cell-category="{ item }">
            <span
              class="inline-block rounded-full border border-teal-200 bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-800"
            >
              {{ item.category }}
            </span>
          </template>

          <template #cell-status="{ item }">
            <span
              class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold"
              :class="{
                'border-yellow-300 bg-yellow-50 text-yellow-700':
                  item.status === 'pending',
                'border-blue-300 bg-blue-50 text-blue-700':
                  item.status === 'process',
                'border-green-300 bg-green-50 text-green-700':
                  item.status === 'done',
              }"
            >
              {{
                item.status === "pending"
                  ? "Menunggu"
                  : item.status === "process"
                    ? "Diproses"
                    : "Selesai"
              }}
            </span>
          </template>

          <template #cell-created_at="{ item }">
            <span class="text-sm text-slate-700">{{
              formatDate(item.created_at)
            }}</span>
          </template>

          <template #cell-first_response_at="{ item }">
            <span class="text-sm text-slate-700">{{
              item.first_response_at ? formatDate(item.first_response_at) : "-"
            }}</span>
          </template>

          <template #cell-completed_at="{ item }">
            <span class="text-sm text-slate-700">{{
              item.completed_at ? formatDate(item.completed_at) : "-"
            }}</span>
          </template>

          <template #cell-actions="{ item }">
            <RouterLink :to="{ name: 'admin-complaint-detail', params: { id: item.id } }">
              <button
                class="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Eye :size="16" />
                Detail
              </button>
            </RouterLink>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Filter Dialog -->
    <Dialog
      v-model:visible="filterDialogVisible"
      modal
      header="Filter Pengaduan"
      :style="{ width: 'min(48rem, 94vw)' }"
    >
      <form class="space-y-4" @submit.prevent="filterDialogVisible = false">
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="admin-input space-y-2">
            <span class="font-semibold text-slate-900">Kategori</span>
            <Select
              v-model="filters.category"
              :options="[
                { label: 'Semua kategori', value: '' },
                ...categoryStore.options,
              ]"
              option-label="label"
              option-value="value"
              filter
              fluid
            />
          </label>

          <label class="admin-input space-y-2">
            <span class="font-semibold text-slate-900">Status</span>
            <Select
              v-model="filters.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              fluid
            />
          </label>

          <label class="admin-input space-y-2">
            <span class="font-semibold text-slate-900">Dari Tanggal</span>
            <DatePicker
              v-model="filters.startDate"
              date-format="yy-mm-dd"
              input-class="w-full"
              fluid
            />
          </label>

          <label class="admin-input space-y-2">
            <span class="font-semibold text-slate-900">Sampai Tanggal</span>
            <DatePicker
              v-model="filters.endDate"
              date-format="yy-mm-dd"
              input-class="w-full"
              fluid
            />
          </label>
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button
            severity="secondary"
            outlined
            label="Batal"
            type="button"
            @click="filterDialogVisible = false"
          />
          <Button
            label="Terapkan Filter"
            type="submit"
            @click="filterDialogVisible = false"
          />
        </div>
      </form>
    </Dialog>
  </section>
</template>
