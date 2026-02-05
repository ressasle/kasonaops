import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PageHeaderProps = {
  showNewCustomer?: boolean;
};

export function PageHeader({ showNewCustomer = false }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="headline-serif text-3xl">Operations Command</div>
        <div className="text-sm text-muted-foreground">Admin, Sales, Operations, Tracking</div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input placeholder="Search company, portfolio, or ID" className="sm:w-72" />
        <Button variant="outline">Sync Supabase</Button>
        {showNewCustomer && (
          <Button asChild>
            <Link href="/customers/new">New customer</Link>
          </Button>
        )}
        <Button asChild>
          <Link href="/tasks#new-task">New task</Link>
        </Button>
      </div>
    </header>
  );
}
