<script setup>
import { reactive } from "vue";
import { RouterLink, useRouter } from "vue-router";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import { useAuthStore } from "@/stores/authStore";
import {
  closeLoading,
  openLoading,
  showError,
  showSuccess,
} from "@/utils/notifications";
import { User, Lock, LogIn, ArrowLeft } from "lucide-vue-next";

const NIS_REGEX = /^\d{1,8}$/;

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  identity: "",
  password: "",
});

async function handleSubmit() {
  const identity = form.identity.trim();

  if (!identity) {
    showError("NIS siswa atau username admin wajib diisi.");
    return;
  }

  if (/^\d+$/.test(identity) && !NIS_REGEX.test(identity)) {
    showError("NIS siswa maksimal 8 digit angka.");
    return;
  }

  form.identity = identity;
  openLoading("Login akun...");

  try {
    const result = await authStore.signIn(form);
    const role = result?.user?.user_metadata?.role || "siswa";

    showSuccess("Login berhasil");

    if (role === "admin") {
      router.replace("/admin");
      return;
    }

    router.replace("/siswa");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}
</script>

<template>
  <div class="w-full space-y-6">
    <!-- Back Button -->
    <RouterLink
      to="/"
      class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <ArrowLeft :size="18" />
      Kembali ke Beranda
    </RouterLink>

    <!-- Header -->
    <div class="space-y-2">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-linear-to-br from-teal-500 to-teal-600 p-2">
          <LogIn :size="24" class="text-white" />
        </div>
        <h2 class="text-3xl font-bold text-white">Masuk Sistem</h2>
      </div>
      <p class="text-sm text-slate-400">
        Masukkan kredensial Anda untuk mengakses dashboard pengaduan sarana
        sekolah.
      </p>
    </div>

    <!-- Form -->
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <!-- NIS/Username Input -->
      <label class="auth-input block space-y-2">
        <div class="flex items-center gap-2">
          <User :size="18" class="text-teal-600" />
          <span class="font-semibold text-slate-900">NIS / Username</span>
          <span class="text-red-500">*</span>
        </div>
        <InputText
          v-model="form.identity"
          type="text"
          required
          placeholder="Masukkan NIS 8 digit siswa atau username admin"
          inputmode="text"
          class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-500 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        />
        <p class="text-xs text-slate-600">
          Gunakan NIS 8 digit untuk siswa atau username untuk admin
        </p>
      </label>

      <!-- Password Input -->
      <label class="auth-input block space-y-2">
        <div class="flex items-center gap-2">
          <Lock :size="18" class="text-teal-600" />
          <span class="font-semibold text-slate-900">Password</span>
          <span class="text-red-500">*</span>
        </div>
        <Password
          v-model="form.password"
          toggle-mask
          :feedback="false"
          required
          minlength="6"
          input-class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900"
          class="w-full"
        />
        <p class="text-xs text-slate-600">Minimal 6 karakter</p>
      </label>

      <!-- Submit Button -->
      <Button
        type="submit"
        label="Masuk Sekarang"
        class="w-full rounded-lg bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700"
      />
    </form>

    <!-- Info Banner moved to about section in AuthLayout -->
  </div>
</template>
