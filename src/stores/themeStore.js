import { computed, ref } from "vue";
import { defineStore } from "pinia";

const STORAGE_KEY = "pengaduan-theme-mode";

export const useThemeStore = defineStore("theme", () => {
  const mode = ref("light");
  const initialized = ref(false);

  const isDark = computed(() => mode.value === "dark");
  const isLight = computed(() => mode.value === "light");

  function applyMode(nextMode) {
    mode.value = nextMode === "dark" ? "dark" : "light";

    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("app-dark", isDark.value);
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, mode.value);
    }
  }

  function initTheme() {
    if (initialized.value) return;

    const savedMode =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;

    applyMode(savedMode === "dark" ? "dark" : "light");
    initialized.value = true;
  }

  function toggleTheme() {
    applyMode(isDark.value ? "light" : "dark");
  }

  return {
    mode,
    initialized,
    isDark,
    isLight,
    initTheme,
    toggleTheme,
  };
});
