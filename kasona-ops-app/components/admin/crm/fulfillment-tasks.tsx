"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Customer } from "@/lib/data/customers";

type FulfillmentTasksProps = {
  customers: Customer[];
  supabaseReady: boolean;
};

const PRIORITY_STATUSES = [
  "Reminder Set",
  "To Check",
  "To Reach Out",
  "Mail Sent",
  "Backlog",
  "To Expand",
  "New",
  "Renewed"
];

export function FulfillmentTasks({ customers, supabaseReady }: FulfillmentTasksProps) {
  const router = useRouter();
  const [savingId, setSavingId] = useState<number | null>(null);

  const grouped = PRIORITY_STATUSES.map((status) => ({
    status,
    customers: customers.filter((customer) => customer.action_status === status)
  })).filter((group) => group.customers.length > 0);

  const updateStatus = async (companyId: number, actionStatus: string | null) => {
    if (!supabaseReady) return;

    setSavingId(companyId);
    try {
      const response = await fetch(`/api/customers/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_status: actionStatus })
      });

      if (!response.ok) {
        throw new Error("Unable to update action status");
      }

      router.refresh();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="space-y-6">
      {grouped.length === 0 && (
        <Card className="p-6 text-sm text-muted-foreground">No fulfillment tasks based on current action status.</Card>
      )}

      {grouped.map((group) => (
        <Card key={group.status} className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{group.status}</div>
            <Badge variant={group.status === "Reminder Set" ? "warning" : "default"}>{group.customers.length}</Badge>
          </div>

          <div className="space-y-3">
            {group.customers.map((customer) => (
              <div key={customer.company_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3">
                <div>
                  <Link href={`/customers/${customer.company_id}`} className="text-sm font-medium hover:underline cursor-pointer">
                    {customer.company_name}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {customer.product_type ?? "No product"}
                    {customer.reminder_date ? ` · Reminder ${customer.reminder_date.slice(0, 10)}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    disabled={savingId === customer.company_id}
                    onClick={() => updateStatus(customer.company_id, "To Check")}
                  >
                    To Check
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                    disabled={savingId === customer.company_id}
                    onClick={() => updateStatus(customer.company_id, "Renewed")}
                  >
                    {savingId === customer.company_id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Done"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </section>
  );
}
