"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high";

export type TaskItem = {
  task_id: string;
  company_id: number | null;
  owner_id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  source: string;
  notes?: string | null;
};

type TaskFormState = {
  title: string;
  company_id: string;
  owner_id: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  source: string;
  notes: string;
};

const EMPTY_STATE: TaskFormState = {
  title: "",
  company_id: "",
  owner_id: "",
  status: "todo",
  priority: "medium",
  due_date: "",
  source: "manual",
  notes: ""
};

type TaskManagerProps = {
  initialTasks: TaskItem[];
};

export function TaskManager({ initialTasks }: TaskManagerProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [form, setForm] = useState<TaskFormState>(EMPTY_STATE);

  const handleChange =
    (field: keyof TaskFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) return;

    const newTask: TaskItem = {
      task_id: `task-${Date.now()}`,
      company_id: form.company_id ? Number(form.company_id) : null,
      owner_id: form.owner_id || "unassigned",
      title: form.title.trim(),
      status: form.status,
      priority: form.priority,
      due_date: form.due_date || null,
      source: form.source || "manual",
      notes: form.notes.trim() || null
    };

    setTasks((prev) => [newTask, ...prev]);
    setForm(EMPTY_STATE);
  };

  const totals = useMemo(() => {
    return {
      total: tasks.length,
      high: tasks.filter((task) => task.priority === "high").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length
    };
  }, [tasks]);

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
              <div className="space-y-2">
                <Label>Owner</Label>
                <Input value={form.owner_id} onChange={handleChange("owner_id")} placeholder="Jakob" />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={handleChange("status")}
                  className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm"
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <select
                  value={form.priority}
                  onChange={handleChange("priority")}
                  className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={form.due_date} onChange={handleChange("due_date")} />
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Input value={form.source} onChange={handleChange("source")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={handleChange("notes")} rows={3} />
            </div>
            <Button type="submit" className="w-full">
              Create Task
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="p-6 lg:col-span-2">
        <CardHeader>
          <CardTitle>Task Queue</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="default">{totals.total} total</Badge>
            <Badge variant="warning">{totals.inProgress} active</Badge>
            <Badge variant="danger">{totals.high} high</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.task_id}>
                  <TableCell>
                    <div className="text-sm font-medium">{task.title}</div>
                    <div className="text-xs text-muted-foreground">{task.company_id ?? "No company"}</div>
                  </TableCell>
                  <TableCell>{task.owner_id}</TableCell>
                  <TableCell>
                    <Badge variant={task.status === "in_progress" ? "warning" : task.status === "done" ? "success" : "default"}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "default"}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.due_date ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
