import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Customer } from "@/lib/data/customers";

type UpcomingCustomersProps = {
  customers: Customer[];
};

export function UpcomingCustomers({ customers }: UpcomingCustomersProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = customers
    .filter((customer) => {
      if (!customer.start_date) return false;
      const date = new Date(customer.start_date);
      return !Number.isNaN(date.getTime()) && date >= today;
    })
    .sort((a, b) => (a.start_date ?? "").localeCompare(b.start_date ?? ""));

  return (
    <section className="space-y-4">
      {upcoming.length === 0 && (
        <Card className="p-6 text-sm text-muted-foreground">No upcoming customer start dates.</Card>
      )}

      {upcoming.map((customer) => (
        <Card key={customer.company_id} className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link href={`/customers/${customer.company_id}`} className="text-sm font-semibold hover:underline cursor-pointer">
                {customer.company_name}
              </Link>
              <div className="text-xs text-muted-foreground">Start Date: {customer.start_date}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">{customer.product_type ?? "No product"}</Badge>
              <Badge variant={customer.status?.includes("Paid") ? "success" : "warning"}>{customer.status ?? "Unknown"}</Badge>
            </div>
          </div>
        </Card>
      ))}
    </section>
  );
}
