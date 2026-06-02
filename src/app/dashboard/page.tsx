import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { AUTH_COOKIE } from "@/lib/constants";
import AdminView, { type Registrazione } from "./AdminView";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;

  if (!token) redirect("/accedi");

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) redirect("/accedi");

  const isAdmin = user.user_metadata?.is_admin === true;

  if (isAdmin) {
    const { data: registrazioni } = await supabaseAdmin
      .from("registrazioni")
      .select("*")
      .order("created_at", { ascending: true });

    return (
      <AdminView registrazioni={(registrazioni as Registrazione[]) ?? []} />
    );
  }

  const { data: reg } = await supabaseAdmin
    .from("registrazioni")
    .select("stato, nome")
    .eq("user_id", user.id)
    .single();

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-5">🏕️</div>
        <h1 className="text-2xl font-bold text-emerald-800 mb-2">
          Ciao{reg?.nome ? `, ${reg.nome}` : ""}!
        </h1>

        {reg?.stato === "approvato" ? (
          <div>
            <p className="text-gray-600 mb-2">
              La tua registrazione è stata{" "}
              <strong className="text-emerald-600">approvata</strong>!
            </p>
            <p className="text-gray-500 text-sm">
              Ti contatteremo con i dettagli del campeggio a breve.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Grazie per esserti registrato al{" "}
              <strong>Campeggio Estivo Gioventù Idente 2026</strong>!
            </p>
            <p className="text-gray-500 text-sm">
              Il tuo account è in <strong>validazione</strong> da parte dei
              capi. Ti faremo sapere prima possibile!
            </p>
          </div>
        )}

        <div className="mt-8">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
