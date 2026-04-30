<template>
  <div class="space-y-3">
    <!-- Table Container with responsive scroll -->
    <div
      class="overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-sm shadow-slate-900/5"
    >
      <table class="w-full text-sm">
        <!-- Table Header -->
        <thead>
          <tr
            class="border-b border-slate-200 bg-linear-to-r from-slate-50 to-slate-100"
          >
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-left font-bold text-slate-900"
              :class="{ 'cursor-pointer hover:bg-slate-200': column.sortable }"
              @click="column.sortable && toggleSort(column.key)"
            >
              <div class="flex items-center gap-2">
                <!-- Column Icon -->
                <component
                  v-if="column.icon"
                  :is="column.icon"
                  :size="16"
                  class="shrink-0 text-slate-600"
                />
                <span>{{ column.label }}</span>
                <!-- Sort Indicator -->
                <ArrowUp
                  v-if="
                    column.sortable &&
                    sortKey === column.key &&
                    sortDirection === 'asc'
                  "
                  :size="16"
                  class="ml-auto text-slate-600"
                />
                <ArrowDown
                  v-else-if="
                    column.sortable &&
                    sortKey === column.key &&
                    sortDirection === 'desc'
                  "
                  :size="16"
                  class="ml-auto text-slate-600"
                />
              </div>
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody v-if="items.length > 0">
          <tr
            v-for="(item, index) in paginatedItems"
            :key="item.id || index"
            class="border-b border-slate-100 transition-colors hover:bg-slate-50"
          >
            <td v-for="column in columns" :key="column.key" class="px-4 py-3">
              <slot
                :name="`cell-${column.key}`"
                :item="item"
                :value="item[column.key]"
                :index="startIndex + index"
                :row-number="startIndex + index + 1"
              >
                <!-- Default cell rendering -->
                <div class="text-slate-900">
                  {{ formatCellValue(item[column.key], column) }}
                </div>
              </slot>
            </td>
          </tr>
        </tbody>

        <!-- Empty State -->
        <tbody v-else>
          <tr>
            <td :colspan="columns.length" class="px-4 py-8 text-center">
              <EmptyState
                :title="emptyTitle"
                :message="emptyMessage"
                :icon="emptyIcon"
                :action-label="emptyActionLabel"
                @action="$emit('empty-action')"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
    >
      <div class="text-sm text-slate-600">
        Menampilkan {{ startIndex + 1 }} hingga
        {{ Math.min(endIndex, items.length) }} dari {{ items.length }} data
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50"
        >
          <ChevronLeft :size="16" />
          Sebelumnya
        </button>

        <div class="flex items-center gap-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium',
              currentPage === page
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50',
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50"
        >
          Selanjutnya
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-vue-next";
import EmptyState from "./EmptyState.vue";

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    // [{ key: 'id', label: 'ID', icon: UserIcon, sortable: true }, ...]
  },
  items: {
    type: Array,
    required: true,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  emptyTitle: {
    type: String,
    default: "Tidak ada data",
  },
  emptyMessage: {
    type: String,
    default: "Tidak ada data yang sesuai dengan kriteria pencarian Anda",
  },
  emptyIcon: {
    type: [String, Object],
    default: "inbox",
  },
  emptyActionLabel: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["sort", "empty-action"]);

const currentPage = ref(1);
const sortKey = ref(null);
const sortDirection = ref("asc");

const totalPages = computed(() =>
  Math.ceil(props.items.length / props.pageSize),
);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize;
  const end = start + props.pageSize;
  return props.items.slice(start, end);
});

const startIndex = computed(() => (currentPage.value - 1) * props.pageSize);
const endIndex = computed(() => startIndex.value + props.pageSize);

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDirection.value = "asc";
  }
  emit("sort", { sortKey: sortKey.value, sortDirection: sortDirection.value });
};

const formatCellValue = (value, column) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).substring(0, 100);
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const goToPage = (page) => {
  currentPage.value = page;
};
</script>

<style scoped>
table {
  border-collapse: collapse;
}
</style>
