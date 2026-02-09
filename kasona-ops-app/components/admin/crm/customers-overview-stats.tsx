import Link from "next/link";

import { Card } from "@/components/ui/card";

type CustomersOverviewStatsProps = {
  totalCustomers: number;
  assignedToMe: number;
  operationsQueue: {
    pending: number;
    waiting: number;
  };
};

export function CustomersOverviewStats({
  totalCustomers,
  assignedToMe,
  operationsQueue
}: CustomersOverviewStatsProps) {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <Card className="p-5">
        <div className="label-mono text-xs text-muted-foreground">Operations Queue</div>
        <div className="mt-3 text-2xl font-semibold">{operationsQueue.pending}</div>
        <Link href="/operations" className="mt-1 block text-xs text-accent hover:underline cursor-pointer">
          {operationsQueue.waiting} waiting for review
        </Link>
      </Card>
      <Card className="p-5">
        <div className="label-mono text-xs text-muted-foreground">Total Customers</div>
        <div className="mt-3 text-2xl font-semibold">{totalCustomers}</div>
        <div className="mt-1 text-xs text-accent">Live roster</div>
      </Card>
      <Card className="p-5">
        <div className="label-mono text-xs text-muted-foreground">Customers Assigned To Me</div>
        <div className="mt-3 text-2xl font-semibold">{assignedToMe}</div>
        <div className="mt-1 text-xs text-accent">Based on owner assignment</div>
      </Card>
    </section>
  );
}
