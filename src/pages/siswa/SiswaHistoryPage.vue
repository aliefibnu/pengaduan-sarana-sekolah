<script setup>
import { computed, onMounted, reactive } from "vue";
import { storeToRefs } from "pinia";
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
        Gunakan filter untuk melihat status laporan secara cepat.
      </p>

      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <label class="space-y-1 text-sm">
          <span class="text-slate-600">Filter status</span>
          <select
            v-model="localFilters.status"
            class="w-full rounded-xl border border-slate-200 px-3 py-2"
          >
            <option value="">Semua status</option>
            <option value="pending">Menunggu</option>
            <option value="process">Diproses</option>
            <option value="done">Selesai</option>
          </select>
        </label>

        <label class="space-y-1 text-sm">
          <span class="text-slate-600">Filter kategori</span>
          <select
            v-model="localFilters.category"
            class="w-full rounded-xl border border-slate-200 px-3 py-2"
          >
            <option value="">Semua kategori</option>
            <option>Kelas</option>
            <option>Toilet</option>
            <option>Laboratorium</option>
            <option>Perpustakaan</option>
            <option>Lapangan</option>
            <option>Lainnya</option>
          </select>
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
        Tidak ada data sesuai filter saat ini.
      </p>
    </div>
  </section>
</template>
