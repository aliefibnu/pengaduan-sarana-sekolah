import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      component: () => import("@/layouts/AuthLayout.vue"),
      meta: { guestOnly: true },
      children: [
        {
          path: "",
          name: "login",
          component: () => import("@/pages/auth/LoginPage.vue"),
        },
      ],
    },
    {
      path: "/register",
      component: () => import("@/layouts/AuthLayout.vue"),
      meta: { guestOnly: true },
      children: [
        {
          path: "",
          name: "register",
          component: () => import("@/pages/auth/RegisterPage.vue"),
        },
      ],
    },
    {
      path: "/siswa",
      component: () => import("@/layouts/SiswaLayout.vue"),
      meta: { requiresAuth: true, roles: ["siswa"] },
      children: [
        {
          path: "",
          name: "siswa-dashboard",
          component: () => import("@/pages/siswa/SiswaDashboardPage.vue"),
        },
        {
          path: "new",
          name: "siswa-new-complaint",
          component: () => import("@/pages/siswa/SiswaCreateComplaintPage.vue"),
        },
        {
          path: "history",
          name: "siswa-history",
          component: () => import("@/pages/siswa/SiswaHistoryPage.vue"),
        },
        {
          path: "history/:id",
          name: "siswa-history-detail",
          component: () => import("@/pages/siswa/SiswaComplaintDetailPage.vue"),
        },
      ],
    },
    {
      path: "/admin",
      component: () => import("@/layouts/AdminLayout.vue"),
      meta: { requiresAuth: true, roles: ["admin"] },
      children: [
        {
          path: "",
          name: "admin-dashboard",
          component: () => import("@/pages/admin/AdminDashboardPage.vue"),
        },
        {
          path: "complaints",
          name: "admin-complaints",
          component: () => import("@/pages/admin/AdminComplaintsPage.vue"),
        },
        {
          path: "complaints/:id",
          name: "admin-complaint-detail",
          component: () => import("@/pages/admin/AdminComplaintDetailPage.vue"),
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/login",
    },
  ],
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
