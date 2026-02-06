"use client";

import { useRouter } from "next/navigation";
import { FolderPlus, ListTodo, Plus, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function QuickActionButton() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="lg" className="h-12 w-12 rounded-full shadow-glow">
          <Plus className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-panel">
        <DropdownMenuItem onClick={() => router.push("/tasks#new-task")}
          className="gap-2"
        >
          <ListTodo className="h-4 w-4" />
          New Task
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/customers/new")}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          New Lead
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/onboarding")}
          className="gap-2"
        >
          <FolderPlus className="h-4 w-4" />
          New Onboarding
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
