import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  // Verify the caller is an admin
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.user_metadata?.is_admin) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { id, stato } = await req.json();

  if (!id || !["approvato", "in_attesa"].includes(stato)) {
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("registrazioni")
    .update({ stato })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
