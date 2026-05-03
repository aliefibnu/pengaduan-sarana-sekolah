<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import DataTable from "@/components/DataTable.vue";
import { useAuthStore } from "@/stores/authStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useComplaintStore } from "@/stores/complaintStore";
import { useFeedbackStore } from "@/stores/feedbackStore";
import { formatDate } from "@/utils/format";
import {
  closeLoading,
  confirmAction,
  openLoading,
  showError,
  showSuccess,
} from "@/utils/notifications";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Calendar,
  TrendingUp,
  Image,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const categoryStore = useCategoryStore();
const complaintStore = useComplaintStore();
const feedbackStore = useFeedbackStore();
const { selected, loading, submitting } = storeToRefs(complaintStore);
const { items: feedbacks } = storeToRefs(feedbackStore);
const imagePreviewVisible = ref(false);
const isEditing = ref(false);

const categoryOptions = computed(() => {
  const dynamicOptions = categoryStore.options;
  const currentCategory = selected.value?.category || editForm.category;

  if (
    currentCategory &&
    !dynamicOptions.some((option) => option.value === currentCategory)
  ) {
    return [
      ...dynamicOptions,
      { label: currentCategory, value: currentCategory },
    ];
  }

  return dynamicOptions;
});

const editForm = reactive({
  title: "",
  description: "",
  category: "",
});

const canModify = computed(() => {
  if (!selected.value || !authStore.user?.id) return false;

  return (
    selected.value.user_id === authStore.user.id &&
    selected.value.status === "pending" &&
    feedbacks.value.length === 0
  );
});

const timelineItems = computed(() => {
  return [...feedbacks.value].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );
});

const feedbackColumns = [
  { key: "message", label: "Pesan", icon: MessageSquare, sortable: false },
  {
    key: "progress_percentage",
    label: "Progres",
    icon: TrendingUp,
    sortable: false,
  },
  { key: "created_at", label: "Tanggal", icon: Calendar, sortable: false },
];

const latestTimelineProgress = computed(() => {
  if (selected.value?.status === "done") return 100;

  const latestFeedback = timelineItems.value[timelineItems.value.length - 1];
  if (!latestFeedback) return null;

  const value = latestFeedback.progress_percentage;
  return value === null || value === undefined ? null : value;
});

watch(
  () => selected.value,
  (complaint) => {
    if (!complaint) return;
    editForm.title = complaint.title;
    editForm.description = complaint.description;
    editForm.category = complaint.category;
  },
  { immediate: true },
);

watch(canModify, (allowed) => {
  if (!allowed) {
    isEditing.value = false;
  }
});

onMounted(async () => {
  try {
    await Promise.all([
      complaintStore.loadDetail(route.params.id),
      feedbackStore.loadByComplaintId(route.params.id),
      categoryStore.loadAll(),
    ]);
  } catch (error) {
    showError(error.message);
  }
});

function openImagePreview() {
  if (!selected.value?.image_url) return;
  imagePreviewVisible.value = true;
}

function startEditing() {
  if (!selected.value) return;
  editForm.title = selected.value.title;
  editForm.description = selected.value.description;
  editForm.category = selected.value.category;
  isEditing.value = true;
}

function cancelEditing() {
  isEditing.value = false;
  if (!selected.value) return;
  editForm.title = selected.value.title;
  editForm.description = selected.value.description;
  editForm.category = selected.value.category;
}

async function handleUpdateComplaint() {
  if (!selected.value || !authStore.user?.id) return;
  if (!canModify.value) {
    showError(
      "Aspirasi tidak bisa diubah karena sudah diproses atau sudah ada progres admin.",
    );
    return;
  }

  if (!editForm.title.trim() || !editForm.description.trim()) {
    showError("Judul dan deskripsi tidak boleh kosong.");
    return;
  }

  const confirmed = await confirmAction({
    title: "Simpan perubahan aspirasi?",
    message: "Perubahan akan langsung tersimpan pada laporan Anda.",
    okText: "Simpan",
  });

  if (!confirmed) return;

  openLoading("Menyimpan perubahan...");
  try {
    await complaintStore.updateOwn({
      complaintId: selected.value.id,
      userId: authStore.user.id,
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      category: editForm.category,
    });
    isEditing.value = false;
    showSuccess("Aspirasi berhasil diperbarui.");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}

async function handleDeleteComplaint() {
  if (!selected.value || !authStore.user?.id) return;
  if (!canModify.value) {
    showError(
      "Aspirasi tidak bisa dihapus karena sudah diproses atau sudah ada progres admin.",
    );
    return;
  }

  const confirmed = await confirmAction({
    title: "Hapus aspirasi ini?",
    message: "Aspirasi yang dihapus tidak dapat dikembalikan.",
    okText: "Hapus",
  });

  if (!confirmed) return;

  openLoading("Menghapus aspirasi...");
  try {
    await complaintStore.removeOwn({
      complaintId: selected.value.id,
      userId: authStore.user.id,
    });
    showSuccess("Aspirasi berhasil dihapus.");
    router.push("/siswa/history");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}
</script>

<template>
  <section class="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <!-- Back Button & Title (restored from Siswa detail) -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          @click="router.push('/siswa/history')"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft :size="18" />
          Kembali
        </button>
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Detail Pengaduan</h1>
          <p class="text-sm text-slate-600">
            Lihat status dan riwayat penanganan
          </p>
        </div>
      </div>
    </div>

    <!-- Complaint Detail -->
    <article class="rounded-lg border border-slate-300 bg-white shadow-sm">
      <div
        class="border-b border-slate-200 bg-gradient-to-r from-teal-50 to-teal-100 px-5 py-3"
      >
        <h2 class="flex items-center gap-2 text-lg font-bold text-slate-900">
          <AlertCircle :size="20" class="text-slate-600" />
          {{ selected?.title || "Loading..." }}
        </h2>
      </div>

      <div v-if="loading" class="px-6 py-8 text-center text-slate-500">
        Memuat detail pengaduan...
      </div>

      <div v-else-if="selected" class="space-y-3 px-5 py-3">
        <div class="flex items-center justify-end">
          <span
            class="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-semibold"
            :class="{
              'border-yellow-300 bg-yellow-50 text-yellow-700':
                selected.status === 'pending',
              'border-slate-300 bg-slate-50 text-slate-700':
                selected.status === 'process',
              'border-green-300 bg-green-50 text-green-700':
                selected.status === 'done',
            }"
          >
            <component
              :is="selected.status === 'done' ? CheckCircle2 : AlertCircle"
              :size="18"
            />
            {{
              selected.status === "pending"
                ? "Menunggu"
                : selected.status === "process"
                  ? "Diproses"
                  : "Selesai"
            }}
          </span>
        </div>

        <p class="text-sm leading-relaxed text-slate-700">
          {{ selected.description }}
        </p>

        <button
          v-if="selected.image_url"
          @click="openImagePreview"
          class="group w-full overflow-hidden rounded-lg border border-slate-300 transition hover:border-slate-400"
        >
          <img
            :src="selected.image_url"
            alt="Bukti"
            class="max-h-48 w-full object-cover"
          />
          <div class="flex items-center justify-between bg-slate-50 px-4 py-2">
            <span
              class="flex items-center gap-2 text-sm font-medium text-slate-700"
            >
              <Image :size="16" />
              Bukti Pengaduan
            </span>
            <span class="text-xs text-slate-500">Klik untuk perbesar</span>
          </div>
        </button>

        <form
          v-if="isEditing"
          class="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
          @submit.prevent="handleUpdateComplaint"
        >
          <label class="admin-input space-y-2 text-sm">
            <span class="font-semibold text-slate-900">Judul Pengaduan</span>
            <InputText
              v-model="editForm.title"
              required
              class="w-full"
              placeholder="Contoh: Lampu kelas 8B mati"
            />
          </label>

          <label class="admin-input space-y-2 text-sm">
            <span class="font-semibold text-slate-900">Deskripsi</span>
            <Textarea
              v-model="editForm.description"
              rows="4"
              required
              class="w-full"
              placeholder="Tuliskan detail lokasi dan dampaknya"
            />
          </label>

          <label class="admin-input space-y-2 text-sm">
            <span class="font-semibold text-slate-900">Kategori</span>
            <Select
              v-model="editForm.category"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              filter
              filter-placeholder="Cari kategori"
              fluid
            />
          </label>

          <div
            class="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4"
          >
            <Button
              outlined
              severity="secondary"
              label="Batal"
              :disabled="submitting"
              @click="cancelEditing"
            />
            <Button
              type="submit"
              severity="primary"
              label="Simpan Perubahan"
              :disabled="submitting"
            />
          </div>
        </form>

        <div
          v-if="canModify"
          class="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4"
        >
          <button
            v-if="!isEditing"
            @click="startEditing"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Edit2 :size="16" />
            Edit Pengaduan
          </button>
          <button
            v-if="!isEditing"
            @click="handleDeleteComplaint"
            :disabled="submitting"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Trash2 :size="16" />
            Hapus Pengaduan
          </button>
        </div>
      </div>
    </article>

    <!-- Timeline Table -->
    <article class="rounded-lg border border-slate-300 bg-white shadow-sm">
      <div
        class="border-b border-slate-200 bg-gradient-to-r from-teal-50 to-teal-100 px-5 py-3"
      >
        <h2 class="flex items-center gap-2 text-lg font-bold text-slate-900">
          <MessageSquare :size="20" class="text-slate-600" />
          Riwayat Penanganan
        </h2>
      </div>

      <div class="overflow-x-auto">
        <DataTable
          :columns="feedbackColumns"
          :items="timelineItems"
          :page-size="10"
          empty-title="Belum ada riwayat"
          empty-message="Belum ada kabar dari admin mengenai pengaduan Anda"
        >
          <template #cell-message="{ item }">
            <p class="text-sm text-slate-800">{{ item.message }}</p>
          </template>

          <template #cell-progress_percentage="{ item }">
            <div
              v-if="item.progress_percentage !== null"
              class="flex items-center gap-2"
            >
              <div class="w-16 rounded-full bg-slate-100">
                <div
                  class="h-1.5 rounded-full bg-slate-600"
                  :style="{ width: `${item.progress_percentage}%` }"
                />
              </div>
              <span
                class="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-bold text-slate-700"
              >
                {{ item.progress_percentage }}%
              </span>
            </div>
            <span v-else class="text-xs text-slate-500">-</span>
          </template>

          <template #cell-created_at="{ item }">
            <span class="text-sm text-slate-700">{{
              formatDate(item.created_at)
            }}</span>
          </template>
        </DataTable>
      </div>
    </article>

    <!-- Image Preview Dialog -->
    <Dialog
      v-model:visible="imagePreviewVisible"
      modal
      header="Preview Bukti Pengaduan"
      :style="{ width: 'min(64rem, 96vw)' }"
    >
      <img
        v-if="selected?.image_url"
        :src="selected.image_url"
        alt="Bukti pengaduan"
        class="max-h-[78vh] w-full rounded-xl object-contain"
      />
    </Dialog>
  </section>
</template>
