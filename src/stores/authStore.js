import { computed, ref } from "vue";
import { defineStore } from "pinia";
import {
  getSession,
  loginWithEmail,
  logout,
  onAuthStateChange,
  registerWithEmail,
} from "@/services/authService";

export const useAuthStore = defineStore("auth", () => {
  const session = ref(null);
  const user = ref(null);
  const role = ref("guest");
  const profileName = ref("");
  const loading = ref(false);
  const initialized = ref(false);
  let unsubscribe = null;

  const isAuthenticated = computed(() => Boolean(user.value));
  const isAdmin = computed(() => role.value === "admin");
  const isSiswa = computed(() => role.value === "siswa");

  function hydrateFromSession(value) {
    session.value = value;
    user.value = value?.user || null;
    role.value = value?.user?.user_metadata?.role || "guest";
    profileName.value =
      value?.user?.user_metadata?.name || value?.user?.email || "";
  }

  async function initAuth() {
    if (initialized.value) return;
    loading.value = true;

    try {
      const existing = await getSession();
      hydrateFromSession(existing);
      const listener = onAuthStateChange((nextSession) => {
        hydrateFromSession(nextSession);
      });

      unsubscribe = () => listener?.data?.subscription?.unsubscribe();
      initialized.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function signIn(payload) {
    loading.value = true;
    try {
      const data = await loginWithEmail(payload);
      hydrateFromSession(data.session);
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function signUp(payload) {
    loading.value = true;
    try {
      const data = await registerWithEmail(payload);
      hydrateFromSession(data.session);
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function signOut() {
    loading.value = true;
    try {
      await logout();
      hydrateFromSession(null);
    } finally {
      loading.value = false;
    }
  }

  function $disposeAuth() {
    unsubscribe?.();
  }

  return {
    session,
    user,
    role,
    profileName,
    loading,
    initialized,
    isAuthenticated,
    isAdmin,
    isSiswa,
    initAuth,
    signIn,
    signUp,
    signOut,
    $disposeAuth,
  };
});
