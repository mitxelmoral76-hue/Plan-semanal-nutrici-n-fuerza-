import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && key);
export const COACH_EMAIL = (process.env.NEXT_PUBLIC_COACH_EMAIL ?? "").toLowerCase();

let client: SupabaseClient | null = null;
export function supa(): SupabaseClient {
  if (!client) client = createClient(url!, key!);
  return client;
}
