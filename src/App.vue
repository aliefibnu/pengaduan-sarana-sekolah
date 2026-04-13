<script setup>
import { RouterView } from "vue-router";
import { onBeforeMount } from "vue";
import { useThemeStore } from "@/stores/themeStore";

const themeStore = useThemeStore();

onBeforeMount(() => {
  themeStore.initTheme();
});
</script>

<template>
  <RouterView />
</template>
