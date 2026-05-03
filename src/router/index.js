import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { applyRouteSeo } from "@/utils/seo";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/HomeView.vue"),
      meta: {
        title: "Benerin Dong",
        description:
          "Aplikasi Benerin Dong untuk siswa dan admin dengan alur laporan yang cepat, transparan, dan mudah dipantau.",
      },
    },
    {
      path: "/complaints/:id",
      name: "public-complaint-detail",
      component: () => import("@/pages/public/PublicComplaintDetailPage.vue"),
      meta: {
        title: "Detail Aduan - Benerin Dong",
        description:
          "Lihat detail aduan secara read-only lengkap dengan status dan riwayat penanganan.",
      },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/pages/auth/LoginPage.vue"),
      meta: {
        guestOnly: true,
        title: "Masuk - Benerin Dong",
        description:
          "Masuk sebagai siswa dengan NIS 8 digit atau admin dengan username untuk mengakses dashboard Benerin Dong.",
        robots: "noindex, nofollow",
      },
    },
    {
      path: "/siswa",
      component: () => import("@/layouts/SiswaLayout.vue"),
      meta: {
        requiresAuth: true,
        roles: ["siswa"],
        title: "Dashboard Siswa - Pengaduan Sarana Sekolah",
        description:
          "Dashboard siswa untuk melihat status pengaduan, riwayat laporan, dan feedback dari admin.",
        robots: "noindex, nofollow",
      },
      children: [
        {
          path: "",
          name: "siswa-dashboard",
          component: () => import("@/pages/siswa/SiswaDashboardPage.vue"),
          meta: {
            title: "Dashboard Siswa - Pengaduan Sarana Sekolah",
            description:
              "Dashboard siswa untuk melihat status pengaduan, riwayat laporan, dan feedback dari admin.",
            robots: "noindex, nofollow",
          },
        },
        {
          path: "new",
          name: "siswa-new-complaint",
          component: () => import("@/pages/siswa/SiswaCreateComplaintPage.vue"),
          meta: {
            title: "Buat Pengaduan - Pengaduan Sarana Sekolah",
            description:
              "Kirim pengaduan sarana sekolah baru dengan judul, deskripsi, kategori, dan foto opsional.",
            robots: "noindex, nofollow",
          },
        },
        {
          path: "history",
          name: "siswa-history",
          component: () => import("@/pages/siswa/SiswaHistoryPage.vue"),
          meta: {
            title: "Riwayat Pengaduan - Pengaduan Sarana Sekolah",
            description:
              "Lihat seluruh riwayat pengaduan siswa beserta status dan feedback terbaru.",
            robots: "noindex, nofollow",
          },
        },
        {
          path: "history/:id",
          name: "siswa-history-detail",
          component: () => import("@/pages/siswa/SiswaComplaintDetailPage.vue"),
          meta: {
            title: "Detail Pengaduan - Pengaduan Sarana Sekolah",
            description:
              "Detail pengaduan siswa untuk memantau status, kronologi, dan feedback admin.",
            robots: "noindex, nofollow",
          },
        },
      ],
    },
    {
      path: "/admin",
      component: () => import("@/layouts/AdminLayout.vue"),
      meta: {
        requiresAuth: true,
        roles: ["admin"],
        title: "Dashboard Admin - Pengaduan Sarana Sekolah",
        description:
          "Dashboard admin untuk memantau, memproses, dan memberi feedback pada seluruh pengaduan sarana sekolah.",
        robots: "noindex, nofollow",
      },
      children: [
        {
          path: "",
          name: "admin-dashboard",
          component: () => import("@/pages/admin/AdminDashboardPage.vue"),
          meta: {
            title: "Dashboard Admin - Pengaduan Sarana Sekolah",
            description:
              "Dashboard admin untuk memantau, memproses, dan memberi feedback pada seluruh pengaduan sarana sekolah.",
            robots: "noindex, nofollow",
          },
        },
        {
          path: "complaints",
          name: "admin-complaints",
          component: () => import("@/pages/admin/AdminComplaintsPage.vue"),
          meta: {
            title: "Manajemen Pengaduan - Pengaduan Sarana Sekolah",
            description:
              "Kelola seluruh pengaduan, filter laporan, ubah status, dan kirim feedback dari satu tempat.",
            robots: "noindex, nofollow",
          },
        },
        {
          path: "complaints/:id",
          name: "admin-complaint-detail",
          component: () => import("@/pages/admin/AdminComplaintDetailPage.vue"),
          meta: {
            title: "Detail Pengaduan Admin - Pengaduan Sarana Sekolah",
            description:
              "Halaman detail pengaduan untuk admin melihat kronologi, mengubah status, dan menambahkan feedback.",
            robots: "noindex, nofollow",
          },
        },
        {
          path: "users",
          name: "admin-users",
          component: () => import("@/pages/admin/AdminUsersPage.vue"),
          meta: {
            title: "Manajemen User - Pengaduan Sarana Sekolah",
            description:
              "Kelola akun siswa dari dashboard admin, termasuk membuat, mengubah, dan menghapus akun.",
            robots: "noindex, nofollow",
          },
        },
        {
          path: "categories",
          name: "admin-categories",
          component: () => import("@/pages/admin/AdminCategoriesPage.vue"),
          meta: {
            title: "Manajemen Kategori - Pengaduan Sarana Sekolah",
            description:
              "Kelola kategori aduan agar pilihan kategori tetap relevan untuk siswa dan admin.",
            robots: "noindex, nofollow",
          },
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

router.afterEach((to) => {
  applyRouteSeo(to);
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.initialized) {
    await authStore.initAuth();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const role = authStore.role;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: "login" };
  }

  if (to.meta.guestOnly && isAuthenticated) {
    if (role === "admin") {
      return { name: "admin-dashboard" };
    }

    return { name: "siswa-dashboard" };
  }

  if (to.name === "home" && isAuthenticated) {
    if (role === "admin") {
      return { name: "admin-dashboard" };
    }

    if (role === "siswa") {
      return { name: "siswa-dashboard" };
    }
  }

  if (to.meta.roles && !to.meta.roles.includes(role)) {
    if (role === "admin") {
      return { name: "admin-dashboard" };
    }

    if (role === "siswa") {
      return { name: "siswa-dashboard" };
    }

    return { name: "login" };
  }

  return true;
});

export default router;
