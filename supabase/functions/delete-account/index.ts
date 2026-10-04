// Deletes the calling user's own auth account (and, via the tracker_state table's
// `on delete cascade`, their saved tracker data with it).
//
// This has to run server-side because deleting an auth user needs the secret key, which
// must never be shipped to the browser. Supabase injects SUPABASE_URL and the
// publishable/secret keys into every Edge Function's environment automatically — nothing
// to configure in the dashboard.
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const publishableKey = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")!)["default"];
  const secretKey = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")!)["default"];

  // Confirm who's calling, using their own token — never trust a user id passed in the body.
  const callerClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userErr,
  } = await callerClient.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, secretKey);
  const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id);
  if (deleteErr) {
    return new Response(JSON.stringify({ error: deleteErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
