"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FulfillmentItem } from "@/lib/data/operations";

type FulfillmentQueueProps = {
  queue: FulfillmentItem[];
  isAdmin?: boolean;
  currentUserId?: string | null;
};

const getPodcastSchedule = (frequency: string | null) => {
  switch (frequency) {
    case "daily":
      return "Every weekday at 7:00 AM";
    case "weekly":
      return "Every Monday at 9:00 AM";
    case "bi-weekly":
      return "Every other Monday at 9:00 AM";
    case "monthly":
      return "First Monday of month at 9:00 AM";
    case "quarterly":
      return "First Monday of quarter at 9:00 AM";
    default:
      return "Schedule not set";
  }
};

export function FulfillmentQueue({ queue, isAdmin = false, currentUserId }: FulfillmentQueueProps) {
  const [viewAllOwners, setViewAllOwners] = useState(false);
  const [rows, setRows] = useState<FulfillmentItem[]>(queue);
  const [savingPortfolioId, setSavingPortfolioId] = useState<string | null>(null);

  const visibleQueue = useMemo(() => {
    const source = rows;
    if (!currentUserId || (isAdmin && viewAllOwners)) return source;
    return source.filter((item) => item.owner_id === currentUserId || item.creator_id === currentUserId);
  }, [rows, currentUserId, isAdmin, viewAllOwners]);

  const updateStatus = async (portfolioId: string, productStatus: string) => {
    setSavingPortfolioId(portfolioId);
    try {
      const response = await fetch(`/api/investor-profiles/${encodeURIComponent(portfolioId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_status: productStatus })
      });
      if (!response.ok) return;
      setRows((prev) => prev.map((item) => (item.portfolio_id === portfolioId ? { ...item, product_status: productStatus } : item)));
    } finally {
      setSavingPortfolioId(null);
    }
  };

  return (
    <>
      {isAdmin && (
        <div className="flex items-center gap-2 mb-4">
          <Switch checked={viewAllOwners} onCheckedChange={setViewAllOwners} />
          <Label>Show all owners</Label>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Portfolio</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Output</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Next Action</TableHead>
            <TableHead>Open</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleQueue.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-sm text-muted-foreground">
                No items available.
              </TableCell>
            </TableRow>
          )}
          {visibleQueue.map((item) => (
            <TableRow key={item.portfolio_id}>
              <TableCell className="font-mono text-xs">
                <div>{item.portfolio_name ?? item.portfolio_id}</div>
                <div className="text-muted-foreground">{item.company_name ?? item.customer_name ?? "-"}</div>
              </TableCell>
              <TableCell>
                <select
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  value={item.product_status ?? ""}
                  disabled={savingPortfolioId === item.portfolio_id}
                  onChange={(event) => updateStatus(item.portfolio_id, event.target.value)}
                >
                  <option value="to create">to create</option>
                  <option value="created">created</option>
                  <option value="to review">to review</option>
                  <option value="to send">to send</option>
                  <option value="sent out">sent out</option>
                </select>
              </TableCell>
              <TableCell>{item.output_format ?? "-"} · {item.output_frequency ?? "-"}</TableCell>
              <TableCell>{getPodcastSchedule(item.output_frequency)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {item.owner_id ?? item.creator_id ?? "Unassigned"}
              </TableCell>
              <TableCell>
                {item.product_status === "to create" ? (
                  <Button size="sm" className="cursor-pointer">Generate Podcast</Button>
                ) : item.product_status === "created" ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={item.company_id ? `/customers/${item.company_id}` : "/operations"}>Review Podcast</Link>
                  </Button>
                ) : item.product_status === "to review" || item.product_status === "to send" ? (
                  <Button size="sm" className="cursor-pointer">Send Podcast</Button>
                ) : (
                  <Badge variant="success">Completed</Badge>
                )}
              </TableCell>
              <TableCell>
                {item.company_id ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/customers/${item.company_id}`}>Open</Link>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">No customer</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
