<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import Select from "primevue/select";
import DataTable from "@/components/DataTable.vue";
import { useAuthStore } from "@/stores/authStore";
import { useComplaintStore } from "@/stores/complaintStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { showError } from "@/utils/notifications";
import { formatDate } from "@/utils/format";
import { History, Filter, FileText, Eye } from "lucide-vue-next";

const authStore = useAuthStore();
const complaintStore = useComplaintStore();
const categoryStore = useCategoryStore();
const { items, loading } = storeToRefs(complaintStore);
const { options: categoryOptions } = storeToRefs(categoryStore);

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

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const statusMatch =
      !localFilters.status || item.status === localFilters.status;
    const categoryMatch =
      !localFilters.category || item.category === localFilters.category;
    return statusMatch && categoryMatch;
  });
});

const columns = [
  { key: "id", label: "ID", icon: FileText, sortable: true },
  { key: "title", label: "Judul", icon: FileText, sortable: true },
  { key: "created_at", label: "Dibuat", icon: null, sortable: true },
  { key: "category", label: "Kategori", icon: null, sortable: true },
  { key: "status", label: "Status", icon: null, sortable: true },
  { key: "actions", label: "Aksi", icon: Eye, sortable: false },
];

onMounted(async () => {
  if (!authStore.user?.id) return;

  try {
    await Promise.all([
      complaintStore.loadMine(authStore.user.id),
      categoryStore.loadAll(),
    ]);
  } catch (error) {
    showError(error.message);
  }
});
</script>

<template>
  <section class="space-y-6">
    <!-- Header -->
    <div class="space-y-1">
      <h1 class="flex items-center gap-3 text-3xl font-bold text-slate-900">
        <History :size="28" class="text-slate-700" />
        Riwayat Pengaduan
      </h1>
      <p class="text-sm text-slate-600">Lihat semua pengaduan yang Anda buat</p>
    </div>

    <!-- Filters -->
    <div
      class="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row"
    >
      <div class="flex-1">
        <label class="block space-y-2 text-sm">
          <span class="flex items-center gap-2 font-semibold text-slate-900">
            <Filter :size="16" />
            Status
          </span>
          <Select
            v-model="localFilters.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            fluid
            placeholder="Pilih status"
          />
        </label>
      </div>

      <div class="flex-1">
        <label class="block space-y-2 text-sm">
          <span class="flex items-center gap-2 font-semibold text-slate-900">
            <Filter :size="16" />
            Kategori
          </span>
          <Select
            v-model="localFilters.category"
            :options="[
              { label: 'Semua kategori', value: '' },
              ...categoryOptions,
            ]"
            option-label="label"
            option-value="value"
            filter
            fluid
            placeholder="Pilih kategori"
          />
        </label>
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
            <span class="font-mono text-sm text-slate-700">{{
              rowNumber
            }}</span>
          </template>

          <template #cell-title="{ item }">
            <RouterLink
              :to="`/siswa/history/${item.id}`"
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
              class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold"
              :class="{
                'border-slate-300 bg-slate-50 text-slate-700':
                  item.status === 'pending',
                'border-slate-300 bg-slate-50 text-slate-700':
                  item.status === 'processing',
                'border-slate-300 bg-slate-50 text-slate-700':
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

          <template #cell-actions="{ item }">
            <RouterLink :to="`/siswa/history/${item.id}`">
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
