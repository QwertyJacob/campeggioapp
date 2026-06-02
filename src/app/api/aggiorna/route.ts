import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { AUTH_COOKIE } from "@/lib/constants";
import { cookies } from "next/headers";

async function getAdminUser() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user?.user_metadata?.is_admin) return null;
  return user;
}

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });

  const { id, date_disponibili, area_campeggio, area_altro_dettaglio, ruolo, capo_area } =
    await req.json();

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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
