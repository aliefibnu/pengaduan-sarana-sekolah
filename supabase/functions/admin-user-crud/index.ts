import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const AUTH_EMAIL_DOMAIN = "skaju.smk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

function normalizeIdentity(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function buildAuthEmail(identity: string) {
  return `${identity}@${AUTH_EMAIL_DOMAIN}`;
}

function resolveNisFromAuthUser(authUser: {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}) {
  const metadataNisn = String(authUser?.user_metadata?.nisn || "").trim();
  if (/^\d{1,8}$/.test(metadataNisn)) {
    return metadataNisn;
  }

  const localPart = String(authUser?.email || "").split("@")[0] || "";
  if (/^\d{1,8}$/.test(localPart)) {
    return localPart;
  }

  return "";
}

async function isCallerAdmin(
  adminClient: ReturnType<typeof createClient>,
  callerUser: {
    id: string;
    user_metadata?: Record<string, unknown> | null;
    app_metadata?: Record<string, unknown> | null;
  },
) {
  const metadataRole = String(
    callerUser?.user_metadata?.role || callerUser?.app_metadata?.role || "",
  ).toLowerCase();

  if (metadataRole === "admin") {
    return true;
  }

  const { data: callerProfile, error: profileError } = await adminClient
    .from("users")
    .select("role")
    .eq("id", callerUser.id)
    .maybeSingle();

  if (profileError) {
    return false;
  }

  return String(callerProfile?.role || "").toLowerCase() === "admin";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method tidak didukung." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(
      { error: "Konfigurasi environment function belum lengkap." },
      500,
    );
  }

  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return jsonResponse({ error: "Token otorisasi tidak ditemukan." }, 401);
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const {
    data: { user: callerUser },
    error: callerError,
  } = await callerClient.auth.getUser();

  if (callerError || !callerUser) {
    return jsonResponse({ error: "Sesi user tidak valid." }, 401);
  }

  const callerIsAdmin = await isCallerAdmin(adminClient, callerUser);
  if (!callerIsAdmin) {
    return jsonResponse(
      { error: "Hanya admin yang diizinkan menjalankan aksi ini." },
      403,
    );
  }

  let payload: {
    action?: string;
    name?: string;
    identity?: string;
    password?: string;
    userId?: string;
  };

  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Payload JSON tidak valid." }, 400);
  }

  const action = payload.action;

  if (action === "list") {
    const { data: profiles, error: profilesError } = await adminClient
      .from("users")
      .select("id, name, role, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) {
      return jsonResponse({ error: "Gagal mengambil daftar user." }, 400);
    }

    const { data: authPage, error: authError } =
      await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (authError) {
      return jsonResponse(
        { error: authError.message || "Gagal mengambil data auth user." },
        400,
      );
    }

    const authUsers = authPage?.users || [];
    const authMap = new Map(
      authUsers.map((user) => [
        user.id,
        {
          email: user.email,
          user_metadata: user.user_metadata,
        },
      ]),
    );

    const users = (profiles || [])
      .filter((profile) => profile.role === "siswa")
      .map((profile) => {
        const authUser = authMap.get(profile.id);
        return {
          ...profile,
          nis: resolveNisFromAuthUser(authUser || {}),
        };
      });

    return jsonResponse({ users });
  }

  if (action === "create") {
    const name = String(payload.name || "").trim();
    const identity = String(payload.identity || "")
      .trim()
      .replace(/\s+/g, "");
    const password = String(payload.password || "");

    if (!name) {
      return jsonResponse({ error: "Nama siswa wajib diisi." }, 400);
    }

    if (!/^\d{1,8}$/.test(identity)) {
      return jsonResponse({ error: "NIS tidak valid." }, 400);
    }

    if (password.length < 6) {
      return jsonResponse({ error: "Password minimal 6 karakter." }, 400);
    }

    const email = buildAuthEmail(identity);

    const { data: createdUser, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role: "siswa",
          nisn: identity,
        },
      });

    if (createError || !createdUser?.user) {
      return jsonResponse(
        { error: createError?.message || "Gagal membuat akun auth siswa." },
        400,
      );
    }

    const { error: upsertError } = await adminClient.from("users").upsert(
      {
        id: createdUser.user.id,
        name,
        role: "siswa",
      },
      { onConflict: "id" },
    );

    if (upsertError) {
      await adminClient.auth.admin.deleteUser(createdUser.user.id);

      return jsonResponse(
        { error: upsertError.message || "Gagal menyimpan profil user." },
        400,
      );
    }

    return jsonResponse({
      message: "Akun siswa berhasil dibuat.",
      user: {
        id: createdUser.user.id,
        name,
        role: "siswa",
        email,
      },
    });
  }

  if (action === "delete") {
    const userId = String(payload.userId || "").trim();

    if (!userId) {
      return jsonResponse({ error: "ID user wajib diisi." }, 400);
    }

    if (userId === callerUser.id) {
      return jsonResponse(
        { error: "Admin tidak bisa menghapus akun sendiri." },
        400,
      );
    }

    const { data: targetUser, error: targetError } = await adminClient
      .from("users")
      .select("id, role")
      .eq("id", userId)
      .single();

    if (targetError || !targetUser) {
      return jsonResponse({ error: "User tidak ditemukan." }, 404);
    }

    if (targetUser.role !== "siswa") {
      return jsonResponse(
        { error: "Hanya akun siswa yang bisa dihapus." },
        400,
      );
    }

    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      return jsonResponse(
        { error: deleteError.message || "Gagal menghapus akun auth user." },
        400,
      );
    }

    return jsonResponse({
      message: "Akun siswa berhasil dihapus.",
      userId,
    });
  }

  return jsonResponse({ error: "Aksi tidak valid." }, 400);
});
