<script setup>
import { reactive } from "vue";
import { useRouter, RouterLink } from "vue-router";
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

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  email: "",
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
  <div>
    <h2 class="text-2xl font-bold text-white">Masuk</h2>
    <p class="mt-1 text-sm text-slate-400">
      Masukkan akun Anda untuk mengakses dashboard.
    </p>

    <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
      <label class="auth-input block space-y-2 text-sm">
        <span>Email</span>
        <InputText
          v-model="form.email"
          type="email"
          required
          placeholder="nama@sekolah.sch.id"
          class="w-full"
        />
      </label>

      <label class="auth-input block space-y-2 text-sm">
        <span>Password</span>
        <Password
          v-model="form.password"
          toggle-mask
          :feedback="false"
          required
          minlength="6"
          input-class="w-full"
          class="w-full"
        />
      </label>

      <Button type="submit" label="Masuk" class="w-full" />
    </form>

    <p class="mt-5 text-center text-sm text-slate-400">
      Belum punya akun?
      <RouterLink
        to="/register"
        class="font-semibold text-blue-300 hover:text-blue-200"
        >Daftar di sini</RouterLink
      >
    </p>
  </div>
</template>
