<script setup>
import { RouterLink } from "vue-router";
import { ImageIcon, MessageSquareText } from "lucide-vue-next";
import StatusBadge from "@/components/StatusBadge.vue";
import { formatDate } from "@/utils/format";

defineProps({
  complaint: {
    type: Object,
    required: true,
  },
  to: {
    type: [String, Object],
    default: "",
  },
});
</script>

<template>
  <article
    class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
  >
    <div class="mb-3 flex items-start justify-between gap-3">
      <div>
        <h3 class="text-base font-semibold text-slate-900">
          {{ complaint.title }}
        </h3>
        <p class="text-xs text-slate-500">
          {{ formatDate(complaint.created_at) }}
        </p>
      </div>
      <StatusBadge :status="complaint.status" />
    </div>

    <p class="line-clamp-3 text-sm text-slate-700">
      {{ complaint.description }}
    </p>

    <div class="mt-4 flex flex-wrap items-center gap-2 text-xs">
      <span
        class="rounded-lg bg-blue-50 px-2.5 py-1 font-medium text-blue-700"
        >{{ complaint.category }}</span
      >
      <span
        v-if="complaint.image_url"
        class="inline-flex items-center gap-1 text-slate-500"
      >
        <ImageIcon class="h-3.5 w-3.5" />
        Foto terlampir
      </span>
      <span
        v-if="complaint.feedbacks?.length"
        class="inline-flex items-center gap-1 text-slate-500"
      >
        <MessageSquareText class="h-3.5 w-3.5" />
        {{ complaint.feedbacks.length }} feedback
      </span>
    </div>

    <RouterLink
      v-if="to"
      :to="to"
      class="mt-4 inline-flex rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
    >
      Lihat detail
    </RouterLink>
  </article>
</template>
