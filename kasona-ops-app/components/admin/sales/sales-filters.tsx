import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SelectOption = {
  value: string;
  label: string;
};

type SalesFiltersProps = {
  view: string;
  search?: string;
  product?: string;
  status?: string;
  type?: string;
  ownerId?: string;
  productOptions: SelectOption[];
  statusOptions: SelectOption[];
  typeOptions: SelectOption[];
  ownerOptions: SelectOption[];
};

export function SalesFilters({
  view,
  search,
  product,
  status,
  type,
  ownerId,
  productOptions,
  statusOptions,
  typeOptions,
  ownerOptions,
}: SalesFiltersProps) {
  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 md:grid-cols-6" method="GET" action="/sales">
          <input type="hidden" name="view" value={view} />
          <Input name="search" defaultValue={search ?? ""} placeholder="Search company or contact" />

          <select name="product" defaultValue={product ?? ""} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All products</option>
            {productOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select name="status" defaultValue={status ?? ""} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select name="type" defaultValue={type ?? ""} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All types</option>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select name="owner_id" defaultValue={ownerId ?? ""} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All owners</option>
            {ownerOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Button type="submit">Apply</Button>
            <Button asChild variant="outline">
              <Link href={`/sales?view=${encodeURIComponent(view)}`}>Reset Filters</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
