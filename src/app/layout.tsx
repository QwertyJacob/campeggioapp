import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campeggio Estivo 2026 — Registrazione",
  description: "Modulo di registrazione per i professori e collaboratori del Campeggio Estivo 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 antialiased">
        {children}
      </body>
    </html>
  );
}
