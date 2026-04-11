import { ref } from "vue";
import { defineStore } from "pinia";
import {
  createFeedback,
  fetchFeedbackByComplaintId,
} from "@/services/feedbackService";

export const useFeedbackStore = defineStore("feedback", () => {
  const items = ref([]);
  const loading = ref(false);
  const submitting = ref(false);

  async function loadByComplaintId(complaintId) {
    loading.value = true;
    try {
      items.value = await fetchFeedbackByComplaintId(complaintId);
    } finally {
      loading.value = false;
    }
  }

  async function addFeedback(payload) {
    submitting.value = true;

    try {
      const created = await createFeedback(payload);
      items.value = [created, ...items.value];
      return created;
    } finally {
      submitting.value = false;
    }
  }

  return {
    items,
    loading,
    submitting,
    loadByComplaintId,
    addFeedback,
  };
});
