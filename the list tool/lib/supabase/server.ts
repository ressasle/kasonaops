import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || (!anonKey && !serviceKey)) {
    return null;
  }

  return createClient<Database>(url, serviceKey ?? anonKey, {
    auth: { persistSession: false }
  });
}
