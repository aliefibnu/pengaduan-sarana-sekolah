<script setup>
import { useRouter, RouterView } from "vue-router";
import AppSidebar from "@/components/AppSidebar.vue";
import TopHeader from "@/components/TopHeader.vue";
import { useAuthStore } from "@/stores/authStore";
import {
  closeLoading,
  confirmAction,
  openLoading,
  showError,
} from "@/utils/notifications";

const router = useRouter();
const authStore = useAuthStore();

const menus = [
  { label: "Ringkasan", to: "/siswa" },
  { label: "Buat Pengaduan", to: "/siswa/new" },
  { label: "Riwayat Pengaduan", to: "/siswa/history" },
];

async function handleLogout() {
  const confirmed = await confirmAction({
    title: "Keluar akun?",
    message: "Sesi akan diakhiri dari perangkat ini.",
  });

  if (!confirmed) return;

  openLoading("Mengakhiri sesi...");

  try {
    await authStore.signOut();
    router.replace("/login");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}
</script>

<template>
  <main class="min-h-screen bg-slate-50 p-4 lg:p-6">
    <div class="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[18rem_1fr]">
      <AppSidebar title="Portal Siswa" :menus="menus" />

      <section class="space-y-4">
        <TopHeader
          :name="authStore.profileName"
          role="siswa"
          @logout="handleLogout"
        />
        <RouterView />
      </section>
    </div>
  </main>
</template>
