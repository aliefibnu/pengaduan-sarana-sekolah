<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import Slider from "primevue/slider";
import Textarea from "primevue/textarea";
import StatusBadge from "@/components/StatusBadge.vue";
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
const complaintStore = useComplaintStore();
const feedbackStore = useFeedbackStore();
const { selected, loading, submitting } = storeToRefs(complaintStore);
const { items: feedbacks } = storeToRefs(feedbackStore);

const form = reactive({
  message: "",
  progress_percentage: null,
});
const imagePreviewVisible = ref(false);

const latestFeedbackWithProgress = computed(() => {
  return (
    feedbacks.value.find(
      (item) =>
        item.progress_percentage !== null &&
        item.progress_percentage !== undefined,
    ) || null
  );
});

const minProgress = computed(() => {
  return latestFeedbackWithProgress.value?.progress_percentage ?? 0;
});

const latestTimelineProgress = computed(() => {
  if (selected.value?.status === "done") return 100;

  const latestFeedback = feedbacks.value[0];
  if (!latestFeedback) return null;

  const value = latestFeedback.progress_percentage;
  return value === null || value === undefined ? null : value;
});

const progressSliderModel = computed({
  get() {
    return form.progress_percentage ?? minProgress.value;
  },
  set(value) {
    form.progress_percentage = value;
  },
});

watch(minProgress, (value) => {
  if (
    form.progress_percentage !== null &&
    form.progress_percentage !== undefined &&
    form.progress_percentage < value
  ) {
    form.progress_percentage = value;
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

async function handleMarkAsDone() {
  if (!selected.value) return;

  if (selected.value.status === "done") {
    showSuccess("Aspirasi ini sudah selesai.");
    return;
  }

  const confirmed = await confirmAction({
    title: "Tandai aspirasi selesai?",
    message: "Setelah selesai, aduan ini ditutup.",
    okText: "Tandai Selesai",
  });

  if (!confirmed) return;

  openLoading("Menandai selesai...");
  try {
    await complaintStore.markAsDone({
      complaintId: route.params.id,
    });
    showSuccess("Aspirasi berhasil ditandai selesai.");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}

async function handleSubmitFeedback() {
  if (selected.value?.status === "done") {
    showError("Aspirasi ini sudah selesai.");
    return;
  }

  if (!form.message.trim()) {
    showError("Feedback tidak boleh kosong.");
    return;
  }

  if (
    form.progress_percentage !== null &&
    form.progress_percentage !== undefined &&
    form.progress_percentage < minProgress.value
  ) {
    showError(
      `Persentase tidak boleh lebih kecil dari progres terakhir (${minProgress.value}%).`,
    );
    return;
  }

  openLoading("Mengirim feedback...");
  try {
    await feedbackStore.addFeedback({
      complaint_id: route.params.id,
      message: form.message.trim(),
      progress_percentage: form.progress_percentage,
    });

    form.message = "";
    form.progress_percentage = null;
    await complaintStore.loadDetail(route.params.id);
    await feedbackStore.loadByComplaintId(route.params.id);
    showSuccess("Feedback berhasil dikirim.");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}

function openImagePreview() {
  if (!selected.value?.image_url) return;
  imagePreviewVisible.value = true;
}

function increaseProgress() {
  const current = form.progress_percentage ?? minProgress.value;
  form.progress_percentage = Math.min(100, current + 1);
}

function decreaseProgress() {
  const current = form.progress_percentage ?? minProgress.value;
  form.progress_percentage = Math.max(minProgress.value, current - 1);
}

function clearProgress() {
  form.progress_percentage = null;
}
</script>

<template>
  <section class="space-y-4">
    <article class="admin-panel p-5">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-lg font-semibold text-slate-900">Detail Pengaduan</h3>
        <Button
          outlined
          severity="secondary"
          size="small"
          label="Kembali ke daftar"
          icon="pi pi-arrow-left"
          @click="router.push('/admin/complaints')"
        />
      </div>

      <p v-if="loading" class="text-sm text-slate-500">
        Memuat detail pengaduan...
      </p>

      <div v-else-if="selected" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h4 class="text-base font-semibold text-slate-900">
            {{ selected.title }}
          </h4>
          <StatusBadge :status="selected.status" />
        </div>

        <p class="text-xs text-slate-500">
          Pelapor: {{ selected.users?.name || "-" }} • {{ selected.category }} •
          {{ formatDate(selected.created_at) }}
        </p>

        <p class="text-sm leading-relaxed text-slate-700">
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
            class="max-h-80 w-full rounded-2xl object-cover transition group-hover:scale-[1.01]"
          />
          <span
            class="mt-2 inline-flex text-xs font-medium text-blue-700 group-hover:text-blue-800"
          >
            Klik foto untuk perbesar
          </span>
        </button>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <Button
            v-if="selected.status !== 'done'"
            severity="success"
            label="Tandai Selesai"
            icon="pi pi-check-circle"
            :disabled="submitting"
            @click="handleMarkAsDone"
          />

          <p v-else class="text-xs font-medium text-emerald-700">
            Aspirasi selesai. Timeline progres telah ditutup.
          </p>
        </div>
      </div>
    </article>

    <article class="admin-panel p-5">
      <h3 class="text-lg font-semibold text-slate-900">
        Timeline Feedback Admin
      </h3>

      <div class="mt-4 space-y-3">
        <div
          v-if="latestTimelineProgress !== null"
          class="space-y-2 rounded-xl border border-blue-100 bg-blue-50 p-3"
        >
          <div
            class="flex items-center justify-between text-xs font-medium text-blue-700"
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

        <div
          v-if="selected?.completed_at"
          class="rounded-xl border border-emerald-100 bg-emerald-50 p-3"
        >
          <p class="text-xs font-medium text-emerald-700">
            Selesai: {{ formatDate(selected.completed_at) }}
          </p>
        </div>

        <div
          v-for="item in feedbacks"
          :key="item.id"
          class="rounded-xl border border-slate-200 bg-slate-50 p-3"
        >
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm text-slate-700">{{ item.message }}</p>
            <div
              v-if="item.progress_percentage !== null"
              class="whitespace-nowrap rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700"
            >
              {{ item.progress_percentage }}%
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            {{ formatDate(item.created_at) }}
          </p>
        </div>

        <p v-if="!feedbacks.length" class="text-sm text-slate-500">
          Belum ada feedback pada pengaduan ini.
        </p>

        <p
          v-if="selected?.first_response_at"
          class="text-xs font-medium text-blue-700"
        >
          Direspon: {{ formatDate(selected.first_response_at) }}
        </p>
      </div>

      <div v-if="selected?.status !== 'done'" class="mt-4 space-y-3">
        <label class="text-sm font-medium text-slate-700" for="feedback-input">
          Tambah feedback baru
        </label>
        <Textarea
          id="feedback-input"
          v-model="form.message"
          rows="3"
          class="admin-input w-full"
          placeholder="Tuliskan perkembangan perbaikan fasilitas"
          :disabled="selected?.status === 'done'"
        />
        <label class="text-sm font-medium text-slate-700" for="progress-input">
          Persentase progres (opsional)
        </label>
        <p class="text-xs text-slate-500">
          Progres minimal: {{ minProgress }}%
        </p>
        <div class="space-y-2">
          <Slider
            v-model="progressSliderModel"
            :min="minProgress"
            :max="100"
            :step="1"
            :disabled="selected?.status === 'done'"
            class="w-full"
          />
          <div class="flex flex-wrap items-center gap-2">
            <Button
              size="small"
              outlined
              severity="secondary"
              icon="pi pi-minus"
              :disabled="
                selected?.status === 'done' ||
                progressSliderModel <= minProgress
              "
              @click="decreaseProgress"
            />
            <InputNumber
              id="progress-input"
              v-model="form.progress_percentage"
              input-id="progress-number"
              :min="minProgress"
              :max="100"
              suffix="%"
              :use-grouping="false"
              show-buttons
              button-layout="horizontal"
              increment-button-icon="pi pi-plus"
              decrement-button-icon="pi pi-minus"
              placeholder="Kosongkan jika tidak diisi"
              :disabled="selected?.status === 'done'"
            />
            <Button
              size="small"
              outlined
              severity="secondary"
              icon="pi pi-plus"
              :disabled="
                selected?.status === 'done' || progressSliderModel >= 100
              "
              @click="increaseProgress"
            />
            <Button
              size="small"
              text
              severity="secondary"
              label="Kosongkan"
              icon="pi pi-times"
              :disabled="selected?.status === 'done'"
              @click="clearProgress"
            />
          </div>
        </div>
        <Button
          severity="primary"
          label="Kirim Feedback"
          icon="pi pi-send"
          :disabled="submitting"
          @click="handleSubmitFeedback"
        />
      </div>

      <p v-else class="mt-4 text-sm font-medium text-emerald-700">
        Aspirasi sudah selesai. Form feedback dan persentase disembunyikan.
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
