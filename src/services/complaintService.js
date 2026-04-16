import { supabase, getPublicImageUrl } from "./supabase";

const sortableFields = ["created_at", "status", "category", "title"];

const statusLabelMap = {
  pending: "menunggu",
  process: "diproses",
  done: "selesai",
};

function mapComplaint(item) {
  return {
    ...item,
    image_url: item.image_path ? getPublicImageUrl(item.image_path) : "",
  };
}

function applyComplaintFilters(query, filters = {}, searchTerm = "") {
  let nextQuery = query;

  if (filters.category) {
    nextQuery = nextQuery.eq("category", filters.category);
  }

  if (filters.userId) {
    nextQuery = nextQuery.eq("user_id", filters.userId);
  }

  if (filters.date) {
    nextQuery = nextQuery
      .gte("created_at", `${filters.date}T00:00:00`)
      .lt("created_at", `${filters.date}T23:59:59`);
  }

  if (filters.month) {
    const [year, month] = filters.month.split("-");
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);

    nextQuery = nextQuery
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString());
  }

  if (searchTerm?.trim()) {
    const escaped = searchTerm.trim().replace(/,/g, " ");
    nextQuery = nextQuery.or(
      `title.ilike.%${escaped}%,description.ilike.%${escaped}%,category.ilike.%${escaped}%,status.ilike.%${escaped}%,users.name.ilike.%${escaped}%`,
    );
  }

  return nextQuery;
}

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function tokenizeSearch(searchTerm = "") {
  return normalizeText(searchTerm).split(/\s+/).filter(Boolean);
}

function mapStatusAliases(status = "") {
  const normalized = normalizeText(status);
  const localized = statusLabelMap[normalized] || "";

  return [normalized, localized].filter(Boolean);
}

function matchesComplaintSearch(item, searchTerm = "") {
  const keywords = tokenizeSearch(searchTerm);
  if (!keywords.length) return true;

  const statusKeywords = mapStatusAliases(item.status);
  const haystack = [
    item.title,
    item.description,
    item.category,
    item.status,
    item.users?.name,
    ...statusKeywords,
  ]
    .map((value) => normalizeText(value))
    .join(" ");

  return keywords.every((keyword) => haystack.includes(keyword));
}

async function fetchComplaintMutationState(complaintId) {
  const { data: complaint, error: complaintError } = await supabase
    .from("complaints")
    .select("id, user_id, status, image_path")
    .eq("id", complaintId)
    .single();

  if (complaintError) throw complaintError;

  const { data: feedbackRows, error: feedbackError } = await supabase
    .from("feedbacks")
    .select("id")
    .eq("complaint_id", complaintId)
    .limit(1);

  if (feedbackError) throw feedbackError;

  return {
    ...complaint,
    hasFeedback: Boolean(feedbackRows?.length),
  };
}

function ensureStudentCanMutateComplaint(state, userId) {
  if (!state || state.user_id !== userId) {
    throw new Error("Aspirasi tidak ditemukan atau bukan milik Anda.");
  }

  if (state.status !== "pending") {
    throw new Error("Aspirasi hanya dapat diubah saat masih menunggu.");
  }

  if (state.hasFeedback) {
    throw new Error(
      "Aspirasi tidak dapat diubah karena sudah mendapat progres dari admin.",
    );
  }
}

export async function uploadComplaintImage(file, userId) {
  if (!file) return null;

  const extension = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  const { error } = await supabase.storage
    .from("complaint-images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;
  return path;
}

export async function createComplaint(payload) {
  const { data, error } = await supabase
    .from("complaints")
    .insert(payload)
    .select("*, users(name)")
    .single();

  if (error) throw error;
  return mapComplaint(data);
}

export async function fetchMyComplaints(userId) {
  const { data, error } = await supabase
    .from("complaints")
    .select(
      "*, users(name), feedbacks(id, message, progress_percentage, created_at)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map(mapComplaint);
}

export async function fetchAllComplaints(filters = {}) {
  let query = supabase
    .from("complaints")
    .select(
      "*, users(name), feedbacks(id, message, progress_percentage, created_at)",
    )
    .order("created_at", { ascending: false });

  query = applyComplaintFilters(query, filters);

  const { data, error } = await query;

  if (error) throw error;
  return data.map(mapComplaint);
}

export async function fetchAllComplaintsPaginated({
  filters = {},
  page = 1,
  pageSize = 8,
  searchTerm = "",
  sortBy = "created_at",
  sortDirection = "desc",
} = {}) {
  const safeSortBy = sortableFields.includes(sortBy) ? sortBy : "created_at";
  const isAscending = sortDirection === "asc";
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  const hasSearchTerm = Boolean(searchTerm?.trim());

  let query = supabase
    .from("complaints")
    .select("*, users(name), feedbacks(id, message, created_at)", {
      count: "exact",
    })
    .order(safeSortBy, { ascending: isAscending });

  if (hasSearchTerm) {
    query = applyComplaintFilters(query, filters);

    const { data, error } = await query;

    if (error) throw error;

    const mappedItems = (data || []).map(mapComplaint);
    const searchedItems = mappedItems.filter((item) =>
      matchesComplaintSearch(item, searchTerm),
    );

    return {
      items: searchedItems.slice(start, end + 1),
      total: searchedItems.length,
      page,
      pageSize,
    };
  }

  query = applyComplaintFilters(query, filters, searchTerm).range(start, end);

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    items: (data || []).map(mapComplaint),
    total: count || 0,
    page,
    pageSize,
  };
}

export async function fetchAllComplaintsForExport({
  filters = {},
  searchTerm = "",
  sortBy = "created_at",
  sortDirection = "desc",
} = {}) {
  const safeSortBy = sortableFields.includes(sortBy) ? sortBy : "created_at";
  const isAscending = sortDirection === "asc";
  const hasSearchTerm = Boolean(searchTerm?.trim());

  let query = supabase
    .from("complaints")
    .select("*, users(name), feedbacks(id, message, created_at)")
    .order(safeSortBy, { ascending: isAscending });

  query = hasSearchTerm
    ? applyComplaintFilters(query, filters)
    : applyComplaintFilters(query, filters, searchTerm);

  const { data, error } = await query;

  if (error) throw error;

  const mappedItems = (data || []).map(mapComplaint);

  if (!hasSearchTerm) {
    return mappedItems;
  }

  return mappedItems.filter((item) => matchesComplaintSearch(item, searchTerm));
}

export async function markComplaintAsDone({ complaintId }) {
  const { data: snapshot, error: snapshotError } = await supabase
    .from("complaints")
    .select("id, status")
    .eq("id", complaintId)
    .single();

  if (snapshotError) throw snapshotError;

  if (snapshot.status === "done") {
    throw new Error("Aspirasi ini sudah ditandai selesai.");
  }

  const { data, error } = await supabase
    .from("complaints")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", complaintId)
    .select(
      "*, users(name), feedbacks(id, message, progress_percentage, created_at)",
    )
    .single();

  if (error) throw error;
  return mapComplaint(data);
}

export async function updateOwnComplaint({
  complaintId,
  userId,
  title,
  description,
  category,
}) {
  const mutationState = await fetchComplaintMutationState(complaintId);
  ensureStudentCanMutateComplaint(mutationState, userId);

  const updates = {
    title,
    description,
    category,
  };

  const { data, error } = await supabase
    .from("complaints")
    .update(updates)
    .eq("id", complaintId)
    .select("*, users(name), feedbacks(id, message, created_at)")
    .single();

  if (error) throw error;
  return mapComplaint(data);
}

export async function deleteOwnComplaint({ complaintId, userId }) {
  const mutationState = await fetchComplaintMutationState(complaintId);
  ensureStudentCanMutateComplaint(mutationState, userId);

  if (mutationState.image_path) {
    const { error: storageError } = await supabase.storage
      .from("complaint-images")
      .remove([mutationState.image_path]);

    if (storageError) throw storageError;
  }

  const { error } = await supabase
    .from("complaints")
    .delete()
    .eq("id", complaintId);

  if (error) throw error;
}

export async function fetchComplaintById(complaintId) {
  const { data, error } = await supabase
    .from("complaints")
    .select(
      "*, users(name), feedbacks(id, message, progress_percentage, created_at)",
    )
    .eq("id", complaintId)
    .single();

  if (error) throw error;
  return mapComplaint(data);
}
