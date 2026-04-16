<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
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
});
const imagePreviewVisible = ref(false);

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
    message: "Setelah selesai, progres baru tidak dapat ditambahkan.",
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
    showError("Aspirasi sudah selesai, progres baru tidak bisa ditambahkan.");
    return;
  }

  if (!form.message.trim()) {
    showError("Feedback tidak boleh kosong.");
    return;
  }

  openLoading("Mengirim feedback...");
  try {
    await feedbackStore.addFeedback({
      complaint_id: route.params.id,
      message: form.message.trim(),
    });

    form.message = "";
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
          v-for="item in feedbacks"
          :key="item.id"
          class="rounded-xl border border-slate-200 bg-slate-50 p-3"
        >
          <p class="text-sm text-slate-700">{{ item.message }}</p>
          <p class="mt-1 text-xs text-slate-500">
            {{ formatDate(item.created_at) }}
          </p>
        </div>

        <p v-if="!feedbacks.length" class="text-sm text-slate-500">
          Belum ada feedback pada pengaduan ini.
        </p>
      </div>

      <div class="mt-4 space-y-2">
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
        <Button
          severity="primary"
          label="Kirim Feedback"
          :disabled="selected?.status === 'done'"
          @click="handleSubmitFeedback"
        />
      </div>
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
