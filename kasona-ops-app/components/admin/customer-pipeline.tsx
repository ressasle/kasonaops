"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, AlertCircle } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Customer } from "@/lib/data/customers";
import { cn } from "@/lib/utils";

const STATUS_COLUMNS = [
  "Lead Identified",
  "Lead Captured",
  "Lead Enriched",
  "Meeting Booked",
  "Offer Sent",
  "Paid User",
  "Closed Won",
  "Closed Lost"
];

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

type ViewMode = "kanban" | "list";

type CustomerPipelineProps = {
  customers: Customer[];
  enableSync?: boolean;
};

// Sortable Item Component (The Card)
function SortableCustomerCard({ customer }: { customer: Customer }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: customer.company_id,
    data: {
      type: "Customer",
      customer,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-2xl border-2 border-primary/50 bg-background/80 p-3 opacity-50"
      >
        <div className="h-12 w-full rounded bg-muted/20" />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group cursor-grab rounded-2xl border border-border/60 bg-card p-3 shadow-sm transition hover:border-primary/40 active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/customers/${customer.company_id}`}
          className="text-sm font-medium hover:underline"
          onClick={(e) => e.stopPropagation()} // Prevent drag start when clicking link
        >
          {customer.company_name}
        </Link>
        {customer.expected_deal_value && (
          <Badge variant="outline" className="text-[10px] px-1 h-5">
            €{(customer.expected_deal_value / 1000).toFixed(0)}k
          </Badge>
        )}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {customer.action_status ?? "No action"}
      </div>
      {customer.industry && (
        <Badge variant="secondary" className="mt-2 text-[10px] font-normal">
          {customer.industry}
        </Badge>
      )}
    </div>
  );
}

// Droppable Column Component
function PipelineColumn({
  status,
  customers,
}: {
  status: string;
  customers: Customer[];
}) {
  const { setNodeRef } = useSortable({
    id: status,
    data: {
      type: "Column",
      status,
    },
  });

  const totalValue = customers.reduce((sum, c) => sum + (c.expected_deal_value ?? 0), 0);

  return (
    <div ref={setNodeRef} className="flex h-full min-h-[500px] w-full min-w-[280px] flex-col rounded-xl bg-muted/50 p-2">
      <div className="mb-3 flex items-center justify-between px-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{status}</span>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 min-w-[1.25rem]">{customers.length}</Badge>
          </div>
          {totalValue > 0 && (
            <div className="mt-0.5 text-[10px] text-muted-foreground uppercase tracking-wider">
              €{(totalValue / 1000).toFixed(1)}k
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <SortableContext
          items={customers.map((c) => c.company_id)}
          strategy={verticalListSortingStrategy}
        >
          {customers.map((customer) => (
            <SortableCustomerCard key={customer.company_id} customer={customer} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// Visualization Component
function PipelineVisualization({ customers }: { customers: Customer[] }) {
  const data = useMemo(() => {
    return STATUS_COLUMNS.map(status => {
      const inStage = customers.filter(c => c.status === status);
      const count = inStage.length;
      const value = inStage.reduce((sum, c) => sum + (c.expected_deal_value ?? 0), 0);
      return { status, count, value };
    }).filter(d => d.count > 0);
  }, [customers]);

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <Card className="p-4 mb-6">
      <h3 className="text-sm font-medium mb-4">Pipeline Value Distribution</h3>
      <div className="flex h-32 items-end gap-2 sm:gap-4 overflow-x-auto pb-2">
        {data.map((item) => (
          <div key={item.status} className="flex flex-col items-center gap-2 min-w-[60px] flex-1">
            <div className="relative w-full rounded-t-md bg-primary/20 hover:bg-primary/30 transition-all group" style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: '4px' }}>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                €{item.value.toLocaleString()} ({item.count} deals)
              </div>
            </div>
            <div className="text-[10px] text-center text-muted-foreground leading-tight truncate w-full" title={item.status}>
              {item.status}
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="text-sm text-muted-foreground w-full text-center py-10">No deals in pipeline</div>}
      </div>
    </Card>
  );
}

export function CustomerPipeline({ customers, enableSync = false }: CustomerPipelineProps) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("kanban");
  const [localCustomers, setLocalCustomers] = useState(customers);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Group customers for Kanban
  const grouped = useMemo(() => {
    return STATUS_COLUMNS.reduce<Record<string, Customer[]>>((acc, status) => {
      acc[status] = localCustomers.filter((customer) => customer.status === status);
      return acc;
    }, {});
  }, [localCustomers]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateStatus = async (companyId: number, status: string | null) => {
    // Optimistic update
    setLocalCustomers((prev) =>
      prev.map((customer) =>
        customer.company_id === companyId ? { ...customer, status: status as Customer["status"] } : customer
      )
    );

    if (!enableSync) return;

    setSyncingId(companyId);
    setSyncError(null);

    try {
      const response = await fetch(`/api/customers/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to sync status");
      }

      router.refresh();
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Unable to sync status");
      // Revert on error? For now keeping it simple as optimistic usually wins.
    } finally {
      setSyncingId(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const cid = event.active.id;
    setActiveId(cid);
    const customer = localCustomers.find(c => c.company_id === cid);
    if (customer) setActiveCustomer(customer);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // We only care about drop
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveCustomer(null);

    if (!over) return;

    const activeId = active.id;
    // const overId = over.id;

    // Find the customer
    const customer = localCustomers.find(c => c.company_id === activeId);
    if (!customer) return;

    // Determine the target status
    let targetStatus = "";

    // If dropped on a container (column)
    if (STATUS_COLUMNS.includes(over.id as string)) {
      targetStatus = over.id as string;
    } else {
      // If dropped on another card, find that card's status
      const overCustomer = localCustomers.find(c => c.company_id === over.id);
      if (overCustomer && overCustomer.status) {
        targetStatus = overCustomer.status;
      }
    }

    if (targetStatus && targetStatus !== customer.status) {
      updateStatus(customer.company_id, targetStatus as Customer["status"] ?? null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="label-mono text-xs text-muted-foreground">Customer Pipeline</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {syncingId && <span>Syncing...</span>}
            {syncError && <span className="text-red-300 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {syncError}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={view === "kanban" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setView("kanban")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={view === "list" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setView("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <PipelineVisualization customers={localCustomers} />

      {view === "kanban" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_COLUMNS.map((status) => (
              <PipelineColumn
                key={status}
                status={status}
                customers={grouped[status] ?? []}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeCustomer ? (
              <div className="w-[250px] cursor-grabbing rounded-2xl border border-primary/50 bg-card p-3 shadow-xl opacity-90">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium">{activeCustomer.company_name}</span>
                  {activeCustomer.expected_deal_value && (
                    <Badge variant="outline" className="text-[10px] px-1 h-5">
                      €{(activeCustomer.expected_deal_value / 1000).toFixed(0)}k
                    </Badge>
                  )}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <Card className="p-4">
          {/* Fallback Table View */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Expected Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localCustomers.map((customer) => (
                <TableRow key={customer.company_id}>
                  <TableCell>{customer.company_name}</TableCell>
                  <TableCell>
                    <select
                      value={customer.status ?? ""}
                      onChange={(event) => updateStatus(customer.company_id, event.target.value)}
                      className="rounded-full border border-border bg-transparent px-3 py-1 text-xs"
                    >
                      {STATUS_COLUMNS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>{customer.action_status ?? "-"}</TableCell>
                  <TableCell>{customer.expected_deal_value ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
