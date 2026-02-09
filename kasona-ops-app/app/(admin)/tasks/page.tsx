import { PageHeader } from "@/components/admin/page-header";
import { TaskManager } from "@/components/admin/tasks/task-manager";
import { getTasks } from "@/lib/data/tasks";
import { getActiveTeamOptions } from "@/lib/data/team-options";

type TasksPageProps = {
  searchParams?: Promise<{
    owner_id?: string;
  }>;
};

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const resolvedSearchParams = await searchParams;
  const ownerId = resolvedSearchParams?.owner_id;

  const [tasks, owners] = await Promise.all([
    getTasks({ ownerId }),
    getActiveTeamOptions(),
  ]);

  return (
    <div className="space-y-10">
      <PageHeader />
      <TaskManager initialTasks={tasks} ownerOptions={owners} initialOwnerFilter={ownerId ?? ""} />
    </div>
  );
}
