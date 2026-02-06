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

  const visibleQueue = useMemo(() => {
    if (!currentUserId || (isAdmin && viewAllOwners)) return queue;
    return queue.filter((item) => item.owner_id === currentUserId || item.creator_id === currentUserId);
  }, [queue, currentUserId, isAdmin, viewAllOwners]);

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
            <TableHead>Open</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleQueue.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-sm text-muted-foreground">
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
                <Badge
                  variant={
                    item.product_status === "to send"
                      ? "danger"
                      : item.product_status === "to review"
                        ? "warning"
                        : "success"
                  }
                >
                  {item.product_status ?? "-"}
                </Badge>
              </TableCell>
              <TableCell>{item.output_format ?? "-"} · {item.output_frequency ?? "-"}</TableCell>
              <TableCell>{getPodcastSchedule(item.output_frequency)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {item.owner_id ?? item.creator_id ?? "Unassigned"}
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
