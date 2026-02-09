import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { KanbanBoard } from "@/components/admin/sales/kanban-board";
import { SalesFilters } from "@/components/admin/sales/sales-filters";
import { SalesLeadsTable } from "@/components/admin/sales/sales-leads-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSalesLeads, LOST_STATUSES, PIPELINE_STAGES } from "@/lib/data/sales";
import { getTasksByCategories } from "@/lib/data/tasks";
import { CategoryTasksCard } from "@/components/admin/tasks/category-tasks-card";
import { getActiveTeamOptions } from "@/lib/data/team-options";

type SalesPageProps = {
  searchParams?: Promise<{
    view?: string;
    product?: string;
    status?: string;
    type?: string;
    owner_id?: string;
    search?: string;
  }>;
};

const formatValue = (value: number | null) => {
  if (!value) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
};

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeView = resolvedSearchParams?.view ?? "overview";
  const selectedProduct = resolvedSearchParams?.product ?? "";
  const selectedStatus = resolvedSearchParams?.status ?? "";
  const selectedType = resolvedSearchParams?.type ?? "";
  const selectedOwner = resolvedSearchParams?.owner_id ?? "";
  const selectedSearch = resolvedSearchParams?.search ?? "";

  const [leads, salesTasks, ownerOptions] = await Promise.all([
    getSalesLeads(200, {
      product: selectedProduct || undefined,
      status: selectedStatus || undefined,
      type: selectedType || undefined,
      ownerId: selectedOwner || undefined,
      search: selectedSearch || undefined,
    }),
    getTasksByCategories(["sales"]),
    getActiveTeamOptions(),
  ]);

  const productOptions = [...new Set(leads.map((lead) => lead.product_type).filter((value): value is string => Boolean(value)))].map((value) => ({ value, label: value }));
  const typeOptions = [...new Set(leads.map((lead) => lead.type).filter((value): value is string => Boolean(value)))].map((value) => ({ value, label: value }));
  const statusOptions = [...new Set([...PIPELINE_STAGES.flatMap((stage) => stage.statuses), ...LOST_STATUSES])];

  const stageSummaries = PIPELINE_STAGES.map((stage) => {
    const stageLeads = leads.filter((lead) => stage.statuses.includes(lead.status ?? ""));
    const stageValue = stageLeads.reduce((sum, lead) => {
      const value = lead.expected_deal_value ?? lead.contract_size ?? 0;
      return sum + value;
    }, 0);
    return {
      stage: stage.label,
      statusFilter: stage.statuses[0] ?? "",
      count: stageLeads.length,
      value: formatValue(stageValue)
    };
  });

  const leadCount = stageSummaries.find((stage) => stage.stage === "New Lead")?.count ?? 0;
  const meetingCount = leads.filter((lead) => lead.status === "Meeting Booked").length;
  const offerCount = leads.filter((lead) => ["Offer Generated", "Offer Sent"].includes(lead.status ?? "")).length;
  const wonCount = leads.filter((lead) => ["Paid User", "Closed Won", "Expanded"].includes(lead.status ?? "")).length;
  const lostCount = leads.filter((lead) => LOST_STATUSES.includes(lead.status ?? "")).length;
  const winRate = wonCount + lostCount > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : 0;

  const highlights = [
    { label: "New leads", value: leadCount.toString(), delta: `${leadCount} in pipeline` },
    { label: "Meetings", value: meetingCount.toString(), delta: `${meetingCount} booked` },
    { label: "Offers", value: offerCount.toString(), delta: `${offerCount} active` },
    { label: "Win rate", value: `${winRate}%`, delta: `${wonCount} won` }
  ];

  const nextActions = leads
    .filter((lead) => lead.action_status)
    .slice(0, 3)
    .map((lead) => ({
      title: `${lead.action_status}: ${lead.company_name}`,
      status: lead.status ?? "-"
    }));
  return (
    <div className="space-y-10">
      <PageHeader />

      <div className="flex items-center gap-2 border-b border-border/50 pb-4">
        <Button asChild variant={activeView === "overview" ? "default" : "ghost"} size="sm">
          <Link href="/sales?view=overview">Overview</Link>
        </Button>
        <Button asChild variant={activeView === "kanban" ? "default" : "ghost"} size="sm">
          <Link href="/sales?view=kanban">Kanban</Link>
        </Button>
        <Button asChild variant={activeView === "list" ? "default" : "ghost"} size="sm">
          <Link href="/sales?view=list">List View</Link>
        </Button>
      </div>

      <SalesFilters
        view={activeView}
        search={selectedSearch}
        product={selectedProduct}
        status={selectedStatus}
        type={selectedType}
        ownerId={selectedOwner}
        productOptions={productOptions}
        statusOptions={statusOptions.map((value) => ({ value, label: value }))}
        typeOptions={typeOptions}
        ownerOptions={ownerOptions}
      />

      {activeView === "kanban" ? (
        <KanbanBoard leads={leads} />
      ) : activeView === "list" ? (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>All Leads</CardTitle>
            <Button variant="outline">Export</Button>
          </CardHeader>
          <CardContent>
            <SalesLeadsTable leads={leads} salesTasks={salesTasks} statusOptions={statusOptions} />
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => (
              <Card key={item.label} className="p-5">
                <div className="label-mono text-xs text-muted-foreground">{item.label}</div>
                <div className="mt-3 text-2xl font-semibold">{item.value}</div>
                <div className="mt-1 text-xs text-accent">{item.delta}</div>
              </Card>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Pipeline Overview</CardTitle>
                <Button variant="outline">Export</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {stageSummaries.map((stage) => (
                  <Link
                    key={stage.stage}
                    href={stage.statusFilter ? `/customers?status=${encodeURIComponent(stage.statusFilter)}` : "/customers"}
                    className="flex items-center justify-between rounded-2xl border border-border/60 p-4 transition hover:border-primary/40 hover:bg-white/5"
                  >
                    <div>
                      <div className="text-sm font-semibold">{stage.stage}</div>
                      <div className="text-xs text-muted-foreground">{stage.value}</div>
                    </div>
                    <Badge variant="default">{stage.count}</Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle>Next Actions</CardTitle>
                <Button variant="outline">Assign</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {nextActions.length === 0 && (
                  <div className="text-sm text-muted-foreground">No next actions yet.</div>
                )}
                {nextActions.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-border/60 p-4">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.status}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <CategoryTasksCard title="Sales Tasks" tasks={salesTasks} />
          </section>
        </>
      )}
    </div>
  );
}
