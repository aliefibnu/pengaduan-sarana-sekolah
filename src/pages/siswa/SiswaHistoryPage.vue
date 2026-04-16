<script setup>
import { computed, onMounted, reactive } from "vue";
import { storeToRefs } from "pinia";
import Select from "primevue/select";
import ComplaintCard from "@/components/ComplaintCard.vue";
import { useAuthStore } from "@/stores/authStore";
import { useComplaintStore } from "@/stores/complaintStore";
import { showError } from "@/utils/notifications";

const authStore = useAuthStore();
const complaintStore = useComplaintStore();
const { items, loading } = storeToRefs(complaintStore);

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

const categoryOptions = [
  { label: "Semua kategori", value: "" },
  { label: "Kelas", value: "Kelas" },
  { label: "Toilet", value: "Toilet" },
  { label: "Laboratorium", value: "Laboratorium" },
  { label: "Perpustakaan", value: "Perpustakaan" },
  { label: "Lapangan", value: "Lapangan" },
  { label: "Lainnya", value: "Lainnya" },
];

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    if (localFilters.status && item.status !== localFilters.status)
      return false;
    if (localFilters.category && item.category !== localFilters.category)
      return false;
    return true;
  });
});

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
  <section class="space-y-4">
    <div class="rounded-2xl bg-white p-5 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">Riwayat Pengaduan</h3>
      <p class="mt-1 text-sm text-slate-500">
        Lihat perjalanan aduan kamu di sini.
      </p>

      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <label class="admin-input space-y-1 text-sm">
          <span class="text-slate-600">Status</span>
          <Select
            v-model="localFilters.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            placeholder="Semua status"
            filter
            filter-placeholder="Cari status"
            fluid
          />
        </label>

        <label class="admin-input space-y-1 text-sm">
          <span class="text-slate-600">Kategori</span>
          <Select
            v-model="localFilters.category"
            :options="categoryOptions"
            option-label="label"
            option-value="value"
            placeholder="Semua kategori"
            filter
            filter-placeholder="Cari kategori"
            fluid
          />
        </label>
      </div>
    </div>

    <div class="rounded-2xl bg-white p-5 shadow-sm">
      <p v-if="loading" class="text-sm text-slate-500">Memuat riwayat...</p>

      <div
        v-else-if="filteredItems.length"
        class="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
      >
        <ComplaintCard
          v-for="item in filteredItems"
          :key="item.id"
          :complaint="item"
          :to="`/siswa/history/${item.id}`"
        />
      </div>

      <p v-else class="text-sm text-slate-500">
        Belum ada aduan yang cocok.
      </p>
    </div>
  </section>
</template>
