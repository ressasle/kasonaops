import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pipeline = [
  { stage: "Lead Identified", count: 18, value: "EUR 62k" },
  { stage: "Lead Enriched", count: 9, value: "EUR 44k" },
  { stage: "Meeting Booked", count: 5, value: "EUR 32k" },
  { stage: "Offer Sent", count: 4, value: "EUR 28k" },
  { stage: "Paid User", count: 3, value: "EUR 21k" }
];

const highlights = [
  { label: "New leads", value: "12", delta: "+4 this week" },
  { label: "Meetings", value: "6", delta: "3 upcoming" },
  { label: "Offers", value: "4", delta: "2 pending" },
  { label: "Win rate", value: "31%", delta: "+6%" }
];

export default function SalesPage() {
  return (
    <div className="space-y-10">
      <PageHeader />

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
            {pipeline.map((stage) => (
              <Link
                key={stage.stage}
                href={`/customers?status=${encodeURIComponent(stage.stage)}`}
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
            {[
              { title: "Follow up: Aurelia Partners", status: "Offer Sent" },
              { title: "Send onboarding pack: 261031", status: "Lead Enriched" },
              { title: "Schedule demo: Bergmann Holdings", status: "Meeting Booked" }
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border/60 p-4">
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.status}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
