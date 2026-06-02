"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className={
        className ??
        "text-sm text-gray-500 hover:text-gray-800 border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-lg transition"
      }
    >
      Esci
    </button>
  );
}
