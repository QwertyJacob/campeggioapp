"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { EMAIL_DOMAIN } from "@/lib/constants";

export default function AccediPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Inserisci nome utente e password.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: `${username.trim().toLowerCase()}${EMAIL_DOMAIN}`,
        password,
      });

      if (authError) {
        setError("Nome utente o password errati.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Errore imprevisto. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏕️</div>
          <h1 className="text-2xl font-bold text-emerald-800">
            Campeggio Estivo<br />Gioventù Idente 2026
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Accedi</h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-1"
                htmlFor="username"
              >
                Nome utente
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="mrossi"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 px-6 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {loading ? "Accesso in corso..." : "Accedi"}
            </button>

            <p className="text-center text-sm text-gray-500 pt-1">
              Non hai un account?{" "}
              <Link
                href="/registrati"
                className="text-emerald-600 font-medium hover:underline"
              >
                Registrati
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
