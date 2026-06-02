"use server";

import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/constants";

export async function setAuthCookie(accessToken: string) {
  const store = await cookies();
  store.set(AUTH_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1 ora (uguale alla scadenza del JWT Supabase)
    sameSite: "lax",
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}
