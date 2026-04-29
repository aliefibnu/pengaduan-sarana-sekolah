<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
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
import { User, Lock, LogIn } from "lucide-vue-next";

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  identity: "",
  password: "",
});

async function handleSubmit() {
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
    <!-- Header -->
    <div class="space-y-2">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 p-2">
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
          placeholder="Masukkan NIS siswa atau username admin"
          inputmode="text"
          class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-500 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        />
        <p class="text-xs text-slate-600">
          Gunakan NIS untuk siswa atau username untuk admin
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

    <!-- Info Banner -->
    <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <p class="text-sm text-blue-800">
        <strong>💡 Informasi Login:</strong>
      </p>
      <ul class="mt-2 space-y-1 text-xs text-blue-700">
        <li>• Siswa: Gunakan NIS sebagai username</li>
        <li>• Admin: Gunakan username yang telah ditetapkan</li>
        <li>• Hubungi admin jika lupa password</li>
      </ul>
    </div>
  </div>
</template>
