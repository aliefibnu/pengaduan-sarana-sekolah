<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import vueFilePondModule from "vue-filepond";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import { useAuthStore } from "@/stores/authStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useComplaintStore } from "@/stores/complaintStore";
import {
  closeLoading,
  openLoading,
  showError,
  showSuccess,
} from "@/utils/notifications";
import {
  PenTool,
  MessageSquare,
  Tag,
  Image as ImageIcon,
  ArrowLeft,
  Plus,
} from "lucide-vue-next";

const router = useRouter();
const authStore = useAuthStore();
const categoryStore = useCategoryStore();
const complaintStore = useComplaintStore();
const filePondRef = ref(null);
const pondFiles = ref([]);
const categoryDialogVisible = ref(false);
const newCategoryName = ref("");
const vueFilePond = vueFilePondModule.default || vueFilePondModule;
const FilePond = vueFilePond(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
);

const categoryOptions = computed(() => categoryStore.options);

const form = reactive({
  title: "",
  description: "",
  category: "",
  imageFile: null,
});

function applyDefaultCategory() {
  if (form.category) return;
  form.category = categoryOptions.value[0]?.value || "";
}

onMounted(async () => {
  try {
    await categoryStore.loadAll();
    applyDefaultCategory();
  } catch (error) {
    showError(error.message);
  }
});

function onPondUpdate(fileItems) {
  pondFiles.value = fileItems.map((item) => item.file);
  form.imageFile = fileItems[0]?.file || null;
}

function openCategoryDialog() {
  if (!authStore.user?.id) {
    showError("Anda harus login untuk menambah kategori.");
    return;
  }

  newCategoryName.value = "";
  categoryDialogVisible.value = true;
}

async function handleCreateCategory() {
  if (!authStore.user?.id) return;

  openLoading("Menambahkan kategori...");
  try {
    const created = await categoryStore.add({
      name: newCategoryName.value,
      createdBy: authStore.user.id,
    });
    form.category = created.name;
    categoryDialogVisible.value = false;
    showSuccess("Kategori baru berhasil ditambahkan.");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}

async function handleSubmit() {
  if (!authStore.user?.id) return;
  if (!form.category) {
    showError("Pilih kategori terlebih dahulu.");
    return;
  }

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
    form.category = "";
    applyDefaultCategory();
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
  <section class="space-y-6">
    <!-- Header -->
    <div class="space-y-2">
      <div class="flex items-center gap-3">
        <RouterLink
          to="/siswa/history"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft :size="18" />
          Kembali
        </RouterLink>
      </div>
      <div class="space-y-1">
        <h1 class="text-3xl font-bold text-slate-900">Buat Pengaduan Baru</h1>
        <p class="text-sm text-slate-600">
          Jelaskan masalah sejelas mungkin agar proses perbaikan lebih cepat
        </p>
      </div>
    </div>

    <!-- Form Section -->
    <article class="rounded-lg border border-slate-300 bg-white shadow-sm">
      <div
        class="border-b border-slate-200 bg-gradient-to-r from-teal-50 to-teal-100 px-6 py-4"
      >
        <h2 class="flex items-center gap-2 text-xl font-bold text-slate-900">
          <MessageSquare :size="24" class="text-teal-600" />
          Form Pengaduan Sarana
        </h2>
      </div>

      <form class="space-y-5 px-6 py-6" @submit.prevent="handleSubmit">
        <!-- Title Input -->
        <label class="admin-input space-y-2">
          <div class="flex items-center gap-2">
            <PenTool :size="18" class="text-teal-600" />
            <span class="font-semibold text-slate-900">Judul Pengaduan</span>
            <span class="text-red-500">*</span>
          </div>
          <InputText
            v-model="form.title"
            required
            class="w-full"
            placeholder="Contoh: Lampu kelas 8B mati"
          />
          <p class="text-xs text-slate-500">
            Berikan judul singkat dan deskriptif
          </p>
        </label>

        <!-- Description Input -->
        <label class="admin-input space-y-2">
          <div class="flex items-center gap-2">
            <MessageSquare :size="18" class="text-teal-600" />
            <span class="font-semibold text-slate-900">Deskripsi Masalah</span>
            <span class="text-red-500">*</span>
          </div>
          <Textarea
            v-model="form.description"
            rows="5"
            required
            class="w-full"
            placeholder="Tuliskan detail lokasi, gejala, dan dampaknya secara lengkap"
          />
          <p class="text-xs text-slate-500">
            Semakin detail Anda menjelaskan, semakin cepat admin dapat menangani
          </p>
        </label>

        <!-- Category Select -->
        <label class="admin-input space-y-2">
          <div class="flex items-center gap-2">
            <Tag :size="18" class="text-teal-600" />
            <span class="font-semibold text-slate-900">Kategori</span>
            <span class="text-red-500">*</span>
          </div>
          <Select
            v-model="form.category"
            :options="categoryOptions"
            option-label="label"
            option-value="value"
            filter
            filter-placeholder="Cari kategori"
            fluid
            placeholder="Pilih kategori pengaduan"
          />
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p
              v-if="!categoryOptions.length"
              class="text-xs font-medium text-amber-700"
            >
              ⚠️ Belum ada kategori tersedia. Tambahkan kategori terlebih
              dahulu.
            </p>
            <Button
              type="button"
              outlined
              severity="secondary"
              label="Tambah Kategori"
              size="small"
              @click="openCategoryDialog"
            />
          </div>
        </label>

        <!-- File Upload -->
        <label class="space-y-2">
          <div class="flex items-center gap-2">
            <ImageIcon :size="18" class="text-teal-600" />
            <span class="font-semibold text-slate-900">Foto Bukti</span>
            <span class="text-xs font-medium text-slate-500">(Opsional)</span>
          </div>
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
          <p class="text-xs text-slate-500">
            Ukuran maksimal: 5MB (PNG, JPG, WEBP)
          </p>
        </label>

        <!-- Submit Button -->
        <div class="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
          <Button
            type="button"
            outlined
            severity="secondary"
            label="Batal"
            @click="router.push('/siswa/history')"
          />
          <Button type="submit" label="Kirim Pengaduan" class="flex-1" />
        </div>
      </form>
    </article>

    <!-- Category Dialog -->
    <Dialog
      v-model:visible="categoryDialogVisible"
      modal
      header="Tambah Kategori Baru"
      :style="{ width: 'min(28rem, 94vw)' }"
    >
      <form class="space-y-4" @submit.prevent="handleCreateCategory">
        <label class="admin-input space-y-2">
          <div class="flex items-center gap-2">
            <Tag :size="18" class="text-teal-600" />
            <span class="font-semibold text-slate-900">Nama Kategori</span>
            <span class="text-red-500">*</span>
          </div>
          <InputText
            v-model="newCategoryName"
            class="w-full"
            required
            placeholder="Contoh: Aula, Kantin, Kamar Mandi"
          />
        </label>

        <div class="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button
            type="button"
            outlined
            severity="secondary"
            label="Batal"
            @click="categoryDialogVisible = false"
          />
          <Button type="submit" severity="primary" label="Simpan Kategori" />
        </div>
      </form>
    </Dialog>
  </section>
</template>
