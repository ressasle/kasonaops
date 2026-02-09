import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/lib/data/types";

type CategoryTasksCardProps = {
  title: string;
  tasks: Task[];
};

export function CategoryTasksCard({ title, tasks }: CategoryTasksCardProps) {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Badge variant="outline">{tasks.length} tasks</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 && <div className="text-sm text-muted-foreground">No tasks in this category.</div>}
        {tasks.slice(0, 6).map((task) => (
          <div key={task.id} className="rounded-xl border border-border/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium">{task.title}</div>
              <Badge variant={task.priority === "urgent" ? "danger" : task.priority === "high" ? "warning" : "default"}>{task.priority}</Badge>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Owner: {task.owner_id ?? "Unassigned"} · Status: {task.status}
            </div>
          </div>
        ))}
        <Link href="/tasks" className="block pt-2 text-xs text-primary hover:underline">
          Open full task manager
        </Link>
      </CardContent>
    </Card>
  );
}
