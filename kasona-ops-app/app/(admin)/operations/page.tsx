import Link from "next/link";

import { FulfillmentQueue } from "@/components/admin/operations/fulfillment-queue";
import { PodcastControls } from "@/components/admin/operations/podcast-controls";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFulfillmentQueue } from "@/lib/data/operations";
import { getTasksByCategories } from "@/lib/data/tasks";
import { CategoryTasksCard } from "@/components/admin/tasks/category-tasks-card";

type OperationsPageProps = {
  searchParams?: Promise<{
    view?: string;
    admin?: string;
    ownerId?: string;
  }>;
};

export default async function OperationsPage({ searchParams }: OperationsPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeView = resolvedSearchParams?.view ?? "queue";
  const isAdmin = resolvedSearchParams?.admin === "true";
  const currentUserId = resolvedSearchParams?.ownerId ?? null;
  const [queue, fulfillmentTasks] = await Promise.all([
    getFulfillmentQueue(),
    getTasksByCategories(["fulfillment"]),
  ]);

  const qaChecklist = [
    { label: "Portfolio completeness", value: `${queue.filter((item) => !item.output_format).length} waiting` },
    { label: "Investor DNA confirmed", value: `${queue.filter((item) => item.product_status === "created").length} completed` },
    { label: "Handover delivered", value: `${queue.filter((item) => item.product_status === "to send").length} pending` }
  ];
  return (
    <div className="space-y-10">
      <PageHeader />

      <div className="flex items-center gap-2 border-b border-border/50 pb-4">
        <Button asChild variant={activeView === "queue" ? "default" : "ghost"} size="sm">
          <Link href="/operations?view=queue">Fulfillment Queue</Link>
        </Button>
        <Button asChild variant={activeView === "qa" ? "default" : "ghost"} size="sm">
          <Link href="/operations?view=qa">QA Checklist</Link>
        </Button>
        <Button asChild variant={activeView === "podcasts" ? "default" : "ghost"} size="sm">
          <Link href="/operations?view=podcasts">Podcasts</Link>
        </Button>
      </div>

      {activeView === "podcasts" ? (
        <section className="grid gap-6">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Podcast Controls</CardTitle>
              <Badge variant="outline">{queue.length} portfolios</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {queue.map((item) => (
                <div key={item.portfolio_id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 p-4">
                  <div>
                    <div className="text-sm font-semibold">{item.portfolio_name ?? item.portfolio_id}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.company_name ?? item.customer_name ?? "-"}
                    </div>
                  </div>
                  <PodcastControls customerId={item.company_id} />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      ) : activeView === "qa" ? (
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>QA Checklist</CardTitle>
              <Button variant="outline">Open</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {qaChecklist.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/60 p-4">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.value}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="p-6 lg:col-span-2">
            <CardHeader>
              <CardTitle>QA Actions</CardTitle>
              <Badge variant="warning">Logic pending</Badge>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Q&A check logic needs definition before buttons can be activated.
            </CardContent>
          </Card>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <CardHeader>
              <CardTitle>Fulfillment Queue</CardTitle>
              <Button variant="outline">View queue</Button>
            </CardHeader>
            <CardContent>
              <FulfillmentQueue queue={queue} isAdmin={isAdmin} currentUserId={currentUserId} />
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>QA Checklist</CardTitle>
              <Button variant="outline">Open</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {qaChecklist.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/60 p-4">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.value}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <CategoryTasksCard title="Fulfillment Tasks" tasks={fulfillmentTasks} />
        </section>
      )}
    </div>
  );
}
