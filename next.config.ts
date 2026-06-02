import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose Supabase vars to the browser regardless of whether Vercel set them
  // with or without the NEXT_PUBLIC_ prefix (Vercel's Supabase integration
  // sets SUPABASE_URL / SUPABASE_ANON_KEY; manual setup uses NEXT_PUBLIC_ ones).
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY ??
      "",
  },
};

export default nextConfig;
