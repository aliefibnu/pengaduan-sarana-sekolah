<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import vueFilePond from "vue-filepond";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
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
const filePondRef = ref(null);
const pondFiles = ref([]);
const FilePond = vueFilePond(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
);
const categoryOptions = [
  { label: "Kelas", value: "Kelas" },
  { label: "Toilet", value: "Toilet" },
  { label: "Laboratorium", value: "Laboratorium" },
  { label: "Perpustakaan", value: "Perpustakaan" },
  { label: "Lapangan", value: "Lapangan" },
  { label: "Lainnya", value: "Lainnya" },
];

const form = reactive({
  title: "",
  description: "",
  category: "Kelas",
  imageFile: null,
});

function onPondUpdate(fileItems) {
  pondFiles.value = fileItems.map((item) => item.file);
  form.imageFile = fileItems[0]?.file || null;
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
    pondFiles.value = [];
    if (filePondRef.value) filePondRef.value.removeFiles();
    router.push("/siswa/history");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}
</script>

<template>
  <section class="admin-panel p-5">
    <h3 class="text-lg font-semibold text-slate-900">Form Pengaduan Sarana</h3>
    <p class="mt-1 text-sm text-slate-500">
      Jelaskan masalah sejelas mungkin agar proses perbaikan cepat.
    </p>

    <form class="mt-5 grid gap-4" @submit.prevent="handleSubmit">
      <label class="admin-input space-y-2 text-sm">
        <span class="font-medium text-slate-700">Judul pengaduan</span>
        <InputText
          v-model="form.title"
          required
          class="w-full"
          placeholder="Contoh: Lampu kelas 8B mati"
        />
      </label>

      <label class="admin-input space-y-2 text-sm">
        <span class="font-medium text-slate-700">Deskripsi</span>
        <Textarea
          v-model="form.description"
          rows="5"
          required
          class="w-full"
          placeholder="Tuliskan detail lokasi dan dampaknya"
        />
      </label>

      <label class="admin-input space-y-2 text-sm">
        <span class="font-medium text-slate-700">Kategori</span>
        <Select
          v-model="form.category"
          :options="categoryOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </label>

      <label class="space-y-2 text-sm">
        <span class="font-medium text-slate-700">Foto (opsional)</span>
        <FilePond
          ref="filePondRef"
          :files="pondFiles"
          :allow-multiple="false"
          :instant-upload="false"
          :allow-process="false"
          :allow-reorder="false"
          :accepted-file-types="['image/png', 'image/jpeg', 'image/webp']"
          max-file-size="5MB"
          file-validate-type-label-expected-types="Hanya PNG, JPG, atau WEBP"
          label-max-file-size-exceeded="Ukuran file terlalu besar"
          label-max-file-size="Ukuran maksimum file adalah {filesize}"
          label-idle="Drag & drop foto di sini atau <span class='filepond--label-action'>Pilih File</span>"
          credits="false"
          class="w-full"
          @updatefiles="onPondUpdate"
        />
      </label>

      <Button type="submit" label="Kirim Pengaduan" class="w-full" />
    </form>
  </section>
</template>
