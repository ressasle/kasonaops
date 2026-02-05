import tasks from "@/data/tasks.json";
import { CustomerPipeline } from "@/components/admin/customer-pipeline";
import { PageHeader } from "@/components/admin/page-header";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCustomers, getInvestorProfiles } from "@/lib/data/customers";

export default async function DashboardPage() {
  const [customers, profiles] = await Promise.all([getCustomers(), getInvestorProfiles()]);
  const supabaseReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
  );

  const pipelineValue = customers.reduce((sum, customer) => sum + (customer.expected_deal_value ?? 0), 0);
  const monthlyRevenue = customers
    .filter((customer) => customer.billing_type === "Monthly")
    .reduce((sum, customer) => sum + (customer.contract_size ?? 0), 0);
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
      value
    );

  const activity = [
    ...customers.map((customer) => ({
      key: `customer-${customer.company_id}`,
      label: customer.company_name,
      detail: customer.status ?? "Customer update",
      date: customer.updated_at ?? customer.created_at ?? ""
    })),
    ...profiles.map((profile) => ({
      key: `portfolio-${profile.portfolio_id}`,
      label: profile.portfolio_id,
      detail: profile.product_status ?? "Portfolio update",
      date: profile.updated_at ?? profile.created_at ?? ""
    }))
  ]
    .filter((item) => item.date)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .slice(0, 6);

  return (
    <div className="space-y-10">
      <PageHeader />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Customers", value: `${customers.length}`, delta: "Live roster" },
          { label: "Active Portfolios", value: `${profiles.length}`, delta: "Needs review" },
          { label: "MRR", value: formatCurrency(monthlyRevenue), delta: "Monthly contracts" },
          { label: "Pipeline Value", value: formatCurrency(pipelineValue), delta: "Open opportunities" }
        ].map((card) => (
          <Card key={card.label} className="p-5">
            <div className="label-mono text-xs text-muted-foreground">{card.label}</div>
            <div className="mt-3 text-2xl font-semibold">{card.value}</div>
            <div className="mt-1 text-xs text-accent">{card.delta}</div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
            <Button variant="outline">View pipeline</Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              { stage: "Lead", count: 18, value: "EUR 62k" },
              { stage: "Meeting", count: 6, value: "EUR 41k" },
              { stage: "Offer", count: 4, value: "EUR 58k" },
              { stage: "Active", count: 3, value: "EUR 21k" }
            ].map((stage) => (
              <div key={stage.stage} className="rounded-2xl border border-border/60 p-4">
                <div className="label-mono text-xs text-muted-foreground">{stage.stage}</div>
                <div className="mt-2 text-xl font-semibold">{stage.count}</div>
                <div className="text-xs text-muted-foreground">{stage.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <CardTitle>Operations Queue</CardTitle>
            <Button variant="outline">Open fulfillment</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Portfolio ingestion", value: "7 waiting" },
              { label: "Investor DNA completed", value: "12 this week" },
              { label: "Handover delivered", value: "3 pending" }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.value}</div>
                </div>
                <Badge variant="warning">SLA</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CustomerPipeline customers={customers} enableSync={supabaseReady} />
        </div>

        <Card className="p-6">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <Button variant="outline">Assign</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => (
              <div key={task.task_id} className="rounded-2xl border border-border/60 p-3">
                <div className="text-sm font-medium">{task.title}</div>
                <div className="text-xs text-muted-foreground">Owner: {task.owner_id}</div>
                <div className="mt-2">
                  <Badge
                    variant={
                      task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "default"
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="label-mono text-xs text-muted-foreground">Customer Overview</div>
          {!supabaseReady && <Badge variant="warning">Supabase not configured</Badge>}
        </div>
        <Card className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.slice(0, 8).map((customer) => (
                <TableRow key={customer.company_id}>
                  <TableCell>
                    <Link href={`/customers/${customer.company_id}`} className="hover:underline">
                      {customer.company_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.status?.includes("Paid") ? "success" : "default"}>
                      {customer.status ?? "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.action_status ?? "-"}</TableCell>
                  <TableCell>{customer.expected_deal_value ?? "-"}</TableCell>
                  <TableCell>{customer.updated_at ? customer.updated_at.slice(0, 10) : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="label-mono text-xs text-muted-foreground">Recent Activity</div>
        <Card className="p-4">
          <div className="space-y-3">
            {activity.length === 0 && (
              <div className="text-sm text-muted-foreground">No recent activity yet.</div>
            )}
            {activity.map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.detail}</div>
                </div>
                <div className="text-xs text-muted-foreground">{item.date.slice(0, 10)}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
