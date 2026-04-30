<script setup>
import { RouterLink } from "vue-router";

defineProps({
  title: {
    type: String,
    required: true,
  },
  menus: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <aside
    class="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 lg:w-72"
  >
    <div class="mb-6">
      <p
        class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
      >
        Dashboard
      </p>
      <h1 class="mt-2 text-lg font-bold text-slate-900">{{ title }}</h1>
    </div>

    <nav class="space-y-2">
      <RouterLink
        v-for="menu in menus"
        :key="menu.to"
        :to="menu.to"
        class="block rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        active-class="bg-slate-100 text-slate-900"
      >
        {{ menu.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
