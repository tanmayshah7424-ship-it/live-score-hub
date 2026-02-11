import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const adminEmail = "admin@scorecard.com";
  const adminPassword = "Admin@2026!";

  // Create admin user
  const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { display_name: "Admin" },
  });

  if (createError) {
    // User might already exist
    return new Response(JSON.stringify({ error: createError.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  // Add admin role
  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: user.user.id, role: "admin" }, { onConflict: "user_id,role" });

  return new Response(
    JSON.stringify({ success: true, message: "Admin user created", userId: user.user.id }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
