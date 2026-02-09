import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Task, TaskInsert, TaskUpdate } from "@/lib/data/types";

export type TaskFilters = {
  ownerId?: string;
  status?: Task["status"];
  priority?: Task["priority"];
  category?: NonNullable<Task["category"]>;
  companyId?: number;
};

export async function getTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase.from("kasona_tasks").select("*").order("created_at", { ascending: false });

  if (filters.ownerId) query = query.eq("owner_id", filters.ownerId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.category) query = query.eq("category", filters.category);
  if (typeof filters.companyId === "number") query = query.eq("company_id", filters.companyId);

  const { data, error } = await query;
  if (error || !data) return [];
  return data as unknown as Task[];
}

export async function getTasksByCategories(categories: Array<NonNullable<Task["category"]>>): Promise<Task[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase || categories.length === 0) return [];

  const { data, error } = await supabase
    .from("kasona_tasks")
    .select("*")
    .in("category", categories)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error || !data) return [];
  return data as unknown as Task[];
}

export async function createTask(payload: TaskInsert): Promise<Task | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("kasona_tasks")
    .insert({ ...payload, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error || !data) return null;
  return data as Task;
}

export async function updateTask(taskId: string, payload: TaskUpdate): Promise<Task | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("kasona_tasks")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select()
    .single();

  if (error || !data) return null;
  return data as Task;
}

export async function deleteTask(taskId: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("kasona_tasks").delete().eq("id", taskId);
  return !error;
}
