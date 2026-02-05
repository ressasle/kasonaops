import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const signals = [
  { label: "Waitlist → Meeting", value: "18%" },
  { label: "Meeting → Offer", value: "42%" },
  { label: "Offer → Paid", value: "31%" }
];

const sla = [
  { label: "Delayed outputs", value: "2" },
  { label: "Pending QA", value: "5" },
  { label: "Missing portfolio data", value: "3" }
];

export default function TrackingPage() {
  return (
    <div className="space-y-10">
      <PageHeader />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Conversion Signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {signals.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-sm text-accent">{item.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <CardTitle>SLA Watchlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sla.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-sm text-muted-foreground">{item.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
