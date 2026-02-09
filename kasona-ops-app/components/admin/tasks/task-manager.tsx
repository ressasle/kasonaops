"use client";

import { useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { OwnerSelect, type OwnerOption } from "@/components/admin/owner-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { Task } from "@/lib/data/types";

type TaskManagerProps = {
  initialTasks: Task[];
  ownerOptions: OwnerOption[];
  initialOwnerFilter?: string;
};

type TaskFormState = {
  title: string;
  company_id: string;
  owner_id: string;
  status: Task["status"];
  priority: Task["priority"];
  category: NonNullable<Task["category"]>;
  due_date: string;
  source: Task["source"];
  notes: string;
};

const EMPTY_STATE: TaskFormState = {
  title: "",
  company_id: "",
  owner_id: "",
  status: "todo",
  priority: "medium",
  category: "general",
  due_date: "",
  source: "manual",
  notes: "",
};

const CATEGORY_OPTIONS: Array<NonNullable<Task["category"]>> = [
  "sales",
  "finance",
  "fulfillment",
  "product",
  "team",
  "general",
];

export function TaskManager({ initialTasks, ownerOptions, initialOwnerFilter = "" }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [form, setForm] = useState<TaskFormState>(EMPTY_STATE);
  const [ownerFilter, setOwnerFilter] = useState<string>(initialOwnerFilter);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: keyof TaskFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const filteredTasks = useMemo(() => {
    if (!ownerFilter) return tasks;
    return tasks.filter((task) => task.owner_id === ownerFilter);
  }, [tasks, ownerFilter]);

  const totals = useMemo(() => {
    return {
      total: filteredTasks.length,
      high: filteredTasks.filter((task) => task.priority === "high" || task.priority === "urgent").length,
      inProgress: filteredTasks.filter((task) => task.status === "in_progress").length,
      blocked: filteredTasks.filter((task) => task.status === "blocked").length,
    };
  }, [filteredTasks]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          company_id: form.company_id ? Number(form.company_id) : null,
          owner_id: form.owner_id || null,
          status: form.status,
          priority: form.priority,
          category: form.category,
          due_date: form.due_date || null,
          source: form.source,
          notes: form.notes.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to create task");
      }

      const data = (await response.json()) as { data: Task };
      setTasks((prev) => [data.data, ...prev]);
      setForm(EMPTY_STATE);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create task");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTaskUpdate = async (taskId: string, payload: Partial<Task>) => {
    setError(null);
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error ?? "Unable to update task");
    }

    const data = (await response.json()) as { data: Task };
    setTasks((prev) => prev.map((task) => (task.id === taskId ? data.data : task)));
  };

  const handleDelete = async (taskId: string) => {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;

    setError(null);
    const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Unable to delete task");
      return;
    }

    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <Card id="new-task" className="p-6 lg:col-span-1">
        <CardHeader>
          <CardTitle>New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Task Title</Label>
              <Input value={form.title} onChange={handleChange("title")} required />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company ID</Label>
                <Input type="number" value={form.company_id} onChange={handleChange("company_id")} />
              </div>
              <OwnerSelect value={form.owner_id} onChange={(value) => setForm((prev) => ({ ...prev, owner_id: value }))} options={ownerOptions} label="Owner" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <select value={form.status} onChange={handleChange("status")} className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm">
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <select value={form.priority} onChange={handleChange("priority")} className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <select value={form.category} onChange={handleChange("category")} className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm">
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={form.due_date} onChange={handleChange("due_date")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={handleChange("notes")} rows={3} />
            </div>
            {error && <div className="text-sm text-red-300">{error}</div>}
            <Button type="submit" className="w-full gap-2" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="p-6 lg:col-span-2">
        <CardHeader>
          <CardTitle>Task Queue</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">{totals.total} total</Badge>
            <Badge variant="warning">{totals.inProgress} active</Badge>
            <Badge variant="danger">{totals.high} high/urgent</Badge>
            <Badge variant="outline">{totals.blocked} blocked</Badge>
          </div>
          <OwnerSelect
            value={ownerFilter}
            onChange={setOwnerFilter}
            options={ownerOptions}
            label="Filter by owner"
            placeholder="All owners"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="text-sm font-medium">{task.title}</div>
                    <div className="text-xs text-muted-foreground">Company {task.company_id ?? "-"}</div>
                  </TableCell>
                  <TableCell>{task.owner_id ?? "Unassigned"}</TableCell>
                  <TableCell>
                    <select
                      value={task.status}
                      onChange={(event) => {
                        handleTaskUpdate(task.id, { status: event.target.value as Task["status"] }).catch((updateError) => {
                          setError(updateError instanceof Error ? updateError.message : "Unable to update task");
                        });
                      }}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="todo">todo</option>
                      <option value="in_progress">in_progress</option>
                      <option value="blocked">blocked</option>
                      <option value="done">done</option>
                    </select>
                  </TableCell>
                  <TableCell>{task.category ?? "general"}</TableCell>
                  <TableCell>
                    <Badge variant={task.priority === "urgent" ? "danger" : task.priority === "high" ? "warning" : "default"}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.due_date ?? "-"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
