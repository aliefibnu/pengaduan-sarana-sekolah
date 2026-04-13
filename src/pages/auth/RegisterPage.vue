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
  name: "",
  email: "",
  password: "",
});

async function handleSubmit() {
  openLoading("Mendaftarkan akun...");

  try {
    await authStore.signUp({
      ...form,
      role: "siswa",
    });

    showSuccess("Registrasi berhasil. Akun siap digunakan.");
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
    <h2 class="text-2xl font-bold text-white">Registrasi Siswa</h2>
    <p class="mt-1 text-sm text-slate-400">
      Isi data dengan benar untuk membuat akun siswa.
    </p>

    <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
      <label class="auth-input block space-y-2 text-sm">
        <span>Nama lengkap</span>
        <InputText v-model="form.name" type="text" required class="w-full" />
      </label>

      <label class="auth-input block space-y-2 text-sm">
        <span>Email</span>
        <InputText v-model="form.email" type="email" required class="w-full" />
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

      <Button type="submit" label="Buat Akun" class="w-full" />
    </form>

    <p class="mt-5 text-center text-sm text-slate-400">
      Sudah punya akun?
      <RouterLink
        to="/login"
        class="font-semibold text-blue-300 hover:text-blue-200"
        >Masuk sekarang</RouterLink
      >
    </p>
  </div>
</template>
