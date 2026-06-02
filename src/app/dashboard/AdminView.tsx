"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DATE_DISPONIBILI, AREE, RUOLI } from "@/lib/constants";
import LogoutButton from "./LogoutButton";

export type Registrazione = {
  id: string;
  user_id: string;
  username: string;
  nome: string;
  cognome: string;
  eta: number;
  date_disponibili: string[];
  area_campeggio: string;
  area_altro_dettaglio: string | null;
  ruolo: string;
  capo_area: boolean;
  stato: string;
  created_at: string;
};

type EditForm = {
  date_disponibili: string[];
  area_campeggio: string;
  area_altro_dettaglio: string;
  ruolo: string;
  capo_area: boolean;
};

function areaLabel(a: string, dettaglio: string | null) {
  const found = AREE.find((x) => x.id === a);
  if (a === "altro" && dettaglio) return `Altro: ${dettaglio}`;
  return found?.label ?? a;
}

function ruoloLabel(r: string) {
  return RUOLI.find((x) => x.id === r)?.label ?? r;
}

function StatoBadge({ stato }: { stato: string }) {
  if (stato === "approvato") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
        Approvato
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
      In attesa
    </span>
  );
}

export default function AdminView({
  registrazioni,
}: {
  registrazioni: Registrazione[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function startEdit(reg: Registrazione) {
    setEditingId(reg.id);
    setEditForm({
      date_disponibili: [...reg.date_disponibili],
      area_campeggio: reg.area_campeggio,
      area_altro_dettaglio: reg.area_altro_dettaglio ?? "",
      ruolo: reg.ruolo,
      capo_area: reg.capo_area,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  function toggleDate(id: string) {
    if (!editForm) return;
    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            date_disponibili: prev.date_disponibili.includes(id)
              ? prev.date_disponibili.filter((d) => d !== id)
              : [...prev.date_disponibili, id],
          }
        : null
    );
  }

  async function handleApprova(id: string, nuovoStato: "approvato" | "in_attesa") {
    setLoadingId(id);
    setError(null);
    try {
      const res = await fetch("/api/approva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stato: nuovoStato }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Errore durante l'operazione.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleSaveEdit() {
    if (!editingId || !editForm) return;
    if (editForm.date_disponibili.length === 0) {
      setError("Seleziona almeno una data.");
      return;
    }
    setLoadingId(editingId);
    setError(null);
    try {
      const res = await fetch("/api/aggiorna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      if (!res.ok) throw new Error();
      cancelEdit();
      router.refresh();
    } catch {
      setError("Errore durante il salvataggio.");
    } finally {
      setLoadingId(null);
    }
  }

  const inAttesa = registrazioni.filter((r) => r.stato === "in_attesa").length;
  const approvati = registrazioni.filter((r) => r.stato === "approvato").length;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-emerald-800">
              Gestione Registrazioni
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {registrazioni.length} totali &nbsp;·&nbsp;
              <span className="text-emerald-600">{approvati} approvati</span>
              &nbsp;·&nbsp;
              <span className="text-amber-600">{inAttesa} in attesa</span>
            </p>
          </div>
          <LogoutButton />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {registrazioni.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-400">
            Nessuna registrazione ancora.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-emerald-50 text-emerald-800">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                      Nome
                    </th>
                    <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                      Username
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">Età</th>
                    <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                      Area
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">
                      Ruolo
                    </th>
                    <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                      Capo Area
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">Date</th>
                    <th className="text-left px-4 py-3 font-semibold">Stato</th>
                    <th className="text-left px-4 py-3 font-semibold">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {registrazioni.map((reg) => (
                    <tr
                      key={reg.id}
                      className="border-t border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                        {reg.nome} {reg.cognome}
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono">
                        {reg.username}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{reg.eta}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">
                        {areaLabel(reg.area_campeggio, reg.area_altro_dettaglio)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {ruoloLabel(reg.ruolo)}
                      </td>
                      <td className="px-4 py-3">
                        {reg.capo_area ? (
                          <span className="text-emerald-600 font-semibold">
                            Sì
                          </span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {reg.date_disponibili.length} giorni
                      </td>
                      <td className="px-4 py-3">
                        <StatoBadge stato={reg.stato} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          {reg.stato === "in_attesa" ? (
                            <button
                              onClick={() => handleApprova(reg.id, "approvato")}
                              disabled={loadingId === reg.id}
                              className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition disabled:opacity-50"
                            >
                              Approva
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApprova(reg.id, "in_attesa")}
                              disabled={loadingId === reg.id}
                              className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition disabled:opacity-50"
                            >
                              Revoca
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(reg)}
                            className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition"
                          >
                            Modifica
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && editForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-5">
              Modifica Registrazione
            </h2>

            {/* Date */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Date disponibili
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {DATE_DISPONIBILI.map((d) => {
                  const checked = editForm.date_disponibili.includes(d.id);
                  return (
                    <label
                      key={d.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition select-none ${
                        checked
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium"
                          : "border-gray-200 text-gray-600 hover:border-emerald-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleDate(d.id)}
                      />
                      <span
                        className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center ${
                          checked
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-gray-400"
                        }`}
                      >
                        {checked && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
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

            {/* Area */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Area di collaborazione
              </p>
              <div className="space-y-1.5">
                {AREE.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        editForm.area_campeggio === a.id
                          ? "border-emerald-600 bg-emerald-600"
                          : "border-gray-400"
                      }`}
                    >
                      {editForm.area_campeggio === a.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <input
                      type="radio"
                      className="sr-only"
                      name="edit-area"
                      value={a.id}
                      checked={editForm.area_campeggio === a.id}
                      onChange={() =>
                        setEditForm({
                          ...editForm,
                          area_campeggio: a.id,
                          area_altro_dettaglio: "",
                        })
                      }
                    />
                    <span className="text-sm text-gray-700">{a.label}</span>
                  </label>
                ))}
              </div>
              {editForm.area_campeggio === "altro" && (
                <input
                  type="text"
                  value={editForm.area_altro_dettaglio}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      area_altro_dettaglio: e.target.value,
                    })
                  }
                  placeholder="Specifica..."
                  className="mt-2 ml-6 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>

            {/* Ruolo */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Ruolo</p>
              <div className="flex flex-wrap gap-2">
                {RUOLI.map((r) => (
                  <label key={r.id} className="cursor-pointer">
                    <input
                      type="radio"
                      className="sr-only"
                      name="edit-ruolo"
                      value={r.id}
                      checked={editForm.ruolo === r.id}
                      onChange={() =>
                        setEditForm({ ...editForm, ruolo: r.id })
                      }
                    />
                    <div
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                        editForm.ruolo === r.id
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-gray-300 text-gray-700 hover:border-emerald-400"
                      }`}
                    >
                      {r.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Capo Area */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                    editForm.capo_area
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-gray-400"
                  }`}
                  onClick={() =>
                    setEditForm({ ...editForm, capo_area: !editForm.capo_area })
                  }
                >
                  {editForm.capo_area && (
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
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={editForm.capo_area}
                  onChange={(e) =>
                    setEditForm({ ...editForm, capo_area: e.target.checked })
                  }
                />
                <span className="text-sm font-semibold text-gray-700">
                  Assegna come Capo Area
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={cancelEdit}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl transition text-sm"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!!loadingId}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl transition text-sm"
              >
                {loadingId ? "Salvataggio..." : "Salva modifiche"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
