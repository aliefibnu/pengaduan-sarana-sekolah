<script setup>
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import ComplaintCard from "@/components/ComplaintCard.vue";
import { useAuthStore } from "@/stores/authStore";
import { useComplaintStore } from "@/stores/complaintStore";
import { showError } from "@/utils/notifications";

const authStore = useAuthStore();
const complaintStore = useComplaintStore();
const { items, statusCount, loading } = storeToRefs(complaintStore);

const latestThree = computed(() => items.value.slice(0, 3));

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
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-2xl bg-white p-4 shadow-sm">
        <p class="text-xs text-slate-500">Total laporan</p>
        <p class="mt-1 text-2xl font-bold text-slate-900">
          {{ statusCount.total }}
        </p>
      </article>
      <article class="rounded-2xl bg-white p-4 shadow-sm">
        <p class="text-xs text-slate-500">Menunggu</p>
        <p class="mt-1 text-2xl font-bold text-slate-900">
          {{ statusCount.pending }}
        </p>
      </article>
      <article class="rounded-2xl bg-white p-4 shadow-sm">
        <p class="text-xs text-slate-500">Diproses</p>
        <p class="mt-1 text-2xl font-bold text-slate-900">
          {{ statusCount.process }}
        </p>
      </article>
      <article class="rounded-2xl bg-white p-4 shadow-sm">
        <p class="text-xs text-slate-500">Selesai</p>
        <p class="mt-1 text-2xl font-bold text-slate-900">
          {{ statusCount.done }}
        </p>
      </article>
    </div>

    <div class="rounded-2xl bg-white p-5 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-slate-900">Pengaduan Terbaru</h3>
        <RouterLink
          to="/siswa/new"
          class="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
        >
          + Buat Pengaduan
        </RouterLink>
      </div>

      <p v-if="loading" class="text-sm text-slate-500">Memuat data...</p>

      <div
        v-else-if="latestThree.length"
        class="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
      >
        <ComplaintCard
          v-for="item in latestThree"
          :key="item.id"
          :complaint="item"
          :to="`/siswa/history/${item.id}`"
        />
      </div>

      <p v-else class="text-sm text-slate-500">
        Belum ada pengaduan. Mulai kirim laporan agar fasilitas sekolah bisa
        segera ditindaklanjuti.
      </p>
    </div>
  </section>
</template>
