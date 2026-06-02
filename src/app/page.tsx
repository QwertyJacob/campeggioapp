import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <div className="text-6xl mb-5">🏕️</div>
        <h1 className="text-4xl font-bold text-emerald-800 mb-2">
          Campeggio Estivo<br />Gioventù Idente 2026
        </h1>
        <p className="text-emerald-600 mt-3 text-lg">13 – 25 Luglio 2026</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <Link
          href="/accedi"
          className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Accedi
        </Link>
        <Link
          href="/registrati"
          className="flex-1 text-center border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold py-3 px-8 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Registrati
        </Link>
      </div>
    </main>
  );
}
