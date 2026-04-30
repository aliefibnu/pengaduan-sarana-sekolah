<template>
  <div class="flex items-center gap-2">
    <!-- Icon + Text Pair -->
    <component
      v-if="icon"
      :is="icon"
      :size="iconSize"
      class="flex-shrink-0"
      :class="iconClass"
    />

    <!-- Status Badge with Icon -->
    <span
      v-if="isStatus"
      class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold"
      :class="getStatusClasses(value)"
    >
      <component :is="getStatusIcon(value)" :size="14" />
      {{ formatStatusLabel(value) }}
    </span>

    <!-- Metadata Chip (Icon + Count) -->
    <span
      v-else-if="isMeta"
      class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
    >
      <component :is="icon" :size="12" />
      {{ value }}
    </span>

    <!-- Regular Text -->
    <span v-else class="text-slate-900">{{ value }}</span>
  </div>
</template>

<script setup>
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Image,
  MessageSquareText,
  TrendingUp,
} from "lucide-vue-next";

const props = defineProps({
  value: {
    type: [String, Number, Boolean],
    required: true,
  },
  icon: {
    type: [Object, null],
    default: null,
  },
  iconSize: {
    type: Number,
    default: 16,
  },
  iconClass: {
    type: String,
    default: "text-slate-700",
  },
  isStatus: {
    type: Boolean,
    default: false,
  },
  isMeta: {
    type: Boolean,
    default: false,
  },
});

const getStatusIcon = (status) => {
  const statusMap = {
    completed: CheckCircle2,
    selesai: CheckCircle2,
    done: CheckCircle2,
    processing: Clock,
    proses: Clock,
    pending: AlertCircle,
    ditunda: AlertCircle,
    rejected: XCircle,
    ditolak: XCircle,
    failed: XCircle,
    gagal: XCircle,
  };
  return statusMap[String(status).toLowerCase()] || AlertCircle;
};

const getStatusClasses = (status) => {
  const lowerStatus = String(status).toLowerCase();

  // Positive / completed — green
  if (["completed", "selesai", "done"].includes(lowerStatus)) {
    return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  // Processing — blue/teal
  if (["processing", "proses"].includes(lowerStatus)) {
    return "border border-sky-200 bg-sky-50 text-sky-700";
  }

  // Pending / waiting — amber
  if (["pending", "ditunda"].includes(lowerStatus)) {
    return "border border-amber-200 bg-amber-50 text-amber-800";
  }

  // Rejected / failed — red
  if (["rejected", "ditolak", "failed", "gagal"].includes(lowerStatus)) {
    return "border border-rose-200 bg-rose-50 text-rose-700";
  }

  // Fallback: neutral slate
  return "border border-slate-300 bg-slate-50 text-slate-700";
};

const formatStatusLabel = (status) => {
  const labelMap = {
    completed: "Selesai",
    selesai: "Selesai",
    done: "Selesai",
    processing: "Proses",
    proses: "Proses",
    pending: "Ditunda",
    ditunda: "Ditunda",
    rejected: "Ditolak",
    ditolak: "Ditolak",
    failed: "Gagal",
    gagal: "Gagal",
  };
  return labelMap[String(status).toLowerCase()] || status;
};
</script>
