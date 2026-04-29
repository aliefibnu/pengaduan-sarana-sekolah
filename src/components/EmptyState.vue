<template>
  <div class="flex flex-col items-center justify-center space-y-3 py-8">
    <!-- Icon -->
    <div v-if="iconComponent" class="text-slate-300">
      <component :is="iconComponent" :size="48" />
    </div>

    <!-- Emoji Icon -->
    <div v-else-if="icon" class="text-5xl">{{ icon }}</div>

    <!-- Title -->
    <h3 class="text-center text-lg font-bold text-slate-900">{{ title }}</h3>

    <!-- Message -->
    <p class="max-w-sm text-center text-sm text-slate-600">{{ message }}</p>

    <!-- Action Button -->
    <button
      v-if="actionLabel"
      @click="$emit('action')"
      class="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-700"
    >
      <Plus :size="16" />
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  Inbox,
  FileText,
  Users,
  FolderOpen,
  Search,
  AlertCircle,
  Plus,
} from "lucide-vue-next";

const props = defineProps({
  title: {
    type: String,
    default: "Tidak ada data",
  },
  message: {
    type: String,
    default: "Tidak ada data yang sesuai dengan kriteria pencarian Anda",
  },
  icon: {
    type: String,
    default: "📭",
  },
  iconType: {
    type: String,
    default: "inbox",
    // inbox, document, users, folder, search, alert
  },
  actionLabel: {
    type: String,
    default: null,
  },
});

defineEmits(["action"]);

const iconComponent = computed(() => {
  const iconMap = {
    inbox: Inbox,
    document: FileText,
    users: Users,
    folder: FolderOpen,
    search: Search,
    alert: AlertCircle,
  };
  return iconMap[props.iconType] || null;
});
</script>
