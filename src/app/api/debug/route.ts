import { NextResponse } from "next/server";

export async function GET() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? null;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    null;

  return NextResponse.json({
    supabase_url: url
      ? `${url.substring(0, 40)}...`
      : "❌ NON IMPOSTATO",
    url_starts_with_https: url?.startsWith("https://") ?? false,
    url_has_supabase_co: url?.includes(".supabase.co") ?? false,
    has_anon_key: !!anonKey,
    has_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    env_vars_found: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });
}
