// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (_req) => {
  try {
    // 🔐 Gunakan SERVICE ROLE (langsung, tanpa auth user)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // 🧾 Hardcoded admin data
    const email = "admin@skaju.smk";
    const password = "admin123";
    const name = "Admin Baru";

    // 🧑‍💻 Create user di Auth
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: "admin",
        },
      });

    if (createError) {
      throw createError;
    }

    // 📝 Insert ke tabel public.users
    const { error: insertError } = await supabaseAdmin.from("users").insert({
      id: newUser.user.id,
      name,
      role: "admin",
    });

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        message: "Admin berhasil dibuat",
        user_id: newUser.user.id,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        message: err?.message ?? err,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
