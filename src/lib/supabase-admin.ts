import { createClient } from "@supabase/supabase-js";

// Uses service role key — server-side only, never import in client components
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabaseAdmin = createClient(url, serviceKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
