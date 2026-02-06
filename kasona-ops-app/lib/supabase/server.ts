import { createClient, SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

export type TypedSupabaseClient = SupabaseClient<Database>;

export function getSupabaseServerClient(): TypedSupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || (!anonKey && !serviceKey)) {
    return null;
  }

  const key = serviceKey ?? anonKey;
  if (!key) {
    return null;
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false }
  });
}
