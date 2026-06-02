import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { EMAIL_DOMAIN, DATE_DISPONIBILI } from "@/lib/constants";

// One-time endpoint to create the admin user jcevallos.
// Call GET /api/seed once after setting SUPABASE_SERVICE_ROLE_KEY in Vercel.

export async function GET() {
  const username = "jcevallos";
  const email = `${username}${EMAIL_DOMAIN}`;

  // Check if already seeded
  const { data: existing } = await supabaseAdmin
    .from("registrazioni")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ message: "Utente admin già presente." });
  }

  // Create auth user
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: "bigj26",
      email_confirm: true,
      user_metadata: {
        username,
        nome: "Jesus",
        cognome: "Cevallos",
        is_admin: true,
      },
    });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Errore creazione utente" },
      { status: 500 }
    );
  }

  // Insert registration
  const allDates = DATE_DISPONIBILI.map((d) => d.id);
  const { error: regError } = await supabaseAdmin.from("registrazioni").insert({
    user_id: authData.user.id,
    username,
    nome: "Jesus",
    cognome: "Cevallos",
    eta: 34,
    date_disponibili: allDates,
    area_campeggio: "altro",
    area_altro_dettaglio: "capo campeggio",
    ruolo: "prof",
    stato: "approvato",
    capo_area: false,
  });

  if (regError) {
    return NextResponse.json(
      { error: regError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Utente admin jcevallos creato con successo!",
  });
}
