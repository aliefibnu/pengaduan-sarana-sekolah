<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import {
  CheckCircle2,
  Clock3,
  ImageIcon,
  MessageSquareText,
  TrendingUp,
} from "lucide-vue-next";
import StatusBadge from "@/components/StatusBadge.vue";
import { formatDate } from "@/utils/format";

const props = defineProps({
  complaint: {
    type: Object,
    required: true,
  },
  to: {
    type: [String, Object],
    default: "",
  },
});

const latestFeedback = computed(() => {
  const feedbacks = props.complaint.feedbacks || [];
  if (!feedbacks.length) return null;

  return feedbacks.reduce((latest, current) => {
    if (!latest) return current;
    return new Date(current.created_at) > new Date(latest.created_at)
      ? current
      : latest;
  }, null);
});

const latestTimelineProgress = computed(() => {
  if (props.complaint.status === "done") return 100;

  const value = latestFeedback.value?.progress_percentage;
  return value === null || value === undefined ? null : value;
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
        class="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700"
        >{{ complaint.category }}</span
      >
      <span
        v-if="complaint.image_url"
        class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600"
      >
        <ImageIcon class="h-3.5 w-3.5" />
        1
      </span>
      <span
        v-if="complaint.feedbacks?.length"
        class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600"
      >
        <MessageSquareText class="h-3.5 w-3.5" />
        {{ complaint.feedbacks.length }}
      </span>
      <span
        v-if="latestTimelineProgress !== null"
        class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700"
      >
        <TrendingUp class="h-3.5 w-3.5" />
        {{ latestTimelineProgress }}%
      </span>
    </div>

    <div
      v-if="complaint.first_response_at"
      class="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 p-2"
    >
      <p
        class="inline-flex items-center gap-1 text-xs font-medium text-slate-700"
      >
        <Clock3 class="h-3.5 w-3.5" />
        Ditanggapi: {{ formatDate(complaint.first_response_at) }}
      </p>
    </div>

    <div
      v-if="complaint.completed_at"
      class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-2"
    >
      <p
        class="inline-flex items-center gap-1 text-xs font-medium text-slate-700"
      >
        <CheckCircle2 class="h-3.5 w-3.5" />
        Selesai: {{ formatDate(complaint.completed_at) }}
      </p>
    </div>

    <RouterLink
      v-if="to"
      :to="to"
      class="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
    >
      <span class="mr-1 inline-flex items-center">
        <i class="pi pi-eye"></i>
      </span>
      Lihat detail
    </RouterLink>
  </article>
</template>
