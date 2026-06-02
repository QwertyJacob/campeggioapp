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

  const { id, stato } = await req.json();
  if (!id || !["approvato", "in_attesa"].includes(stato)) {
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("registrazioni").update({ stato }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
