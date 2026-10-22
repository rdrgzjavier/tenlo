import "server-only";

import { createClient } from "@supabase/supabase-js";
import { hasSupabaseServerConfig } from "@/lib/supabase/server";

export function createSupabasePublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!hasSupabaseServerConfig() || !url || !key) {
    throw new Error("Faltan variables publicas de Supabase.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
