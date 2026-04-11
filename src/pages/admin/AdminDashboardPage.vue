<script setup>
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import ComplaintCard from "@/components/ComplaintCard.vue";
import { useComplaintStore } from "@/stores/complaintStore";
import { showError } from "@/utils/notifications";

const complaintStore = useComplaintStore();
const { items, loading, statusCount } = storeToRefs(complaintStore);

const latestFour = computed(() => items.value.slice(0, 4));

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
  <section class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-2xl bg-white p-4 shadow-sm">
        <p class="text-xs text-slate-500">Total aduan</p>
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

    <article class="rounded-2xl bg-white p-5 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">Aduan Terbaru</h3>
      <p v-if="loading" class="mt-3 text-sm text-slate-500">
        Memuat data admin...
      </p>

      <div v-else-if="latestFour.length" class="mt-4 grid gap-3 md:grid-cols-2">
        <ComplaintCard
          v-for="item in latestFour"
          :key="item.id"
          :complaint="item"
          :to="`/admin/complaints`"
        />
      </div>

      <p v-else class="mt-3 text-sm text-slate-500">Belum ada aduan masuk.</p>
    </article>
  </section>
</template>
