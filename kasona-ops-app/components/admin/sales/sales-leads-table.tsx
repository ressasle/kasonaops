"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SalesLead } from "@/lib/data/sales";
import type { Task } from "@/lib/data/types";

type SalesLeadsTableProps = {
  leads: SalesLead[];
  salesTasks: Task[];
  statusOptions: string[];
};

const formatValue = (value: number | null) => {
  if (!value) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
};

export function SalesLeadsTable({ leads, salesTasks, statusOptions }: SalesLeadsTableProps) {
  const [rows, setRows] = useState<SalesLead[]>(leads);
  const [savingId, setSavingId] = useState<number | null>(null);

  const taskCountByCompany = useMemo(() => {
    const map = new Map<number, number>();
    for (const task of salesTasks) {
      if (typeof task.company_id !== "number") continue;
      map.set(task.company_id, (map.get(task.company_id) ?? 0) + (task.status === "done" ? 0 : 1));
    }
    return map;
  }, [salesTasks]);

  const updateStatus = async (companyId: number, status: string) => {
    setSavingId(companyId);
    try {
      const response = await fetch(`/api/sales/${companyId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        return;
      }

      setRows((prev) => prev.map((lead) => (lead.company_id === companyId ? { ...lead, status } : lead)));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Probability</TableHead>
          <TableHead>Sales Tasks</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((lead) => (
          <TableRow key={lead.company_id}>
            <TableCell>
              <Link href={`/customers/${lead.company_id}`} className="text-sm font-semibold hover:underline">
                {lead.company_name}
              </Link>
              <div className="text-xs text-muted-foreground">
                {lead.contact_person_name || lead.email || "No contact"}
              </div>
            </TableCell>
            <TableCell>
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                value={lead.status ?? ""}
                disabled={savingId === lead.company_id}
                onChange={(event) => updateStatus(lead.company_id, event.target.value)}
              >
                <option value="">-</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </TableCell>
            <TableCell>{lead.action_status ?? "-"}</TableCell>
            <TableCell>{formatValue(lead.expected_deal_value ?? lead.contract_size)}</TableCell>
            <TableCell>{lead.probability ? `${lead.probability}%` : "-"}</TableCell>
            <TableCell>
              <Badge variant="outline">{taskCountByCompany.get(lead.company_id) ?? 0} open</Badge>
            </TableCell>
            <TableCell className="text-right">
              {lead.email ? (
                <Button asChild variant="outline" size="sm" className="cursor-pointer">
                  <a href={`mailto:${lead.email}`}>Send Email</a>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="cursor-not-allowed" disabled>
                  Send Email
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
