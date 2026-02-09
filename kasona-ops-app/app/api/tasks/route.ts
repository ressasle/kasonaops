import { NextRequest, NextResponse } from "next/server";

import { createTask, getTasks } from "@/lib/data/tasks";
import type { TaskInsert } from "@/lib/data/types";

export async function GET(request: NextRequest) {
  const ownerId = request.nextUrl.searchParams.get("owner_id") || undefined;
  const status = request.nextUrl.searchParams.get("status") || undefined;
  const priority = request.nextUrl.searchParams.get("priority") || undefined;
  const category = request.nextUrl.searchParams.get("category") || undefined;
  const companyId = request.nextUrl.searchParams.get("company_id");

  const tasks = await getTasks({
    ownerId,
    status: status as "todo" | "in_progress" | "blocked" | "done" | undefined,
    priority: priority as "low" | "medium" | "high" | "urgent" | undefined,
    category: category as "sales" | "finance" | "fulfillment" | "product" | "team" | "general" | undefined,
    companyId: companyId ? Number(companyId) : undefined,
  });

  return NextResponse.json({ data: tasks });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as TaskInsert;

  if (!payload.title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const task = await createTask({
    ...payload,
    title: payload.title.trim(),
    status: payload.status ?? "todo",
    priority: payload.priority ?? "medium",
    source: payload.source ?? "manual",
    category: payload.category ?? "general",
  });

  if (!task) {
    return NextResponse.json({ error: "Unable to create task" }, { status: 500 });
  }

  return NextResponse.json({ data: task });
}
