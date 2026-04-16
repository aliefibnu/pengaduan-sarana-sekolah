import { supabase } from "./supabase";

export async function createFeedback({
  complaint_id,
  message,
  progress_percentage = null,
}) {
  const { data: complaint, error: complaintError } = await supabase
    .from("complaints")
    .select("id, status, first_response_at")
    .eq("id", complaint_id)
    .single();

  if (complaintError) throw complaintError;

  if (complaint.status === "done") {
    throw new Error(
      "Aspirasi sudah selesai sehingga progres baru tidak bisa ditambahkan.",
    );
  }

  const isFirstResponse = !complaint.first_response_at;
  const updates = {};

  if (complaint.status === "pending") {
    updates.status = "process";
  }

  if (isFirstResponse) {
    updates.first_response_at = new Date().toISOString();
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from("complaints")
      .update(updates)
      .eq("id", complaint_id);

    if (updateError) throw updateError;
  }

  const feedbackData = {
    complaint_id,
    message,
  };

  if (progress_percentage !== null && progress_percentage !== undefined) {
    if (progress_percentage < 0 || progress_percentage > 100) {
      throw new Error("Persentase progres harus antara 0-100.");
    }

    const { data: latestProgressRow, error: latestProgressError } =
      await supabase
        .from("feedbacks")
        .select("progress_percentage")
        .eq("complaint_id", complaint_id)
        .not("progress_percentage", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (latestProgressError) throw latestProgressError;

    const latestProgress = latestProgressRow?.progress_percentage;
    if (
      typeof latestProgress === "number" &&
      progress_percentage < latestProgress
    ) {
      throw new Error(
        `Persentase progres tidak boleh lebih kecil dari progres terakhir (${latestProgress}%).`,
      );
    }

    feedbackData.progress_percentage = progress_percentage;
  }

  const { data, error } = await supabase
    .from("feedbacks")
    .insert(feedbackData)
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
