<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import StatusBadge from "@/components/StatusBadge.vue";
import { useComplaintStore } from "@/stores/complaintStore";
import { useFeedbackStore } from "@/stores/feedbackStore";
import { fetchUsers } from "@/services/userService";
import { formatDate, monthLabel } from "@/utils/format";
import {
  closeLoading,
  openLoading,
  showError,
  showSuccess,
} from "@/utils/notifications";

const route = useRoute();
const router = useRouter();
const complaintStore = useComplaintStore();
const feedbackStore = useFeedbackStore();
const { items, loading, filters, listMeta } = storeToRefs(complaintStore);

const users = ref([]);
const feedbackMessage = ref("");
const selectedComplaintId = ref("");
const filterDialogVisible = ref(false);
const feedbackDialogVisible = ref(false);
const searchTerm = ref("");
const sortBy = ref("created_at");
const sortDirection = ref("desc");
const tableBusy = ref(false);
const skipControlWatch = ref(false);

let searchDebounceTimer = null;
const allowedSortBy = ["created_at", "status", "category", "title"];

const formFilters = reactive({
  date: "",
  month: "",
  userId: "",
  category: "",
});

const categories = [
  "Kelas",
  "Toilet",
  "Laboratorium",
  "Perpustakaan",
  "Lapangan",
  "Lainnya",
];

const sortByOptions = [
  { label: "Urutkan: Tanggal", value: "created_at" },
  { label: "Urutkan: Status", value: "status" },
  { label: "Urutkan: Kategori", value: "category" },
  { label: "Urutkan: Judul", value: "title" },
];

const sortDirectionOptions = [
  { label: "Terbaru / Z-A", value: "desc" },
  { label: "Terlama / A-Z", value: "asc" },
];

const selectedDate = computed({
  get() {
    return toDateValue(formFilters.date);
  },
  set(value) {
    formFilters.date = toDateString(value);
  },
});

const selectedMonth = computed({
  get() {
    return toMonthDateValue(formFilters.month);
  },
  set(value) {
    formFilters.month = toMonthString(value);
  },
});

const userOptions = computed(() => [
  { name: "Semua user", id: "" },
  ...users.value.map((user) => ({ name: user.name, id: user.id })),
]);

const categoryOptions = computed(() => [
  { label: "Semua kategori", value: "" },
  ...categories.map((category) => ({ label: category, value: category })),
]);

const groupedSummary = computed(() => ({
  activeDate: formFilters.date || "-",
  activeMonth: monthLabel(formFilters.month),
  activeUser:
    users.value.find((user) => user.id === formFilters.userId)?.name ||
    "Semua user",
  activeCategory: formFilters.category || "Semua kategori",
}));

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(listMeta.value.total / listMeta.value.pageSize));
});

const hasActiveFilter = computed(() => {
  return Boolean(
    formFilters.date ||
    formFilters.month ||
    formFilters.userId ||
    formFilters.category ||
    searchTerm.value.trim(),
  );
});

const maxDate = computed(() => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
});

onMounted(async () => {
  try {
    const initialPage = hydrateFromQuery();
    const allUsers = await fetchUsers();

    users.value = allUsers.filter((user) => user.role === "siswa");
    await loadTable({ page: initialPage, syncQuery: false });
  } catch (error) {
    showError(error.message);
  }
});

onUnmounted(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
});

watch(searchTerm, () => {
  if (skipControlWatch.value) return;
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  searchDebounceTimer = setTimeout(() => {
    loadTable({ page: 1 }).catch((error) => showError(error.message));
  }, 400);
});

watch([sortBy, sortDirection], () => {
  if (skipControlWatch.value) return;
  loadTable({ page: 1 }).catch((error) => showError(error.message));
});

async function loadTable({ page = listMeta.value.page } = {}) {
  tableBusy.value = true;

  try {
    await complaintStore.loadAllPaginated({
      nextFilters: formFilters,
      page,
      pageSize: listMeta.value.pageSize,
      searchTerm: searchTerm.value,
      sortBy: sortBy.value,
      sortDirection: sortDirection.value,
    });

    await syncQuery();
  } finally {
    tableBusy.value = false;
  }
}

function readQueryValue(key) {
  const value = route.query[key];
  return typeof value === "string" ? value : "";
}

function hydrateFromQuery() {
  const queryDate = readQueryValue("date");
  const queryMonth = readQueryValue("month");
  const queryUserId = readQueryValue("userId");
  const queryCategory = readQueryValue("category");
  const querySearch = readQueryValue("q");
  const querySortBy = readQueryValue("sortBy");
  const querySortDirection = readQueryValue("sortDir");
  const queryPage = Number.parseInt(readQueryValue("page"), 10);

  skipControlWatch.value = true;
  formFilters.date = queryDate;
  formFilters.month = queryMonth;
  formFilters.userId = queryUserId;
  formFilters.category = queryCategory;
  searchTerm.value = querySearch;
  sortBy.value = allowedSortBy.includes(querySortBy)
    ? querySortBy
    : "created_at";
  sortDirection.value = querySortDirection === "asc" ? "asc" : "desc";
  skipControlWatch.value = false;

  return Number.isFinite(queryPage) && queryPage > 0 ? queryPage : 1;
}

async function syncQuery() {
  const nextQuery = {};

  if (formFilters.date) nextQuery.date = formFilters.date;
  if (formFilters.month) nextQuery.month = formFilters.month;
  if (formFilters.userId) nextQuery.userId = formFilters.userId;
  if (formFilters.category) nextQuery.category = formFilters.category;
  if (searchTerm.value.trim()) nextQuery.q = searchTerm.value.trim();
  if (sortBy.value !== "created_at") nextQuery.sortBy = sortBy.value;
  if (sortDirection.value !== "desc") nextQuery.sortDir = sortDirection.value;
  if (listMeta.value.page > 1) nextQuery.page = String(listMeta.value.page);

  await router.replace({ query: nextQuery });
}

function resetFilter() {
  skipControlWatch.value = true;
  Object.assign(formFilters, {
    date: "",
    month: "",
    userId: "",
    category: "",
  });
  searchTerm.value = "";
  sortBy.value = "created_at";
  sortDirection.value = "desc";
  skipControlWatch.value = false;

  loadTable({ page: 1 }).catch((error) => showError(error.message));
}

function openFilterDialog() {
  filterDialogVisible.value = true;
}

function openFeedbackDialog() {
  feedbackDialogVisible.value = true;
}

async function applyFilterAndClose() {
  await applyFilter();
  filterDialogVisible.value = false;
}

async function submitFeedbackAndClose() {
  await submitFeedback();
  feedbackDialogVisible.value = false;
}

async function applyFilter() {
  openLoading("Menerapkan filter...");

  try {
    await loadTable({ page: 1 });
    showSuccess("Filter diperbarui");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}

function nextPage() {
  if (listMeta.value.page < totalPages.value) {
    loadTable({ page: listMeta.value.page + 1 }).catch((error) =>
      showError(error.message),
    );
  }
}

function prevPage() {
  if (listMeta.value.page > 1) {
    loadTable({ page: listMeta.value.page - 1 }).catch((error) =>
      showError(error.message),
    );
  }
}

function toCsvValue(value) {
  const raw = String(value ?? "");
  return `"${raw.replace(/"/g, '""')}"`;
}

function toDateValue(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toMonthDateValue(value) {
  if (!value) return null;
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return null;
  return new Date(year, month - 1, 1);
}

function toDateString(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return "";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMonthString(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return "";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

async function exportCsv() {
  openLoading("Menyiapkan file CSV...");

  try {
    const exportItems = await complaintStore.exportAllFiltered({
      nextFilters: formFilters,
      searchTerm: searchTerm.value,
      sortBy: sortBy.value,
      sortDirection: sortDirection.value,
    });

    const rows = exportItems.map((item) => {
      return [
        item.id,
        item.title,
        item.description,
        item.category,
        item.status,
        item.users?.name || "",
        formatDate(item.created_at),
      ]
        .map(toCsvValue)
        .join(",");
    });

    const header = [
      "id",
      "title",
      "description",
      "category",
      "status",
      "user_name",
      "created_at",
    ]
      .map(toCsvValue)
      .join(",");

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const dateStamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `pengaduan-admin-${dateStamp}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    showSuccess("Export CSV berhasil diunduh.");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}

async function submitFeedback() {
  if (!selectedComplaintId.value || !feedbackMessage.value.trim()) {
    showError("Pilih aduan dan isi feedback terlebih dahulu.");
    return;
  }

  openLoading("Mengirim feedback...");

  try {
    await feedbackStore.addFeedback({
      complaint_id: selectedComplaintId.value,
      message: feedbackMessage.value.trim(),
    });

    await loadTable();
    feedbackMessage.value = "";
    selectedComplaintId.value = "";
    showSuccess("Feedback berhasil dikirim");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}
</script>

<template>
  <section class="space-y-4">
    <article class="admin-panel p-5">
      <h3 class="text-lg font-semibold text-slate-900">Filter Pengaduan</h3>

      <div class="mt-4 flex flex-wrap items-center gap-3">
        <Button
          severity="primary"
          label="Buka Filter"
          icon="pi pi-sliders-h"
          @click="openFilterDialog"
        />
        <Button
          outlined
          severity="primary"
          label="Export CSV"
          icon="pi pi-download"
          @click="exportCsv"
        />
        <Button
          outlined
          severity="secondary"
          label="Reset Filter"
          icon="pi pi-refresh"
          :disabled="!hasActiveFilter"
          @click="resetFilter"
        />
      </div>

      <p class="mt-3 text-xs text-slate-500">
        Aktif: {{ groupedSummary.activeDate }} |
        {{ groupedSummary.activeMonth }} | {{ groupedSummary.activeUser }} |
        {{ groupedSummary.activeCategory }}
      </p>
    </article>

    <article class="admin-panel p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold text-slate-900">Daftar Pengaduan</h3>
          <p class="mt-1 text-sm text-slate-500">
            Cari dan urutkan data pengaduan dengan cepat.
          </p>
        </div>

        <Button
          outlined
          severity="primary"
          label="Cari & Urutkan"
          icon="pi pi-search"
          @click="openFilterDialog"
        />
      </div>

      <p v-if="loading || tableBusy" class="mt-3 text-sm text-slate-500">
        Memuat daftar pengaduan...
      </p>

      <div v-if="loading || tableBusy" class="mt-4 overflow-auto">
        <table class="min-w-full text-left text-sm">
          <thead
            class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"
          >
            <tr>
              <th class="rounded-l-xl px-3 py-3">Judul</th>
              <th class="px-3 py-3">User</th>
              <th class="px-3 py-3">Kategori</th>
              <th class="px-3 py-3">Status</th>
              <th class="px-3 py-3">Dibuat</th>
              <th class="px-3 py-3">Direspon</th>
              <th class="px-3 py-3">Selesai</th>
              <th class="rounded-r-xl px-3 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="n in listMeta.pageSize"
              :key="`skeleton-${n}`"
              class="border-b border-slate-100"
            >
              <td class="px-3 py-3">
                <div class="h-4 w-44 animate-pulse rounded bg-slate-200"></div>
                <div
                  class="mt-2 h-3 w-64 animate-pulse rounded bg-slate-100"
                ></div>
              </td>
              <td class="px-3 py-3">
                <div class="h-4 w-24 animate-pulse rounded bg-slate-200"></div>
              </td>
              <td class="px-3 py-3">
                <div class="h-4 w-20 animate-pulse rounded bg-slate-200"></div>
              </td>
              <td class="px-3 py-3">
                <div
                  class="h-5 w-20 animate-pulse rounded-full bg-slate-200"
                ></div>
              </td>
              <td class="px-3 py-3">
                <div class="h-4 w-24 animate-pulse rounded bg-slate-200"></div>
              </td>
              <td class="px-3 py-3">
                <div class="h-4 w-24 animate-pulse rounded bg-slate-200"></div>
              </td>
              <td class="px-3 py-3">
                <div class="h-4 w-24 animate-pulse rounded bg-slate-200"></div>
              </td>
              <td class="px-3 py-3">
                <div class="h-6 w-28 animate-pulse rounded bg-slate-200"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="items.length" class="mt-4 overflow-auto">
        <table class="min-w-full text-left text-sm">
          <thead
            class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"
          >
            <tr>
              <th class="rounded-l-xl px-3 py-3">Judul</th>
              <th class="px-3 py-3">User</th>
              <th class="px-3 py-3">Kategori</th>
              <th class="px-3 py-3">Status</th>
              <th class="px-3 py-3">Dibuat</th>
              <th class="px-3 py-3">Direspon</th>
              <th class="px-3 py-3">Selesai</th>
              <th class="rounded-r-xl px-3 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in items"
              :key="item.id"
              class="border-b border-slate-100"
            >
              <td class="px-3 py-3">
                <p class="font-medium text-slate-800">{{ item.title }}</p>
                <p class="line-clamp-2 text-xs text-slate-500">
                  {{ item.description }}
                </p>
              </td>
              <td class="px-3 py-3">{{ item.users?.name || "-" }}</td>
              <td class="px-3 py-3">{{ item.category }}</td>
              <td class="px-3 py-3"><StatusBadge :status="item.status" /></td>
              <td class="px-3 py-3 text-xs text-slate-600">
                {{ formatDate(item.created_at) }}
              </td>
              <td class="px-3 py-3 text-xs text-slate-600">
                {{
                  item.first_response_at
                    ? formatDate(item.first_response_at)
                    : "-"
                }}
              </td>
              <td class="px-3 py-3 text-xs text-slate-600">
                {{ item.completed_at ? formatDate(item.completed_at) : "-" }}
              </td>
              <td class="px-3 py-3">
                <div class="flex flex-wrap items-center gap-2">
                  <RouterLink
                    :to="`/admin/complaints/${item.id}`"
                    class="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    <i class="pi pi-eye"></i>
                    Detail
                  </RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-else
        class="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center"
      >
        <p class="text-sm font-semibold text-slate-700">
          Tidak ada data pengaduan ditemukan
        </p>
        <p class="mt-1 text-xs text-slate-500">
          {{
            hasActiveFilter
              ? "Coba ubah kata kunci, filter, atau urutan data."
              : "Belum ada pengaduan yang masuk saat ini."
          }}
        </p>
        <Button
          v-if="hasActiveFilter"
          outlined
          severity="secondary"
          size="small"
          label="Reset Filter"
          class="mt-3"
          @click="resetFilter"
        />
      </div>

      <div
        class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"
      >
        <p class="text-xs text-slate-500">
          Halaman {{ listMeta.page }} dari {{ totalPages }} • Menampilkan
          {{ items.length }} dari {{ listMeta.total }} data
        </p>

        <div class="flex items-center gap-2">
          <Button
            outlined
            size="small"
            severity="secondary"
            label="Sebelumnya"
            :disabled="listMeta.page === 1"
            @click="prevPage"
          />
          <Button
            outlined
            size="small"
            severity="secondary"
            label="Berikutnya"
            :disabled="listMeta.page === totalPages"
            @click="nextPage"
          />
        </div>
      </div>
    </article>

    <Dialog
      v-model:visible="filterDialogVisible"
      modal
      header="Atur Filter & Pencarian"
      :style="{ width: 'min(56rem, 96vw)' }"
    >
      <div class="grid gap-3 md:grid-cols-2">
        <label class="admin-input space-y-1 text-sm">
          <span class="text-slate-600">Tanggal</span>
          <DatePicker
            v-model="selectedDate"
            input-id="admin-filter-date"
            show-icon
            fluid
            date-format="dd/mm/yy"
            placeholder="Pilih tanggal"
            :maxDate="maxDate"
          />
        </label>

        <label class="admin-input space-y-1 text-sm">
          <span class="text-slate-600">Bulan</span>
          <DatePicker
            v-model="selectedMonth"
            input-id="admin-filter-month"
            show-icon
            view="month"
            date-format="mm/yy"
            fluid
            placeholder="Pilih bulan"
            :maxDate="maxDate"
          />
        </label>

        <label class="admin-input space-y-1 text-sm">
          <span class="text-slate-600">User</span>
          <Select
            v-model="formFilters.userId"
            :options="userOptions"
            option-label="name"
            option-value="id"
            placeholder="Semua user"
            filter
            filter-placeholder="Cari user"
            fluid
          />
        </label>

        <label class="admin-input space-y-1 text-sm">
          <span class="text-slate-600">Kategori</span>
          <Select
            v-model="formFilters.category"
            :options="categoryOptions"
            option-label="label"
            option-value="value"
            placeholder="Semua kategori"
            filter
            filter-placeholder="Cari kategori"
            fluid
          />
        </label>

        <label class="admin-input space-y-1 text-sm md:col-span-2">
          <span class="text-slate-600">Cari</span>
          <InputText
            v-model="searchTerm"
            placeholder="Cari judul, deskripsi, nama user, kategori, status"
            class="w-full"
          />
        </label>

        <label class="admin-input space-y-1 text-sm">
          <span class="text-slate-600">Urutkan berdasarkan</span>
          <Select
            v-model="sortBy"
            :options="sortByOptions"
            option-label="label"
            option-value="value"
            filter
            filter-placeholder="Cari urutan"
            fluid
          />
        </label>

        <label class="admin-input space-y-1 text-sm">
          <span class="text-slate-600">Arah urutan</span>
          <Select
            v-model="sortDirection"
            :options="sortDirectionOptions"
            option-label="label"
            option-value="value"
            filter
            filter-placeholder="Cari arah"
            fluid
          />
        </label>
      </div>

      <template #footer>
        <div class="flex flex-wrap justify-end gap-2">
          <Button
            outlined
            severity="secondary"
            label="Reset"
            icon="pi pi-refresh"
            @click="resetFilter"
          />
          <Button
            severity="primary"
            label="Terapkan"
            icon="pi pi-check"
            @click="applyFilterAndClose"
          />
        </div>
      </template>
    </Dialog>
  </section>
</template>
