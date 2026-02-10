import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TransactionCost, TransactionCostInsert } from "@/lib/data/types";

export async function getTransactionCosts(): Promise<TransactionCost[]> {
    const supabase = getSupabaseServerClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from("kasona_transaction_costs")
        .select("*")
        .order("cost_category", { ascending: true })
        .order("cost_name", { ascending: true });

    if (error || !data) return [];
    return data as unknown as TransactionCost[];
}

export async function getActiveCosts(): Promise<TransactionCost[]> {
    const supabase = getSupabaseServerClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from("kasona_transaction_costs")
        .select("*")
        .eq("status", "active")
        .order("next_due_date", { ascending: true });

    if (error || !data) return [];
    return data as unknown as TransactionCost[];
}

export async function getUpcomingCosts(days: number = 30): Promise<TransactionCost[]> {
    const supabase = getSupabaseServerClient();
    if (!supabase) return [];

    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);

    const { data, error } = await supabase
        .from("kasona_transaction_costs")
        .select("*")
        .eq("status", "active")
        .gte("next_due_date", today.toISOString().split("T")[0])
        .lte("next_due_date", futureDate.toISOString().split("T")[0])
        .order("next_due_date", { ascending: true });

    if (error || !data) return [];
    return data as unknown as TransactionCost[];
}

export async function getCostsByCategory(): Promise<Record<string, TransactionCost[]>> {
    const costs = await getActiveCosts();
    return costs.reduce((acc, cost) => {
        if (!acc[cost.cost_category]) {
            acc[cost.cost_category] = [];
        }
        acc[cost.cost_category].push(cost);
        return acc;
    }, {} as Record<string, TransactionCost[]>);
}

export function calculateMonthlyTotal(costs: TransactionCost[]): number {
    return costs.reduce((total, cost) => {
        if (!cost.amount || cost.status !== "active") return total;

        switch (cost.cost_type) {
            case "monatlich":
                return total + cost.amount;
            case "quartalsweise":
                return total + cost.amount / 3;
            case "halbjaehrlich":
                return total + cost.amount / 6;
            case "jaehrlich":
                return total + cost.amount / 12;
            default:
                return total;
        }
    }, 0);
}

export function calculateFixedCosts(costs: TransactionCost[]): number {
    return costs
        .filter((c) => c.cost_nature === "fix" && c.status === "active")
        .reduce((total, cost) => {
            if (!cost.amount) return total;
            switch (cost.cost_type) {
                case "monatlich":
                    return total + cost.amount;
                case "quartalsweise":
                    return total + cost.amount / 3;
                case "halbjaehrlich":
                    return total + cost.amount / 6;
                case "jaehrlich":
                    return total + cost.amount / 12;
                default:
                    return total;
            }
        }, 0);
}

export async function createTransactionCost(
    cost: TransactionCostInsert
): Promise<TransactionCost | null> {
    const supabase = getSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await (supabase as any)
        .from("kasona_transaction_costs")
        .insert(cost)
        .select()
        .single();

    if (error || !data) return null;
    return data as TransactionCost;
}
