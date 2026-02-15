
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const { data, error } = await supabase.from("comments").select("id").limit(1);

if (error) {
    console.log("Migration NOT run:", error.message);
} else {
    console.log("Migration run successfully!");
}
