import { supabase } from "./supabase";

export async function registerWithEmail({
  name,
  email,
  password,
  role = "siswa",
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  });

  if (error) throw error;

  if (data.user) {
    await upsertProfileFromUser(data.user);
  }

  // Jika email confirmation dimatikan di Supabase, session biasanya langsung tersedia.
  if (data.session) {
    return data;
  }

  // Fallback: coba login langsung agar user tidak perlu flow verifikasi dari UI.
  try {
    const loginResult = await loginWithEmail({ email, password });
    return loginResult;
  } catch (error) {
    throw new Error(
      "Akun berhasil dibuat, tetapi login otomatis gagal. Nonaktifkan 'Confirm email' di Supabase Auth > Providers agar pengguna tidak perlu verifikasi email.",
    );
  }
}

export async function loginWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  if (data.user) {
    await upsertProfileFromUser(data.user);
  }

  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) =>
    callback(session),
  );
}

export async function upsertProfileFromUser(user) {
  const roleFromJwt = user?.user_metadata?.role || "siswa";
  const nameFromJwt =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "Tanpa Nama";

  const { error } = await supabase.from("users").upsert(
    {
      id: user.id,
      name: nameFromJwt,
      role: roleFromJwt,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.warn("Gagal sinkron users profile:", error.message);
  }
}
