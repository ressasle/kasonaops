"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { TeamMemberCard } from "@/components/admin/team/team-member-card";
import { TeamMemberForm } from "@/components/admin/team/team-member-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { TeamMember, TeamMemberInsert, TeamMemberUpdate } from "@/lib/data/team";

const ROLE_OPTIONS = ["all", "admin", "manager", "analyst", "assistant", "viewer"];
const DEPARTMENT_OPTIONS = ["all", "management", "sales", "operations", "finance", "tech", "unassigned"];

type TeamManagerProps = {
  members: TeamMember[];
  supabaseReady: boolean;
};

export function TeamManager({ members, supabaseReady }: TeamManagerProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const filteredMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return members.filter((member) => {
      const matchesTerm = term
        ? [member.display_name, member.email, member.member_id]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))
        : true;
      const matchesRole = roleFilter === "all" ? true : member.role === roleFilter;
      const matchesDepartment =
        departmentFilter === "all"
          ? true
          : departmentFilter === "unassigned"
            ? !member.department
            : member.department === departmentFilter;
      const matchesActive =
        activeFilter === "all"
          ? true
          : activeFilter === "active"
            ? member.is_active
            : !member.is_active;
      return matchesTerm && matchesRole && matchesDepartment && matchesActive;
    });
  }, [members, searchTerm, roleFilter, departmentFilter, activeFilter]);

  const openCreateDialog = () => {
    setEditingMember(null);
    setDialogOpen(true);
  };

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member);
    setDialogOpen(true);
  };

  const submitMember = async (payload: TeamMemberInsert | TeamMemberUpdate) => {
    if (!supabaseReady) {
      throw new Error("Supabase is not configured. Add environment variables first.");
    }

    const isEditing = Boolean(editingMember);
    const response = await fetch(
      isEditing ? `/api/team/${editingMember?.member_id}` : "/api/team",
      {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(errorPayload.error ?? "Unable to save team member");
    }

    setDialogOpen(false);
    setEditingMember(null);
    router.refresh();
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="label-mono text-xs text-muted-foreground">Team Directory</div>
          <div className="mt-1 text-sm text-muted-foreground">Manage HR, roles, and ownership.</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={supabaseReady ? "success" : "warning"}>{supabaseReady ? "Live" : "Offline"}</Badge>
          <Button onClick={openCreateDialog} className="cursor-pointer">
            Add Team Member
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input
          placeholder="Search name, email, member ID"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="bg-black/20 border-border/50"
        />
        <select
          value={departmentFilter}
          onChange={(event) => setDepartmentFilter(event.target.value)}
          className="h-10 rounded-full border border-input bg-black/20 px-3 text-sm"
        >
          {DEPARTMENT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All departments" : option}
            </option>
          ))}
        </select>
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="h-10 rounded-full border border-input bg-black/20 px-3 text-sm"
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All roles" : option}
            </option>
          ))}
        </select>
        <select
          value={activeFilter}
          onChange={(event) => setActiveFilter(event.target.value)}
          className="h-10 rounded-full border border-input bg-black/20 px-3 text-sm"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredMembers.map((member) => (
          <TeamMemberCard key={member.member_id} member={member} onEdit={openEditDialog} />
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="glass-panel rounded-2xl p-6 text-sm text-muted-foreground">No team members match the current filters.</div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-panel max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMember ? `Edit ${editingMember.display_name}` : "Add Team Member"}</DialogTitle>
            <DialogDescription>
              Fill in personal, HR, and role details for this team member.
            </DialogDescription>
          </DialogHeader>
          <TeamMemberForm
            initialValue={editingMember ?? undefined}
            submitLabel={editingMember ? "Update Member" : "Create Member"}
            onSubmit={submitMember}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
