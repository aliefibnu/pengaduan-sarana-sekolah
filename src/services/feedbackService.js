import { supabase } from "./supabase";

export async function createFeedback({ complaint_id, message }) {
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
