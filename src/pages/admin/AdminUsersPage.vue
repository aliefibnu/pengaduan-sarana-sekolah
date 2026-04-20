<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Tag from "primevue/tag";
import {
  closeLoading,
  confirmAction,
  openLoading,
  showError,
  showSuccess,
} from "@/utils/notifications";
import {
  createSiswaUserByAdmin,
  deleteUserByAdmin,
  fetchUsers,
  updateUser,
} from "@/services/userService";

const users = ref([]);
const loading = ref(false);
const keyword = ref("");

const createDialogVisible = ref(false);
const editDialogVisible = ref(false);
const activeUserId = ref("");

const createForm = reactive({
  name: "",
  identity: "",
  password: "",
});

const editForm = reactive({
  name: "",
});

const filteredUsers = computed(() => {
  const siswaOnly = users.value.filter((item) => item.role === "siswa");
  const q = keyword.value.trim().toLowerCase();

  if (!q) {
    return siswaOnly;
  }

  return siswaOnly.filter((item) => {
    return (
      item.name.toLowerCase().includes(q) ||
      item.role.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });
});

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function resetCreateForm() {
  createForm.name = "";
  createForm.identity = "";
  createForm.password = "";
}

function handleIdentityInput(event) {
  const nextValue = String(event?.target?.value || "")
    .replace(/\D/g, "")
    .slice(0, 8);
  createForm.identity = nextValue;
}

function openCreateDialog() {
  resetCreateForm();
  createDialogVisible.value = true;
}

function openEditDialog(user) {
  if (user.role !== "siswa") {
    showError("Hanya akun siswa yang bisa diubah dari halaman ini.");
    return;
  }

  activeUserId.value = user.id;
  editForm.name = user.name;
  editDialogVisible.value = true;
}

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

async function handleCreateUser() {
  if (!createForm.name.trim()) {
    showError("Nama siswa wajib diisi.");
    return;
  }

  if (!createForm.identity.trim()) {
    showError("NIS wajib diisi.");
    return;
  }

  if (createForm.password.length < 6) {
    showError("Password minimal 6 karakter.");
    return;
  }

  openLoading("Membuat akun siswa...");

  try {
    await createSiswaUserByAdmin({
      name: createForm.name,
      identity: createForm.identity,
      password: createForm.password,
    });

    createDialogVisible.value = false;
    showSuccess("Akun siswa berhasil dibuat.");
    await loadUsers();
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}

async function handleUpdateUser() {
  if (!activeUserId.value) {
    return;
  }

  if (!editForm.name.trim()) {
    showError("Nama siswa wajib diisi.");
    return;
  }

  openLoading("Menyimpan perubahan user...");

  try {
    await updateUser(activeUserId.value, {
      name: editForm.name.trim(),
      role: "siswa",
    });

    editDialogVisible.value = false;
    showSuccess("Data user berhasil diperbarui.");
    await loadUsers();
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}

async function handleDeleteUser(user) {
  if (user.role !== "siswa") {
    showError("Hanya akun siswa yang bisa dihapus dari halaman ini.");
    return;
  }

  const confirmed = await confirmAction({
    title: "Hapus akun siswa?",
    message: `Akun ${user.name} akan dihapus permanen dari sistem auth.`,
    okText: "Hapus",
    cancelText: "Batal",
  });

  if (!confirmed) {
    return;
  }

  openLoading("Menghapus akun siswa...");

  try {
    await deleteUserByAdmin(user.id);
    showSuccess("Akun siswa berhasil dihapus.");
    await loadUsers();
  } catch (error) {
    showError(error.message);
  } finally {
    closeLoading();
  }
}

onMounted(loadUsers);
</script>

<template>
  <section
    class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-6"
  >
    <header
      class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h2 class="text-xl font-bold text-slate-900">Manajemen User</h2>
        <p class="text-sm text-slate-600">
          Admin membuat akun siswa, mengubah nama, dan menghapus akun jika
          diperlukan.
        </p>
      </div>
      <Button
        label="Buat Akun Siswa"
        icon="pi pi-plus"
        @click="openCreateDialog"
      />
    </header>

    <div class="mt-4">
      <InputText
        v-model="keyword"
        class="w-full md:w-96"
        placeholder="Cari nama, role, atau id user"
      />
    </div>

    <div class="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
      <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead class="bg-slate-50 text-slate-700">
          <tr>
            <th class="px-4 py-3 font-semibold">Nama</th>
            <th class="px-4 py-3 font-semibold">Role</th>
            <th class="px-4 py-3 font-semibold">Dibuat</th>
            <th class="px-4 py-3 font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr v-if="loading">
            <td colspan="4" class="px-4 py-6 text-center text-slate-500">
              Memuat data user...
            </td>
          </tr>
          <tr v-else-if="filteredUsers.length === 0">
            <td colspan="4" class="px-4 py-6 text-center text-slate-500">
              Tidak ada user yang cocok.
            </td>
          </tr>
          <tr v-for="item in filteredUsers" :key="item.id">
            <td class="px-4 py-3">
              <p class="font-semibold text-slate-900">{{ item.name }}</p>
              <p class="text-xs text-slate-500">{{ item.id }}</p>
            </td>
            <td class="px-4 py-3">
              <Tag :value="item.role" severity="info" />
            </td>
            <td class="px-4 py-3 text-slate-600">
              {{ formatDate(item.created_at) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-2">
                <Button
                  label="Ubah"
                  size="small"
                  severity="secondary"
                  @click="openEditDialog(item)"
                />
                <Button
                  label="Hapus"
                  size="small"
                  severity="danger"
                  outlined
                  @click="handleDeleteUser(item)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog
      v-model:visible="createDialogVisible"
      modal
      header="Buat Akun Siswa"
      :style="{ width: '32rem' }"
    >
      <form class="space-y-4" @submit.prevent="handleCreateUser">
        <label class="block space-y-2 text-sm">
          <span>Nama lengkap</span>
          <InputText v-model="createForm.name" class="w-full" required />
        </label>

        <label class="block space-y-2 text-sm">
          <span>NIS</span>
          <InputText
            v-model="createForm.identity"
            class="w-full"
            required
            maxlength="8"
            inputmode="numeric"
            placeholder="8 digit NIS"
            @input="handleIdentityInput"
          />
        </label>

        <label class="block space-y-2 text-sm">
          <span>Password</span>
          <Password
            v-model="createForm.password"
            :feedback="false"
            toggle-mask
            input-class="w-full"
            class="w-full"
            required
            minlength="6"
          />
        </label>

        <p class="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
          Role akun otomatis siswa dan hanya bisa login lewat halaman login.
        </p>

        <div class="flex justify-end gap-2 pt-2">
          <Button
            label="Batal"
            severity="secondary"
            outlined
            type="button"
            @click="createDialogVisible = false"
          />
          <Button label="Buat Akun" type="submit" />
        </div>
      </form>
    </Dialog>

    <Dialog
      v-model:visible="editDialogVisible"
      modal
      header="Ubah Data User"
      :style="{ width: '30rem' }"
    >
      <form class="space-y-4" @submit.prevent="handleUpdateUser">
        <label class="block space-y-2 text-sm">
          <span>Nama lengkap</span>
          <InputText v-model="editForm.name" class="w-full" required />
        </label>

        <p class="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Role user dikunci sebagai siswa sesuai kebijakan aplikasi login-only.
        </p>

        <div class="flex justify-end gap-2 pt-2">
          <Button
            label="Batal"
            severity="secondary"
            outlined
            type="button"
            @click="editDialogVisible = false"
          />
          <Button label="Simpan" type="submit" />
        </div>
      </form>
    </Dialog>
  </section>
</template>
