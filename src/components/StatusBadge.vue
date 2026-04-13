<script setup>
import { computed } from "vue";
import Tag from "primevue/tag";

const props = defineProps({
  status: {
    type: String,
    default: "pending",
  },
});

const severity = computed(() => {
  if (props.status === "done") return "success";
  if (props.status === "process") return "warn";
  return "secondary";
});

const label = computed(() => {
  if (props.status === "done") return "Selesai";
  if (props.status === "process") return "Diproses";
  return "Menunggu";
});
</script>

<template>
  <Tag :value="label" :severity="severity" rounded />
</template>
