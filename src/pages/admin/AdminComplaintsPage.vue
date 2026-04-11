<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import StatusBadge from "@/components/StatusBadge.vue";
import { useComplaintStore } from "@/stores/complaintStore";
import { useFeedbackStore } from "@/stores/feedbackStore";
import { fetchUsers } from "@/services/userService";
import { formatDate, monthLabel } from "@/utils/format";
import {
  closeLoading,
  confirmAction,
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

async function onChangeStatus(item, status) {
  if (item.status === status) {
    return;
  }

  if (item.status === "done" && status !== "done") {
    const downgradeConfirmed = await confirmAction({
      title: "Turunkan status dari selesai?",
      message:
        "Pengaduan sudah selesai. Pastikan ada alasan kuat sebelum mengubah kembali.",
      okText: "Lanjutkan",
      cancelText: "Batalkan",
    });

    if (!downgradeConfirmed) return;
  }

  const confirmed = await confirmAction({
    title: "Update status?",
    message: "Perubahan status akan langsung terlihat oleh siswa.",
    okText: "Update",
  });

  if (!confirmed) return;

  openLoading("Mengubah status...");

  try {
    await complaintStore.changeStatus({ complaintId: item.id, status });
    await loadTable();
    showSuccess("Status pengaduan diperbarui");
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
    <article class="rounded-2xl bg-white p-5 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">Filter Pengaduan</h3>

      <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label class="space-y-1 text-sm">
          <span class="text-slate-600">Tanggal</span>
          <input
            v-model="formFilters.date"
            type="date"
            class="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>

        <label class="space-y-1 text-sm">
          <span class="text-slate-600">Bulan</span>
          <input
            v-model="formFilters.month"
            type="month"
            class="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>

        <label class="space-y-1 text-sm">
          <span class="text-slate-600">User</span>
          <select
            v-model="formFilters.userId"
            class="w-full rounded-xl border border-slate-200 px-3 py-2"
          >
            <option value="">Semua user</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </label>

        <label class="space-y-1 text-sm">
          <span class="text-slate-600">Kategori</span>
          <select
            v-model="formFilters.category"
            class="w-full rounded-xl border border-slate-200 px-3 py-2"
          >
            <option value="">Semua kategori</option>
            <option v-for="category in categories" :key="category">
              {{ category }}
            </option>
          </select>
        </label>
      </div>

      <button
        type="button"
        class="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        @click="applyFilter"
      >
        Terapkan Filter
      </button>

      <p class="mt-3 text-xs text-slate-500">
        Aktif: {{ groupedSummary.activeDate }} |
        {{ groupedSummary.activeMonth }} | {{ groupedSummary.activeUser }} |
        {{ groupedSummary.activeCategory }}
      </p>
    </article>

    <article class="rounded-2xl bg-white p-5 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">Daftar Pengaduan</h3>
      <div class="mt-4 flex flex-wrap items-center gap-3">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Cari judul, deskripsi, nama user, kategori, status"
          class="min-w-[260px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
          @click="exportCsv"
        >
          Export CSV
        </button>

        <select
          v-model="sortBy"
          class="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="created_at">Urutkan: Tanggal</option>
          <option value="status">Urutkan: Status</option>
          <option value="category">Urutkan: Kategori</option>
          <option value="title">Urutkan: Judul</option>
        </select>

        <select
          v-model="sortDirection"
          class="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="desc">Terbaru / Z-A</option>
          <option value="asc">Terlama / A-Z</option>
        </select>
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
              <th class="px-3 py-3">Tanggal</th>
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
                <div class="h-4 w-28 animate-pulse rounded bg-slate-200"></div>
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
              <th class="px-3 py-3">Tanggal</th>
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
              <td class="px-3 py-3">
                <div class="flex flex-wrap items-center gap-2">
                  <select
                    class="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    :value="item.status"
                    @change="onChangeStatus(item, $event.target.value)"
                  >
                    <option value="pending">Menunggu</option>
                    <option value="process">Diproses</option>
                    <option value="done">Selesai</option>
                  </select>

                  <RouterLink
                    :to="`/admin/complaints/${item.id}`"
                    class="rounded-lg border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                  >
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
        <button
          v-if="hasActiveFilter"
          type="button"
          class="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          @click="resetFilter"
        >
          Reset Filter
        </button>
      </div>

      <div
        class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"
      >
        <p class="text-xs text-slate-500">
          Halaman {{ listMeta.page }} dari {{ totalPages }} • Menampilkan
          {{ items.length }} dari {{ listMeta.total }} data
        </p>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="listMeta.page === 1"
            @click="prevPage"
          >
            Sebelumnya
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="listMeta.page === totalPages"
            @click="nextPage"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </article>

    <article class="rounded-2xl bg-white p-5 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">Kirim Feedback Admin</h3>

      <div class="mt-4 grid gap-3 md:grid-cols-[1fr_2fr]">
        <select
          v-model="selectedComplaintId"
          class="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Pilih pengaduan</option>
          <option v-for="item in items" :key="item.id" :value="item.id">
            {{ item.title }} - {{ item.users?.name || "-" }}
          </option>
        </select>

        <textarea
          v-model="feedbackMessage"
          rows="3"
          placeholder="Tuliskan progres perbaikan atau informasi tindak lanjut"
          class="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        ></textarea>
      </div>

      <button
        type="button"
        class="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        @click="submitFeedback"
      >
        Kirim Feedback
      </button>
    </article>
  </section>
</template>
