import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campeggio Estivo Gioventù Idente 2026",
  description: "Modulo di registrazione di professori e aiutoprofessori",
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
