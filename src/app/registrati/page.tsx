"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { DATE_DISPONIBILI, AREE, RUOLI, EMAIL_DOMAIN } from "@/lib/constants";
import { setAuthCookie } from "@/app/actions";

type FormState = {
  nome: string;
  cognome: string;
  eta: string;
  username: string;
  password: string;
  dateDisponibili: string[];
  areaCampeggio: string;
  areaAltroDettaglio: string;
  ruolo: string;
};

const INITIAL: FormState = {
  nome: "",
  cognome: "",
  eta: "",
  username: "",
  password: "",
  dateDisponibili: [],
  areaCampeggio: "",
  areaAltroDettaglio: "",
  ruolo: "",
};

export default function RegistratiPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleData(id: string) {
    setForm((prev) => ({
      ...prev,
      dateDisponibili: prev.dateDisponibili.includes(id)
        ? prev.dateDisponibili.filter((d) => d !== id)
        : [...prev.dateDisponibili, id],
    }));
  }

  function validate(): string | null {
    if (!form.nome.trim()) return "Il nome è obbligatorio.";
    if (!form.cognome.trim()) return "Il cognome è obbligatorio.";
    const eta = parseInt(form.eta);
    if (!form.eta || isNaN(eta) || eta < 16 || eta > 99)
      return "Inserisci un'età valida (16–99).";
    if (!form.username.trim()) return "Il nome utente è obbligatorio.";
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username))
      return "Il nome utente può contenere solo lettere, numeri e underscore (3–30 caratteri).";
    if (form.password.length < 6)
      return "La password deve essere di almeno 6 caratteri.";
    if (form.dateDisponibili.length === 0)
      return "Seleziona almeno una data.";
    if (!form.areaCampeggio) return "Seleziona un'area di collaborazione.";
    if (form.areaCampeggio === "altro" && !form.areaAltroDettaglio.trim())
      return "Specifica l'area di collaborazione.";
    if (!form.ruolo) return "Seleziona un ruolo.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${form.username.trim().toLowerCase()}${EMAIL_DOMAIN}`,
        password: form.password,
        options: {
          data: {
            username: form.username.trim().toLowerCase(),
            nome: form.nome.trim(),
            cognome: form.cognome.trim(),
            is_admin: false,
          },
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("already registered")) {
          setError("Nome utente già in uso. Scegline un altro.");
        } else {
          setError(authError.message);
        }
        return;
      }

      if (!authData.user) {
        setError(
          "Registrazione non completata. Assicurati che le conferme email siano disabilitate su Supabase."
        );
        return;
      }

      const { error: regError } = await supabase.from("registrazioni").insert({
        user_id: authData.user.id,
        username: form.username.trim().toLowerCase(),
        nome: form.nome.trim(),
        cognome: form.cognome.trim(),
        eta: parseInt(form.eta),
        date_disponibili: form.dateDisponibili,
        area_campeggio: form.areaCampeggio,
        area_altro_dettaglio:
          form.areaCampeggio === "altro"
            ? form.areaAltroDettaglio.trim()
            : null,
        ruolo: form.ruolo,
      });

      if (regError) {
        setError(
          "Account creato ma errore nel salvataggio della registrazione. Contatta l'amministratore."
        );
        return;
      }

      if (authData.session) {
        await setAuthCookie(authData.session.access_token);
      }
      router.push("/dashboard");
    } catch {
      setError("Errore imprevisto. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏕️</div>
          <h1 className="text-3xl font-bold text-emerald-800 mb-1">
            Campeggio Estivo Gioventù Idente 2026
          </h1>
          <p className="text-emerald-600 font-medium">
            Modulo di registrazione di professori e aiutoprofessori
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-7">
            {/* Nome & Cognome */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-semibold text-gray-700 mb-1"
                  htmlFor="nome"
                >
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  id="nome"
                  type="text"
                  autoComplete="given-name"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Mario"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-gray-700 mb-1"
                  htmlFor="cognome"
                >
                  Cognome <span className="text-red-500">*</span>
                </label>
                <input
                  id="cognome"
                  type="text"
                  autoComplete="family-name"
                  value={form.cognome}
                  onChange={(e) =>
                    setForm({ ...form, cognome: e.target.value })
                  }
                  placeholder="Rossi"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Età */}
            <div className="max-w-[180px]">
              <label
                className="block text-sm font-semibold text-gray-700 mb-1"
                htmlFor="eta"
              >
                Età <span className="text-red-500">*</span>
              </label>
              <input
                id="eta"
                type="number"
                min={16}
                max={99}
                value={form.eta}
                onChange={(e) => setForm({ ...form, eta: e.target.value })}
                placeholder="25"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Username & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-semibold text-gray-700 mb-1"
                  htmlFor="username"
                >
                  Nome utente <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  placeholder="mrossi"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-gray-700 mb-1"
                  htmlFor="password"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="min. 6 caratteri"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Date disponibili */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Date in cui sei disponibile{" "}
                <span className="text-red-500">*</span>
                <span className="font-normal text-gray-500 ml-2">
                  (puoi selezionarne più di una)
                </span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DATE_DISPONIBILI.map((d) => {
                  const checked = form.dateDisponibili.includes(d.id);
                  return (
                    <label
                      key={d.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition select-none text-sm ${
                        checked
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium"
                          : "border-gray-200 hover:border-emerald-300 text-gray-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleData(d.id)}
                      />
                      <span
                        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                          checked
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-gray-400"
                        }`}
                      >
                        {checked && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 12 12"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {d.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Area campeggio */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Area di collaborazione <span className="text-red-500">*</span>
              </p>
              <div className="space-y-2">
                {AREE.map((a) => (
                  <label key={a.id} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
                        form.areaCampeggio === a.id
                          ? "border-emerald-600 bg-emerald-600"
                          : "border-gray-400 group-hover:border-emerald-400"
                      }`}
                    >
                      {form.areaCampeggio === a.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <input
                      type="radio"
                      className="sr-only"
                      name="area"
                      value={a.id}
                      checked={form.areaCampeggio === a.id}
                      onChange={() =>
                        setForm({
                          ...form,
                          areaCampeggio: a.id,
                          areaAltroDettaglio: "",
                        })
                      }
                    />
                    <span
                      className={`text-sm ${
                        form.areaCampeggio === a.id
                          ? "text-emerald-800 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {a.label}
                    </span>
                  </label>
                ))}
              </div>
              {form.areaCampeggio === "altro" && (
                <input
                  type="text"
                  value={form.areaAltroDettaglio}
                  onChange={(e) =>
                    setForm({ ...form, areaAltroDettaglio: e.target.value })
                  }
                  placeholder="Specifica l'area..."
                  className="mt-3 ml-8 w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              )}
            </div>

            {/* Ruolo */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Ruolo <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {RUOLI.map((r) => {
                  const selected = form.ruolo === r.id;
                  return (
                    <label key={r.id} className="cursor-pointer">
                      <input
                        type="radio"
                        className="sr-only"
                        name="ruolo"
                        value={r.id}
                        checked={selected}
                        onChange={() => setForm({ ...form, ruolo: r.id })}
                      />
                      <div
                        className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition ${
                          selected
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-gray-300 text-gray-700 hover:border-emerald-400"
                        }`}
                      >
                        {r.label}
                      </div>
                    </label>
                  );
                })}
              </div>
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
              {loading ? "Registrazione in corso..." : "Registrati al Campeggio"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Hai già un account?{" "}
              <Link
                href="/accedi"
                className="text-emerald-600 font-medium hover:underline"
              >
                Accedi
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
