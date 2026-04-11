import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const authStore = useAuthStore();
  const {
    user,
    role,
    isAuthenticated,
    isAdmin,
    isSiswa,
    profileName,
    loading,
  } = storeToRefs(authStore);

  return {
    authStore,
    user,
    role,
    isAuthenticated,
    isAdmin,
    isSiswa,
    profileName,
    loading,
  };
}
