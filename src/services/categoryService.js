import { supabase } from "./supabase";

function normalizeName(value = "") {
  return String(value).trim().replace(/\s+/g, " ");
}

function toCategoryModel(item) {
  return {
    id: item.id,
    name: item.name,
    created_by: item.created_by,
    created_at: item.created_at,
  };
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, created_by, created_at")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data || []).map(toCategoryModel);
}

export async function createCategory({ name, createdBy }) {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    throw new Error("Nama kategori wajib diisi.");
  }

  const payload = {
    name: normalizedName,
    created_by: createdBy,
  };

  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select("id, name, created_by, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Kategori sudah ada.");
    }
    throw error;
  }

  return toCategoryModel(data);
}

export async function updateCategory({ id, name }) {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    throw new Error("Nama kategori wajib diisi.");
  }

  const { data, error } = await supabase
    .from("categories")
    .update({ name: normalizedName })
    .eq("id", id)
    .select("id, name, created_by, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Nama kategori sudah digunakan.");
    }
    throw error;
  }

  return toCategoryModel(data);
}

export async function deleteCategory(id) {
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) throw error;
}
