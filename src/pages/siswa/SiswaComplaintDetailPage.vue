<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import StatusBadge from "@/components/StatusBadge.vue";
import { useComplaintStore } from "@/stores/complaintStore";
import { useFeedbackStore } from "@/stores/feedbackStore";
import { formatDate } from "@/utils/format";
import { showError } from "@/utils/notifications";

const route = useRoute();
const complaintStore = useComplaintStore();
const feedbackStore = useFeedbackStore();
const { selected, loading } = storeToRefs(complaintStore);
const { items: feedbacks } = storeToRefs(feedbackStore);

onMounted(async () => {
  try {
    await complaintStore.loadDetail(route.params.id);
    await feedbackStore.loadByComplaintId(route.params.id);
  } catch (error) {
    showError(error.message);
  }
});
</script>

<template>
  <section class="space-y-4">
    <article class="rounded-2xl bg-white p-5 shadow-sm">
      <p v-if="loading" class="text-sm text-slate-500">Memuat detail...</p>

      <div v-else-if="selected" class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-lg font-semibold text-slate-900">
            {{ selected.title }}
          </h3>
          <StatusBadge :status="selected.status" />
        </div>

        <p class="text-sm text-slate-500">
          {{ formatDate(selected.created_at) }} • {{ selected.category }}
        </p>
        <p class="text-sm leading-relaxed text-slate-700">
          {{ selected.description }}
        </p>

        <img
          v-if="selected.image_url"
          :src="selected.image_url"
          alt="Bukti pengaduan"
          class="max-h-72 w-full rounded-2xl object-cover"
        />
      </div>
    </article>

    <article class="rounded-2xl bg-white p-5 shadow-sm">
      <h4 class="text-base font-semibold text-slate-900">Feedback Admin</h4>

      <div v-if="feedbacks.length" class="mt-3 space-y-2">
        <div
          v-for="item in feedbacks"
          :key="item.id"
          class="rounded-xl border border-slate-200 bg-slate-50 p-3"
        >
          <p class="text-sm text-slate-700">{{ item.message }}</p>
          <p class="mt-1 text-xs text-slate-500">
            {{ formatDate(item.created_at) }}
          </p>
        </div>
      </div>

      <p v-else class="mt-3 text-sm text-slate-500">
        Belum ada feedback dari admin.
      </p>
    </article>
  </section>
</template>
