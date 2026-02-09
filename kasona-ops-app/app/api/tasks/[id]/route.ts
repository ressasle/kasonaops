import { NextResponse } from "next/server";

import { deleteTask, updateTask } from "@/lib/data/tasks";
import type { TaskUpdate } from "@/lib/data/types";

type Params = {
  id: string;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  const resolvedParams = await params;
  if (!resolvedParams.id) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  const payload = (await request.json()) as TaskUpdate;
  const updated = await updateTask(resolvedParams.id, payload);

  if (!updated) {
    return NextResponse.json({ error: "Unable to update task" }, { status: 500 });
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<Params> }
) {
  const resolvedParams = await params;
  if (!resolvedParams.id) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  const success = await deleteTask(resolvedParams.id);
  if (!success) {
    return NextResponse.json({ error: "Unable to delete task" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
