
// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const adminEmail = "tanmayshah7424@gmail.com";
    const adminPassword = "Tanmay7424@";

    // 1. Check if user exists first
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    let targetUser = users.find((u: any) => u.email === adminEmail);

    if (!targetUser) {
      // 2. Create admin user if not found
      console.log("Creating new admin user...");
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { display_name: "Admin" },
      });
      if (createError) throw createError;
      targetUser = newUser.user;
    } else {
      console.log("Admin user already exists, updating role...");
    }

    // 3. Add admin role (using upsert)
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: targetUser.id, role: "admin" },
        { onConflict: "user_id,role" }
      );

    if (roleError) throw roleError;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin access granted",
        userId: targetUser.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
