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

  const {
    id,
    date_disponibili,
    area_campeggio,
    area_altro_dettaglio,
    ruolo,
    capo_area,
  } = await req.json();

  if (!id || !Array.isArray(date_disponibili) || date_disponibili.length === 0) {
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("registrazioni")
    .update({
      date_disponibili,
      area_campeggio,
      area_altro_dettaglio: area_campeggio === "altro" ? area_altro_dettaglio : null,
      ruolo,
      capo_area: Boolean(capo_area),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
