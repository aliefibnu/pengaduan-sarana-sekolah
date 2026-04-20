import { supabase } from "./supabase";

async function extractEdgeFunctionErrorMessage(error, fallbackMessage) {
  const response = error?.context;

  if (!response || typeof response !== "object") {
    return error?.message || fallbackMessage;
  }

  try {
    const cloned = response.clone?.();

    if (cloned && typeof cloned.json === "function") {
      const body = await cloned.json();

      if (typeof body?.error === "string" && body.error.trim()) {
        return body.error;
      }

      if (typeof body?.message === "string" && body.message.trim()) {
        return body.message;
      }
    }
  } catch {
    // ignore json parse error and continue with text fallback
  }

  try {
    const cloned = response.clone?.();

    if (cloned && typeof cloned.text === "function") {
      const textBody = await cloned.text();

      if (textBody.trim()) {
        return textBody;
      }
    }
  } catch {
    // ignore text parse error and continue with default fallback
  }

  return error?.message || fallbackMessage;
}

export async function fetchUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, role, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createSiswaUserByAdmin({ name, identity, password }) {
  const { data, error } = await supabase.functions.invoke("admin-user-crud", {
    body: {
      action: "create",
      name,
      identity,
      password,
    },
  });

  if (error) {
    const message = await extractEdgeFunctionErrorMessage(
      error,
      "Gagal membuat akun siswa.",
    );
    throw new Error(message);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function updateUser(userId, payload) {
  const { data, error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", userId)
    .select("id, name, role, created_at")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUserByAdmin(userId) {
  const { data, error } = await supabase.functions.invoke("admin-user-crud", {
    body: {
      action: "delete",
      userId,
    },
  });

  if (error) {
    const message = await extractEdgeFunctionErrorMessage(
      error,
      "Gagal menghapus akun user.",
    );
    throw new Error(message);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}
