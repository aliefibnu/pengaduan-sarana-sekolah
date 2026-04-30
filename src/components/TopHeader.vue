<script setup>
import { LogOut } from "lucide-vue-next";

defineProps({
  name: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "siswa",
  },
});

defineEmits(["logout"]);
</script>

<template>
  <header
    class="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm shadow-slate-900/5"
  >
    <div>
      <p class="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
        Halo
      </p>
      <h2 class="text-lg font-semibold text-slate-900">
        {{ name || "Pengguna" }}
      </h2>
      <p class="text-sm text-slate-500">Role: {{ role }}</p>
    </div>

    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      @click="$emit('logout')"
    >
      <LogOut class="h-4 w-4" />
      Keluar
    </button>
  </header>
</template>
