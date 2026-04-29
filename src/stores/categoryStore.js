import { computed, ref } from "vue";
import { defineStore } from "pinia";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/services/categoryService";

export const useCategoryStore = defineStore("categories", () => {
  const items = ref([]);
  const loading = ref(false);
  const submitting = ref(false);

  const options = computed(() => {
    return items.value.map((item) => ({
      label: item.name,
      value: item.name,
    }));
  });

  async function loadAll() {
    loading.value = true;
    try {
      items.value = await fetchCategories();
      return items.value;
    } finally {
      loading.value = false;
    }
  }

  async function add({ name, createdBy }) {
    submitting.value = true;
    try {
      const created = await createCategory({ name, createdBy });
      items.value = [...items.value, created].sort((a, b) =>
        a.name.localeCompare(b.name, "id", { sensitivity: "base" }),
      );
      return created;
    } finally {
      submitting.value = false;
    }
  }

  async function update({ id, name }) {
    submitting.value = true;
    try {
      const updated = await updateCategory({ id, name });
      const idx = items.value.findIndex((item) => item.id === id);
      if (idx !== -1) {
        items.value[idx] = updated;
      }
      items.value = [...items.value].sort((a, b) =>
        a.name.localeCompare(b.name, "id", { sensitivity: "base" }),
      );
      return updated;
    } finally {
      submitting.value = false;
    }
  }

  async function remove(id) {
    submitting.value = true;
    try {
      await deleteCategory(id);
      items.value = items.value.filter((item) => item.id !== id);
    } finally {
      submitting.value = false;
    }
  }

  return {
    items,
    loading,
    submitting,
    options,
    loadAll,
    add,
    update,
    remove,
  };
});
