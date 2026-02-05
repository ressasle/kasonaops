import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const fulfillmentQueue = [
  { portfolio: "261031-A", status: "to review", output: "Podcast · weekly", nextRun: "Mon" },
  { portfolio: "261044-B", status: "created", output: "Newsletter · monthly", nextRun: "Feb 10" },
  { portfolio: "261090-C", status: "to send", output: "Podcast · weekly", nextRun: "Today" }
];

const qaChecklist = [
  { label: "Portfolio completeness", value: "7 waiting" },
  { label: "Investor DNA confirmed", value: "12 completed" },
  { label: "Handover delivered", value: "3 pending" }
];

export default function OperationsPage() {
  return (
    <div className="space-y-10">
      <PageHeader />

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <CardHeader>
            <CardTitle>Fulfillment Queue</CardTitle>
            <Button variant="outline">View queue</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Portfolio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Output</TableHead>
                  <TableHead>Next Run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fulfillmentQueue.map((item) => (
                  <TableRow key={item.portfolio}>
                    <TableCell className="font-mono">{item.portfolio}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === "to send" ? "danger" : item.status === "to review" ? "warning" : "success"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.output}</TableCell>
                    <TableCell>{item.nextRun}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
      </section>
    </div>
  );
}
