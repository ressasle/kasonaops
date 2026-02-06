import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PIPELINE_STAGES, type SalesLead } from "@/lib/data/sales";

const formatValue = (value: number | null) => {
  if (!value) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
};

export function KanbanBoard({ leads }: { leads: SalesLead[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-6">
      {PIPELINE_STAGES.map((stage) => {
        const stageLeads = leads.filter((lead) => stage.statuses.includes(lead.status ?? ""));
        return (
          <div key={stage.id} className={`glass-panel p-4 ${stage.color}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{stage.label}</h3>
              <Badge variant="outline" className="text-xs">
                {stageLeads.length}
              </Badge>
            </div>
            <div className="mt-4 space-y-3">
              {stageLeads.length === 0 && (
                <div className="text-xs text-muted-foreground">No leads yet</div>
              )}
              {stageLeads.map((lead) => (
                <Card key={lead.company_id} className="space-y-2 rounded-2xl border border-border/60 p-3">
                  <div className="text-sm font-semibold">{lead.company_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {lead.contact_person_name || lead.email || "No contact"}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatValue(lead.expected_deal_value ?? lead.contract_size)}</span>
                    <Link href={`/customers/${lead.company_id}`} className="text-primary">
                      Open
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
