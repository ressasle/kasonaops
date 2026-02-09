"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PencilLine } from "lucide-react";

import { TeamMemberForm } from "@/components/admin/team/team-member-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TeamMember, TeamMemberUpdate } from "@/lib/data/team";

type TeamMemberProfileProps = {
  member: TeamMember;
};

export function TeamMemberProfile({ member }: TeamMemberProfileProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const onSubmit = async (payload: TeamMemberUpdate) => {
    const response = await fetch(`/api/team/${member.member_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error ?? "Unable to update member");
    }

    setOpen(false);
    router.refresh();
  };

  return (
    <section className="space-y-6">
      <Card className="glass-panel rounded-2xl p-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="headline-serif text-lg">{member.display_name}</CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">{member.job_title ?? "No job title"}</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={member.is_active ? "success" : "default"}>{member.is_active ? "Active" : "Inactive"}</Badge>
            <Button onClick={() => setOpen(true)} className="cursor-pointer">
              <PencilLine className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white/5">
          <TabsTrigger value="overview" className="cursor-pointer">Overview</TabsTrigger>
          <TabsTrigger value="hr" className="cursor-pointer">HR Details</TabsTrigger>
          <TabsTrigger value="notes" className="cursor-pointer">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white/5 p-4">
                <div className="label-mono text-xs text-muted-foreground">Member ID</div>
                <div className="mt-2 text-sm font-medium">{member.member_id}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="label-mono text-xs text-muted-foreground">Role</div>
                <div className="mt-2 text-sm font-medium">{member.role}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="label-mono text-xs text-muted-foreground">Department</div>
                <div className="mt-2 text-sm font-medium">{member.department ?? "Unassigned"}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="label-mono text-xs text-muted-foreground">Contact</div>
                <div className="mt-2 text-sm font-medium">{member.email}</div>
                <div className="text-xs text-muted-foreground">{member.phone ?? "No phone"}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hr">
          <Card className="p-6">
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white/5 p-4">
                <div className="label-mono text-xs text-muted-foreground">Contract</div>
                <div className="mt-2 text-sm font-medium">{member.contract_type ?? "Not set"}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="label-mono text-xs text-muted-foreground">Salary</div>
                <div className="mt-2 text-sm font-medium">
                  {member.salary_gross ? `${member.salary_gross} ${member.salary_currency ?? "EUR"}` : "Not set"}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="label-mono text-xs text-muted-foreground">Hire Date</div>
                <div className="mt-2 text-sm font-medium">{member.hire_date ?? "Not set"}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="label-mono text-xs text-muted-foreground">Bank</div>
                <div className="mt-2 text-sm font-medium">{member.bank_name ?? "Not set"}</div>
                <div className="text-xs text-muted-foreground">{member.iban ?? "No IBAN"}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="p-6">
            <CardContent className="text-sm text-muted-foreground">
              {member.notes?.trim() ? member.notes : "No notes added yet."}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-panel max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>Update profile, HR, and role details.</DialogDescription>
          </DialogHeader>
          <TeamMemberForm
            initialValue={member}
            submitLabel="Save Changes"
            onSubmit={onSubmit}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
