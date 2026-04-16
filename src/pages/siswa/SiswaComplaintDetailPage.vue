<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import StatusBadge from "@/components/StatusBadge.vue";
import Textarea from "primevue/textarea";
import { useAuthStore } from "@/stores/authStore";
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

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const complaintStore = useComplaintStore();
const feedbackStore = useFeedbackStore();
const { selected, loading, submitting } = storeToRefs(complaintStore);
const { items: feedbacks } = storeToRefs(feedbackStore);
const imagePreviewVisible = ref(false);
const isEditing = ref(false);

const categoryOptions = [
  { label: "Kelas", value: "Kelas" },
  { label: "Toilet", value: "Toilet" },
  { label: "Laboratorium", value: "Laboratorium" },
  { label: "Perpustakaan", value: "Perpustakaan" },
  { label: "Lapangan", value: "Lapangan" },
  { label: "Lainnya", value: "Lainnya" },
];

const editForm = reactive({
  title: "",
  description: "",
  category: "Kelas",
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
    await complaintStore.loadDetail(route.params.id);
    await feedbackStore.loadByComplaintId(route.params.id);
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
  <section class="space-y-4">
    <article class="rounded-2xl bg-white p-5 shadow-sm">
      <p v-if="loading" class="text-sm text-slate-500">Memuat detail...</p>

      <div v-else-if="selected" class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-lg font-semibold text-slate-900">
            {{ selected.title }}
          </h3>
          <StatusBadge :status="selected.status" />
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <template v-if="canModify">
            <Button
              v-if="!isEditing"
              outlined
              size="small"
              severity="secondary"
              label="Edit Aspirasi"
              icon="pi pi-pencil"
              @click="startEditing"
            />
            <Button
              v-if="!isEditing"
              outlined
              size="small"
              severity="danger"
              label="Hapus Aspirasi"
              icon="pi pi-trash"
              :disabled="submitting"
              @click="handleDeleteComplaint"
            />
          </template>

          <p v-else class="text-xs text-slate-500">
            Aduan ini sudah berjalan, jadi tidak bisa diubah lagi.
          </p>
        </div>

        <p class="text-sm text-slate-500">
          {{ formatDate(selected.created_at) }} • {{ selected.category }}
        </p>

        <form
          v-if="isEditing"
          class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
          @submit.prevent="handleUpdateComplaint"
        >
          <label class="admin-input space-y-1 text-sm">
            <span class="text-slate-600">Judul aspirasi</span>
            <InputText
              v-model="editForm.title"
              required
              class="w-full"
              placeholder="Contoh: Lampu kelas 8B mati"
            />
          </label>

          <label class="admin-input space-y-1 text-sm">
            <span class="text-slate-600">Deskripsi</span>
            <Textarea
              v-model="editForm.description"
              rows="4"
              required
              class="w-full"
              placeholder="Tuliskan detail lokasi dan dampaknya"
            />
          </label>

          <label class="admin-input space-y-1 text-sm">
            <span class="text-slate-600">Kategori</span>
            <Select
              v-model="editForm.category"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              filter
              filter-placeholder="Cari kategori"
              class="w-full"
            />
          </label>

          <div class="flex flex-wrap justify-end gap-2">
            <Button
              outlined
              severity="secondary"
              label="Batal"
              icon="pi pi-times"
              :disabled="submitting"
              @click="cancelEditing"
            />
            <Button
              type="submit"
              severity="primary"
              label="Simpan Perubahan"
              icon="pi pi-check"
              :disabled="submitting"
            />
          </div>
        </form>

        <p v-else class="text-sm leading-relaxed text-slate-700">
          {{ selected.description }}
        </p>

        <button
          v-if="selected.image_url"
          type="button"
          class="group w-full overflow-hidden rounded-2xl"
          @click="openImagePreview"
        >
          <img
            :src="selected.image_url"
            alt="Bukti pengaduan"
            class="max-h-72 w-full rounded-2xl object-cover transition group-hover:scale-[1.01]"
          />
          <span
            class="mt-2 inline-flex text-xs font-medium text-blue-700 group-hover:text-blue-800"
          >
            Klik foto untuk perbesar
          </span>
        </button>
      </div>
    </article>

    <article class="rounded-2xl bg-white p-5 shadow-sm">
      <h4 class="text-base font-semibold text-slate-900">Riwayat Penanganan</h4>

      <div v-if="timelineItems.length" class="mt-4 pl-1">
        <div class="relative pl-7">
          <span class="absolute bottom-0 left-[11px] top-1 w-px bg-slate-200"></span>

          <div
            v-if="latestTimelineProgress !== null"
            class="relative pb-5"
          >
            <span class="absolute -left-7 top-2 h-3 w-3 rounded-full border border-blue-600 bg-blue-600"></span>
            <div class="rounded-xl border border-blue-100 bg-blue-50 p-3">
              <div
                class="mb-1 flex items-center justify-between text-xs font-semibold text-blue-700"
              >
                <span>Progres</span>
                <span>{{ latestTimelineProgress }}%</span>
              </div>
              <div class="h-2 rounded-full bg-blue-100">
                <div
                  class="h-2 rounded-full bg-blue-600 transition-all"
                  :style="{ width: `${latestTimelineProgress}%` }"
                ></div>
              </div>
            </div>
          </div>

          <div
            v-if="selected?.completed_at"
            class="relative pb-5"
          >
            <span class="absolute -left-7 top-2 h-3 w-3 rounded-full border border-emerald-600 bg-emerald-600"></span>
            <div
              class="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-medium text-emerald-700"
            >
              Selesai: {{ formatDate(selected.completed_at) }}
            </div>
          </div>

          <div
            v-for="(item, index) in timelineItems"
            :key="item.id"
            class="relative pb-5 last:pb-0"
          >
            <span
              class="absolute -left-7 top-2 h-3 w-3 rounded-full border"
              :class="
                index === 0
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-slate-300 bg-white'
              "
            ></span>

            <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p class="text-sm text-slate-700">{{ item.message }}</p>
              <p class="mt-1 text-xs text-slate-500">
                {{ formatDate(item.created_at) }}
              </p>
            </div>
          </div>

          <div
            v-if="selected?.first_response_at"
            class="relative"
          >
            <span class="absolute -left-7 top-2 h-3 w-3 rounded-full border border-blue-300 bg-white"></span>
            <div
              class="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-medium text-blue-700"
            >
              Direspon: {{ formatDate(selected.first_response_at) }}
            </div>
          </div>
        </div>
      </div>

      <p v-else class="mt-3 text-sm text-slate-500">
        Belum ada kabar terbaru.
      </p>
    </article>

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
