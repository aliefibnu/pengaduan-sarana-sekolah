import { supabase } from "./supabase";

export async function fetchUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, role")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}
