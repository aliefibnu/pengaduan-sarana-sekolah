<script setup>
import { onMounted, reactive, ref } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import DataTable from "@/components/DataTable.vue";
import {
  fetchUsers,
  createSiswaUserByAdmin,
  updateUser,
  deleteUserByAdmin,
} from "@/services/userService";
import {
  closeLoading,
  confirmAction,
  openLoading,
  showError,
  showSuccess,
} from "@/utils/notifications";
import { formatDate } from "@/utils/format";
import { Users, Plus, Edit2, Trash2 } from "lucide-vue-next";

const NIS_REGEX = /^\d{1,8}$/;

const users = ref([]);
const loading = ref(false);
const createDialogVisible = ref(false);
const editDialogVisible = ref(false);
const submitting = ref(false);
const activeUserId = ref("");

const columns = [
  { key: "name", label: "Nama Siswa", icon: Users, sortable: true },
  { key: "role", label: "Role", icon: null, sortable: true },
  { key: "created_at", label: "Dibuat", icon: null, sortable: true },
  { key: "actions", label: "Aksi", icon: null, sortable: false },
];

const createForm = reactive({ name: "", nis: "", password: "" });
const editForm = reactive({ name: "", nis: "", password: "" });

async function loadUsers() {
  loading.value = true;
  try {
    users.value = await fetchUsers();
  } catch (error) {
    showError(error.message);
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  createForm.name = "";
  createForm.nis = "";
  createForm.password = "";
  createDialogVisible.value = true;
}

function openEditDialog(user) {
  activeUserId.value = user.id;
  editForm.name = user.name;
  editForm.nis = user.nis;
  editForm.password = "";
  editDialogVisible.value = true;
}

async function handleCreateUser() {
  const nis = createForm.nis.trim();

  if (!createForm.name.trim() || !nis || !createForm.password.trim()) {
    showError("Semua field wajib diisi.");
    return;
  }

  if (!NIS_REGEX.test(nis)) {
    showError("NIS siswa harus 1-8 digit angka.");
    return;
  }

  submitting.value = true;
  openLoading("Menambahkan user...");
  try {
    await createSiswaUserByAdmin({
      name: createForm.name,
      identity: nis,
      password: createForm.password,
    });
    createDialogVisible.value = false;
    createForm.name = "";
    createForm.nis = "";
    createForm.password = "";
    showSuccess("User berhasil ditambahkan.");
    await loadUsers();
  } catch (error) {
    showError(error.message);
  } finally {
    submitting.value = false;
    closeLoading();
  }
}

async function handleUpdateUser() {
  if (!editForm.name.trim()) {
    showError("Nama wajib diisi.");
    return;
  }

  submitting.value = true;
  openLoading("Menyimpan perubahan...");
  try {
    await updateUser(activeUserId.value, {
      name: editForm.name,
      password: editForm.password || undefined,
    });
    editDialogVisible.value = false;
    showSuccess("User berhasil diperbarui.");
    await loadUsers();
  } catch (error) {
    showError(error.message);
  } finally {
    submitting.value = false;
    closeLoading();
  }
}

async function handleDeleteUser(user) {
  const confirmed = await confirmAction({
    title: "Hapus user?",
    message: `User ${user.name} akan dihapus dari sistem.`,
    okText: "Hapus",
    cancelText: "Batal",
  });

  if (!confirmed) return;

  submitting.value = true;
  openLoading("Menghapus user...");
  try {
    await deleteUserByAdmin(user.id);
    showSuccess("User berhasil dihapus.");
    await loadUsers();
  } catch (error) {
    showError(error.message);
  } finally {
    submitting.value = false;
    closeLoading();
  }
}

onMounted(loadUsers);
</script>

<template>
  <section class="space-y-6">
    <div
      class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
    >
      <div class="space-y-1">
        <h1 class="flex items-center gap-3 text-3xl font-bold text-slate-900">
          <Users :size="28" class="text-slate-700" />
          Manajemen User Siswa
        </h1>
        <p class="text-sm text-slate-600">Kelola akun siswa dan izin akses</p>
      </div>
      <Button
        label="Tambah User"
        icon="pi pi-plus"
        :loading="submitting"
        @click="openCreateDialog"
        class="bg-slate-900 text-white hover:bg-slate-800"
      />
    </div>

    <div
      class="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm"
    >
      <div class="overflow-x-auto">
        <DataTable
          :columns="columns"
          :items="users"
          :loading="loading"
          empty-title="Belum ada user"
          empty-message="Mulai dengan menambahkan user pertama"
        >
          <template #cell-name="{ item }">
            <div class="space-y-0.5">
              <p class="font-semibold text-slate-900">{{ item.name }}</p>
              <p class="font-mono text-xs text-slate-600">{{ item.nis }}</p>
            </div>
          </template>

          <template #cell-role="{ item }">
            <span
              class="inline-block rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
            >
              {{ item.role || "siswa" }}
            </span>
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
                @click="handleDeleteUser(item)"
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

    <Dialog
      v-model:visible="createDialogVisible"
      modal
      header="Tambah User Siswa"
      :style="{ width: 'min(28rem, 94vw)' }"
    >
      <form class="space-y-4" @submit.prevent="handleCreateUser">
        <label class="admin-input space-y-2">
          <span class="font-semibold text-slate-900">Nama Siswa</span>
          <InputText
            v-model="createForm.name"
            class="w-full"
            required
            placeholder="Contoh: Ahmad Ridho"
          />
        </label>

        <label class="admin-input space-y-2">
          <span class="font-semibold text-slate-900">NIS Siswa</span>
          <InputText
            v-model="createForm.nis"
            class="w-full"
            required
            placeholder="Contoh: 12345678"
            inputmode="numeric"
            maxlength="8"
            pattern="[0-9]*"
          />
          <p class="text-xs text-slate-600">Maksimal 8 digit angka.</p>
        </label>

        <label class="admin-input space-y-2">
          <span class="font-semibold text-slate-900">Password</span>
          <Password
            v-model="createForm.password"
            toggle-mask
            :feedback="false"
            class="w-full"
            required
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

    <Dialog
      v-model:visible="editDialogVisible"
      modal
      header="Edit User Siswa"
      :style="{ width: 'min(28rem, 94vw)' }"
    >
      <form class="space-y-4" @submit.prevent="handleUpdateUser">
        <label class="admin-input space-y-2">
          <span class="font-semibold text-slate-900">Nama Siswa</span>
          <InputText v-model="editForm.name" class="w-full" required />
        </label>

        <label class="admin-input space-y-2">
          <span class="font-semibold text-slate-900"
            >Password Baru (kosongkan jika tidak diubah)</span
          >
          <Password
            v-model="editForm.password"
            toggle-mask
            :feedback="false"
            class="w-full"
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
