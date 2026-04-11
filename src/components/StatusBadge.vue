<script setup>
import { computed } from "vue";

const props = defineProps({
  status: {
    type: String,
    default: "pending",
  },
});

const classes = computed(() => {
  if (props.status === "done") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }

  if (props.status === "process") {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }

  return "bg-slate-100 text-slate-800 border-slate-200";
});

const label = computed(() => {
  if (props.status === "done") return "Selesai";
  if (props.status === "process") return "Diproses";
  return "Menunggu";
});
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
    :class="classes"
  >
    {{ label }}
  </span>
</template>
