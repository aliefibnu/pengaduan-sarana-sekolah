<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import DataTable from "@/components/DataTable.vue";
import { useAuthStore } from "@/stores/authStore";
import { useCategoryStore } from "@/stores/categoryStore";
import {
  closeLoading,
  confirmAction,
  openLoading,
  showError,
  showSuccess,
} from "@/utils/notifications";
import { formatDate } from "@/utils/format";
import { Tag, Plus, Edit2, Trash2 } from "lucide-vue-next";

const authStore = useAuthStore();
const categoryStore = useCategoryStore();
const { items, loading, submitting } = storeToRefs(categoryStore);

const keyword = ref("");
const createDialogVisible = ref(false);
const editDialogVisible = ref(false);
const activeCategoryId = ref("");

const columns = [
  { key: "name", label: "Nama Kategori", icon: Tag, sortable: true },
  { key: "created_at", label: "Dibuat", icon: null, sortable: true },
  { key: "actions", label: "Aksi", icon: null, sortable: false },
];

const createForm = reactive({
  name: "",
});

const editForm = reactive({
  name: "",
});

const filteredItems = computed(() => {
  const q = keyword.value.trim().toLowerCase();

  if (!q) {
    return items.value;
  }

  return items.value.filter((item) => item.name.toLowerCase().includes(q));
});

function resetCreateForm() {
  createForm.name = "";
}

function openCreateDialog() {
  resetCreateForm();
  createDialogVisible.value = true;
}

function openEditDialog(item) {
  activeCategoryId.value = item.id;
  editForm.name = item.name;
  editDialogVisible.value = true;
}

async function loadCategories() {
  try {
    await categoryStore.loadAll();
  } catch (error) {
    showError(error.message);
  }
}

async function handleCreateCategory() {
  if (!authStore.user?.id) return;

  if (!createForm.name.trim()) {
    showError("Nama kategori wajib diisi.");
    return;
  }

  openLoading("Menambahkan kategori...");
  try {
    await categoryStore.add({
      name: createForm.name,
      createdBy: authStore.user.id,
    });
    createDialogVisible.value = false;
    showSuccess("Kategori berhasil ditambahkan.");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}

async function handleUpdateCategory() {
  if (!activeCategoryId.value) return;

  if (!editForm.name.trim()) {
    showError("Nama kategori wajib diisi.");
    return;
  }

  openLoading("Menyimpan perubahan kategori...");
  try {
    await categoryStore.update({
      id: activeCategoryId.value,
      name: editForm.name,
    });
    editDialogVisible.value = false;
    showSuccess("Kategori berhasil diperbarui.");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}

async function handleDeleteCategory(item) {
  const confirmed = await confirmAction({
    title: "Hapus kategori ini?",
    message: `Kategori "${item.name}" akan dihapus dari daftar pilihan kategori.`,
    okText: "Hapus",
    cancelText: "Batal",
  });

  if (!confirmed) return;

  openLoading("Menghapus kategori...");
  try {
    await categoryStore.remove(item.id);
    showSuccess("Kategori berhasil dihapus.");
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}

onMounted(loadCategories);
</script>

<template>
  <section class="space-y-6">
    <!-- Header & Actions -->
    <div
      class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
    >
      <div class="space-y-1">
        <h1 class="flex items-center gap-3 text-3xl font-bold text-slate-900">
          <Tag :size="28" class="text-teal-600" />
          Manajemen Kategori
        </h1>
        <p class="text-sm text-slate-600">
          Kelola kategori pengaduan agar pilihan siswa dan admin selalu relevan
        </p>
      </div>
      <Button
        label="Tambah Kategori"
        icon="pi pi-plus"
        :loading="submitting"
        @click="openCreateDialog"
        class="bg-teal-600 text-white hover:bg-teal-700"
      />
    </div>

    <!-- Search Bar -->
    <div>
      <InputText
        v-model="keyword"
        class="w-full rounded-lg border border-slate-300 px-4 py-2.5 placeholder-slate-500 md:w-96"
        placeholder="🔍 Cari nama kategori"
      />
    </div>

    <!-- Data Table -->
    <div
      class="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm"
    >
      <div class="overflow-x-auto">
        <DataTable
          :columns="columns"
          :items="filteredItems"
          :loading="loading"
          empty-title="Belum ada kategori"
          empty-message="Mulai dengan menambahkan kategori pertama"
          @empty-action="openCreateDialog"
        >
          <template #cell-name="{ item }">
            <div class="flex items-center gap-2">
              <Tag :size="16" class="text-teal-600" />
              <span class="font-semibold text-slate-900">{{ item.name }}</span>
            </div>
          </template>

          <template #cell-created_at="{ item }">
            <span class="text-sm text-slate-700">{{
              formatDate(item.created_at)
            }}</span>
          </template>

          <template #cell-actions="{ item }">
            <div class="flex flex-wrap gap-2">
              <button
                @click="openEditDialog(item)"
                :disabled="submitting"
                class="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <Edit2 :size="16" />
                Edit
              </button>
              <button
                @click="handleDeleteCategory(item)"
                :disabled="submitting"
                class="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 :size="16" />
                Hapus
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Create Dialog -->
    <Dialog
      v-model:visible="createDialogVisible"
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
            v-model="createForm.name"
            class="w-full"
            required
            placeholder="Contoh: Aula, Kantin, Kamar Mandi"
          />
        </label>

        <div class="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button
            label="Batal"
            severity="secondary"
            outlined
            type="button"
            @click="createDialogVisible = false"
          />
          <Button label="Simpan" type="submit" :loading="submitting" />
        </div>
      </form>
    </Dialog>

    <!-- Edit Dialog -->
    <Dialog
      v-model:visible="editDialogVisible"
      modal
      header="Ubah Kategori"
      :style="{ width: 'min(28rem, 94vw)' }"
    >
      <form class="space-y-4" @submit.prevent="handleUpdateCategory">
        <label class="admin-input space-y-2">
          <div class="flex items-center gap-2">
            <Tag :size="18" class="text-teal-600" />
            <span class="font-semibold text-slate-900">Nama Kategori</span>
            <span class="text-red-500">*</span>
          </div>
          <InputText
            v-model="editForm.name"
            class="w-full"
            required
            placeholder="Contoh: Aula, Kantin, Kamar Mandi"
          />
        </label>

        <div class="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button
            label="Batal"
            severity="secondary"
            outlined
            type="button"
            @click="editDialogVisible = false"
          />
          <Button label="Simpan" type="submit" :loading="submitting" />
        </div>
      </form>
    </Dialog>
  </section>
</template>
