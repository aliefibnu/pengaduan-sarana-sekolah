import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  // Tetap buat app bisa boot untuk mode mock UI, tapi operasi API akan gagal dengan pesan jelas.
  console.warn(
    "Supabase env belum diset: VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY",
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
);

export function assertSupabaseConfigured() {
  if (hasSupabaseEnv) {
    return;
  }

  throw new Error(
    "Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env.",
  );
}

export function getPublicImageUrl(path) {
  if (!path) return "";
  const { data } = supabase.storage.from("complaint-images").getPublicUrl(path);
  return data.publicUrl;
}
