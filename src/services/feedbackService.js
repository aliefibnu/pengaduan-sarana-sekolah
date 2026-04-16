import { supabase } from "./supabase";

export async function createFeedback({ complaint_id, message }) {
  const { data: complaint, error: complaintError } = await supabase
    .from("complaints")
    .select("id, status")
    .eq("id", complaint_id)
    .single();

  if (complaintError) throw complaintError;

  if (complaint.status === "done") {
    throw new Error(
      "Aspirasi sudah selesai sehingga progres baru tidak bisa ditambahkan.",
    );
  }

  if (complaint.status === "pending") {
    const { error: updateError } = await supabase
      .from("complaints")
      .update({ status: "process" })
      .eq("id", complaint_id);

    if (updateError) throw updateError;
  }

  const { data, error } = await supabase
    .from("feedbacks")
    .insert({ complaint_id, message })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function fetchFeedbackByComplaintId(complaintId) {
  const { data, error } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("complaint_id", complaintId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
