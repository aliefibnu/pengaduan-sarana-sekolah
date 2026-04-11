<script setup>
import { reactive, ref } from "vue";
import { Eye, EyeOff } from "lucide-vue-next";
import { useRouter, RouterLink } from "vue-router";
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
const showPassword = ref(false);

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
      Gunakan akun Supabase Anda untuk mengakses dashboard.
    </p>

    <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
      <label class="block space-y-2 text-sm">
        <span>Email</span>
        <input
          v-model="form.email"
          type="email"
          required
          placeholder="nama@sekolah.sch.id"
          class="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 outline-none ring-blue-500 transition focus:ring"
        />
      </label>

      <label class="block space-y-2 text-sm">
        <span>Password</span>
        <div class="relative">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="6"
            class="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 pr-11 outline-none ring-blue-500 transition focus:ring"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-slate-400 transition hover:text-slate-200"
            :aria-label="
              showPassword ? 'Sembunyikan password' : 'Lihat password'
            "
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" class="h-4 w-4" />
            <Eye v-else class="h-4 w-4" />
          </button>
        </div>
      </label>

      <button
        type="submit"
        class="w-full rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500"
      >
        Masuk
      </button>
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
