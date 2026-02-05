import tasks from "@/data/tasks.json";
import { PageHeader } from "@/components/admin/page-header";
import { TaskManager, type TaskItem } from "@/components/admin/tasks/task-manager";

export default function TasksPage() {
  return (
    <div className="space-y-10">
      <PageHeader />
      <TaskManager initialTasks={tasks as TaskItem[]} />
    </div>
  );
}
