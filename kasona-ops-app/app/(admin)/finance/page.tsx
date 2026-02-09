import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCustomers } from "@/lib/data/customers";
import { getTasksByCategories } from "@/lib/data/tasks";
import { CategoryTasksCard } from "@/components/admin/tasks/category-tasks-card";

export default async function FinancePage() {
  const [customers, financeTasks] = await Promise.all([
    getCustomers(),
    getTasksByCategories(["finance"]),
  ]);

  return (
    <div className="space-y-10">
      <PageHeader />

      <section className="grid gap-6 lg:grid-cols-3">
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

        <CategoryTasksCard title="Finance Tasks" tasks={financeTasks} />
      </section>
    </div>
  );
}
