"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, FolderPlus, ListTodo, Plus, UserPlus } from "lucide-react";

import { ReminderDialog } from "@/components/admin/reminder-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function QuickActionButton() {
  const router = useRouter();
  const [showReminderDialog, setShowReminderDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="lg" className="h-12 w-12 rounded-full shadow-glow cursor-pointer" aria-label="Open quick actions">
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-panel">
          <DropdownMenuItem onClick={() => router.push("/tasks#new-task")} className="gap-2 cursor-pointer">
            <ListTodo className="h-4 w-4" />
            New Task
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/customers/new")} className="gap-2 cursor-pointer">
            <UserPlus className="h-4 w-4" />
            New Lead
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowReminderDialog(true)} className="gap-2 cursor-pointer">
            <Bell className="h-4 w-4" />
            Set Reminder
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/onboarding")} className="gap-2 cursor-pointer">
            <FolderPlus className="h-4 w-4" />
            New Onboarding
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ReminderDialog open={showReminderDialog} onOpenChange={setShowReminderDialog} />
    </>
  );
}
