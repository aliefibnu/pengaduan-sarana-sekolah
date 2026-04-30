<script setup>
import { computed, onMounted, ref, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import Slider from "primevue/slider";
import Textarea from "primevue/textarea";
import DataTable from "@/components/DataTable.vue";
import { fetchComplaintById } from "@/services/complaintService";
import {
  fetchFeedbackByComplaintId,
  createFeedback,
} from "@/services/feedbackService";
import { formatDate } from "@/utils/format";
import {
  closeLoading,
  openLoading,
  showError,
  showSuccess,
} from "@/utils/notifications";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Calendar,
  TrendingUp,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const submitting = ref(false);
const selected = ref(null);
const feedbacks = ref([]);
const imagePreviewVisible = ref(false);
const newFeedback = reactive({ message: "", progress_percentage: 0 });

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

const timelineItems = computed(() => {
  return [...feedbacks.value].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );
});

const latestTimelineProgress = computed(() => {
  const item = feedbacks.value.find((f) => f.progress_percentage !== null);
  return item?.progress_percentage ?? null;
});

async function loadData() {
  loading.value = true;
  try {
    const [complaintData, feedbackData] = await Promise.all([
      fetchComplaintById(route.params.id),
      fetchFeedbackByComplaintId(route.params.id),
    ]);
    selected.value = complaintData;
    feedbacks.value = feedbackData;
  } catch (error) {
    showError(error.message);
  } finally {
    loading.value = false;
  }
}

async function handleAddFeedback() {
  if (!newFeedback.message.trim()) {
    showError("Pesan feedback wajib diisi.");
    return;
  }

  submitting.value = true;
  openLoading("Menambahkan feedback...");
  try {
    await createFeedback({
      complaint_id: route.params.id,
      message: newFeedback.message,
      progress_percentage: newFeedback.progress_percentage,
    });
    showSuccess("Feedback berhasil ditambahkan.");
    newFeedback.message = "";
    newFeedback.progress_percentage = 0;
    await loadData();
  } catch (error) {
    showError(error.message);
  } finally {
    submitting.value = false;
    closeLoading();
  }
}

function openImagePreview() {
  imagePreviewVisible.value = true;
}

onMounted(loadData);
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center gap-3">
      <button
        @click="router.push('/admin/complaints')"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <ArrowLeft :size="18" />
        Kembali
      </button>
    </div>

    <article class="rounded-lg border border-slate-300 bg-white shadow-sm">
      <div
        class="border-b border-slate-200 bg-gradient-to-r from-teal-50 to-teal-100 px-6 py-4"
      >
        <h1 class="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <AlertCircle :size="24" class="text-slate-600" />
          {{ selected?.title || "Loading..." }}
        </h1>
      </div>

      <div v-if="loading" class="px-6 py-8 text-center text-slate-500">
        Memuat detail pengaduan...
      </div>

      <div v-else-if="selected" class="space-y-4 px-6 py-6">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-xs text-slate-600">
              <strong>Dibuat:</strong> {{ formatDate(selected.created_at) }}
            </p>
            <p class="text-xs text-slate-600">
              <strong>Kategori:</strong> {{ selected.category }}
            </p>
          </div>
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

        <p
          class="border-t border-slate-200 pt-4 text-sm leading-relaxed text-slate-700"
        >
          {{ selected.description }}
        </p>

        <img
          v-if="selected.image_url"
          :src="selected.image_url"
          alt="Bukti"
          class="max-h-64 w-full rounded-lg border border-slate-300 object-cover"
        />
      </div>
    </article>

    <div
      v-if="latestTimelineProgress !== null"
      class="rounded-lg border border-slate-300 bg-slate-50 p-4"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-slate-900">Progres Penanganan</p>
          <p class="text-2xl font-bold text-slate-700">
            {{ latestTimelineProgress }}%
          </p>
        </div>
        <div class="flex-1">
          <div class="h-3 rounded-full bg-slate-200">
            <div
              class="h-3 rounded-full bg-slate-600 transition-all"
              :style="{ width: `${latestTimelineProgress}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <article class="rounded-lg border border-slate-300 bg-white shadow-sm">
      <div
        class="border-b border-slate-200 bg-gradient-to-r from-teal-50 to-teal-100 px-6 py-4"
      >
        <h2 class="flex items-center gap-2 text-xl font-bold text-slate-900">
          <MessageSquare :size="24" class="text-slate-600" />
          Riwayat Feedback
        </h2>
      </div>

      <div class="overflow-x-auto">
        <DataTable
          :columns="feedbackColumns"
          :items="timelineItems"
          :page-size="10"
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

      <div class="border-t border-slate-200 px-6 py-6">
        <h3 class="mb-4 font-semibold text-slate-900">Tambah Feedback Baru</h3>
        <form class="space-y-4" @submit.prevent="handleAddFeedback">
          <label class="space-y-2">
            <span class="text-sm font-semibold text-slate-900">Pesan</span>
            <Textarea
              v-model="newFeedback.message"
              rows="3"
              class="w-full"
              placeholder="Tuliskan feedback atau update penanganan"
            />
          </label>

          <label class="space-y-2">
            <span class="text-sm font-semibold text-slate-900"
              >Progres Penanganan (%):
              {{ newFeedback.progress_percentage }}</span
            >
            <Slider
              v-model="newFeedback.progress_percentage"
              :min="0"
              :max="100"
              class="w-full"
            />
          </label>

          <div class="flex justify-end gap-2">
            <Button
              type="submit"
              label="Kirim Feedback"
              :loading="submitting"
            />
          </div>
        </form>
      </div>
    </article>
  </section>
</template>
