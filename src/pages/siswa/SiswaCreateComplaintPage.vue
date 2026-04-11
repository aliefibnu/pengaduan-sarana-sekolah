<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useComplaintStore } from "@/stores/complaintStore";
import {
  closeLoading,
  openLoading,
  showError,
  showSuccess,
} from "@/utils/notifications";

const router = useRouter();
const authStore = useAuthStore();
const complaintStore = useComplaintStore();
const fileInput = ref(null);

const form = reactive({
  title: "",
  description: "",
  category: "Kelas",
  imageFile: null,
});

function onPickImage(event) {
  form.imageFile = event.target.files?.[0] || null;
}

async function handleSubmit() {
  if (!authStore.user?.id) return;

  openLoading("Mengirim pengaduan...");

  try {
    await complaintStore.submitComplaint({
      userId: authStore.user.id,
      title: form.title,
      description: form.description,
      category: form.category,
      imageFile: form.imageFile,
    });

    showSuccess("Pengaduan berhasil dikirim");
    form.title = "";
    form.description = "";
    form.category = "Kelas";
    form.imageFile = null;
    if (fileInput.value) fileInput.value.value = "";
    router.push("/siswa/history");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}
</script>

<template>
  <section class="rounded-2xl bg-white p-5 shadow-sm">
    <h3 class="text-lg font-semibold text-slate-900">Form Pengaduan Sarana</h3>
    <p class="mt-1 text-sm text-slate-500">
      Jelaskan masalah sejelas mungkin agar proses perbaikan cepat.
    </p>

    <form class="mt-5 grid gap-4" @submit.prevent="handleSubmit">
      <label class="space-y-2 text-sm">
        <span class="font-medium text-slate-700">Judul pengaduan</span>
        <input
          v-model="form.title"
          required
          class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-blue-500 transition focus:ring"
          placeholder="Contoh: Lampu kelas 8B mati"
        />
      </label>

      <label class="space-y-2 text-sm">
        <span class="font-medium text-slate-700">Deskripsi</span>
        <textarea
          v-model="form.description"
          rows="5"
          required
          class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-blue-500 transition focus:ring"
          placeholder="Tuliskan detail lokasi dan dampaknya"
        ></textarea>
      </label>

      <label class="space-y-2 text-sm">
        <span class="font-medium text-slate-700">Kategori</span>
        <select
          v-model="form.category"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-blue-500 transition focus:ring"
        >
          <option>Kelas</option>
          <option>Toilet</option>
          <option>Laboratorium</option>
          <option>Perpustakaan</option>
          <option>Lapangan</option>
          <option>Lainnya</option>
        </select>
      </label>

      <label class="space-y-2 text-sm">
        <span class="font-medium text-slate-700">Foto (opsional)</span>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="w-full rounded-xl border border-slate-200 px-3 py-2"
          @change="onPickImage"
        />
      </label>

      <button
        type="submit"
        class="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
      >
        Kirim Pengaduan
      </button>
    </form>
  </section>
</template>
