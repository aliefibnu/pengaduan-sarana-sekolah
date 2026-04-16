import { computed, ref } from "vue";
import { defineStore } from "pinia";
import {
  createComplaint,
  deleteOwnComplaint,
  fetchAllComplaints,
  fetchAllComplaintsForExport,
  fetchAllComplaintsPaginated,
  fetchComplaintById,
  fetchMyComplaints,
  markComplaintAsDone,
  updateOwnComplaint,
  uploadComplaintImage,
} from "@/services/complaintService";

export const useComplaintStore = defineStore("complaints", () => {
  const items = ref([]);
  const selected = ref(null);
  const loading = ref(false);
  const submitting = ref(false);
  const filters = ref({
    date: "",
    month: "",
    userId: "",
    category: "",
  });
  const listMeta = ref({
    page: 1,
    pageSize: 8,
    total: 0,
    searchTerm: "",
    sortBy: "created_at",
    sortDirection: "desc",
  });

  const statusCount = computed(() => {
    return items.value.reduce(
      (acc, item) => {
        acc.total += 1;
        acc[item.status] += 1;
        return acc;
      },
      { total: 0, pending: 0, process: 0, done: 0 },
    );
  });

  async function loadMine(userId) {
    loading.value = true;
    try {
      items.value = await fetchMyComplaints(userId);
    } finally {
      loading.value = false;
    }
  }

  async function loadAll(nextFilters = filters.value) {
    loading.value = true;
    filters.value = { ...nextFilters };

    try {
      items.value = await fetchAllComplaints(filters.value);
    } finally {
      loading.value = false;
    }
  }

  async function loadAllPaginated({
    nextFilters = filters.value,
    page = listMeta.value.page,
    pageSize = listMeta.value.pageSize,
    searchTerm = listMeta.value.searchTerm,
    sortBy = listMeta.value.sortBy,
    sortDirection = listMeta.value.sortDirection,
  } = {}) {
    loading.value = true;
    filters.value = { ...nextFilters };

    try {
      const result = await fetchAllComplaintsPaginated({
        filters: filters.value,
        page,
        pageSize,
        searchTerm,
        sortBy,
        sortDirection,
      });

      items.value = result.items;
      listMeta.value = {
        page,
        pageSize,
        total: result.total,
        searchTerm,
        sortBy,
        sortDirection,
      };
    } finally {
      loading.value = false;
    }
  }

  async function exportAllFiltered({
    nextFilters = filters.value,
    searchTerm = listMeta.value.searchTerm,
    sortBy = listMeta.value.sortBy,
    sortDirection = listMeta.value.sortDirection,
  } = {}) {
    return fetchAllComplaintsForExport({
      filters: nextFilters,
      searchTerm,
      sortBy,
      sortDirection,
    });
  }

  async function submitComplaint({
    userId,
    title,
    description,
    category,
    imageFile,
  }) {
    submitting.value = true;

    try {
      let imagePath = null;
      if (imageFile) {
        imagePath = await uploadComplaintImage(imageFile, userId);
      }

      const created = await createComplaint({
        user_id: userId,
        title,
        description,
        category,
        image_path: imagePath,
        status: "pending",
      });

      items.value = [created, ...items.value];
      return created;
    } finally {
      submitting.value = false;
    }
  }

  async function loadDetail(complaintId) {
    loading.value = true;

    try {
      selected.value = await fetchComplaintById(complaintId);
      return selected.value;
    } finally {
      loading.value = false;
    }
  }

  async function markAsDone({ complaintId }) {
    submitting.value = true;

    try {
      const updated = await markComplaintAsDone({ complaintId });
      const idx = items.value.findIndex((item) => item.id === complaintId);

      if (idx !== -1) {
        items.value[idx] = updated;
      }

      if (selected.value?.id === complaintId) {
        selected.value = updated;
      }

      return updated;
    } finally {
      submitting.value = false;
    }
  }

  async function updateOwn({
    complaintId,
    userId,
    title,
    description,
    category,
  }) {
    submitting.value = true;

    try {
      const updated = await updateOwnComplaint({
        complaintId,
        userId,
        title,
        description,
        category,
      });

      const idx = items.value.findIndex((item) => item.id === complaintId);
      if (idx !== -1) {
        items.value[idx] = updated;
      }

      if (selected.value?.id === complaintId) {
        selected.value = updated;
      }

      return updated;
    } finally {
      submitting.value = false;
    }
  }

  async function removeOwn({ complaintId, userId }) {
    submitting.value = true;

    try {
      await deleteOwnComplaint({ complaintId, userId });
      items.value = items.value.filter((item) => item.id !== complaintId);

      if (selected.value?.id === complaintId) {
        selected.value = null;
      }
    } finally {
      submitting.value = false;
    }
  }

  return {
    items,
    selected,
    loading,
    submitting,
    filters,
    listMeta,
    statusCount,
    loadMine,
    loadAll,
    loadAllPaginated,
    exportAllFiltered,
    submitComplaint,
    loadDetail,
    markAsDone,
    updateOwn,
    removeOwn,
  };
});
