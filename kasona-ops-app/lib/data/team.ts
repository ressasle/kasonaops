import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export type TeamMember = Database["public"]["Tables"]["kasona_team_members"]["Row"];
export type TeamMemberInsert = Database["public"]["Tables"]["kasona_team_members"]["Insert"];
export type TeamMemberUpdate = Database["public"]["Tables"]["kasona_team_members"]["Update"];

export async function getTeamMembers(includeInactive = true): Promise<TeamMember[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("kasona_team_members")
    .select("*")
    .order("is_active", { ascending: false })
    .order("display_name", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}

export async function getTeamMember(memberId: string): Promise<TeamMember | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("kasona_team_members")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function createTeamMember(payload: TeamMemberInsert): Promise<TeamMember | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("kasona_team_members")
    .insert({ ...payload, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error || !data) return null;
  return data;
}

export async function updateTeamMember(memberId: string, payload: TeamMemberUpdate): Promise<TeamMember | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("kasona_team_members")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("member_id", memberId)
    .select()
    .single();

  if (error || !data) return null;
  return data;
}

export async function deactivateTeamMember(memberId: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("kasona_team_members")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("member_id", memberId);

  return !error;
}
