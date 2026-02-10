import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCustomers } from "@/lib/data/customers";
import { getTasksByCategories } from "@/lib/data/tasks";
import { getTransactionCosts, calculateMonthlyTotal, calculateFixedCosts } from "@/lib/data/costs";
import { CategoryTasksCard } from "@/components/admin/tasks/category-tasks-card";
import { DollarSign, TrendingDown, Calendar, Wallet } from "lucide-react";

export default async function FinancePage() {
  const [customers, financeTasks, costs] = await Promise.all([
    getCustomers(),
    getTasksByCategories(["finance"]),
    getTransactionCosts(),
  ]);

  const monthlyTotal = calculateMonthlyTotal(costs);
  const fixedCosts = calculateFixedCosts(costs);
  const activeCosts = costs.filter((c) => c.status === "active");
  const upcomingCount = costs.filter((c) => {
    if (!c.next_due_date) return false;
    const dueDate = new Date(c.next_due_date);
    const today = new Date();
    const thirtyDays = new Date(today);
    thirtyDays.setDate(today.getDate() + 30);
    return dueDate >= today && dueDate <= thirtyDays;
  }).length;

  return (
    <div className="space-y-10">
      <PageHeader />

      {/* Liquidity Summary Cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-panel p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Monatliche Kosten</div>
              <div className="text-2xl font-bold">€{monthlyTotal.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </Card>
        <Card className="glass-panel p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-500/10 p-2">
              <TrendingDown className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Fixkosten (mtl.)</div>
              <div className="text-2xl font-bold">€{fixedCosts.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </Card>
        <Card className="glass-panel p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/10 p-2">
              <Calendar className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Fällig (30 Tage)</div>
              <div className="text-2xl font-bold">{upcomingCount}</div>
            </div>
          </div>
        </Card>
        <Card className="glass-panel p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <Wallet className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Aktive Kosten</div>
              <div className="text-2xl font-bold">{activeCosts.length}</div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Overview */}
        <Card className="p-6 lg:col-span-2">
          <CardHeader>
            <CardTitle>Finance Overview</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline">Generate invoice</Button>
              <Button variant="outline">Payment history</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contract Size</TableHead>
                  <TableHead>Billing Type</TableHead>
                  <TableHead>Charge Type</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={`finance-${customer.company_id}`}>
                    <TableCell>
                      <div className="text-sm font-medium">{customer.company_name}</div>
                      <div className="text-xs text-muted-foreground">{customer.billing_email ?? "-"}</div>
                    </TableCell>
                    <TableCell>{customer.contract_size ?? "-"}</TableCell>
                    <TableCell>{customer.billing_type ?? "-"}</TableCell>
                    <TableCell>{customer.charge_type ?? "-"}</TableCell>
                    <TableCell>{customer.start_date ?? "-"}</TableCell>
                    <TableCell>{customer.end_date ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <CardTitle>Billing Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
              <div>
                <div className="text-sm font-medium">Invoices due</div>
                <div className="text-xs text-muted-foreground">Last 30 days</div>
              </div>
              <Badge variant="warning">4</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
              <div>
                <div className="text-sm font-medium">Payments received</div>
                <div className="text-xs text-muted-foreground">Last 30 days</div>
              </div>
              <Badge variant="success">12</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
              <div>
                <div className="text-sm font-medium">Overdue</div>
                <div className="text-xs text-muted-foreground">Needs follow-up</div>
              </div>
              <Badge variant="danger">2</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Costs Table Section */}
      <section>
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Kostenseite</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline">Export CSV</Button>
              <Button variant="default">+ Kosten hinzufügen</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Fix/Variabel</TableHead>
                  <TableHead>Betrag</TableHead>
                  <TableHead>Startdatum</TableHead>
                  <TableHead>Enddatum</TableHead>
                  <TableHead>Fällig</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      Noch keine Kosten erfasst. Klicke auf &quot;+ Kosten hinzufügen&quot; um zu starten.
                    </TableCell>
                  </TableRow>
                ) : (
                  costs.map((cost) => (
                    <TableRow key={cost.id}>
                      <TableCell>
                        <div className="text-sm font-medium">{cost.cost_name}</div>
                        {cost.vendor && <div className="text-xs text-muted-foreground">{cost.vendor}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cost.cost_category}</Badge>
                      </TableCell>
                      <TableCell>{cost.cost_type}</TableCell>
                      <TableCell>
                        <Badge variant={cost.cost_nature === "fix" ? "default" : "secondary"}>
                          {cost.cost_nature}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cost.amount ? `€${cost.amount.toLocaleString("de-DE", { minimumFractionDigits: 2 })}` : "-"}
                      </TableCell>
                      <TableCell>{cost.start_date ?? "-"}</TableCell>
                      <TableCell>{cost.end_date ?? "-"}</TableCell>
                      <TableCell>{cost.next_due_date ?? "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            cost.status === "active" ? "success" :
                              cost.status === "paused" ? "warning" : "danger"
                          }
                        >
                          {cost.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <CategoryTasksCard title="Finance Tasks" tasks={financeTasks} />
      </section>
    </div>
  );
}
